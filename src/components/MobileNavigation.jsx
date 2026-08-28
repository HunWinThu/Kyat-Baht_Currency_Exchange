import {
  ArrowLeftRight,
  Cloud,
  CloudOff,
  Ellipsis,
  House,
  Landmark,
  ListChecks,
  LogOut,
  Moon,
  RefreshCw,
  Sun,
} from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'exchange', label: 'Exchange', icon: ArrowLeftRight },
  { id: 'records', label: 'Records', icon: ListChecks },
  { id: 'menu', label: 'Menu', icon: Ellipsis },
]

export function MobileTopBar({ title, cloudEnabled, onSignOut, signingOut }) {
  return (
    <header className="z-30 -mx-4 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/70 bg-canvas/90 px-4 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-2.5">
        <div className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
          <Landmark size={18} strokeWidth={2.3} />
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-brand-600">Money desk by <span className="signature text-base">Ktoo</span></p>
          <h1 className="text-lg font-extrabold leading-none tracking-tight">{title}</h1>
        </div>
      </div>
      {cloudEnabled && (
        <button type="button" onClick={onSignOut} disabled={signingOut} className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-2.5 text-xs font-extrabold text-rose-600 shadow-sm transition active:scale-95 disabled:opacity-60" aria-label="Sign out">
          {signingOut ? <RefreshCw className="animate-spin" size={15} /> : <LogOut size={15} />}
          <span className="hidden min-[380px]:inline">{signingOut ? 'Signing out…' : 'Sign out'}</span>
        </button>
      )}
    </header>
  )
}

export function MobileTabBar({ activeTab, onChange }) {
  return (
    <nav className="mobile-tabbar fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pt-1.5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden" aria-label="Main navigation">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button key={id} type="button" onClick={() => onChange(id)} className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl transition active:scale-95 ${active ? 'text-brand-600' : 'text-slate-400'}`} aria-current={active ? 'page' : undefined}>
              {active && <span className="mobile-tab-indicator absolute top-0 h-0.5 w-7 rounded-full bg-brand-600" />}
              <Icon className={active ? 'mobile-tab-icon' : ''} size={20} strokeWidth={active ? 2.6 : 2} />
              <span className="text-[10px] font-extrabold">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function MobileHomeActions({ onNavigate }) {
  return (
    <section className="grid grid-cols-2 gap-3">
      <button type="button" onClick={() => onNavigate('exchange')} className="rounded-3xl bg-brand-600 p-4 text-left text-white shadow-lg shadow-brand-500/20 transition active:scale-[.97]">
        <span className="grid size-10 place-items-center rounded-2xl bg-white/15"><ArrowLeftRight size={20} /></span>
        <span className="mt-4 block text-base font-extrabold">New exchange</span>
        <span className="mt-0.5 block text-xs text-white/70">Calculate and record</span>
      </button>
      <button type="button" onClick={() => onNavigate('records')} className="card p-4 text-left transition active:scale-[.97]">
        <span className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-slate-600"><ListChecks size={20} /></span>
        <span className="mt-4 block text-base font-extrabold text-slate-900">View records</span>
        <span className="mt-0.5 block text-xs text-slate-400">Search by date</span>
      </button>
    </section>
  )
}

export function MobileMenu({ theme, onToggleTheme, cloudEnabled, syncStatus, onRetrySync, onSignOut, signingOut, signOutError }) {
  return (
    <section className="space-y-4 animate-enter">
      <div className="card overflow-hidden">
        <MenuButton
          icon={theme === 'dark' ? Sun : Moon}
          title="Appearance"
          subtitle={theme === 'dark' ? 'Dark mode' : 'Light mode'}
          onClick={onToggleTheme}
          trailing={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-500">Change</span>}
        />
        {cloudEnabled && (
          <MenuButton
            icon={syncStatus === 'error' ? CloudOff : syncStatus === 'syncing' ? RefreshCw : Cloud}
            iconClassName={syncStatus === 'error' ? 'text-rose-600' : 'text-emerald-600'}
            title="Cloud backup"
            subtitle={syncLabel(syncStatus)}
            onClick={syncStatus === 'error' ? onRetrySync : undefined}
            spinning={syncStatus === 'syncing'}
          />
        )}
      </div>

      <div className="card overflow-hidden">
        <MenuButton
          icon={signingOut ? RefreshCw : LogOut}
          iconClassName="text-rose-600"
          title={signingOut ? 'Signing out…' : 'Sign out'}
          subtitle="Sign out of this device"
          onClick={signingOut ? undefined : onSignOut}
          spinning={signingOut}
          danger
        />
      </div>
      {signOutError && <p className="px-3 text-center text-xs font-bold text-rose-600" role="alert">{signOutError}</p>}

      <div className="px-2 text-center">
        <p className="text-xs font-bold text-slate-500">Money Desk by <span className="signature text-lg text-brand-600">Ktoo</span></p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Baht ↔ Kyat · Version 1.0</p>
      </div>
    </section>
  )
}

function MenuButton({ icon: Icon, iconClassName = 'text-slate-600', title, subtitle, onClick, trailing, spinning = false, danger = false }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-4 text-left last:border-0 disabled:cursor-default">
      <span className={`grid size-10 shrink-0 place-items-center rounded-2xl bg-slate-100 ${iconClassName}`}><Icon className={spinning ? 'animate-spin' : ''} size={19} /></span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-extrabold ${danger ? 'text-rose-600' : 'text-slate-800'}`}>{title}</span>
        <span className="mt-0.5 block text-xs font-medium text-slate-400">{subtitle}</span>
      </span>
      {trailing}
    </button>
  )
}

function syncLabel(status) {
  if (status === 'error') return 'Sync failed · tap to retry'
  if (status === 'syncing') return 'Saving your latest changes'
  return 'Your data is safely synced'
}
