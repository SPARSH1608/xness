"use client"

import { useMarket } from "../context/MarketContext"

export default function AssetsPanel() {
  const { symbol, setSymbol, prices, trades } = useMarket()
  const assets = [
    { id: "BTCUSDT", name: "Bitcoin", icon: "₿" },
    { id: "ETHUSDT", name: "Ethereum", icon: "Ξ" },
    { id: "SOLUSDT", name: "Solana", icon: "◎" },
  ]

  // Helper to get real-time price and change
  const getAssetStats = (id) => {
    const price = prices[id]
    const assetTrades = trades[id] || []
    let change = 0
    if (assetTrades.length >= 2) {
      const latest = Number(assetTrades[0]?.price)
      const prev = Number(assetTrades[1]?.price)
      if (latest && prev) {
        change = ((latest - prev) / prev) * 100
      }
    }
    // Calculate bid/ask
    const bid = price ? price * 1.01 : undefined
    const ask = price ? price * 0.99 : undefined
    return {
      price,
      change,
      bid,
      ask,
    }
  }

  return (
    <div className="p-3 bg-black text-white">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-2">Assets</h2>
      </div>

      {/* Access Section */}
      <div className="space-y-2">
        {assets.map((a) => {
          const isSelected = symbol === a.id
          const { price, change, bid, ask } = getAssetStats(a.id)
          const positive = change >= 0
          return (
            <button
              key={a.id}
              onClick={() => setSymbol(a.id)}
              className={`w-full text-left p-3 rounded-md border ${
                isSelected ? "border-green-600 bg-green-900/10" : "border-gray-800 bg-[#0f1318] hover:bg-gray-900"
              } transition`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl text-green-400">{a.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-100">{a.id}</div>
                    <div className="text-xs text-gray-500">{a.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex flex-col items-end space-y-0.5">
                    {price !== undefined ? (
                      <>
                        <span className="text-xs text-gray-400">
                          <span className="text-green-400 font-semibold">Bid</span>
                          <span className="ml-1 text-white font-bold">${Number(bid).toFixed(2)}</span>
                        </span>
                        <span className="text-xs text-gray-400">
                          <span className="text-red-400 font-semibold">Ask</span>
                          <span className="ml-1 text-white font-bold">${Number(ask).toFixed(2)}</span>
                        </span>
                      </>
                    ) : (
                      <span>Loading...</span>
                    )}
                  </div>
                  {/* <div className={`text-xs ${positive ? "text-green-400" : "text-red-400"}`}>
                    {positive ? "+" : ""}
                    {change.toFixed(8)}%
                  </div> */}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
