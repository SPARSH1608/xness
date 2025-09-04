"use client"

import { useMarket } from "../context/MarketContext"

export default function TradesDrawer({ isOpen, onClose }) {
  const { trades, symbol } = useMarket()

  const price = trades[symbol]?.[0]?.price
  const bid = price ? price * 1.01 : undefined
  const ask = price ? price * 0.99 : undefined
 
  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Trades - {symbol}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-3 text-sm font-semibold text-gray-500 pb-2 border-b">
          <div>Price</div>
          <div>Quantity</div>
          <div>Time</div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
          {trades[symbol]?.slice(0, 20).map((trade, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 py-2 border-b text-sm transition-colors duration-300 ${
                index === 0 ? 'bg-yellow-50' : ''
              }`}
            >
              <div className={trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
                {Number(trade.price).toFixed(2)}
              </div>
              <div>{Number(trade.quantity).toFixed(4)}</div>
              <div>{new Date(trade.tradeTime).toLocaleTimeString()}</div>
            </div>
          ))}
          
          {(!trades[symbol] || trades[symbol].length === 0) && (
            <div className="text-center text-gray-500 py-4">No trades yet</div>
          )}
        </div>

        <div className="flex gap-4 text-sm mt-2">
          <span className="text-green-600">Bid: {bid ? `$${bid.toFixed(2)}` : "--"}</span> <br />
          <span className="text-red-600">Ask: {ask ? `$${ask.toFixed(2)}` : "--"}</span>
        </div>
      </div>
    </div>
  )
}