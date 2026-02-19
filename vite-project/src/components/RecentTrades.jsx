"use client"

import { useMarket } from "../context/MarketContext"

export default function RecentTrades() {
  const { symbol, trades } = useMarket()
  const list = (trades[symbol] ?? []).slice(-10) // Only show last 10 trades

  return (
    <div className="bg-[#1e2329] border border-[#2a3038] rounded-md overflow-hidden flex flex-col h-full">
      <div className="px-3 py-2 text-sm text-[#EAECEF] font-semibold border-b border-[#2a3038]">
        Recent Trades - {symbol}
      </div>
      <div className="flex-1 overflow-y-auto">
        {list.length === 0 ? (
          <div className="py-6 text-center text-[#848E9C] text-sm">No recent trades</div>
        ) : (
          <div className="">
            <div className="grid grid-cols-3 text-xs text-[#848E9C] px-3 py-1 bg-[#151a21]">
              <span className="text-left">Price</span>
              <span className="text-right">Size</span>
              <span className="text-right">Time</span>
            </div>
            {list.slice().reverse().map((t, i) => { // Show newest first
              const price = Number(t.price)
              const side = i % 2 === 0 ? 'buy' : 'sell' // Mock side for color variation if not in data
              // In real app, trade would have side 'buy' or 'sell'
              // For now assuming random or checking price change
              // But let's just use price color logic or random for demo if side missing
              
              return (
                <div key={i} className="grid grid-cols-3 px-3 py-1 text-xs items-center hover:bg-[#2a3038]/30 transition-colors">
                  <span className={`text-left font-medium ${true ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
                    {price.toFixed(2)}
                  </span>
                  <span className="text-right text-[#EAECEF]">{Number(t.quantity).toFixed(4)}</span>
                  <span className="text-right text-[#848E9C]">{new Date(t.tradeTime).toLocaleTimeString()}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}