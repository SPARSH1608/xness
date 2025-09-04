"use client"

import Split from "react-split"
import AssetsPanel from "../components/AssetsPanel"
import MarketHeader from "../components/MarketHeader"
import TVChart from "../components/TVChart"
import AccountBalance from "../components/AccountBalance"
import OrderPanel from "../components/OrderPanel"
import PositionsOrdersPanel from "../components/PositionsOrdersPanel"
import RecentTrades from "../components/RecentTrades"
import { MarketProvider } from "../context/MarketContext"
import { UserProvider } from "../context/UserContext"
import TopBar from "../components/TopBar"

export default function Page() {
  return (
    <UserProvider>
      <MarketProvider>
        <div className="h-screen w-full bg-[#0b0f14] text-gray-200 flex flex-col">
          <TopBar />
          <Split
            className="flex-1 flex overflow-hidden"
            sizes={[20, 60, 20]}
            minSize={[180, 300, 220]}
            maxSize={[600, Infinity, 700]}
            gutterSize={24} // <-- match your CSS!
            expandToMin={true}
          >
            {/* Left column */}
            <aside className="h-full flex flex-col border-r border-gray-800 overflow-y-auto bg-[#10151c]">
              <AssetsPanel />
              <div className="p-3">
                <RecentTrades />
              </div>
            </aside>

            {/* Center column */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0 overflow-y-auto">
              <MarketHeader />
              <div className="flex-1 min-w-0">
                <TVChart />
              </div>
              <div className="h-56 p-3 min-w-0">
                <PositionsOrdersPanel />
              </div>
            </main>

            {/* Right column */}
            <aside className="h-full flex flex-col border-l border-gray-800 overflow-y-auto p-3 space-y-3 bg-[#10151c] min-w-0">
        
              <OrderPanel />
            </aside>
          </Split>
        </div>
      </MarketProvider>
    </UserProvider>
  )
}
