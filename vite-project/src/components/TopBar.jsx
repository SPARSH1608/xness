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
    <div className="w-full border-b border-gray-800 bg-black">
      <div className="mx-auto max-w-screen-2xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">TradeStream</span>
          <span className="text-gray-500">|</span>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" aria-hidden />
            <span className="text-xs text-gray-400">Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs text-gray-300">
                Hello, <b>{user.username}</b>
                {" | "}Fixed Balance: <b>${fixedBalance.toFixed(2)}</b>
                {" | "}Live Balance: <b className={liveBalance >= fixedBalance ? "text-green-400" : "text-red-400"}>
                  ${liveBalance.toFixed(2)}
                </b>
              </span>
              <button
                className="text-xs text-red-400 border border-red-400 rounded px-2 py-1 ml-2"
                onClick={logout}
                disabled={loading}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="text-xs text-gray-300 border border-gray-700 rounded px-2 py-1"
                onClick={() => { setShowLogin(true); setShowSignup(false); }}
              >
                Login
              </button>
              <button
                className="text-xs text-gray-300 border border-gray-700 rounded px-2 py-1"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form
            className="bg-[#181c23] p-6 rounded shadow-md flex flex-col gap-3 min-w-[300px]"
            onSubmit={handleLogin}
          >
            <h2 className="text-lg text-white mb-2">Login</h2>
            <input
              className="p-2 rounded bg-gray-900 text-white"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              className="p-2 rounded bg-gray-900 text-white"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            {error && <div className="text-red-400 text-xs">{error}</div>}
            <div className="flex gap-2 mt-2">
              <button
                className="bg-green-600 text-white px-4 py-1 rounded"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <button
                className="text-gray-400 px-4 py-1 rounded border border-gray-700"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form
            className="bg-[#181c23] p-6 rounded shadow-md flex flex-col gap-3 min-w-[300px]"
            onSubmit={handleSignup}
          >
            <h2 className="text-lg text-white mb-2">Signup</h2>
            <input
              className="p-2 rounded bg-gray-900 text-white"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
            />
            <input
              className="p-2 rounded bg-gray-900 text-white"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              className="p-2 rounded bg-gray-900 text-white"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <input
              className="p-2 rounded bg-gray-900 text-white"
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              required
            />
            {error && <div className="text-red-400 text-xs">{error}</div>}
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Signup"}
              </button>
              <button
                className="text-gray-400 px-4 py-1 rounded border border-gray-700"
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
