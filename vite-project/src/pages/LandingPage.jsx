import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <BarChart2 className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Xness+</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
          <a href="#markets" className="hover:text-brand-600 transition-colors">Markets</a>
          <a href="#company" className="hover:text-brand-600 transition-colors">Company</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              New: Advanced Options Trading
            </div>
            <h1 className="text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Trade crypto with <span className="text-brand-500">confidence</span> and precision.
            </h1>
            <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
              Experience the next generation of cryptocurrency trading. Lightning-fast execution, advanced charting, and bank-grade security.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/signup" className="flex items-center gap-2 bg-brand-500 text-white px-8 py-4 rounded-full font-medium hover:bg-brand-600 transition-all hover:shadow-lg hover:shadow-brand-500/20">
                Start Trading Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/trade" className="flex items-center gap-2 bg-slate-100 text-slate-900 px-8 py-4 rounded-full font-medium hover:bg-slate-200 transition-colors">
                View Dashboard
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-8 text-sm text-slate-500">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">$50B+</span>
                <span>Quarterly Volume</span>
              </div>
              <div className="w-px h-12 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">2M+</span>
                <span>Active Traders</span>
              </div>
              <div className="w-px h-12 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">0.01s</span>
                <span>Execution Time</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-blue-50 rounded-[2.5rem] transform rotate-3 scale-105 -z-10"></div>
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Total Balance</div>
                  <div className="text-3xl font-bold font-mono">$124,592.50</div>
                </div>
                <div className="flex items-center gap-1 text-trade-up bg-trade-up/10 px-3 py-1 rounded-full text-sm font-medium">
                  +12.5%
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Bitcoin', symbol: 'BTC', price: '$67,389.27', change: '+2.4%', up: true },
                  { name: 'Ethereum', symbol: 'ETH', price: '$3,421.80', change: '+1.2%', up: true },
                  { name: 'Solana', symbol: 'SOL', price: '$142.50', change: '-0.8%', up: false },
                ].map((coin) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                        {coin.symbol[0]}
                      </div>
                      <div>
                        <div className="font-semibold">{coin.name}</div>
                        <div className="text-sm text-slate-500">{coin.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">{coin.price}</div>
                      <div className={`text-sm font-medium ${coin.up ? 'text-trade-up' : 'text-trade-down'}`}>
                        {coin.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to trade like a pro</h2>
            <p className="text-slate-500">Powerful tools designed for both beginners and advanced traders.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-brand-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-slate-500 leading-relaxed">Execute trades in milliseconds. Our matching engine handles millions of transactions per second.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bank-grade Security</h3>
              <p className="text-slate-500 leading-relaxed">Your assets are protected by industry-leading encryption and cold storage solutions.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <BarChart2 className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Charting</h3>
              <p className="text-slate-500 leading-relaxed">Professional-grade trading tools and indicators to help you make informed decisions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
