"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useSocket } from "./SocketContext"

const Ctx = createContext({
  symbol: "BTCUSDT",
  setSymbol: () => {},
  interval: "1m",
  setInterval: () => {},
  prices: { BTCUSDT: undefined, ETHUSDT: undefined, SOLUSDT: undefined },
  trades: { BTCUSDT: [], ETHUSDT: [], SOLUSDT: [] },
  candles: [],
  loadingCandles: true,
})

const ASSETS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
const INTERVALS = ["1min", "3min", "5min", "10min", "15min", "30min", "1h", "2h", "4h", "1d", "1w"]

const API_BASE = import.meta.env.VITE_BASE_API_URL

export function MarketProvider({ children }) {
  const { socket, joinAssetRoom } = useSocket()
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [interval, setInterval] = useState("1min")
  const [prices, setPrices] = useState({ BTCUSDT: undefined, ETHUSDT: undefined, SOLUSDT: undefined })
  const [trades, setTrades] = useState({ BTCUSDT: [], ETHUSDT: [], SOLUSDT: [] })
  const [candles, setCandles] = useState([])
  const [loadingCandles, setLoadingCandles] = useState(true)
  const [liveCandle, setLiveCandle] = useState(null)

  // Update socket room when symbol changes
  useEffect(() => {
    if (symbol) {
      joinAssetRoom(symbol.toLowerCase())
    }
  }, [symbol, joinAssetRoom])

  // Fetch candle data from API only
  useEffect(() => {
    let cancelled = false
    setLoadingCandles(true)

    const fetchData = async () => {
      try {
        if (API_BASE) {
          const r = await fetch(`${API_BASE}/candles/${symbol}/${interval}`)
          if (r.ok) {
            const data = await r.json()
            if (!cancelled) {
              const formattedCandles = data.map((c) => ({
                time: c.time ?? Math.floor((c.t || c.openTime || Date.now()) / 1000),
                open: +(c.open || c.o),
                high: +(c.high || c.h),
                low: +(c.low || c.l),
                close: +(c.close || c.c),
                volume: +(c.volume || c.v),
              }))
              setCandles(formattedCandles)
              setLoadingCandles(false)
              return
            }
          }
        }
        // If API fails, set empty candles
        if (!cancelled) {
          setCandles([])
          setLoadingCandles(false)
        }
      } catch (error) {
        console.error("Error fetching candles:", error)
        if (!cancelled) {
          setCandles([])
          setLoadingCandles(false)
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [symbol, interval])

  // Store trades and prices for other UI (not for chart)
  useEffect(() => {
    if (!socket) return

    const onTrade = (payload) => {
      const asset = payload.asset.toUpperCase()
      setTrades((prev) => {
        const list = [payload, ...(prev[asset] || [])].slice(0, 200)
        return { ...prev, [asset]: list }
      })
      setPrices((p) => ({ ...p, [asset]: payload.price }))

      // --- Live candle logic ---
      if (asset === symbol) {
        setLiveCandle((prev) => {
          // Calculate the bucket start time for this trade
          const tradeTime = payload.tradeTime || payload.time || Date.now()
          const intervalSec = getIntervalSeconds(interval)
          const bucketTime = Math.floor(tradeTime / 1000 / intervalSec) * intervalSec

          // If prev is for this bucket, update it; else, start a new one
          if (prev && prev.time === bucketTime) {
            return {
              ...prev,
              high: Math.max(prev.high, +payload.price),
              low: Math.min(prev.low, +payload.price),
              close: +payload.price,
              volume: prev.volume + +payload.quantity,
            }
          } else {
            // Start a new candle
            return {
              time: bucketTime,
              open: +payload.price,
              high: +payload.price,
              low: +payload.price,
              close: +payload.price,
              volume: +payload.quantity,
            }
          }
        })
      }
    }

    socket.on("trade", onTrade)
    return () => {
      socket.off("trade", onTrade)
    }
  }, [socket, symbol, interval])

  const displayCandles = useMemo(() => {
    if (!liveCandle) return candles
    // If liveCandle is for a new bucket, append; if for the last, replace
    if (!candles.length || liveCandle.time > candles[candles.length - 1].time) {
      return [...candles, liveCandle]
    } else if (liveCandle.time === candles[candles.length - 1].time) {
      return [...candles.slice(0, -1), liveCandle]
    }
    return candles
  }, [candles, liveCandle])

  const value = useMemo(
    () => ({ symbol, setSymbol, interval, setInterval, prices, trades, candles, loadingCandles }),
    [symbol, interval, prices, trades, candles, loadingCandles],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useMarket() {
  return useContext(Ctx)
}
export { INTERVALS }

function getIntervalSeconds(interval) {
  if (interval.endsWith("min")) return parseInt(interval) * 60
  if (interval.endsWith("h")) return parseInt(interval) * 60 * 60
  if (interval.endsWith("d")) return parseInt(interval) * 60 * 60 * 24
  if (interval.endsWith("w")) return parseInt(interval) * 60 * 60 * 24 * 7
  return 60 // default 1min
}