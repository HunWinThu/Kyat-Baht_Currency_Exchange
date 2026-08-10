import { useEffect, useState } from 'react'
import { Info, Save, X } from 'lucide-react'

export default function RateSettings({ rates, onSave, onClose }) {
  const [draft, setDraft] = useState(rates)
  const [error, setError] = useState('')

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }))
  const submit = (event) => {
    event.preventDefault()
    const normalized = {
      marketBuy: Number(draft.marketBuy),
      marketSell: Number(draft.marketSell),
      buy: Number(draft.buy),
      sell: Number(draft.sell),
    }
    if (Object.values(normalized).some((value) => !Number.isFinite(value) || value <= 0)) {
      setError('Enter a rate greater than zero in every field.')
      return
    }
    onSave(normalized)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="rates-title" className="w-full max-w-md rounded-t-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-7">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-brand-600">Settings</p>
            <h2 id="rates-title" className="mt-1 text-2xl font-extrabold tracking-tight">Exchange rates</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200" aria-label="Close settings"><X size={19} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Market reference</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <RateInput label="Market Buy" hint="Buy reference" value={draft.marketBuy} onChange={(v) => update('marketBuy', v)} />
                <RateInput label="Market Sell" hint="Sell reference" value={draft.marketSell} onChange={(v) => update('marketSell', v)} />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Your business rates</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <RateInput label="Buy THB" hint="Customer buys from you" value={draft.buy} onChange={(v) => update('buy', v)} />
              <RateInput label="Sell THB" hint="Customer sells to you" value={draft.sell} onChange={(v) => update('sell', v)} />
            </div>
          </div>
          <div className="mt-5 flex gap-2 rounded-2xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-700">
            <Info className="mt-0.5 shrink-0" size={15} />
            Quote format: 100,000 MMK = X THB. Each business rate is compared with its matching market reference.
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-rose-600" role="alert">{error}</p>}
          <button type="submit" className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800">
            <Save size={18} /> Save rates
          </button>
        </form>
      </section>
    </div>
  )
}

function RateInput({ label, hint, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span className="mt-0.5 block text-[11px] text-slate-400">{hint}</span>
      <div className="input-shell mt-2 flex items-center px-3.5">
        <input type="number" min="0" step="any" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 bg-transparent py-3.5 text-lg font-extrabold outline-none" required />
        <span className="text-[10px] font-bold text-slate-400">THB / 100K</span>
      </div>
    </label>
  )
}
