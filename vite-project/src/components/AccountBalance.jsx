"use client"

import { useUser } from "../context/userContext"



export default function AccountBalance() {
  const { user } = useUser()
  const total = user?.balance ?? 10000
  const marginUsed = 0
  const unrealized = 0
  const available = total - marginUsed
  const utilization = marginUsed / Math.max(total, 1)

  return (
    <div className="bg-[#0f1318] border border-gray-800 rounded-md p-4">
      <div className="text-sm font-semibold text-gray-300 mb-3">Account Balance</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-gray-400">Total Balance:</div>
        <div className="text-right text-white">${total.toFixed(2)}</div>

        <div className="text-gray-400">Available:</div>
        <div className="text-right text-green-400">${available.toFixed(2)}</div>

        <div className="text-gray-400">Margin Used:</div>
        <div className="text-right text-gray-300">${marginUsed.toFixed(2)}</div>

        <div className="text-gray-400">Unrealized PnL:</div>
        <div className={`text-right ${unrealized >= 0 ? "text-green-400" : "text-red-400"}`}>
          ${unrealized.toFixed(2)}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Balance Utilization</span>
          <span>{Math.round(utilization * 100)}%</span>
        </div>
        <div className="h-1.5 w-full rounded bg-gray-800 overflow-hidden">
          <div className="h-full bg-green-500" style={{ width: `${utilization * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
