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
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, position: null })
  const [closing, setClosing] = useState(false)
  
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

  async function confirmClosePosition() {
    if (!confirmModal.position) return;
    setClosing(true);
    const pos = confirmModal.position;
    
    try {
      const endpoint = pos.type === "short" ? "/positions/closeShort" : "/positions/closeLong";
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ positionId: pos.positionId }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshPositions();
        await refreshUser();
      } else {
        alert(data.error || "Failed to close position");
      }
    } catch (err) {
      alert("Failed to close position");
    } finally {
      setClosing(false);
      setConfirmModal({ isOpen: false, position: null });
    }
  }

  function getPnL(pos) {
    const currentPrice = prices[pos.asset]
    if (!currentPrice) return "-"
    const entry = Number(pos.boughtPrice)
    const qty = Number(pos.quantity)
    const lev = Number(pos.leverage) || 1
    
    // Calculate PnL diff based on long/short
    const isShort = pos.type === "short"
    const diff = isShort ? (entry - Number(currentPrice)) : (Number(currentPrice) - entry)
    
    const pnl = diff * qty * lev
    
    // Avoid -0.00 display
    if (Math.abs(pnl) < 0.01) return "0.00"
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
                      onClick={() => setConfirmModal({ isOpen: true, position: pos })}
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

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.position && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 mb-2">
                Confirm Close
              </h3>
              <p className="text-sm text-center text-slate-600 mb-4">
                Are you sure you want to close your {confirmModal.position.type.toUpperCase()} position on {confirmModal.position.asset}?
              </p>
              
              <div className="bg-slate-50 rounded-xl p-3 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Entry Price</span>
                  <span className="font-mono font-medium">${Number(confirmModal.position.boughtPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Price</span>
                  <span className="font-mono font-medium">${getCurrentPrice(confirmModal.position)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="font-medium text-slate-900">Estimated PnL</span>
                  <span className={`font-mono font-bold ${getPnL(confirmModal.position) > 0 ? "text-trade-up" : getPnL(confirmModal.position) < 0 ? "text-trade-down" : "text-slate-900"}`}>
                    ${getPnL(confirmModal.position)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, position: null })}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                  disabled={closing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClosePosition}
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-slate-900 font-bold rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={closing}
                >
                  {closing ? "Closing..." : "Confirm Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
