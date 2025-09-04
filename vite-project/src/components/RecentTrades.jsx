"use client"

import { useMarket } from "../context/MarketContext"

export default function RecentTrades() {
  const { symbol, trades } = useMarket()
  const list = (trades[symbol] ?? []).slice(-10) // Only show last 10 trades

  return (
    <div className="bg-[#0f1318] border border-gray-800 rounded-md overflow-hidden">
      <div className="px-3 py-2 text-sm text-gray-300 font-semibold border-b border-gray-800">
        Recent Trades - {symbol}
      </div>
      <div className="max-h-128 overflow-y-auto">
        {list.length === 0 ? (
          <div className="py-6 text-center text-gray-500 text-sm">No recent trades</div>
        ) : (
          <div className="divide-y divide-gray-900">
            <div className="grid grid-cols-4 text-xs text-gray-500 px-3 py-2">
              <span>Bid</span>
              <span>Ask</span>
              <span>Quantity</span>
              <span>Time</span>
            </div>
            {list.map((t, i) => {
              const price = Number(t.price)
              const bid = price * 1.01
              const ask = price * 0.99
              return (
                <div key={i} className="grid grid-cols-4 px-3 py-2 text-sm items-center">
                  <span className="text-green-400 font-semibold">${bid.toFixed(2)}</span>
                  <span className="text-red-400 font-semibold">${ask.toFixed(2)}</span>
                  <span className="text-gray-300">{Number(t.quantity).toFixed(4)}</span>
                  <span className="text-gray-400">{new Date(t.tradeTime).toLocaleTimeString()}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}