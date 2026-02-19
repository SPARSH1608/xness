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
    <div className="p-4 bg-[#1e2329] text-[#EAECEF] rounded-md border border-[#2a3038]">
      <div className="flex items-center justify-between mb-4 border-b border-[#2a3038] pb-3">
        <h2 className="text-base font-semibold">Place Order</h2>
      </div>

      {/* Long/Short segmented toggle */}
      <div className="mb-5 grid grid-cols-2 gap-0 bg-[#0b0e11] p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`h-8 rounded-md text-sm font-medium transition-all ${
            side === "buy"
              ? "bg-[#2a3038] text-[#0ECB81] shadow-sm"
              : "text-[#848E9C] hover:text-[#EAECEF]"
          }`}
        >
          Buy Left
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`h-8 rounded-md text-sm font-medium transition-all ${
            side === "sell"
              ? "bg-[#2a3038] text-[#F6465D] shadow-sm"
              : "text-[#848E9C] hover:text-[#EAECEF]"
          }`}
        >
          Sell Right
        </button>
      </div>

      {/* Order Type */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
           <label className="text-xs text-[#848E9C]">Type</label>
        </div>
        <select
          className="w-full h-10 px-3 bg-[#2a3038] border border-transparent rounded-md text-[#EAECEF] text-sm focus:outline-none focus:border-[#474d57] transition-colors appearance-none cursor-pointer"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop">Stop Limit</option>
        </select>
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
           <label className="text-xs text-[#848E9C]">Size</label>
        </div>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            className="w-full h-10 px-3 bg-[#2a3038] border border-transparent rounded-md text-[#EAECEF] text-sm placeholder-[#474d57] focus:outline-none focus:border-[#474d57] transition-colors"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Amount"
            min="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#848E9C] font-medium">USDT</span>
        </div>
      </div>

      {/* Leverage */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
           <label className="text-xs text-[#848E9C]">Leverage</label>
           <span className="text-xs font-medium text-[#EAECEF]">{effectiveLeverage}x</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-2">
          {[1, 5, 10, 20, 50].map((x) => (
             <button
               key={x}
               type="button"
               onClick={() => { setLeverage(x); setNoLeverage(x===1); }}
               className={`h-7 rounded text-xs font-medium transition-colors ${
                 effectiveLeverage === x 
                   ? "bg-[#474d57] text-[#EAECEF]" 
                   : "bg-[#2a3038] text-[#848E9C] hover:bg-[#353b43]"
               }`}
             >
               {x}x
             </button>
          ))}
        </div>
      </div>

      {/* Inputs for Stop/Profit */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs text-[#848E9C] mb-1.5">Stop Loss</label>
          <input
            type="number"
            className="w-full h-9 px-2 bg-[#2a3038] rounded text-sm text-[#EAECEF] border border-transparent focus:border-[#474d57] focus:outline-none"
            placeholder="Price"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-[#848E9C] mb-1.5">Take Profit</label>
           <input
            type="number"
            className="w-full h-9 px-2 bg-[#2a3038] rounded text-sm text-[#EAECEF] border border-transparent focus:border-[#474d57] focus:outline-none"
            placeholder="Price"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
          />
        </div>
      </div>
      
      {/* Summary */}
      <div className="mb-5 p-3 bg-[#0b0e11] rounded border border-[#2a3038]">
         <div className="flex justify-between items-center text-xs mb-1">
           <span className="text-[#848E9C]">Cost</span>
           <span className="text-[#EAECEF]">${totalCost.toFixed(2)}</span>
         </div>
         <div className="flex justify-between items-center text-xs">
           <span className="text-[#848E9C]">Available</span>
           <span className="text-[#EAECEF]">${available.toFixed(2)}</span>
         </div>
      </div>

      {/* Main CTA */}
      <button
        className={`w-full h-11 rounded-md font-bold text-sm transition-all shadow-lg ${
          side === "buy" 
            ? "bg-[#0ECB81] hover:brightness-110 text-white" 
            : "bg-[#F6465D] hover:brightness-110 text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={handlePlaceOrder}
        disabled={!qty || !user || !sufficient}
      >
        {side === "buy" ? "Buy / Long" : "Sell / Short"} {symbol}
      </button>
      
      {!sufficient && (
        <div className="mt-2 text-center text-xs text-[#F6465D]">
          Insufficient balance
        </div>
      )}
    </div>
  )
}
