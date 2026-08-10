import { Landmark, Moon, Sun } from 'lucide-react'

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="flex shrink-0 items-center justify-between py-5 sm:py-7 lg:py-3">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
          <Landmark size={21} strokeWidth={2.2} />
        </div>
        <div>
          <p className="flex items-baseline gap-1 text-lg font-bold uppercase tracking-[.12em] text-brand-600 sm:text-xl">
            <span>Money desk by</span>
            <span className="signature text-2xl leading-none sm:text-[26px]">Ktoo</span>
          </p>
          <h1 className="mt-0.5 text-[11px] font-extrabold uppercase tracking-[.18em] text-slate-500">Baht ↔ Kyat</h1>
        </div>
      </div>
      <button type="button" onClick={onToggleTheme} className="grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  )
}
