import { useMemo, useState } from 'react'
import Calculator from './components/Calculator'
import Header from './components/Header'
import History from './components/History'
import RateSettings from './components/RateSettings'
import SummaryCards from './components/SummaryCards'
import { useLocalStorage } from './hooks/useLocalStorage'
import { calculateTransaction, formatRate, localDateKey } from './utils/currency'

const DEFAULT_RATES = { marketBuy: 761, marketSell: 761, buy: 750, sell: 772 }
const OLD_DEFAULT_RATES = { market: 102.5, buy: 100, sell: 105 }

function initialRates() {
  try {
    const currentRates = JSON.parse(window.localStorage.getItem('exchange-rates-v2'))
    if (currentRates) return {
      marketBuy: Number(currentRates.marketBuy ?? currentRates.market),
      marketSell: Number(currentRates.marketSell ?? currentRates.market),
      buy: Number(currentRates.buy),
      sell: Number(currentRates.sell),
    }
    const oldRates = JSON.parse(window.localStorage.getItem('exchange-rates-v1'))
    if (!oldRates) return DEFAULT_RATES
    const wasOldDefault = Object.keys(OLD_DEFAULT_RATES).every((key) => Number(oldRates[key]) === OLD_DEFAULT_RATES[key])
    if (wasOldDefault) return DEFAULT_RATES
    const convertedMarket = 100_000 / Number(oldRates.market)
    return {
      marketBuy: convertedMarket,
      marketSell: convertedMarket,
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
      marketRate: 100_000 / item.marketRate,
    }))
  } catch {
    return []
  }
}

export default function App() {
  const [rates, setRates] = useLocalStorage('exchange-rates-v3', initialRates)
  const [transactions, setTransactions] = useLocalStorage('exchange-transactions-v2', initialTransactions)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const todaySummary = useMemo(() => transactions
    .filter((item) => localDateKey(item.createdAt) === localDateKey())
    .reduce((total, item) => ({
      thb: total.thb + item.thb,
      mmk: total.mmk + item.mmk,
      capital: total.capital + item.capital,
      profit: total.profit + item.profit,
      count: total.count + 1,
    }), { thb: 0, mmk: 0, capital: 0, profit: 0, count: 0 }), [transactions])

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
    <div className="min-h-screen pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Header onOpenSettings={() => setSettingsOpen(true)} />
        <main className="space-y-5 sm:space-y-6">
          <SummaryCards summary={todaySummary} />
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-6">
            <div className="space-y-4 lg:sticky lg:top-6">
              <Calculator rates={rates} onRecord={recordTransaction} />
              <button type="button" onClick={() => setSettingsOpen(true)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-brand-200">
                <span><span className="block text-xs font-bold text-slate-400">Market B/S · Your B/S</span><span className="tabular mt-0.5 block text-sm font-extrabold text-slate-700">{formatRate(rates.marketBuy)} / {formatRate(rates.marketSell)} · {formatRate(rates.buy)} / {formatRate(rates.sell)} THB per 100K</span></span>
                <span className="text-xs font-bold text-brand-600">Edit</span>
              </button>
            </div>
            <History transactions={transactions} onDelete={deleteTransaction} />
          </div>
        </main>
        <footer className="py-8 text-center text-xs font-medium text-slate-400">Stored privately on this device · No account required</footer>
      </div>
      {settingsOpen && <RateSettings rates={rates} onSave={setRates} onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
