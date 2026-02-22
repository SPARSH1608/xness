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
    <div className="p-6 bg-white shrink-0 h-full overflow-y-auto">
      <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${orderType === 'market' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          onClick={() => setOrderType('market')}
        >
          Market
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${orderType === 'limit' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          onClick={() => setOrderType('limit')}
        >
          Limit
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${orderType === 'stop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          onClick={() => setOrderType('stop')}
        >
          Stop
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => setSide("buy")}
          className={`py-2 rounded-xl text-sm font-bold transition-all border-2 ${
            side === "buy"
              ? "bg-trade-up/10 border-trade-up text-trade-up"
              : "bg-slate-50 border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          LONG
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`py-2 rounded-xl text-sm font-bold transition-all border-2 ${
            side === "sell"
              ? "bg-trade-down/10 border-trade-down text-trade-down"
              : "bg-slate-50 border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          SHORT
        </button>
      </div>

      <div className="space-y-4">
        {orderType !== 'market' && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wider">
              <span>Price</span>
              <span>USDT</span>
            </div>
            <div className="relative">
              <input 
                type="text" 
                defaultValue={price.toFixed(2)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-right pr-12 text-slate-900"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-sans font-medium">USDT</div>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wider">
            <span>Size</span>
            <span>USDT</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              inputMode="decimal"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-right pr-12 text-slate-900"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-sans font-medium">USDT</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
            <span>Leverage</span>
            <span className="text-slate-900">{effectiveLeverage}x</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 5, 10, 20, 50].map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => { setLeverage(x); setNoLeverage(x===1); }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  effectiveLeverage === x 
                    ? "bg-slate-900 text-white" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {x}x
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[10px] text-slate-500 mb-1.5 font-bold uppercase tracking-wider">Stop Loss</label>
            <input
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-900"
              placeholder="None"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1.5 font-bold uppercase tracking-wider">Take Profit</label>
            <input
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-900"
              placeholder="None"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Margin Required</span>
            <span className="font-mono font-bold text-slate-900">${marginRequired.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Available</span>
            <span className="font-mono font-bold text-slate-900">${available.toFixed(2)}</span>
          </div>
        </div>

        <button
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
            side === "buy" 
              ? "bg-trade-up hover:bg-emerald-600 text-white shadow-trade-up/20" 
              : "bg-trade-down hover:bg-red-600 text-white shadow-trade-down/20"
          } disabled:opacity-50 disabled:cursor-not-allowed mt-4`}
          onClick={handlePlaceOrder}
          disabled={!qty || !user || !sufficient || loading}
        >
          {side === "buy" ? "Open Long" : "Open Short"} {symbol}
        </button>
        
        {!sufficient && user && (
          <div className="text-center text-xs text-trade-down font-medium animate-pulse">
            Insufficient balance for this margin
          </div>
        )}
      </div>
    </div>
  )
}
