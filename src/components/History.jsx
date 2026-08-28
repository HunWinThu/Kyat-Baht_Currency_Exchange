import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, CalendarDays, History as HistoryIcon, Phone, Trash2 } from 'lucide-react'
import { formatDate, formatNumber, formatRate, formatTime, localDateKey } from '../utils/currency'

export default function History({ transactions, onDelete }) {
  const [view, setView] = useState('all')
  const [selectedDate, setSelectedDate] = useState(localDateKey())
  const activeDate = view === 'today' ? localDateKey() : selectedDate
  const shown = view === 'all'
    ? transactions
    : transactions.filter((item) => localDateKey(item.createdAt) === activeDate)

  return (
    <section className="card animate-enter flex h-full min-h-0 flex-col p-4 sm:p-5 lg:p-3" aria-labelledby="history-heading">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3 lg:mb-2">
        <div>
          <h2 id="history-heading" className="text-xl font-extrabold tracking-tight">Transactions</h2>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{shown.length} {shown.length === 1 ? 'record' : 'records'} shown</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            {['today', 'all'].map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`rounded-lg px-2.5 py-1.5 capitalize transition ${view === item ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>{item}</button>)}
          </div>
          <label className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 transition ${view === 'date' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200 bg-white text-slate-500'}`}>
            <CalendarDays size={14} className="shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                if (!event.target.value) return
                setSelectedDate(event.target.value)
                setView('date')
              }}
              aria-label="Filter transactions by date"
              className="w-[7.2rem] bg-transparent text-[11px] font-bold outline-none"
            />
          </label>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="grid min-h-0 flex-1 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
          <div>
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm"><HistoryIcon size={21} /></div>
            <p className="mt-3 font-bold text-slate-700">{view === 'date' ? `No transactions on ${formatSelectedDate(selectedDate)}` : 'No transactions yet'}</p>
            <p className="mt-1 text-sm text-slate-400">{view === 'all' ? 'Your records will appear here.' : 'Transactions for this date will appear here.'}</p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {shown.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} onDelete={onDelete} />)}
        </div>
      )}
    </section>
  )
}

function formatSelectedDate(dateKey) {
  return formatDate(new Date(`${dateKey}T00:00:00`))
}

function TransactionRow({ transaction, onDelete }) {
  const isBuy = transaction.type === 'buy'
  const Icon = isBuy ? ArrowDownLeft : ArrowUpRight
  const direction = transaction.direction || (isBuy ? 'MMK_TO_THB' : 'THB_TO_MMK')
  const directionLabel = direction === 'MMK_TO_THB' ? 'MMK → THB' : 'THB → MMK'
  return (
    <article className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-slate-200 hover:bg-white">
      <div className="flex items-start gap-3">
        <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${isBuy ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}><Icon size={18} strokeWidth={2.5} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-extrabold text-slate-800">{transaction.customerName || 'Walk-in customer'}</p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wide ${isBuy ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>{directionLabel}</span>
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">{formatDate(transaction.createdAt)} · {formatTime(transaction.createdAt)}</p>
            </div>
            <button type="button" onClick={() => onDelete(transaction.id)} className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-300 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${isBuy ? 'buy' : 'sell'} transaction`}><Trash2 size={16} /></button>
          </div>
          {transaction.phone && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500">
              <a href={`tel:${transaction.phone}`} className="flex items-center gap-1.5 transition hover:text-brand-600"><Phone size={12} />{transaction.phone}</a>
            </div>
          )}
          <div className="mt-2 space-y-1.5 border-t border-slate-200/70 pt-2">
            <Value label="THB" value={formatNumber(transaction.thb)} />
            <Value label="MMK" value={formatNumber(transaction.mmk)} />
            <Value label="Rate" value={formatRate(transaction.rate)} />
          </div>
        </div>
      </div>
    </article>
  )
}

function Value({ label, value }) {
  return (
    <div className="flex min-w-0 items-baseline justify-between gap-4">
      <p className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="tabular min-w-0 break-words text-right text-sm font-extrabold text-slate-700 [overflow-wrap:anywhere]">{value}</p>
    </div>
  )
}
