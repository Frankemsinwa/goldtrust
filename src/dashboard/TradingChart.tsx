import { useState, useRef, useEffect, useMemo } from 'react';
import './TradingChart.css';

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingChartProps {
  data: Candle[];
  currentPrice: number;
  priceChange: string;
  timeframe: string;
}

export default function TradingChart({ data, currentPrice, priceChange, timeframe }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [dims, setDims] = useState({ width: 600, height: 320 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDims({ width: Math.max(300, width), height: 320 });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    const paddingRight = 72;
    const paddingLeft = 8;
    const paddingTop = 16;
    const chartHeight = 220;
    const volumeHeight = 60;
    const volumeGap = 8;
    const paddingBottom = 28;
    return { paddingRight, paddingLeft, paddingTop, chartHeight, volumeHeight, volumeGap, paddingBottom };
  }, []);

  const computed = useMemo(() => {
    if (!data || data.length === 0) return null;

    const { paddingRight, paddingLeft, paddingTop, chartHeight, volumeHeight, volumeGap } = layout;
    const chartWidth = dims.width - paddingLeft - paddingRight;

    // Price range
    let priceMin = Infinity, priceMax = -Infinity;
    let volMax = 0;
    data.forEach(c => {
      if (c.low < priceMin) priceMin = c.low;
      if (c.high > priceMax) priceMax = c.high;
      if (c.volume > volMax) volMax = c.volume;
    });
    const pricePad = (priceMax - priceMin) * 0.08 || 1;
    priceMin -= pricePad;
    priceMax += pricePad;
    const priceRange = priceMax - priceMin;

    const candleWidth = Math.max(2, (chartWidth / data.length) * 0.65);
    const candleGap = chartWidth / data.length;

    const toY = (price: number) => paddingTop + chartHeight - ((price - priceMin) / priceRange) * chartHeight;
    const toVolY = (vol: number) => {
      const base = paddingTop + chartHeight + volumeGap + volumeHeight;
      return base - (vol / (volMax || 1)) * volumeHeight;
    };

    // Grid lines (5 horizontal)
    const gridLines: { y: number; label: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const price = priceMin + (priceRange / 4) * i;
      gridLines.push({ y: toY(price), label: `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` });
    }

    // Moving Average (7-period SMA)
    const maPeriod = Math.min(7, data.length);
    const maPoints: string[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < maPeriod - 1) continue;
      let sum = 0;
      for (let j = i - maPeriod + 1; j <= i; j++) sum += data[j].close;
      const avg = sum / maPeriod;
      const x = paddingLeft + i * candleGap + candleGap / 2;
      const y = toY(avg);
      maPoints.push(`${x},${y}`);
    }

    // Current price line Y
    const currentPriceY = toY(currentPrice);

    return {
      priceMin, priceMax, priceRange, volMax,
      candleWidth, candleGap,
      toY, toVolY,
      gridLines, maPoints,
      currentPriceY
    };
  }, [data, dims, layout, currentPrice]);

  if (!data || data.length === 0 || !computed) {
    return (
      <div className="tc-container" ref={containerRef}>
        <div className="tc-loading">Loading Market Data...</div>
      </div>
    );
  }

  const { paddingLeft, paddingTop, chartHeight, volumeHeight, volumeGap, paddingBottom } = layout;
  const { candleWidth, candleGap, toY, toVolY, gridLines, maPoints, currentPriceY } = computed;
  const svgHeight = paddingTop + chartHeight + volumeGap + volumeHeight + paddingBottom;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (timeframe === '1H') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (timeframe === '1D') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const idx = Math.floor((x - paddingLeft) / candleGap);
    if (idx >= 0 && idx < data.length) {
      setHoveredCandle(data[idx]);
    } else {
      setHoveredCandle(null);
    }
  };

  const displayCandle = hoveredCandle || data[data.length - 1];
  const changePercent = parseFloat(priceChange);

  // Time axis labels (show ~6 labels)
  const labelStep = Math.max(1, Math.floor(data.length / 6));

  return (
    <div className="tc-container" ref={containerRef}>
      {/* OHLC Info Strip */}
      <div className="tc-ohlc-strip">
        <span className="tc-ohlc-item"><span className="tc-ohlc-label">O</span> {displayCandle.open.toFixed(2)}</span>
        <span className="tc-ohlc-item"><span className="tc-ohlc-label">H</span> {displayCandle.high.toFixed(2)}</span>
        <span className="tc-ohlc-item"><span className="tc-ohlc-label">L</span> {displayCandle.low.toFixed(2)}</span>
        <span className="tc-ohlc-item"><span className="tc-ohlc-label">C</span> {displayCandle.close.toFixed(2)}</span>
        <span className="tc-ohlc-item tc-ohlc-vol"><span className="tc-ohlc-label">VOL</span> {displayCandle.volume.toLocaleString()}</span>
        <span className="tc-ohlc-item" style={{ marginLeft: 'auto' }}>
          <span className="tc-ohlc-label">MA7</span>
        </span>
        <span className="tc-ma-dot" />
      </div>

      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${dims.width} ${svgHeight}`}
        className="tc-svg"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredCandle(null); setMousePos(null); }}
      >
        {/* Grid lines */}
        {gridLines.map((g, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={paddingLeft} y1={g.y}
              x2={dims.width - layout.paddingRight} y2={g.y}
              className="tc-grid-line"
            />
            <text
              x={dims.width - layout.paddingRight + 8}
              y={g.y + 4}
              className="tc-price-label"
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* Volume bars */}
        {data.map((c, i) => {
          const x = paddingLeft + i * candleGap + (candleGap - candleWidth) / 2;
          const volTop = toVolY(c.volume);
          const volBase = paddingTop + chartHeight + volumeGap + volumeHeight;
          const isBull = c.close >= c.open;
          return (
            <rect
              key={`vol-${i}`}
              x={x}
              y={volTop}
              width={candleWidth}
              height={volBase - volTop}
              className={isBull ? 'tc-vol-bull' : 'tc-vol-bear'}
            />
          );
        })}

        {/* Candlestick wicks + bodies */}
        {data.map((c, i) => {
          const cx = paddingLeft + i * candleGap + candleGap / 2;
          const x = cx - candleWidth / 2;
          const isBull = c.close >= c.open;

          const bodyTop = toY(Math.max(c.open, c.close));
          const bodyBottom = toY(Math.min(c.open, c.close));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);

          return (
            <g key={`candle-${i}`}>
              {/* Wick */}
              <line
                x1={cx} y1={toY(c.high)}
                x2={cx} y2={toY(c.low)}
                className={isBull ? 'tc-wick-bull' : 'tc-wick-bear'}
              />
              {/* Body */}
              <rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                rx={1}
                className={isBull ? 'tc-body-bull' : 'tc-body-bear'}
              />
            </g>
          );
        })}

        {/* Moving Average line */}
        {maPoints.length > 1 && (
          <polyline
            fill="none"
            className="tc-ma-line"
            points={maPoints.join(' ')}
          />
        )}

        {/* Current price dashed line */}
        <line
          x1={paddingLeft}
          y1={currentPriceY}
          x2={dims.width - layout.paddingRight}
          y2={currentPriceY}
          className="tc-current-price-line"
        />
        <rect
          x={dims.width - layout.paddingRight}
          y={currentPriceY - 10}
          width={68}
          height={20}
          rx={3}
          className={changePercent >= 0 ? 'tc-price-tag-bull' : 'tc-price-tag-bear'}
        />
        <text
          x={dims.width - layout.paddingRight + 34}
          y={currentPriceY + 4}
          className="tc-price-tag-text"
          textAnchor="middle"
        >
          ${currentPrice.toFixed(2)}
        </text>

        {/* Time axis labels */}
        {data.map((c, i) => {
          if (i % labelStep !== 0) return null;
          const x = paddingLeft + i * candleGap + candleGap / 2;
          const y = paddingTop + chartHeight + volumeGap + volumeHeight + 16;
          return (
            <text key={`time-${i}`} x={x} y={y} className="tc-time-label" textAnchor="middle">
              {formatTime(c.time)}
            </text>
          );
        })}

        {/* Crosshair */}
        {mousePos && hoveredCandle && (
          <g>
            <line
              x1={mousePos.x} y1={paddingTop}
              x2={mousePos.x} y2={paddingTop + chartHeight + volumeGap + volumeHeight}
              className="tc-crosshair"
            />
            <line
              x1={paddingLeft} y1={mousePos.y}
              x2={dims.width - layout.paddingRight} y2={mousePos.y}
              className="tc-crosshair"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
