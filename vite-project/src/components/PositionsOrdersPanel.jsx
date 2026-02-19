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
      className="bg-[#1e2329] border border-[#2a3038] rounded-md overflow-hidden h-full flex flex-col"
      style={{ height: "300px" }}
    >
      <div className="px-4 py-2 text-[#EAECEF] font-semibold border-b border-[#2a3038]">
        Positions
      </div>
      <div className="grid grid-cols-3 gap-1 bg-[#151a21] p-1 border-b border-[#2a3038]">
        {TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              tab === item.key
                ? "bg-[#2a3038] text-[#EAECEF]"
                : "text-[#848E9C] hover:text-[#EAECEF]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-sm text-[#848E9C] overflow-auto">
        {tab === "positions" && (
          loadingPositions ? "Loading..." :
          openPositions.length === 0 ? "No open positions" :
          <table className="w-full text-xs text-left text-[#848E9C]">
            <thead className="bg-[#151a21] sticky top-0">
              <tr>
                <th className="px-2 py-2 font-medium">Asset</th>
                <th className="px-2 py-2 font-medium">Qty</th>
                <th className="px-2 py-2 font-medium">Entry</th>
                <th className="px-2 py-2 font-medium">Lev</th>
                <th className="px-2 py-2 font-medium">Margin</th>
                <th className="px-2 py-2 font-medium">Price</th>
                <th className="px-2 py-2 font-medium">Type</th>
                <th className="px-2 py-2 font-medium">PnL</th>
                <th className="px-2 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3038]">
              {openPositions.map((pos) => (
                <tr key={pos.positionId} className="hover:bg-[#2a3038]/30">
                  <td className="px-2 py-2 text-[#EAECEF] font-medium">{pos.asset}</td>
                  <td className="px-2 py-2">{pos.quantity}</td>
                  <td className="px-2 py-2">{Number(pos.boughtPrice).toFixed(2)}</td>
                  <td className="px-2 py-2">{pos.leverage}x</td>
                  <td className="px-2 py-2">{Number(pos.margin).toFixed(2)}</td>
                  <td
                    className={`px-2 py-2 ${
                      Number(getCurrentPrice(pos)) > Number(pos.boughtPrice)
                        ? "text-[#0ECB81]"
                        : Number(getCurrentPrice(pos)) < Number(pos.boughtPrice)
                        ? "text-[#F6465D]"
                        : ""
                    }`}
                  >
                    {getCurrentPrice(pos)}
                  </td>
                  <td className={`px-2 py-2 ${pos.type === 'long' ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
                    {pos.type.toUpperCase()}
                  </td>
                  <td className={`px-2 py-2 font-medium ${getPnL(pos) > 0 ? "text-[#0ECB81]" : getPnL(pos) < 0 ? "text-[#F6465D]" : ""}`}>
                    {getPnL(pos)}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      className="bg-[#2a3038] hover:bg-[#353b43] text-[#EAECEF] border border-[#474d57] px-2 py-1 rounded text-xs transition-colors"
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
          <table className="w-full text-xs text-left text-[#848E9C]">
            <thead className="bg-[#151a21] sticky top-0">
              <tr>
                <th className="px-2 py-2 font-medium">Asset</th>
                <th className="px-2 py-2 font-medium">Qty</th>
                <th className="px-2 py-2 font-medium">Entry</th>
                <th className="px-2 py-2 font-medium">Lev</th>
                <th className="px-2 py-2 font-medium">Price</th>
                <th className="px-2 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3038]">
              {closedPositions.map((pos) => (
                <tr key={pos.positionId} className="hover:bg-[#2a3038]/30">
                  <td className="px-2 py-2 text-[#EAECEF]">{pos.asset}</td>
                  <td className="px-2 py-2">{pos.quantity}</td>
                  <td className="px-2 py-2">{Number(pos.boughtPrice).toFixed(2)}</td>
                  <td className="px-2 py-2">{pos.leverage}x</td>
                  <td className="px-2 py-2">{getCurrentPrice(pos)}</td>
                  <td className="px-2 py-2 text-[#EAECEF]">{pos.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "liquidated" && (
          loadingPositions ? "Loading..." :
          liquidatedPositions.length === 0 ? "No liquidated positions" :
          <table className="w-full text-xs text-left text-[#848E9C]">
            <thead className="bg-[#151a21] sticky top-0">
              <tr>
                <th className="px-2 py-2 font-medium">Asset</th>
                <th className="px-2 py-2 font-medium">Qty</th>
                <th className="px-2 py-2 font-medium">Entry</th>
                <th className="px-2 py-2 font-medium">Lev</th>
                <th className="px-2 py-2 font-medium">Price</th>
                <th className="px-2 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3038]">
              {liquidatedPositions.map((pos) => (
                <tr key={pos.positionId} className="hover:bg-[#2a3038]/30">
                  <td className="px-2 py-2 text-[#EAECEF]">{pos.asset}</td>
                  <td className="px-2 py-2">{pos.quantity}</td>
                  <td className="px-2 py-2">{Number(pos.boughtPrice).toFixed(2)}</td>
                  <td className="px-2 py-2">{pos.leverage}x</td>
                  <td className="px-2 py-2">{getCurrentPrice(pos)}</td>
                  <td className="px-2 py-2 text-[#F6465D]">{pos.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
