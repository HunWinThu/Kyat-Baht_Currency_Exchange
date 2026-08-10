import { Banknote, ChartNoAxesCombined, CircleDollarSign, TrendingUp } from 'lucide-react'
import { formatNumber } from '../utils/currency'

const cards = [
  { key: 'thb', label: 'THB volume', unit: 'THB', icon: Banknote, tone: 'bg-blue-50 text-blue-600' },
  { key: 'mmk', label: 'MMK volume', unit: 'MMK', icon: CircleDollarSign, tone: 'bg-violet-50 text-violet-600' },
  { key: 'capital', label: 'Capital · အရင်း', unit: 'MMK', icon: ChartNoAxesCombined, tone: 'bg-amber-50 text-amber-600' },
  { key: 'profit', label: 'Profit · အမြတ်', unit: 'MMK', icon: TrendingUp, tone: 'bg-emerald-50 text-emerald-600' },
]

export default function SummaryCards({ summary }) {
  return (
    <section aria-labelledby="today-heading" className="animate-enter">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Overview</p>
          <h2 id="today-heading" className="mt-1 text-xl font-extrabold tracking-tight">Today</h2>
        </div>
        <p className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
          {summary.count} {summary.count === 1 ? 'transaction' : 'transactions'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ key, label, unit, icon: Icon, tone }) => (
          <article key={key} className="card p-4 sm:p-5">
            <div className={`mb-4 grid size-9 place-items-center rounded-xl ${tone}`}><Icon size={18} /></div>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className={`tabular mt-1 break-words text-xl font-extrabold tracking-tight sm:text-2xl ${key === 'profit' && summary[key] < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {formatNumber(summary[key])}
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{unit}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
