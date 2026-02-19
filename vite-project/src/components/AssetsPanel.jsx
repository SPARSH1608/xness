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
    <div className="p-3 bg-[#0b0e11] text-[#EAECEF]">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[#848E9C] border-b border-[#2a3038] pb-2">Assets</h2>
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
              className={`w-full text-left p-3 rounded-md border text-sm transition-all ${
                isSelected 
                  ? "border-[#0ECB81] bg-[#0ECB81]/10" 
                  : "border-[#2a3038] bg-[#151a21] hover:bg-[#1e2329]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xl ${isSelected ? "text-[#0ECB81]" : "text-[#848E9C]"}`}>{a.icon}</span>
                  <div>
                    <div className="font-semibold text-[#EAECEF]">{a.id}</div>
                    <div className="text-xs text-[#848E9C]">{a.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex flex-col items-end space-y-1">
                    {price !== undefined ? (
                      <>
                        <div className="flex justify-between w-24">
                          <span className="text-xs text-[#0ECB81] font-medium">Bid</span>
                          <span className="text-xs text-[#EAECEF] font-bold">${Number(bid).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-24">
                          <span className="text-xs text-[#F6465D] font-medium">Ask</span>
                          <span className="text-xs text-[#EAECEF] font-bold">${Number(ask).toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-[#848E9C]">Loading...</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
