"use client"

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
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
      
      // Calculate diff based on type
      const isShort = pos.type === "short";
      const diff = isShort ? (entry - Number(currentPrice)) : (Number(currentPrice) - entry);
      const pnl = diff * qty * lev;
      
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
        </div>
          
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden lg:block text-right mr-2">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Live Balance</div>
                <div className={`font-mono font-bold ${liveBalance >= fixedBalance ? "text-trade-up" : "text-trade-down"}`}>
                  ${liveBalance.toFixed(2)}
                </div>
              </div>
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                Deposit
              </button>
              <button onClick={() => setShowLogoutModal(true)} className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5">Login</Link>
               <Link to="/signup" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800">Signup</Link>
            </div>
          )}
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
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
            <AssetsPanel />
            <div className="h-128 border-t border-slate-200 shrink-0 overflow-y-auto">
              <RecentTrades />
            </div>
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-center text-slate-600 mb-6">
                Are you sure you want to log out of your account?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
