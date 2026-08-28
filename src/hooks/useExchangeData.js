import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { calculateTransaction } from '../utils/currency'
import { useLocalStorage } from './useLocalStorage'

const DEFAULT_RATES = { buy: '', sell: '' }
const OLD_DEFAULT_RATES = { market: 102.5, buy: 100, sell: 105 }

export function useExchangeData(user) {
  const [rates, setRates] = useLocalStorage('exchange-rates-v4', initialRates)
  const [transactions, setTransactions] = useLocalStorage('exchange-transactions-v2', initialTransactions)
  const [capital, setCapital] = useLocalStorage('exchange-capital-v1', { thb: 0, mmk: 0 })
  const [pendingDeletes, setPendingDeletes] = useLocalStorage('exchange-pending-deletes-v1', [])
  const [syncStatus, setSyncStatus] = useState(supabase ? 'idle' : 'local')
  const [hydratedUserId, setHydratedUserId] = useState(null)

  const ratesRef = useRef(rates)
  const capitalRef = useRef(capital)
  const transactionsRef = useRef(transactions)
  const pendingDeletesRef = useRef(pendingDeletes)
  ratesRef.current = rates
  capitalRef.current = capital
  transactionsRef.current = transactions
  pendingDeletesRef.current = pendingDeletes

  const userId = user?.id

  useEffect(() => {
    setRates((current) => isLegacyDefaultRates(current) ? DEFAULT_RATES : current)
  }, [setRates])

  const syncFromCloud = useCallback(async () => {
    if (!supabase || !userId) return
    setSyncStatus('syncing')

    try {
      const deletions = pendingDeletesRef.current
      if (deletions.length) {
        const { error } = await supabase.from('transactions').delete().in('id', deletions)
        if (error) throw error
        setPendingDeletes([])
      }

      const { data: cloudSettings, error: settingsError } = await supabase
        .from('exchange_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      if (settingsError) throw settingsError

      if (cloudSettings) {
        const cloudRates = { buy: cloudSettings.buy_rate, sell: cloudSettings.sell_rate }
        setRates(isLegacyDefaultRates(cloudRates) ? DEFAULT_RATES : cloudRates)
        setCapital({ thb: cloudSettings.capital_thb, mmk: cloudSettings.capital_mmk })
      } else {
        const { error } = await supabase.from('exchange_settings').upsert(toSettingsRow(userId, ratesRef.current, capitalRef.current))
        if (error) throw error
      }

      if (transactionsRef.current.length) {
        const rows = transactionsRef.current.map((item) => toTransactionRow(item, userId))
        const { error } = await supabase.from('transactions').upsert(rows, { onConflict: 'id' })
        if (error) throw error
      }

      const { data: cloudTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
      if (transactionsError) throw transactionsError

      setTransactions((cloudTransactions || []).map(fromTransactionRow))
      setHydratedUserId(userId)
      setSyncStatus('synced')
    } catch (error) {
      console.error('Supabase sync failed', error)
      setHydratedUserId(userId)
      setSyncStatus('error')
    }
  }, [setCapital, setPendingDeletes, setRates, setTransactions, userId])

  useEffect(() => {
    if (userId) syncFromCloud()
    else setHydratedUserId(null)
  }, [syncFromCloud, userId])

  useEffect(() => {
    if (!supabase || !userId || hydratedUserId !== userId) return
    const timer = window.setTimeout(async () => {
      const { error } = await supabase.from('exchange_settings').upsert(toSettingsRow(userId, rates, capital))
      setSyncStatus(error ? 'error' : 'synced')
    }, 600)
    return () => window.clearTimeout(timer)
  }, [capital, hydratedUserId, rates, userId])

  const recordTransaction = async ({ type, thb, customerName, phone, direction }) => {
    const transaction = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      type,
      customerName,
      phone,
      direction,
      ...calculateTransaction(type, thb, rates),
      createdAt: new Date().toISOString(),
    }
    setTransactions((current) => [transaction, ...current])

    if (supabase && userId) {
      setSyncStatus('syncing')
      const { error } = await supabase.from('transactions').upsert(toTransactionRow(transaction, userId))
      setSyncStatus(error ? 'error' : 'synced')
    }
  }

  const deleteTransaction = async (id) => {
    setTransactions((current) => current.filter((item) => item.id !== id))
    if (!supabase || !userId) return

    setPendingDeletes((current) => current.includes(id) ? current : [...current, id])
    setSyncStatus('syncing')
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      setSyncStatus('error')
    } else {
      setPendingDeletes((current) => current.filter((item) => item !== id))
      setSyncStatus('synced')
    }
  }

  return {
    rates,
    setRates,
    transactions,
    capital,
    setCapital,
    syncStatus,
    syncFromCloud,
    recordTransaction,
    deleteTransaction,
  }
}

function toTransactionRow(item, userId) {
  return {
    id: String(item.id),
    user_id: userId,
    type: item.type,
    customer_name: item.customerName || null,
    phone: item.phone || null,
    direction: item.direction || (item.type === 'buy' ? 'MMK_TO_THB' : 'THB_TO_MMK'),
    thb: Number(item.thb),
    mmk: Number(item.mmk),
    rate: Number(item.rate),
    created_at: item.createdAt,
  }
}

function fromTransactionRow(row) {
  return {
    id: row.id,
    type: row.type,
    customerName: row.customer_name || '',
    phone: row.phone || '',
    direction: row.direction,
    thb: Number(row.thb),
    mmk: Number(row.mmk),
    rate: Number(row.rate),
    createdAt: row.created_at,
  }
}

function toSettingsRow(userId, rates, capital) {
  return {
    user_id: userId,
    buy_rate: Number(rates.buy) || 0,
    sell_rate: Number(rates.sell) || 0,
    capital_thb: Number(capital.thb) || 0,
    capital_mmk: Number(capital.mmk) || 0,
    updated_at: new Date().toISOString(),
  }
}

function isLegacyDefaultRates(rates) {
  return Number(rates?.buy) === 750 && Number(rates?.sell) === 772
}

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
    return { buy: 100_000 / Number(oldRates.buy), sell: 100_000 / Number(oldRates.sell) }
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
