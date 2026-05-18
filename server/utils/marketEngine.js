// server/utils/marketEngine.js
// Algorithmic market simulation engine — produces realistic OHLC candlestick data

/**
 * Seeded PRNG (Mulberry32) — deterministic randomness from a seed integer.
 * This lets us regenerate the same price history for the same investment
 * without storing anything in the DB.
 */
const mulberry32 = (seed) => {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

/**
 * Create a numeric hash from any string — used to seed the PRNG.
 */
const hashStr = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h;
};

/**
 * Get dynamic yield — fluctuates realistically around the base yield.
 */
const getDynamicYield = (baseYieldStr, seedStr) => {
    if (!baseYieldStr) return '0.00%';
    const baseMatch = baseYieldStr.toString().match(/[\d.]+/);
    if (!baseMatch) return baseYieldStr;
    const base = parseFloat(baseMatch[0]);

    const seed = hashStr(seedStr + 'yield');
    const now = Math.floor(Date.now() / 10000); // shifts every 10s
    const rng = mulberry32(seed + now);

    // Multiple overlapping waves + noise for organic feel (wider amplitudes to allow negative yield ROI)
    const t = Date.now() / 1000;
    const wave1 = Math.sin(t / 47 + seed) * 12.5;
    const wave2 = Math.sin(t / 137 + seed * 2) * 7.5;
    const wave3 = Math.cos(t / 23 + seed * 3) * 3.5;
    const noise = (rng() - 0.5) * 5.0;

    const dynamicYield = base + wave1 + wave2 + wave3 + noise;
    const sign = dynamicYield >= 0 ? '+' : '';
    return `${sign}${dynamicYield.toFixed(2)}%`;
};

/**
 * Generate realistic OHLC candlestick data + volume for a given investment.
 *
 * Uses a geometric random walk with drift, mean-reversion, volatility clustering,
 * and occasional momentum bursts — same techniques quant shops use for simulations.
 */
const getMarketChart = (baseAmount, timeframe, seedStr) => {
    const configs = {
        '1H':  { candles: 60,  msStep: 60000,     volatility: 0.003, label: 'minute' },
        '1D':  { candles: 48,  msStep: 1800000,    volatility: 0.006, label: '30min'  },
        '1W':  { candles: 42,  msStep: 14400000,   volatility: 0.012, label: '4hour'  },
        '1M':  { candles: 30,  msStep: 86400000,   volatility: 0.020, label: 'day'    },
    };

    const cfg = configs[timeframe] || configs['1H'];
    const { candles, msStep, volatility } = cfg;
    const baseAmt = parseFloat(baseAmount);
    const now = Date.now();

    // Seed determinism — same investment+timeframe = same chart until time moves
    const timeBucket = Math.floor(now / msStep);
    const seed = hashStr(seedStr + timeframe + Math.floor(timeBucket / candles));
    const rng = mulberry32(seed);

    const chartData = [];
    let price = baseAmt;

    // Drift — slight upward or downward bias per session
    const drift = (rng() - 0.48) * 0.001;

    // Volatility clustering state
    let volMultiplier = 1;

    for (let i = 0; i < candles; i++) {
        const candleTime = now - ((candles - i) * msStep);

        // Volatility clustering: occasionally spike/calm down
        if (rng() < 0.08) volMultiplier = 1.5 + rng() * 2;
        else volMultiplier = Math.max(0.5, volMultiplier * 0.95);

        const currentVol = volatility * volMultiplier;

        // Mean-reversion pull toward base amount (weak)
        const meanPull = (baseAmt - price) / baseAmt * 0.02;

        // Random walk step
        const returns = drift + meanPull + (rng() - 0.5) * currentVol * 2;
        const open = price;
        price = open * (1 + returns);
        const close = price;

        // Generate realistic high/low from open/close
        const range = Math.abs(close - open);
        const wickUp = range * (0.2 + rng() * 1.5);
        const wickDown = range * (0.2 + rng() * 1.5);

        const high = Math.max(open, close) + wickUp;
        const low = Math.min(open, close) - wickDown;

        // Volume — inversely correlated with price stability, spikes on big moves
        const baseVolume = 1000 + rng() * 5000;
        const moveSize = Math.abs(returns) / currentVol;
        const volume = Math.round(baseVolume * (1 + moveSize * 3));

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
    return {
        chartData,
        currentPrice: lastCandle.close,
        priceChange: ((lastCandle.close - chartData[0].open) / chartData[0].open * 100).toFixed(2)
    };
};

/**
 * Calculate real-time portfolio profit across all active investments.
 */
const getPortfolioProfit = (investments) => {
    let totalProfit = 0;
    const t = Date.now() / 1000;

    investments.forEach((inv) => {
        const amount = parseFloat(inv.amount);
        const seed = hashStr(inv.id.toString() + 'profit');
        const rng = mulberry32(seed + Math.floor(t / 10));

        const wave1 = Math.sin(t / 53 + seed) * 0.06;
        const wave2 = Math.cos(t / 131 + seed) * 0.03;
        const noise = (rng() - 0.5) * 0.02;

        totalProfit += amount * (wave1 + wave2 + noise);
    });

    return totalProfit;
};

module.exports = {
    getDynamicYield,
    getMarketChart,
    getPortfolioProfit,
};
