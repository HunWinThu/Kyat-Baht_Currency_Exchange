import { useEffect, useMemo } from 'react'
import Calculator from './components/Calculator'
import Header from './components/Header'
import History from './components/History'
import SummaryCards from './components/SummaryCards'
import { useLocalStorage } from './hooks/useLocalStorage'
import { calculateTransaction, localDateKey } from './utils/currency'

const DEFAULT_RATES = { buy: 750, sell: 772 }
const OLD_DEFAULT_RATES = { market: 102.5, buy: 100, sell: 105 }

function initialRates() {
  try {
    const latestRates = JSON.parse(window.localStorage.getItem('exchange-rates-v3'))
    if (latestRates) return { buy: Number(latestRates.buy), sell: Number(latestRates.sell) }
    const currentRates = JSON.parse(window.localStorage.getItem('exchange-rates-v2'))
    if (currentRates) return { buy: Number(currentRates.buy), sell: Number(currentRates.sell) }
    const oldRates = JSON.parse(window.localStorage.getItem('exchange-rates-v1'))
    if (!oldRates) return DEFAULT_RATES
    const wasOldDefault = Object.keys(OLD_DEFAULT_RATES).every((key) => Number(oldRates[key]) === OLD_DEFAULT_RATES[key])
    if (wasOldDefault) return DEFAULT_RATES
    return {
      buy: 100_000 / Number(oldRates.buy),
      sell: 100_000 / Number(oldRates.sell),
    }
  } catch {
    return DEFAULT_RATES
  }
}

function initialTransactions() {
  try {
    const oldTransactions = JSON.parse(window.localStorage.getItem('exchange-transactions-v1'))
    if (!Array.isArray(oldTransactions)) return []
    return oldTransactions.map((item) => ({
      ...item,
      type: item.type === 'buy' ? 'sell' : 'buy',
      rate: 100_000 / item.rate,
    }))
  } catch {
    return []
  }
}

export default function App() {
  const [rates, setRates] = useLocalStorage('exchange-rates-v4', initialRates)
  const [transactions, setTransactions] = useLocalStorage('exchange-transactions-v2', initialTransactions)
  const [capital, setCapital] = useLocalStorage('exchange-capital-v1', { thb: 0, mmk: 0 })
  const [theme, setTheme] = useLocalStorage('exchange-theme-v1', 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const todaySummary = useMemo(() => transactions
    .filter((item) => localDateKey(item.createdAt) === localDateKey())
    .reduce(summarizeTransaction, emptySummary()), [transactions])

  const allTimeSummary = useMemo(() => transactions.reduce(summarizeTransaction, emptySummary()), [transactions])
  const totalNet = useMemo(() => ({
    thb: (Number(capital.thb) || 0) + allTimeSummary.thb,
    mmk: (Number(capital.mmk) || 0) + allTimeSummary.mmk,
  }), [capital, allTimeSummary])

  const recordTransaction = ({ type, thb, customerName, phone, direction }) => {
    const calculated = calculateTransaction(type, thb, rates)
    const transaction = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      type,
      customerName,
      phone,
      direction,
      ...calculated,
      createdAt: new Date().toISOString(),
    }
    setTransactions((current) => [transaction, ...current])
  }

  const deleteTransaction = (id) => {
    if (window.confirm('Delete this transaction? This cannot be undone.')) {
      setTransactions((current) => current.filter((item) => item.id !== id))
    }
  }

  return (
    <div className="min-h-screen pb-10 lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:pb-0">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:flex lg:h-full lg:flex-col lg:px-8">
        <Header theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
        <main className="space-y-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:space-y-3">
          <DashboardSummary daily={todaySummary} totalNet={totalNet} capital={capital} setCapital={setCapital} />
          <div className="grid items-start gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-4 lg:overflow-hidden">
            <div>
              <ExchangePanel rates={rates} setRates={setRates} onRecord={recordTransaction} />
            </div>
            <History transactions={transactions} onDelete={deleteTransaction} />
          </div>
        </main>
        <footer className="py-8 text-center text-xs font-medium text-slate-400 lg:hidden">Stored privately on this device · No account required</footer>
      </div>
    </div>
  )
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

function DashboardSummary({ daily, totalNet, capital, setCapital }) {
  return (
    <SummaryCards
      daily={daily}
      totalNet={totalNet}
      capital={capital}
      onChangeCapital={(currency, value) => setCapital((current) => ({ ...current, [currency]: value }))}
    />
  )
}

function ExchangePanel({ rates, setRates, onRecord }) {
  return (
    <Calculator rates={rates} onChangeRate={(field, value) => setRates((current) => ({ ...current, [field]: value }))} onRecord={onRecord} />
  )
}
