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
    <div
      className="bg-[#0f1318] border border-gray-800 rounded-md overflow-hidden h-full flex flex-col"
      style={{ height: "300px" }} // <-- Add this line for fixed height
    >
      <div className="px-4 py-2 text-gray-300 font-semibold border-b border-gray-800">
        Positions
      </div>
      <div className="grid grid-cols-3 gap-1 bg-[#0b0f14] p-1 border-b border-gray-800">
        {TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-3 py-2 rounded text-sm ${
              tab === item.key
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-sm text-gray-500 overflow-auto">
        {tab === "positions" && (
          loadingPositions ? "Loading..." :
          openPositions.length === 0 ? "No open positions" :
          <table className="w-full text-xs text-left text-gray-400">
            <thead>
              <tr>
                <th className="px-2 py-1">Asset</th>
                <th className="px-2 py-1">Qty</th>
                <th className="px-2 py-1">Entry</th>
                <th className="px-2 py-1">Leverage</th>
                <th className="px-2 py-1">Margin</th>
                <th className="px-2 py-1">Current Price</th>
                <th className="px-2 py-1">Type</th> {/* Add this */}
                <th className="px-2 py-1">PnL</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {openPositions.map((pos) => (
                <tr key={pos.positionId}>
                  <td className="px-2 py-1">{pos.asset}</td>
                  <td className="px-2 py-1">{pos.quantity}</td>
                  <td className="px-2 py-1">{pos.boughtPrice}</td>
                  <td className="px-2 py-1">{pos.leverage}</td>
                  <td className="px-2 py-1">{pos.margin}</td>
                  <td
                    className={`px-2 py-1 ${
                      Number(getCurrentPrice(pos)) > Number(pos.boughtPrice)
                        ? "text-green-400"
                        : Number(getCurrentPrice(pos)) < Number(pos.boughtPrice)
                        ? "text-red-400"
                        : ""
                    }`}
                  >
                    {getCurrentPrice(pos)}
                  </td>
                  <td className="px-2 py-1">{pos.type}</td> {/* Add this */}
                  <td className={`px-2 py-1 ${getPnL(pos) > 0 ? "text-green-400" : getPnL(pos) < 0 ? "text-red-400" : ""}`}>
                    {getPnL(pos)}
                  </td>
                  <td className="px-2 py-1">{pos.status}</td>
                  <td className="px-2 py-1">
                    {pos.type === "short" ? (
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                        onClick={() => handleCloseShortPosition(pos.positionId)}
                      >
                        Close 
                      </button>
                    ) : (
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                        onClick={() => handleClosePosition(pos.positionId)}
                      >
                        Close 
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "closed" && (
          loadingPositions ? "Loading..." :
          closedPositions.length === 0 ? "No closed positions" :
          <table className="w-full text-xs text-left text-gray-400">
            <thead>
              <tr>
                <th className="px-2 py-1">Asset</th>
                <th className="px-2 py-1">Qty</th>
                <th className="px-2 py-1">Entry</th>
                <th className="px-2 py-1">Leverage</th>
                <th className="px-2 py-1">Margin</th>
                <th className="px-2 py-1">Current Price</th>
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {closedPositions.map((pos) => (
                <tr key={pos.positionId}>
                  <td className="px-2 py-1">{pos.asset}</td>
                  <td className="px-2 py-1">{pos.quantity}</td>
                  <td className="px-2 py-1">{pos.boughtPrice}</td>
                  <td className="px-2 py-1">{pos.leverage}</td>
                  <td className="px-2 py-1">{pos.margin}</td>
                  <td className="px-2 py-1">{getCurrentPrice(pos)}</td>
                  <td className="px-2 py-1">{pos.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "liquidated" && (
          loadingPositions ? "Loading..." :
          liquidatedPositions.length === 0 ? "No liquidated positions" :
          <table className="w-full text-xs text-left text-gray-400">
            <thead>
              <tr>
                <th className="px-2 py-1">Asset</th>
                <th className="px-2 py-1">Qty</th>
                <th className="px-2 py-1">Entry</th>
                <th className="px-2 py-1">Leverage</th>
                <th className="px-2 py-1">Margin</th>
                <th className="px-2 py-1">Current Price</th>
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {liquidatedPositions.map((pos) => (
                <tr key={pos.positionId}>
                  <td className="px-2 py-1">{pos.asset}</td>
                  <td className="px-2 py-1">{pos.quantity}</td>
                  <td className="px-2 py-1">{pos.boughtPrice}</td>
                  <td className="px-2 py-1">{pos.leverage}</td>
                  <td className="px-2 py-1">{pos.margin}</td>
                  <td className="px-2 py-1">{getCurrentPrice(pos)}</td>
                  <td className="px-2 py-1">{pos.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
