const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const rateFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 })

export const formatNumber = (value) => numberFormatter.format(Number(value) || 0)
export const formatRate = (value) => rateFormatter.format(Number(value) || 0)
export const QUOTE_BASE_MMK = 100_000

export function localDateKey(dateLike = new Date()) {
  const date = new Date(dateLike)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatTime = (dateLike) => new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit',
}).format(new Date(dateLike))

export const formatDate = (dateLike) => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
}).format(new Date(dateLike))

export function calculateTransaction(type, thbAmount, rates) {
  const thb = Number(thbAmount)
  const rate = type === 'buy' ? Number(rates.buy) : Number(rates.sell)
  const marketRate = type === 'buy'
    ? Number(rates.marketBuy ?? rates.market)
    : Number(rates.marketSell ?? rates.market)
  const mmk = thb * QUOTE_BASE_MMK / rate
  const marketValue = thb * QUOTE_BASE_MMK / marketRate

  // Transaction types are from the customer's perspective:
  // Buy THB means the business sells THB; Sell THB means the business buys THB.
  const profit = type === 'buy' ? mmk - marketValue : marketValue - mmk
  const capital = type === 'buy' ? marketValue : mmk

  return { thb, mmk, rate, marketRate, profit, capital }
}
