"use client"

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  Bell, 
  Search, 
  Settings, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ChevronDown,
  Menu
} from 'lucide-react';
import { useUser } from "../context/userContext";
import { useMarket } from "../context/MarketContext";

// Functional Components from our project
import AssetsPanel from "../components/AssetsPanel"
import MarketHeader from "../components/MarketHeader"
import TVChart from "../components/TVChart"
import OrderPanel from "../components/OrderPanel"
import PositionsOrdersPanel from "../components/PositionsOrdersPanel"
import RecentTrades from "../components/RecentTrades"

export default function TradePage() {
  const { user, logout, loading, positions } = useUser();
  const { prices, symbol } = useMarket();
  
  // Balance & PnL Logic from TopBar
  const openPositions = useMemo(
    () => positions.filter((pos) => pos.status === "open"),
    [positions]
  );
  
  const totalOpenPnL = useMemo(() => {
    return openPositions.reduce((sum, pos) => {
      const currentPrice = prices[pos.asset];
      if (!currentPrice) return sum;
      
      const entry = Number(pos.boughtPrice);
      const qty = Number(pos.quantity);
      const lev = Number(pos.leverage) || 1;
      const pnl = (Number(currentPrice) - entry) * qty * lev;
      return sum + pnl;
    }, 0);
  }, [openPositions, prices]);

  const fixedBalance = user?.balance ?? 0;
  const liveBalance = fixedBalance + totalOpenPnL;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <BarChart2 className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">Xness+</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button className="px-4 py-1.5 text-sm font-medium bg-white shadow-sm rounded-md text-slate-900">Trade</button>
            <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Markets</button>
            <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Earn</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden lg:flex items-center gap-4 mr-4">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Live Balance</div>
                <div className={`font-mono font-bold ${liveBalance >= fixedBalance ? "text-trade-up" : "text-trade-down"}`}>
                  ${liveBalance.toFixed(2)}
                </div>
              </div>
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                Deposit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5">Login</Link>
               <Link to="/signup" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800">Signup</Link>
            </div>
          )}
          
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
          
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors" onClick={logout}>
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-400 to-blue-500 border-2 border-white shadow-sm cursor-pointer"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white">
        
        {/* Left Sidebar - Markets */}
        <div className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search markets..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <AssetsPanel />
          </div>
          <div className="h-48 border-t border-slate-200 overflow-y-auto p-2">
            <RecentTrades />
          </div>
        </div>

        {/* Center - Chart & Info */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Market Ticker Info */}
          <div className="bg-white border-b border-slate-200 shrink-0">
            <MarketHeader />
          </div>

          {/* Chart Area */}
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
              <TVChart />
            </div>

            {/* Bottom Panels (Positions, Orders, etc) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-72 flex flex-col shrink-0 overflow-hidden">
              <PositionsOrdersPanel />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Order Book & Order Entry */}
        <div className="w-full lg:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          <OrderPanel />
        </div>
      </main>
    </div>
  );
}
