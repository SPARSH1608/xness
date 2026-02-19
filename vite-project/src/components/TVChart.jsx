"use client";

import { createChart, CandlestickSeries, HistogramSeries } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { useMarket, INTERVALS } from "../context/MarketContext";

export default function TVChart() {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  
  const { symbol, candles, loadingCandles, interval, setInterval, liveCandle } = useMarket();
  const [chartReady, setChartReady] = useState(false);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart
    if (chartInstance.current) {
      chartInstance.current.remove();
      chartInstance.current = null;
    }

    const dateFormat =
      interval === "1d" || interval === "1w"
        ? "yyyy-MM-dd"
        : "yyyy-MM-dd HH:mm";

    // Create single chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: "solid", color: "#0b0e11" },
        textColor: "#848E9C",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "#1e2329" },
        horzLines: { color: "#1e2329" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#2a3038",
        tickMarkColor: "#2a3038",
        rightOffset: 5,
      },
      rightPriceScale: {
        borderColor: "#2a3038",
        textColor: "#848E9C",
        scaleMargins: { top: 0.1, bottom: 0.2 }, // Reserve space for volume
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      crosshair: {
        mode: 1, // Magnet mode
        vertLine: {
          color: "#474d57",
          width: 1,
          style: 3, // Dashed
          labelBackgroundColor: "#1e2329",
        },
        horzLine: {
          color: "#474d57",
          width: 1,
          style: 3, // Dashed
          labelBackgroundColor: "#1e2329",
        },
      },
      localization: { 
        dateFormat,
        timeFormatter: (timestamp) => {
          const date = new Date(timestamp * 1000);
          // Format: "YYYY-MM-DD HH:mm UTC" for crosshair
          return date.toISOString().replace("T", " ").substring(0, 16) + " UTC"; 
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#2a3038",
        tickMarkColor: "#2a3038",
        rightOffset: 5,
        tickMarkFormatter: (time, tickMarkType, locale) => {
           const date = new Date(time * 1000);
           // Simple UTC formatting for axis
           // You might want to conditionalize based on tickMarkType (Year, Month, Day, Time)
           // But for now, let's try a generic smart formatter or simple ISO
           // tickMarkType: 0=Year, 1=Month, 2=DayOfMonth, 3=Time, 4=TimeWithSeconds
           if (tickMarkType < 3) {
             return date.toISOString().substring(0, 10); // YYYY-MM-DD
           }
           return date.toISOString().substring(11, 16); // HH:mm
        },
      },
    });


    // Create candle series (Main Price)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#0ECB81",
      downColor: "#F6465D",
      borderVisible: false,
      wickUpColor: "#0ECB81",
      wickDownColor: "#F6465D",
      title: "Price",
    });

    // Create volume series (Overlay)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // Overlay on main chart
      scaleMargins: {
        top: 0.8, // Place at bottom 20%
        bottom: 0,
      },
      title: "Volume",
    });

    chartInstance.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    setChartReady(true);

    // Responsive resize
    const handleResize = () => {
      if (chartContainerRef.current && chartInstance.current) {
        chartInstance.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
      }
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      setChartReady(false);
    };
  }, [symbol, interval]);

  // Update chart data
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !candles.length || !chartReady) return;

    try {
      // Prepare candle data
      const candleData = candles
        .map((candle) => ({
          time: candle.time,
          open: Number(candle.open),
          high: Number(candle.high),
          low: Number(candle.low),
          close: Number(candle.close),
        }))
        .sort((a, b) => a.time - b.time)
        .filter((c, i, arr) => i === 0 || c.time !== arr[i - 1].time);

      candleSeriesRef.current.setData(candleData);

      // Prepare volume data
      const volumeData = candles
        .map((candle) => ({
          time: candle.time,
          value: Number(candle.volume),
          color: Number(candle.close) >= Number(candle.open)
            ? "rgba(14, 203, 129, 0.5)"
            : "rgba(246, 70, 93, 0.5)",
        }))
        .sort((a, b) => a.time - b.time)
        .filter((c, i, arr) => i === 0 || c.time !== arr[i - 1].time);

      volumeSeriesRef.current.setData(volumeData);

      // Fit content
      // setTimeout(() => {
      //   if (chartInstance.current) {
      //      chartInstance.current.timeScale().fitContent();
      //   }
      // }, 50);
    } catch (error) {
      console.error("Error updating chart data:", error);
    }
  }, [candles, chartReady]);

  // Handle live candle updates
  useEffect(() => {
    if (!liveCandle || !candleSeriesRef.current || !volumeSeriesRef.current || !chartReady) return;

    try {
      const time = liveCandle.time;
      
      candleSeriesRef.current.update({
        time,
        open: Number(liveCandle.open),
        high: Number(liveCandle.high),
        low: Number(liveCandle.low),
        close: Number(liveCandle.close),
      });

      volumeSeriesRef.current.update({
        time,
        value: Number(liveCandle.volume),
        color: Number(liveCandle.close) >= Number(liveCandle.open)
          ? "rgba(14, 203, 129, 0.5)"
          : "rgba(246, 70, 93, 0.5)",
      });
    } catch (error) {
      console.error("Error updating live candle:", error);
    }
  }, [liveCandle, chartReady]);

  return (
    <div className="flex flex-col h-full bg-[#0b0e11]">
      <div className="px-4 py-2 border-b border-[#2a3038] bg-[#0b0e11] flex items-center justify-between">
        <div className="flex items-center gap-4">
           {/* Maybe put symbol info here if needed again, or keep minimal */}
           <div className="flex bg-[#1e2329] rounded p-0.5">
             {INTERVALS.map((i) => (
                <button
                  key={i}
                  onClick={() => setInterval(i)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    interval === i 
                    ? "bg-[#2a3038] text-[#EAECEF] font-medium" 
                    : "text-[#848E9C] hover:text-[#EAECEF]"
                  }`}
                >
                  {i}
                </button>
             ))}
           </div>
        </div>
        
        {loadingCandles && <div className="text-xs text-[#848E9C] animate-pulse">Loading data...</div>}
      </div>
      
      <div className="flex-1 relative min-h-0">
        <div ref={chartContainerRef} className="absolute inset-0" />
        
        {!loadingCandles && candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[#848E9C] bg-[#1e2329]/80 px-4 py-2 rounded">No data available for {symbol}</span>
          </div>
        )}
      </div>
    </div>
  );
}