"use client";

import { createChart, CandlestickSeries, HistogramSeries } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { useMarket, INTERVALS } from "../context/MarketContext";

export default function TVChart() {
  const priceChartRef = useRef(null);
  const volumeChartRef = useRef(null);
  const priceChartInstance = useRef(null);
  const volumeChartInstance = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const { symbol, candles, loadingCandles, interval, setInterval, liveCandle } = useMarket();
  const [chartsReady, setChartsReady] = useState(false);

  // Initialize charts
  useEffect(() => {
    if (!priceChartRef.current || !volumeChartRef.current) return;

    // Clean up previous charts if they exist
    if (priceChartInstance.current) {
      priceChartInstance.current.remove();
      priceChartInstance.current = null;
    }
    if (volumeChartInstance.current) {
      volumeChartInstance.current.remove();
      volumeChartInstance.current = null;
    }

    const dateFormat =
      interval === "1d" || interval === "1w"
        ? "yyyy-MM-dd"
        : "yyyy-MM-dd HH:mm";

    // Create price chart
    const priceChart = createChart(priceChartRef.current, {
      layout: {
        background: { type: "solid", color: "#0a0a0a" },
        textColor: "#e5e5e5",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "#222" },
        horzLines: { color: "#222" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#333",
        tickMarkColor: "#444",
        rightOffset: 2,
      },
      rightPriceScale: {
        borderColor: "#333",
        textColor: "#e5e5e5",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      width: priceChartRef.current.clientWidth,
      height: 300,
      crosshair: {
        mode: 0,
        vertLine: {
          color: "#39FF14",
          width: 1,
          style: 2,
          labelBackgroundColor: "#000",
        },
        horzLine: {
          color: "#39FF14",
          width: 1,
          style: 2,
          labelBackgroundColor: "#000",
        },
      },
      localization: { dateFormat },
    });

    // Create candle series
    const candleSeries = priceChart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      title: "Price",
    });

    // Create volume chart
    const volumeChart = createChart(volumeChartRef.current, {
      layout: {
        background: { type: "solid", color: "#0a0a0a" },
        textColor: "#e5e5e5",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "#222" },
        horzLines: { color: "#222" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#333",
        tickMarkColor: "#444",
      },
      rightPriceScale: {
        borderColor: "#333",
        textColor: "#e5e5e5",
        visible: false,
      },
      width: volumeChartRef.current.clientWidth,
      height: 120,
      crosshair: {
        mode: 0,
        vertLine: {
          color: "#39FF14",
          width: 1,
          style: 2,
          labelBackgroundColor: "#000",
        },
        horzLine: {
          visible: false,
        },
      },
      localization: { dateFormat },
    });

    // Create volume series
    const volumeSeries = volumeChart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: {
        type: "volume",
      },
      title: "Volume",
    });

    priceChartInstance.current = priceChart;
    volumeChartInstance.current = volumeChart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Wait for charts to be fully initialized before synchronizing
    setTimeout(() => {
      if (priceChartInstance.current && volumeChartInstance.current) {
        // Synchronize time scales between charts
        priceChartInstance.current.timeScale().subscribeVisibleTimeRangeChange((timeRange) => {
          if (timeRange && volumeChartInstance.current) {
            try {
              volumeChartInstance.current.timeScale().setVisibleRange(timeRange);
            } catch (error) {
              console.error("Error syncing volume chart:", error);
            }
          }
        });

        volumeChartInstance.current.timeScale().subscribeVisibleTimeRangeChange((timeRange) => {
          if (timeRange && priceChartInstance.current) {
            try {
              priceChartInstance.current.timeScale().setVisibleRange(timeRange);
            } catch (error) {
              console.error("Error syncing price chart:", error);
            }
          }
        });

        setChartsReady(true);
      }
    }, 100);

    // Responsive resize
    const handleResize = () => {
      if (priceChartRef.current && priceChartInstance.current) {
        priceChartInstance.current.applyOptions({
          width: priceChartRef.current.clientWidth,
        });
      }
      if (volumeChartRef.current && volumeChartInstance.current) {
        volumeChartInstance.current.applyOptions({
          width: volumeChartRef.current.clientWidth,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (priceChartInstance.current) {
        priceChartInstance.current.remove();
        priceChartInstance.current = null;
      }
      if (volumeChartInstance.current) {
        volumeChartInstance.current.remove();
        volumeChartInstance.current = null;
      }
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      setChartsReady(false);
    };
  }, [symbol, interval]);

  // Update chart data
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !candles.length || !chartsReady) return;

    try {
      // Prepare candle data - time is already in Unix timestamp format
      const candleData = candles
        .map((candle) => ({
          time: candle.time, // Already in Unix timestamp (seconds)
          open: Number(candle.open),
          high: Number(candle.high),
          low: Number(candle.low),
          close: Number(candle.close),
        }))
        .sort((a, b) => a.time - b.time)
        .filter((c, i, arr) => i === 0 || c.time !== arr[i - 1].time);

      candleSeriesRef.current.setData(candleData);

      // Prepare volume data - use the volume field from candle data
      const volumeData = candles
        .map((candle) => ({
          time: candle.time, // Already in Unix timestamp (seconds)
          value: Number(candle.volume), // Use the volume field
          color: Number(candle.close) >= Number(candle.open)
            ? "rgba(34, 197, 94, 0.5)"
            : "rgba(239, 68, 68, 0.5)",
        }))
        .sort((a, b) => a.time - b.time)
        .filter((c, i, arr) => i === 0 || c.time !== arr[i - 1].time);

      volumeSeriesRef.current.setData(volumeData);

      // Fit content to view all data
      setTimeout(() => {
        if (priceChartInstance.current) {
          try {
            priceChartInstance.current.timeScale().fitContent();
          } catch (error) {
            console.error("Error fitting price chart content:", error);
          }
        }
        if (volumeChartInstance.current) {
          try {
            volumeChartInstance.current.timeScale().fitContent();
          } catch (error) {
            console.error("Error fitting volume chart content:", error);
          }
        }
      }, 100);
    } catch (error) {
      console.error("Error updating chart data:", error);
    }
  }, [candles, chartsReady]);

  // Handle live candle updates
  useEffect(() => {
    if (!liveCandle || !candleSeriesRef.current || !volumeSeriesRef.current || !chartsReady) return;

    try {
      const time = liveCandle.time; // Already in Unix timestamp format
      
      // Update candle series
      candleSeriesRef.current.update({
        time,
        open: Number(liveCandle.open),
        high: Number(liveCandle.high),
        low: Number(liveCandle.low),
        close: Number(liveCandle.close),
      });

      // Update volume series - use the volume field from liveCandle
      volumeSeriesRef.current.update({
        time,
        value: Number(liveCandle.volume), // Use the volume field
        color: Number(liveCandle.close) >= Number(liveCandle.open)
          ? "rgba(34, 197, 94, 0.5)"
          : "rgba(239, 68, 68, 0.5)",
      });
    } catch (error) {
      console.error("Error updating live candle:", error);
    }
  }, [liveCandle, chartsReady]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-gray-800 bg-[#0f1318]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-300">
            {symbol} / {interval}
          </h2>
          <div className="flex items-center gap-2">
            <select
              className="bg-[#181c23] text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
              value={interval}
              onChange={e => setInterval(e.target.value)}
            >
              {INTERVALS.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            {loadingCandles && <div className="text-xs text-gray-500 ml-2">Loading data...</div>}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Price Chart Section with Label */}
        <div className="px-3 py-1 bg-[#11151c] border-b border-gray-800 text-xs text-gray-400">
          PRICE CHART
        </div>
        <div className="flex-1 relative min-h-[300px]">
          <div ref={priceChartRef} className="absolute inset-0" />
        </div>
        
        {/* Volume Chart Section with Label */}
        <div className="px-3 py-1 bg-[#11151c] border-b border-gray-800 text-xs text-gray-400">
          VOLUME
        </div>
        <div className="h-[120px] relative">
          <div ref={volumeChartRef} className="absolute inset-0" />
        </div>
      </div>
      
      {!loadingCandles && candles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 pointer-events-none">
          <span className="text-gray-500">No data available</span>
        </div>
      )}
    </div>
  );
}