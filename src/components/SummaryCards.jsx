import { formatNumber, formatSignedNumber } from '../utils/currency'

export default function SummaryCards({ daily, totalNet, capital, onChangeCapital }) {
  return (
    <section aria-labelledby="balances-heading" className="animate-enter space-y-4 lg:grid lg:grid-cols-[2fr_1fr] lg:gap-3 lg:space-y-0">
      <div>
        <div className="mb-2">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Overview</p>
          <h2 id="balances-heading" className="mt-1 text-xl font-extrabold tracking-tight lg:text-lg">Capital & total net</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <CapitalInputCard currency="THB" value={capital.thb} onChange={(value) => onChangeCapital('thb', value)} />
          <CapitalInputCard currency="MMK" value={capital.mmk} onChange={(value) => onChangeCapital('mmk', value)} />
          <MetricCard label="Total THB net" unit="THB" value={totalNet.thb} />
          <MetricCard label="Total MMK net" unit="MMK" value={totalNet.mmk} />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Today</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight lg:text-lg">Daily net movement</h2>
          </div>
          <p className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
            {daily.count} {daily.count === 1 ? 'transaction' : 'transactions'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <MetricCard label="Daily THB net" unit="THB" value={daily.thb} signed />
          <MetricCard label="Daily MMK net" unit="MMK" value={daily.mmk} signed />
        </div>
      </div>
    </section>
  )
}

function MetricCard({ label, unit, value, signed = false }) {
  const color = value < 0 ? 'text-rose-600' : signed && value > 0 ? 'text-emerald-600' : 'text-slate-900'
  return (
    <article className="card p-3 sm:p-4 lg:p-2.5">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`tabular mt-1 break-words text-xl font-extrabold tracking-tight sm:text-2xl lg:text-xl ${color}`}>
        {signed ? formatSignedNumber(value) : formatNumber(value)}
      </p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{unit}</p>
    </article>
  )
}

function CapitalInputCard({ currency, value, onChange }) {
  return (
    <label className="card block p-3 transition focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-amber-100 sm:p-4 lg:p-2.5">
      <span className="text-xs font-semibold text-slate-500">Opening {currency} capital</span>
      <span className="input-shell mt-1.5 flex items-center px-3">
        <input
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          aria-label={`Opening ${currency} capital`}
          className="tabular min-w-0 w-full bg-transparent py-1.5 text-base font-extrabold text-slate-800 outline-none placeholder:text-slate-300"
        />
      </span>
    </label>
  )
}
