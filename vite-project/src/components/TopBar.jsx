"use client"

import { useUser } from "../context/userContext";
import { useMarket } from "../context/MarketContext";
import { useMemo } from "react";
import { useState } from "react";

export default function TopBar() {
  const { user, logout, loading, positions, login, signup } = useUser();
  const { prices } = useMarket();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", username: "", phone: "" });
  const [error, setError] = useState("");

  // Calculate open positions PnL
  const openPositions = useMemo(
    () => positions.filter((pos) => pos.status === "open"),
    [positions]
  );
  const totalOpenPnL = useMemo(() => {
    // You may need to adjust this formula for your PnL logic
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

  // Fixed balance from backend
  const fixedBalance = user?.balance ?? 0;
  // Live balance = fixed + open PnL
  const liveBalance = fixedBalance + totalOpenPnL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(form.email, form.password);
    if (!res.success) setError(res.error || "Login failed");
    else setShowLogin(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    const res = await signup(form.username, form.email, form.password, form.phone);
    if (!res.success) setError(res.error || "Signup failed");
    else setShowSignup(false);
  };

  return (
    <div className="w-full border-b border-[#2a3038] bg-[#0b0e11]">
      <div className="mx-auto max-w-screen-2xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#EAECEF] font-bold tracking-tight">TradeStream</span>
          <span className="text-[#2a3038]">|</span>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#0ECB81]" aria-hidden />
            <span className="text-xs text-[#848E9C]">Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs text-[#848E9C]">
                Hello, <b className="text-[#EAECEF]">{user.username}</b>
                {" | "}Fixed Balance: <b className="text-[#EAECEF]">${fixedBalance.toFixed(2)}</b>
                {" | "}Live Balance: <b className={liveBalance >= fixedBalance ? "text-[#0ECB81]" : "text-[#F6465D]"}>
                  ${liveBalance.toFixed(2)}
                </b>
              </span>
              <button
                className="text-xs text-[#F6465D] border border-[#F6465D] rounded px-2 py-1 ml-2 hover:bg-[#F6465D]/10 transition-colors"
                onClick={logout}
                disabled={loading}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="text-xs text-[#EAECEF] hover:text-[#0ECB81] transition-colors"
                onClick={() => { setShowLogin(true); setShowSignup(false); }}
              >
                Login
              </button>
              <button
                className="text-xs bg-[#EAECEF] text-[#0b0e11] px-3 py-1 rounded font-medium hover:bg-white transition-colors"
                onClick={() => { setShowSignup(true); setShowLogin(false); }}
              >
                Signup
              </button>
            </>
          )}
        </div>
      </div>
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <form
            className="bg-[#1e2329] p-6 rounded-lg shadow-xl border border-[#2a3038] flex flex-col gap-4 min-w-[320px]"
            onSubmit={handleLogin}
          >
            <h2 className="text-lg text-[#EAECEF] font-semibold">Login</h2>
            <input
              className="p-2.5 rounded bg-[#2a3038] text-[#EAECEF] border border-transparent focus:border-[#474d57] outline-none transition-colors"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              className="p-2.5 rounded bg-[#2a3038] text-[#EAECEF] border border-transparent focus:border-[#474d57] outline-none transition-colors"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            {error && <div className="text-[#F6465D] text-xs">{error}</div>}
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 bg-[#0ECB81] hover:brightness-110 text-white py-2 rounded font-medium transition-all"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <button
                className="px-4 text-[#848E9C] hover:text-[#EAECEF] transition-colors"
                type="button"
                onClick={() => setShowLogin(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <form
            className="bg-[#1e2329] p-6 rounded-lg shadow-xl border border-[#2a3038] flex flex-col gap-4 min-w-[320px]"
            onSubmit={handleSignup}
          >
            <h2 className="text-lg text-[#EAECEF] font-semibold">Signup</h2>
            <input
              className="p-2.5 rounded bg-[#2a3038] text-[#EAECEF] border border-transparent focus:border-[#474d57] outline-none transition-colors"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
            />
            <input
              className="p-2.5 rounded bg-[#2a3038] text-[#EAECEF] border border-transparent focus:border-[#474d57] outline-none transition-colors"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              className="p-2.5 rounded bg-[#2a3038] text-[#EAECEF] border border-transparent focus:border-[#474d57] outline-none transition-colors"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <input
              className="p-2.5 rounded bg-[#2a3038] text-[#EAECEF] border border-transparent focus:border-[#474d57] outline-none transition-colors"
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              required
            />
            {error && <div className="text-[#F6465D] text-xs">{error}</div>}
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 bg-[#0ECB81] hover:brightness-110 text-white py-2 rounded font-medium transition-all"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Signup"}
              </button>
              <button
                className="px-4 text-[#848E9C] hover:text-[#EAECEF] transition-colors"
                type="button"
                onClick={() => setShowSignup(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
