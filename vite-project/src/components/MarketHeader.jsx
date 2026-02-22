"use client"

import { useMarket } from "../context/MarketContext"
import { useMemo, useEffect, useRef, useState } from "react"

export default function MarketHeader() {
  const { symbol, prices, trades } = useMarket()
  const price = prices[symbol]

  // Calculate real-time change based on the last two trades
  const changePct = useMemo(() => {
    const symbolTrades = trades[symbol] || []
    if (symbolTrades.length < 2) return 0
    const latest = Number(symbolTrades[0]?.price)
    const prev = Number(symbolTrades[1]?.price)
    if (!latest || !prev) return 0
    return ((latest - prev) / prev) * 100
  }, [trades, symbol])

  // Animation state
  const [displayedChange, setDisplayedChange] = useState(changePct)
  const [flash, setFlash] = useState(false)
  const timeoutRef = useRef()

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setFlash(true)
    timeoutRef.current = setTimeout(() => {
      setDisplayedChange(changePct)
      setFlash(false)
    }, 300)
    return () => clearTimeout(timeoutRef.current)
  }, [changePct])

  const positive = displayedChange >= 0

  // Get latest trade quantity
  const latestTrade = trades[symbol]?.[0]
  const latestQty = latestTrade ? Number(latestTrade.quantity || latestTrade.qty || 0) : 0

  return (
    <div className="bg-white p-4 border-b border-slate-200 flex flex-wrap items-center gap-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xl text-slate-900">
          {symbol.startsWith('BTC') ? '₿' : symbol.startsWith('ETH') ? 'Ξ' : '◎'}
        </div>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            {symbol}
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium uppercase">Perpetual</span>
          </h1>
          <a href="#" className="text-xs text-brand-600 hover:underline font-medium">Market Info</a>
        </div>
      </div>
      
      <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
      
      <div className="flex-1 flex items-center gap-8 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Price</div>
          <div className={`text-lg font-bold font-mono transition-colors duration-300 ${positive ? "text-trade-up" : "text-trade-down"} ${flash ? "opacity-50" : "opacity-100"}`}>
            {price ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "..."}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">24h Change</div>
          <div className={`text-sm font-bold font-mono ${positive ? "text-trade-up" : "text-trade-down"}`}>
            {positive ? "+" : ""}{displayedChange.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Latest Qty</div>
          <div className="text-sm font-medium font-mono text-slate-900">{latestQty}</div>
        </div>
      </div>
    </div>
  )
}
