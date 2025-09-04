"use client"

import { useState, useEffect } from "react"
import { useUser } from "../context/UserContext"

export default function PositionsPanel() {
  const { user } = useUser()
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("positions")

  useEffect(() => {
    if (user) {
      fetchPositions()
    }
  }, [user])

  const fetchPositions = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/positions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setPositions(data)
      }
    } catch (error) {
      console.error("Error fetching positions:", error)
    } finally {
      setLoading(false)
    }
  }

  const closePosition = async (positionId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/positions/${positionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        alert("Position closed successfully")
        fetchPositions()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert("Error closing position")
    }
  }

  if (!user) {
    return (
      <div className="p-4 bg-black text-white h-full">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Positions & Orders</h2>
        <p className="text-gray-500">Please login to view your positions</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-black text-white h-full">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-4 text-gray-200 border-b border-gray-800 pb-2">
        Incidence & Orders
      </h2>

      {/* Tab Navigation */}
      <div className="grid grid-cols-3 gap-1 mb-4 bg-gray-900 rounded p-1">
        <button
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === "positions" 
              ? "bg-blue-600 text-white" 
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("positions")}
        >
          Positions
        </button>
        <button
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === "orders" 
              ? "bg-blue-600 text-white" 
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Open Orders
        </button>
        <button
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === "history" 
              ? "bg-blue-600 text-white" 
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={fetchPositions}
          className="text-blue-400 hover:text-blue-300 text-sm bg-gray-800 px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-400">Loading positions...</div>
        </div>
      ) : positions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No open positions</div>
          <div className="text-xs text-gray-600">No exam positions</div>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map(position => (
            <div key={position.positionId} className="p-3 bg-gray-900 border border-gray-800 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-white">{position.asset}</div>
                  <div className={`text-xs ${position.type === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                    {position.type.toUpperCase()} • {position.leverage}x
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">${position.boughtPrice.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">Qty: {position.quantity}</div>
                </div>
              </div>
              
              {/* Position Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Margin</div>
                  <div className="text-white">${position.margin.toFixed(2)}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Liq. Price</div>
                  <div className="text-white">${position.liquidationPrice?.toFixed(2) || 'N/A'}</div>
                </div>
              </div>

              {/* Stop Loss & Take Profit */}
              {(position.stopLoss || position.takeProfit) && (
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  {position.stopLoss && (
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-gray-400">Stop Loss</div>
                      <div className="text-white">${position.stopLoss.toFixed(2)}</div>
                    </div>
                  )}
                  {position.takeProfit && (
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-gray-400">Take Profit</div>
                      <div className="text-white">${position.takeProfit.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Close Position Button */}
              <button
                onClick={() => closePosition(position.positionId)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-xs font-medium transition-colors"
              >
                Close Position
              </button>
            </div>
          ))}
        </div>
      )}

      {/* About USDT/IPP Section */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <h3 className="text-md font-semibold mb-3 text-gray-400">About USDT/IPP</h3>
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 p-3 border-b border-gray-800">
            <div className="text-sm text-gray-300">Annual Master and Service Analysis</div>
            <div className="text-sm text-white text-right">$15,000</div>
          </div>
          <div className="grid grid-cols-2 gap-4 p-3">
            <div className="text-sm text-gray-300">$25,000 per 1-year-old/No</div>
            <div className="text-sm text-white text-right">$25,000</div>
          </div>
        </div>
      </div>
    </div>
  )
}