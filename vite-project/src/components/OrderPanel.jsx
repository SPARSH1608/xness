"use client"

import { useState, useMemo } from "react"
import { useMarket } from "../context/MarketContext"
import { useUser } from "../context/userContext"

export default function OrderPanel() {
  const { symbol, prices } = useMarket()
  const { user, refreshUser } = useUser()

  const [orderType, setOrderType] = useState("market")
  // keep API compatibility (buy/sell) while UI shows Long/Short
  const [side, setSide] = useState("buy")
  const [quantity, setQuantity] = useState("0.01")
  const [leverage, setLeverage] = useState(10)
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")
  const [noLeverage, setNoLeverage] = useState(false)

  const price = Number(prices[symbol] ?? 0)
  const qty = Number.parseFloat(quantity) || 0

  const notional = useMemo(() => qty * price, [qty, price])
  // Calculate margin on frontend
  const effectiveLeverage = noLeverage ? 1 : leverage
  const marginRequired = useMemo(() => (effectiveLeverage > 0 ? notional / effectiveLeverage : 0), [notional, effectiveLeverage])
  const fee = useMemo(() => notional * 0.001, [notional]) // 0.10%

  const totalCost = marginRequired + fee
  const available = user?.balance ?? 0
  const requiredBalance = marginRequired * effectiveLeverage + fee;
  console.log('available',available, requiredBalance)
  const sufficient = available >= requiredBalance

  const sideLabel = side === "buy" ? "LONG" : "SHORT"

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please login to place orders")
      return
    }
    if (!qty || qty <= 0) {
      alert("Enter a valid quantity")
      return
    }
    // Check margin before sending request
  if (!sufficient) {
  alert(`You need at least $${requiredBalance.toFixed(2)} to open this position (margin * leverage + fee).`);
  return;
}
    try {
   const endpoint =
  side === "buy"
    ? "/positions/createLong"
    : "/positions/createShort";
const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          asset: symbol,
          quantity: qty,
          leverage,
          stopLoss: stopLoss ? Number(stopLoss) : undefined,       // <-- add
          takeProfit: takeProfit ? Number(takeProfit) : undefined, // <-- add
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Order failed")
        return
      }
      alert("Order placed successfully!")
      setStopLoss("")
      setTakeProfit("")
      await refreshUser();
      // Optionally: refresh user balance and positions here
    } catch (err) {
      alert("Error placing order")
    }
  }

  const onSelectLev = (x) => {
    setLeverage(x)
  }

  return (
    <div className="p-4 bg-[#111418] text-gray-100 rounded-md border border-gray-800">
      <h2 className="text-base font-semibold mb-4 border-b border-gray-800 pb-2">Order Panel</h2>

      {/* Long/Short segmented toggle */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={side === "buy"}
          onClick={() => setSide("buy")}
          className={`h-9 rounded-md border text-sm font-medium transition ${
            side === "buy"
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-[#191e25] border-gray-800 text-gray-300 hover:text-white"
          }`}
        >
          Long
        </button>
        <button
          type="button"
          aria-pressed={side === "sell"}
          onClick={() => setSide("sell")}
          className={`h-9 rounded-md border text-sm font-medium transition ${
            side === "sell"
              ? "bg-red-600 border-red-600 text-white"
              : "bg-[#191e25] border-gray-800 text-gray-300 hover:text-white"
          }`}
        >
          Short
        </button>
      </div>

      {/* Order Type */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-2 text-gray-400">Order Type</label>
        <select
          className="w-full h-9 px-3 bg-[#191e25] border border-gray-800 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop">Stop</option>
        </select>
      </div>

      {/* Quantity + Notional hint */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-2 text-gray-400">Quantity</label>
        <input
          type="number"
          inputMode="decimal"
          className="w-full h-9 px-3 bg-[#191e25] border border-gray-800 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0.00"
          min="0"
        />
        <div className="mt-1 text-[11px] text-gray-500">Notional: ${notional.toFixed(2)}</div>
      </div>

      {/* No Leverage Option */}
      <div className="mb-2 flex items-center gap-2">
        <input
          type="checkbox"
          id="noLeverage"
          checked={noLeverage}
          onChange={(e) => {
            setNoLeverage(e.target.checked)
            if (e.target.checked) setLeverage(1)
          }}
        />
        <label htmlFor="noLeverage" className="text-xs text-gray-400 select-none">
          No leverage (1x)
        </label>
      </div>

      {/* Leverage presets + numeric */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-400">
            Leverage: {effectiveLeverage}x
          </label>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-2">
          {[5, 10, 20, 50].map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => { if (!noLeverage) setLeverage(x) }}
              className={`h-9 rounded-md border text-sm transition ${
                leverage === x && !noLeverage ? "border-emerald-600 text-white" : "border-gray-800 text-gray-300 hover:text-white"
              } bg-[#191e25]`}
              disabled={noLeverage}
            >
              {x}x
            </button>
          ))}
        </div>
        <input
          type="number"
          inputMode="numeric"
          className="w-full h-9 px-3 bg-[#191e25] border border-gray-800 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-800 disabled:text-gray-500"
          value={effectiveLeverage}
          onChange={(e) => setLeverage(Math.max(1, Number.parseInt(e.target.value || "0")))}
          placeholder="10"
          min={1}
          disabled={noLeverage}
        />
      </div>

      {/* Margin Required (read-only, not user-editable) */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-2 text-gray-400">Margin Required (USDT)</label>
        <input
          readOnly
          tabIndex={-1}
          className="w-full h-9 px-3 bg-gray-800 border border-gray-800 rounded-md text-gray-500 cursor-not-allowed"
          value={marginRequired ? marginRequired.toFixed(2) : "0.00"}
        />
        <div className="mt-1 flex items-center justify-between text-[11px]">
          <span className="text-gray-500">Available: ${available.toFixed(2)}</span>
          <span className={sufficient ? "text-emerald-500" : "text-red-500"}>
            {sufficient ? "✓ Sufficient" : "Insufficient"}
          </span>
        </div>
      </div>

      {/* Stop Loss / Take Profit (Optional) */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-2 text-gray-400">Stop Loss (Optional)</label>
        <input
          type="number"
          inputMode="decimal"
          className="w-full h-9 px-3 bg-[#191e25] border border-gray-800 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          value={stopLoss}
          onChange={(e) => setStopLoss(e.target.value)}
          placeholder="Stop loss price"
          min="0"
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-medium mb-2 text-gray-400">Take Profit (Optional)</label>
        <input
          type="number"
          inputMode="decimal"
          className="w-full h-9 px-3 bg-[#191e25] border border-gray-800 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          value={takeProfit}
          onChange={(e) => setTakeProfit(e.target.value)}
          placeholder="Take profit price"
          min="0"
        />
      </div>

      {/* CTA */}
      <button
        className={`w-full h-9 rounded-md font-semibold transition ${
          side === "buy" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
        } text-white disabled:bg-gray-600 disabled:cursor-not-allowed`}
        onClick={handlePlaceOrder}
        disabled={!qty || !user || !sufficient}
      >
        {sideLabel} {qty || 0} {orderType === "market" ? "at Market" : "Order"}
      </button>

      {/* Cost Summary */}
      <div className="mt-4 rounded-md border border-gray-800 bg-[#171b21] px-4 py-3 text-sm">
        <div className="flex items-center justify-between text-gray-300">
          <span>Est. Margin:</span>
          <span>${marginRequired.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-300">
          <span>Est. Fee:</span>
          <span>${fee.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between font-medium">
          <span>Total Cost:</span>
          <span>${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Foot price line */}
      <div className="mt-3 text-center text-xs text-gray-500">
        Current Price: {price ? `$${price.toFixed(2)}` : "Loading..."}
      </div>
    </div>
  )
}
