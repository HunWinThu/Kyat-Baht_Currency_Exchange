import { useEffect, useMemo, useState } from 'react'
import AuthScreen from './components/AuthScreen'
import Calculator from './components/Calculator'
import Header from './components/Header'
import History from './components/History'
import SummaryCards from './components/SummaryCards'
import { MobileHomeActions, MobileMenu, MobileTabBar, MobileTopBar } from './components/MobileNavigation'
import { useExchangeData } from './hooks/useExchangeData'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'
import { isSupabaseConfigured } from './lib/supabase'
import { localDateKey } from './utils/currency'

export default function App() {
  const [theme, setTheme] = useLocalStorage('exchange-theme-v1', 'light')
  const [mobileTab, setMobileTab] = useState('home')
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const { session, loading: authLoading, signOut: signOutSession } = useSupabaseAuth()
  const {
    rates,
    setRates,
    transactions,
    capital,
    setCapital,
    syncStatus,
    syncFromCloud,
    recordTransaction,
    deleteTransaction,
  } = useExchangeData(session?.user)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const active = !isSupabaseConfigured || Boolean(session)
    document.documentElement.classList.toggle('app-shell-active', active)
    return () => document.documentElement.classList.remove('app-shell-active')
  }, [session])

  const todaySummary = useMemo(() => transactions
    .filter((item) => localDateKey(item.createdAt) === localDateKey())
    .reduce(summarizeTransaction, emptySummary()), [transactions])

  const allTimeSummary = useMemo(() => transactions.reduce(summarizeTransaction, emptySummary()), [transactions])
  const totalNet = useMemo(() => ({
    thb: (Number(capital.thb) || 0) + allTimeSummary.thb,
    mmk: (Number(capital.mmk) || 0) + allTimeSummary.mmk,
  }), [capital, allTimeSummary])

  if (authLoading) return <LoadingScreen />
  if (isSupabaseConfigured && !session) return <AuthScreen />

  const confirmDelete = (id) => {
    if (window.confirm('Delete this transaction? This cannot be undone.')) deleteTransaction(id)
  }

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')
  const signOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    setSignOutError('')
    try {
      const { error } = await signOutSession()
      if (error) throw error
    } catch (error) {
      console.error('Sign out failed', error)
      setSignOutError('Could not sign out. Check your connection and try again.')
    } finally {
      setSigningOut(false)
    }
  }
  const mobileTitle = { home: 'Overview', exchange: 'Exchange', records: 'Records', menu: 'Menu' }[mobileTab]

  return (
    <div className="mobile-app-shell lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:pb-0">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        <MobileTopBar title={mobileTitle} syncStatus={syncStatus} cloudEnabled={isSupabaseConfigured} />

        <div className="hidden lg:block">
          <Header
            theme={theme}
            onToggleTheme={toggleTheme}
            cloudEnabled={isSupabaseConfigured}
            syncStatus={syncStatus}
            onRetrySync={syncFromCloud}
            onSignOut={signOut}
          />
        </div>

        <main className="hidden space-y-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:space-y-3">
          <SummaryCards
            daily={todaySummary}
            totalNet={totalNet}
            capital={capital}
            onChangeCapital={(currency, value) => setCapital((current) => ({ ...current, [currency]: value }))}
          />
          <div className="grid items-start gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-4 lg:overflow-hidden">
            <Calculator
              rates={rates}
              onChangeRate={(field, value) => setRates((current) => ({ ...current, [field]: value }))}
              onRecord={recordTransaction}
            />
            <History transactions={transactions} onDelete={confirmDelete} />
          </div>
        </main>

        <main className="mobile-tab-content min-h-0 flex-1 py-3 lg:hidden">
          {mobileTab === 'home' && (
            <div key="home" className="mobile-tab-panel mobile-home-screen h-full space-y-3 overflow-hidden">
              <SummaryCards
                daily={todaySummary}
                totalNet={totalNet}
                capital={capital}
                onChangeCapital={(currency, value) => setCapital((current) => ({ ...current, [currency]: value }))}
              />
              <MobileHomeActions onNavigate={setMobileTab} />
            </div>
          )}
          {mobileTab === 'exchange' && (
            <div key="exchange" className="mobile-tab-panel mobile-exchange-screen h-full">
              <Calculator
                rates={rates}
                onChangeRate={(field, value) => setRates((current) => ({ ...current, [field]: value }))}
                onRecord={recordTransaction}
              />
            </div>
          )}
          {mobileTab === 'records' && <div key="records" className="mobile-tab-panel h-full"><History transactions={transactions} onDelete={confirmDelete} /></div>}
          {mobileTab === 'menu' && (
            <div key="menu" className="mobile-tab-panel h-full overflow-hidden">
              <MobileMenu
                theme={theme}
                onToggleTheme={toggleTheme}
                cloudEnabled={isSupabaseConfigured}
                syncStatus={syncStatus}
                onRetrySync={syncFromCloud}
                onSignOut={signOut}
                signingOut={signingOut}
                signOutError={signOutError}
              />
            </div>
          )}
        </main>
      </div>
      <MobileTabBar activeTab={mobileTab} onChange={setMobileTab} />
    </div>
  )
}

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center text-sm font-bold text-slate-500">Connecting securely…</div>
}

function emptySummary() {
  return { thb: 0, mmk: 0, count: 0 }
}

function summarizeTransaction(total, item) {
  return {
    thb: total.thb + (item.type === 'sell' ? item.thb : -item.thb),
    mmk: total.mmk + (item.type === 'buy' ? item.mmk : -item.mmk),
    count: total.count + 1,
  }
}
