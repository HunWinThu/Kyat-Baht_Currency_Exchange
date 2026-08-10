import { useEffect, useState } from 'react'
import { ArrowDownUp, Phone, Plus, UserRound } from 'lucide-react'
import { QUOTE_BASE_MMK } from '../utils/currency'

export default function Calculator({ rates, onChangeRate, onRecord }) {
  const [type, setType] = useState('buy')
  const [thb, setThb] = useState('')
  const [mmk, setMmk] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [lastEdited, setLastEdited] = useState('thb')
  const selectedRate = Number(type === 'buy' ? rates.buy : rates.sell) || 0

  useEffect(() => {
    if (!(selectedRate > 0)) return
    if (lastEdited === 'thb' && thb !== '') setMmk(String(Number(thb) * QUOTE_BASE_MMK / selectedRate))
    if (lastEdited === 'mmk' && mmk !== '') setThb(String(Number(mmk) * selectedRate / QUOTE_BASE_MMK))
    // Recalculate the dependent field when the type or saved rate changes.
  }, [type, selectedRate]) // eslint-disable-line react-hooks/exhaustive-deps

  const changeThb = (value) => {
    setLastEdited('thb')
    setThb(value)
    setMmk(value === '' || !(selectedRate > 0) ? '' : String(Number(value) * QUOTE_BASE_MMK / selectedRate))
  }
  const changeMmk = (value) => {
    setLastEdited('mmk')
    setMmk(value)
    setThb(value === '' || !(selectedRate > 0) ? '' : String(Number(value) * selectedRate / QUOTE_BASE_MMK))
  }
  const record = () => {
    if (!(selectedRate > 0) || !(Number(thb) > 0) || !(Number(mmk) > 0)) return
    onRecord({
      type,
      thb: Number(thb),
      customerName: customerName.trim(),
      phone: phone.trim(),
      direction: type === 'buy' ? 'MMK_TO_THB' : 'THB_TO_MMK',
    })
    setThb('')
    setMmk('')
    setCustomerName('')
    setPhone('')
  }

  return (
    <section className="card animate-enter overflow-hidden p-4 sm:p-5 lg:p-3" aria-labelledby="calculator-heading">
      <div className="mb-3 lg:mb-2">
        <h2 id="calculator-heading" className="text-xl font-extrabold tracking-tight">Calculator</h2>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 lg:mb-2.5">
        <RateInput label="Buy rate" value={rates.buy} onChange={(value) => onChangeRate('buy', value)} />
        <RateInput label="Sell rate" value={rates.sell} onChange={(value) => onChangeRate('sell', value)} />
      </div>

      <div className="mb-3 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        <TypeButton active={type === 'buy'} onClick={() => setType('buy')} title="MMK → THB" subtitle="Buy THB" />
        <TypeButton active={type === 'sell'} onClick={() => setType('sell')} title="THB → MMK" subtitle="Sell THB" />
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <CustomerInput icon={UserRound} label="Customer name" value={customerName} onChange={setCustomerName} placeholder="Optional name" />
        <CustomerInput icon={Phone} label="Phone number" value={phone} onChange={setPhone} placeholder="Optional phone" type="tel" inputMode="tel" />
      </div>

      <div className="relative space-y-3">
        <MoneyInput label="Thai Baht" currency="THB" symbol="฿" value={thb} onChange={changeThb} />
        <div className="absolute left-1/2 top-[72px] z-10 grid size-9 -translate-x-1/2 place-items-center rounded-full border-4 border-white bg-slate-900 text-white shadow-sm">
          <ArrowDownUp size={14} />
        </div>
        <MoneyInput label="Myanmar Kyat" currency="MMK" symbol="K" value={mmk} onChange={changeMmk} />
      </div>

      <button type="button" onClick={record} disabled={!(selectedRate > 0) || !(Number(thb) > 0)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
        <Plus size={19} strokeWidth={2.5} /> Record this transaction
      </button>
    </section>
  )
}

function RateInput({ label, value, onChange }) {
  return (
    <label className="input-shell block px-3 py-2">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="mt-0.5 flex items-baseline gap-1.5">
        <input type="number" min="0" step="any" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0" className="tabular min-w-0 flex-1 bg-transparent text-lg font-extrabold text-slate-800 outline-none placeholder:text-slate-300" />
        <span className="text-[9px] font-bold text-slate-400">THB</span>
      </span>
      <span className="text-[9px] font-semibold text-slate-400">per 100K MMK</span>
    </label>
  )
}

function TypeButton({ active, onClick, title, subtitle }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl px-3 py-2 text-sm font-bold transition ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
      {title} <span className="ml-1 text-[10px] opacity-60">{subtitle}</span>
    </button>
  )
}

function MoneyInput({ label, currency, symbol, value, onChange }) {
  return (
    <label className="input-shell block px-4 py-2.5">
      <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}<span>{currency}</span>
      </span>
      <span className="mt-1 flex items-center gap-2">
        <span className="text-xl font-bold text-slate-300">{symbol}</span>
        <input type="number" min="0" step="any" inputMode="decimal" placeholder="0.00" value={value} onChange={(e) => onChange(e.target.value)} className="tabular min-w-0 flex-1 bg-transparent text-2xl font-extrabold tracking-tight outline-none placeholder:text-slate-300" />
      </span>
    </label>
  )
}

function CustomerInput({ icon: Icon, label, value, onChange, placeholder, type = 'text', inputMode }) {
  return (
    <label className="input-shell flex items-center gap-3 px-3.5 py-2.5">
      <Icon className="shrink-0 text-slate-400" size={17} />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="mt-0.5 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-300"
        />
      </span>
    </label>
  )
}
