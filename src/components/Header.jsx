import { Landmark, Settings2 } from 'lucide-react'

export default function Header({ onOpenSettings }) {
  return (
    <header className="flex items-center justify-between py-5 sm:py-7">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
          <Landmark size={21} strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-brand-600">Money desk</p>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">Baht ↔ Kyat</h1>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        aria-label="Open rate settings"
      >
        <Settings2 size={17} />
        <span className="hidden sm:inline">Rates</span>
      </button>
    </header>
  )
}
