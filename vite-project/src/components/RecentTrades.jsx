"use client"

import { useMarket } from "../context/MarketContext"

export default function RecentTrades() {
  const { symbol, trades } = useMarket()
  const list = (trades[symbol] ?? []).slice(-10) // Only show last 10 trades

  return (
    <div className="bg-white flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Trades</h3>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-[11px]">
        {list.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-sans italic">No recent trades</div>
        ) : (
          <div>
            <div className="grid grid-cols-3 text-slate-400 px-4 py-2 border-b border-slate-50 font-sans uppercase tracking-tight text-[10px] font-bold">
              <span>Price</span>
              <span className="text-right">Size</span>
              <span className="text-right">Time</span>
            </div>
            <div className="divide-y divide-slate-50">
              {list.slice().reverse().map((t, i) => {
                const price = Number(t.price)
                const isUp = i % 2 === 0
                return (
                  <div key={i} className="grid grid-cols-3 px-4 py-2 hover:bg-slate-50 transition-colors group relative">
                    <span className={`text-left font-bold ${isUp ? "text-trade-up" : "text-trade-down"}`}>
                      {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-right text-slate-600 font-medium">{Number(t.quantity).toFixed(4)}</span>
                    <span className="text-right text-slate-400 text-[10px]">{new Date(t.tradeTime).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}