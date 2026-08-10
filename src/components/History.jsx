import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, History as HistoryIcon, Phone, Trash2 } from 'lucide-react'
import { formatDate, formatNumber, formatRate, formatTime, localDateKey } from '../utils/currency'

export default function History({ transactions, onDelete }) {
  const [view, setView] = useState('today')
  const shown = view === 'today' ? transactions.filter((item) => localDateKey(item.createdAt) === localDateKey()) : transactions

  return (
    <section className="card animate-enter p-4 sm:p-5 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:p-3" aria-labelledby="history-heading">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3 lg:mb-2">
        <div>
          <h2 id="history-heading" className="text-xl font-extrabold tracking-tight">Transactions</h2>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          {['today', 'all'].map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`rounded-lg px-3 py-2 capitalize transition ${view === item ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>{item}</button>)}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center lg:min-h-0 lg:flex-1">
          <div>
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm"><HistoryIcon size={21} /></div>
            <p className="mt-3 font-bold text-slate-700">No transactions yet</p>
            <p className="mt-1 text-sm text-slate-400">Your {view === 'today' ? 'daily ' : ''}records will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
          {shown.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} onDelete={onDelete} />)}
        </div>
      )}
    </section>
  )
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
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-200/70 pt-2">
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
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="tabular mt-0.5 truncate text-xs font-extrabold text-slate-700 sm:text-sm">{value}</p>
    </div>
  )
}
