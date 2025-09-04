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
    <div className="px-4 py-2 border-b border-gray-800 bg-[#0f1318]">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-gray-300 font-medium">{symbol}</span>
          <span className="text-white text-lg font-semibold">
            {price ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "..."}
          </span>
          <span
            className={
              (positive ? "text-green-400" : "text-red-400") +
              " text-sm transition-colors duration-300" +
              (flash ? " bg-yellow-100/20 px-1 rounded" : "")
            }
            style={{
              transition: "color 0.3s, background 0.3s"
            }}
          >
            {positive ? "+" : ""}
            {displayedChange.toFixed(6)}%
          </span>
          <span className="text-xs text-blue-400 ml-2">
            Qty: {latestQty}
          </span>
        </div>
      </div>
    </div>
  )
}
