// server/utils/marketEngine.js
// Deterministic ROI engine — packages carry a fixed total ROI over the lock-up
// period. Investment value grows linearly from principal toward principal + ROI,
// reaching the full total return at maturity (lock_up_until). No randomness.

const DAYS_PER_MONTH = 30.44;

/**
 * Parse a yield string (e.g. "+14.2%", "-3.5% APY", "9.5") to a plain number.
 */
const parseRoi = (yieldStr) => {
    if (yieldStr === null || yieldStr === undefined || yieldStr === '') return 0;
    const match = String(yieldStr).match(/[-+]?[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
};

/**
 * Fraction of the lock-up period elapsed, clamped to [0, 1].
 * At maturity (or beyond) the full ROI has accrued.
 */
const getElapsedFraction = (createdAt, lockUpUntil) => {
    const start = new Date(createdAt).getTime();
    const end = new Date(lockUpUntil || start).getTime();
    const now = Date.now();
    if (end <= start) return 1;
    return Math.max(0, Math.min(1, (now - start) / (end - start)));
};

/**
 * Deterministic projected value for an investment.
 * currentValue = amount * (1 + roiPct * elapsedFraction)
 */
const getAccruedValue = (amount, roiPctOrStr, createdAt, lockUpUntil) => {
    const roi = parseRoi(roiPctOrStr) / 100;
    const frac = getElapsedFraction(createdAt, lockUpUntil);
    return parseFloat(amount) * (1 + roi * frac);
};

/**
 * Deterministic accrued ROI percentage shown to the user.
 */
const getAccruedRoi = (roiPctOrStr, createdAt, lockUpUntil) => {
    const roi = parseRoi(roiPctOrStr);
    const frac = getElapsedFraction(createdAt, lockUpUntil);
    return roi * frac;
};

/**
 * Generate deterministic OHLC candlesticks for an investment.
 *
 * Candle closes follow the projected growth curve anchored at created_at:
 *   close(t) = amount * (1 + roiPct * min(1, (t - created_at) / lockUpWindow))
 * No random number generator — the same inputs always produce the same chart.
 */
const getMarketChart = (baseAmount, timeframe, seedStr, { createdAt, lockUpUntil, roi } = {}) => {
    const configs = {
        '1H':  { candles: 60,  msStep: 60000,    label: 'minute' },
        '1D':  { candles: 48,  msStep: 1800000,  label: '30min'  },
        '1W':  { candles: 42,  msStep: 14400000, label: '4hour'  },
        '1M':  { candles: 30,  msStep: 86400000, label: 'day'    },
    };

    const cfg = configs[timeframe] || configs['1H'];
    const { candles, msStep } = cfg;
    const amount = parseFloat(baseAmount) || 0;
    const now = Date.now();
    const startTime = createdAt ? new Date(createdAt).getTime() : now;
    const endTime = lockUpUntil ? new Date(lockUpUntil).getTime() : startTime;
    const lockUpWindow = Math.max(1, endTime - startTime);
    const roiPct = parseRoi(roi) / 100;

    const chartData = [];

    for (let i = 0; i < candles; i++) {
        const candleTime = now - ((candles - 1 - i) * msStep);
        const t = Math.max(startTime, Math.min(now, candleTime));

        const frac = Math.max(0, Math.min(1, (t - startTime) / lockUpWindow));
        const close = amount * (1 + roiPct * frac);

        // Deterministic micro-spread derived from the candle index (no RNG).
        const open = i === 0 ? amount : chartData[i - 1].close;
        const micro = Math.max(close, open) * 0.0005;
        const wobble = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        const high = Math.max(open, close) + micro * (0.2 + Math.abs(wobble) * 0.8);
        const low = Math.min(open, close) - micro * (0.2 + Math.abs(wobble) * 0.8);

        const moveSize = Math.abs(close - open) / Math.max(close, open);
        const volume = Math.round(1000 + (candles - i) * 50 + moveSize * 3000);

        chartData.push({
            time: new Date(candleTime).toISOString(),
            open:  parseFloat(open.toFixed(2)),
            high:  parseFloat(high.toFixed(2)),
            low:   parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume
        });
    }

    const lastCandle = chartData[chartData.length - 1];
    const firstOpen = chartData[0].open;
    return {
        chartData,
        currentPrice: lastCandle.close,
        priceChange: firstOpen > 0 ? ((lastCandle.close - firstOpen) / firstOpen * 100).toFixed(2) : '0.00'
    };
};

/**
 * Deterministic real-time portfolio profit across all active investments.
 */
const getPortfolioProfit = (investments) => {
    let totalProfit = 0;
    investments.forEach((inv) => {
        const roi = parseRoi(inv.yield_percentage || inv.package_yield || inv.yield);
        const accrued = getAccruedValue(inv.amount, roi, inv.created_at, inv.lock_up_until);
        totalProfit += accrued - parseFloat(inv.amount);
    });
    return totalProfit;
};

module.exports = {
    parseRoi,
    getElapsedFraction,
    getAccruedValue,
    getAccruedRoi,
    getMarketChart,
    getPortfolioProfit,
};