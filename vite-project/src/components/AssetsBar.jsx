"use client"

import { useMarket } from "../context/MarketContext"
import { useState, useEffect, useRef } from "react"

export default function AssetsBar({ onShowTrades }) {
  const { prices, trades } = useMarket()
  const assets = [
    { symbol: "BTCUSDT", name: "Bitcoin" },
    { symbol: "ETHUSDT", name: "Ethereum" },
    { symbol: "SOLUSDT", name: "Solana" },
  ]

  // Mock connection status
  const [isConnected, setIsConnected] = useState(true)

  // Store price changes in state for re-render
  const [priceChanges, setPriceChanges] = useState({})

  useEffect(() => {
    const newChanges = {}
    assets.forEach((asset) => {
      const symbol = asset.symbol
      const symbolTrades = trades[symbol] || []
      if (symbolTrades.length < 2) {
        newChanges[symbol] = 0
      } else {
        const latest = Number(symbolTrades[0]?.price)
        const prev = Number(symbolTrades[1]?.price)
        if (!latest || !prev) {
          newChanges[symbol] = 0
        } else {
          newChanges[symbol] = ((latest - prev) / prev) * 100
        }
      }
    })
    setPriceChanges(newChanges)
    // eslint-disable-next-line
  }, [trades.BTCUSDT, trades.ETHUSDT, trades.SOLUSDT])

  return (
    <div className="bg-black text-white p-3 border-b border-gray-800">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          {/* Header */}
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-gray-200 mr-2">Tradedream</h1>
            <span className="text-sm text-gray-500">| a channel</span>
          </div>

          {/* Asset Prices */}
          <div className="flex space-x-6">
            {assets.map((asset) => {
              const change = priceChanges[asset.symbol] || 0
              const isPositive = change >= 0
              const bid = prices[asset.symbol] !== undefined ? prices[asset.symbol] * 1.01 : undefined
              const ask = prices[asset.symbol] !== undefined ? prices[asset.symbol] * 0.99 : undefined

              return (
                <div key={asset.symbol} className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-bold text-white text-sm">
                      {bid !== undefined && ask !== undefined ? (
                        <>
                          <span className="text-green-400">Bid: ${bid.toFixed(2)}</span>
                          <span className="mx-2 text-gray-400">/</span>
                          <span className="text-red-400">Ask: ${ask.toFixed(2)}</span>
                        </>
                      ) : "Loading..."}
                    </div>
                    <div className={`text-xs font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                      {isPositive ? "+" : ""}
                      {Math.abs(change) < 0.01
                        ? change.toExponential(2)
                        : change.toFixed(4)}
                      %
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-300 text-sm">{asset.symbol}</div>
                    <div className="text-xs text-gray-500">{asset.name}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Connection Status and Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-xs text-gray-400">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <button
            onClick={onShowTrades}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm font-medium transition-colors border border-blue-500"
          >
            Access
          </button>
        </div>
      </div>

      {/* Additional Info Bar */}
      <div className="flex items-center space-x-6 mt-2 pt-2 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-gray-400">STUDENT</span>
          <span className="ml-2">50.0% data</span>
        </div>
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-gray-400">IP/USDT</span>
          <span className="ml-2">24.5% data</span>
        </div>
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-gray-400">IP/USDT</span>
          <span className="ml-2">100.0% data</span>
        </div>
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-gray-400">Router Index - STUDENT</span>
          <span className="ml-2">10 years index</span>
        </div>
      </div>
    </div>
  )
}
