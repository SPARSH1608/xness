"use client"

import { useEffect, useState } from "react"
import { useUser } from "../context/userContext"
import { useMarket } from "../context/MarketContext"
import { useSocket } from "../context/SocketContext" // <-- import

const TABS = [
  { key: "positions", label: "Open" },
  { key: "closed", label: "Closed" },
  { key: "liquidated", label: "Liquidated" },
]

export default function PositionsOrdersPanel() {
  const [tab, setTab] = useState("positions")
  const { positions, refreshPositions, loadingPositions, user, refreshUser } = useUser()
  const { prices } = useMarket()
  const { liquidated } = useSocket(); // <-- get liquidated event

  useEffect(() => {
    if (user) refreshPositions()
  }, [user, refreshPositions])

  useEffect(() => {
    if (liquidated) {
      alert(`Your position ${liquidated.positionId} was liquidated at price $${liquidated.closedPrice}`);
      refreshPositions(); // <-- refresh positions after liquidation
      refreshUser();      // <-- refresh user balance if needed
    }
  }, [liquidated, refreshPositions, refreshUser]);

  async function handleClosePosition(positionId) {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/positions/closeLong`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ positionId }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshPositions();
        await refreshUser(); // <-- Refresh user balance after closing position
        // Optionally show a toast or notification
      } else {
        alert(data.error || "Failed to close position");
      }
    } catch (err) {
      alert("Failed to close position");
    }
  }

  async function handleCloseShortPosition(positionId) {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/positions/closeShort`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ positionId }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshPositions();
        await refreshUser();
      } else {
        alert(data.error || "Failed to close short position");
      }
    } catch (err) {
      alert("Failed to close short position");
    }
  }

  function getPnL(pos) {
    const currentPrice = prices[pos.asset]
    if (!currentPrice) return "-"
    const entry = Number(pos.boughtPrice)
    const qty = Number(pos.quantity)
    const lev = Number(pos.leverage) || 1
    const pnl = (Number(currentPrice) - entry) * qty * lev
    return pnl.toFixed(2)
  }

  function getCurrentPrice(pos) {
    const price = prices[pos.asset]
    return price ? Number(price).toFixed(2) : "-"
  }

  // Split positions by status
  const openPositions = positions.filter((pos) => pos.status === "open")
  const closedPositions = positions.filter((pos) => pos.status === "closed")
  const liquidatedPositions = positions.filter((pos) => pos.status === "liquidated")
  return (
    <div className="bg-white rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-6 px-4 border-b border-slate-100 shrink-0">
        {TABS.map((item) => (
          <button 
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === item.key ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {tab === "positions" && (
          loadingPositions ? "Loading..." :
          openPositions.length === 0 ? "No open positions" :
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-500 sticky top-0 bg-white">
              <tr>
                <th className="px-2 py-3 font-medium">Asset</th>
                <th className="px-2 py-3 font-medium">Qty</th>
                <th className="px-2 py-3 font-medium">Entry</th>
                <th className="px-2 py-3 font-medium">Lev</th>
                <th className="px-2 py-3 font-medium">Margin</th>
                <th className="px-2 py-3 font-medium">Price</th>
                <th className="px-2 py-3 font-medium">Type</th>
                <th className="px-2 py-3 font-medium">PnL</th>
                <th className="px-2 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {openPositions.map((pos) => (
                <tr key={pos.positionId} className="hover:bg-slate-50/50">
                  <td className="px-2 py-3 text-slate-900 font-medium">{pos.asset}</td>
                  <td className="px-2 py-3">{pos.quantity}</td>
                  <td className="px-2 py-3 font-mono">{Number(pos.boughtPrice).toFixed(2)}</td>
                  <td className="px-2 py-3">{pos.leverage}x</td>
                  <td className="px-2 py-3 font-mono">{Number(pos.margin).toFixed(2)}</td>
                  <td
                    className={`px-2 py-3 font-mono ${
                      Number(getCurrentPrice(pos)) > Number(pos.boughtPrice)
                        ? "text-trade-up"
                        : Number(getCurrentPrice(pos)) < Number(pos.boughtPrice)
                        ? "text-trade-down"
                        : ""
                    }`}
                  >
                    {getCurrentPrice(pos)}
                  </td>
                  <td className={`px-2 py-3 font-medium ${pos.type === 'long' ? "text-trade-up" : "text-trade-down"}`}>
                    {pos.type.toUpperCase()}
                  </td>
                  <td className={`px-2 py-3 font-mono font-medium ${getPnL(pos) > 0 ? "text-trade-up" : getPnL(pos) < 0 ? "text-trade-down" : ""}`}>
                    {getPnL(pos)}
                  </td>
                  <td className="px-2 py-3 font-mono">
                    <button
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                      onClick={() => pos.type === "short" ? handleCloseShortPosition(pos.positionId) : handleClosePosition(pos.positionId)}
                    >
                      Close
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "closed" && (
          loadingPositions ? "Loading..." :
          closedPositions.length === 0 ? "No closed positions" :
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-500 sticky top-0 bg-white">
              <tr>
                <th className="px-2 py-3 font-medium">Asset</th>
                <th className="px-2 py-3 font-medium">Qty</th>
                <th className="px-2 py-3 font-medium">Entry</th>
                <th className="px-2 py-3 font-medium">Lev</th>
                <th className="px-2 py-3 font-medium">Price</th>
                <th className="px-2 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {closedPositions.map((pos) => (
                <tr key={pos.positionId} className="hover:bg-slate-50/50">
                  <td className="px-2 py-3 text-slate-900 font-medium">{pos.asset}</td>
                  <td className="px-2 py-3">{pos.quantity}</td>
                  <td className="px-2 py-3 font-mono">{Number(pos.boughtPrice).toFixed(2)}</td>
                  <td className="px-2 py-3 font-mono">{pos.leverage}x</td>
                  <td className="px-2 py-3 font-mono">{getCurrentPrice(pos)}</td>
                  <td className="px-2 py-3 text-slate-600 font-medium">{pos.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "liquidated" && (
          loadingPositions ? "Loading..." :
          liquidatedPositions.length === 0 ? "No liquidated positions" :
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-500 sticky top-0 bg-white">
              <tr>
                <th className="px-2 py-3 font-medium">Asset</th>
                <th className="px-2 py-3 font-medium">Qty</th>
                <th className="px-2 py-3 font-medium">Entry</th>
                <th className="px-2 py-3 font-medium">Lev</th>
                <th className="px-2 py-3 font-medium">Price</th>
                <th className="px-2 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liquidatedPositions.map((pos) => (
                <tr key={pos.positionId} className="hover:bg-slate-50/50">
                  <td className="px-2 py-3 text-slate-900 font-medium">{pos.asset}</td>
                  <td className="px-2 py-3">{pos.quantity}</td>
                  <td className="px-2 py-3 font-mono">{Number(pos.boughtPrice).toFixed(2)}</td>
                  <td className="px-2 py-3 font-mono">{pos.leverage}x</td>
                  <td className="px-2 py-3 font-mono">{getCurrentPrice(pos)}</td>
                  <td className="px-2 py-3 text-trade-down font-medium">{pos.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
