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
    <div className="bg-white text-slate-900">
      {/* Search Bar already in TradePage sidebar, but we can add a mini header if needed */}
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Market Assets</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-slate-50">
          {assets.map((a) => {
            const isSelected = symbol === a.id
            const { price, change, bid, ask } = getAssetStats(a.id)
            return (
              <button
                key={a.id}
                onClick={() => setSymbol(a.id)}
                className={`w-full text-left p-4 transition-all group ${
                  isSelected 
                    ? "bg-brand-50" 
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isSelected ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors"
                    }`}>
                      {a.icon}
                    </div>
                    <div>
                      <div className={`font-bold ${isSelected ? "text-brand-700" : "text-slate-900"}`}>{a.id}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{a.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {price !== undefined ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-mono font-bold text-slate-900">${Number(price).toFixed(2)}</div>
                        <div className="flex items-center justify-end gap-1.5 font-mono text-[10px]">
                           <span className="text-trade-up font-bold">B: {Number(bid).toFixed(2)}</span>
                           <span className="text-trade-down font-bold">A: {Number(ask).toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
