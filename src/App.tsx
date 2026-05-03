import { useEffect, useState, useRef, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Dashboard from './dashboard/Dashboard'
import './App.css'

/* ───────────────────── DATA ───────────────────── */

const INVESTORS = [
  { name: 'James W.', amount: '$1.2M', asset: 'GoldTrust Alpha Fund' },
  { name: 'Sophia R.', amount: '$450k', asset: 'Sovereign BTC' },
  { name: 'Institutional Node 09', amount: '$5.8M', asset: 'Liquidity Hub' },
  { name: 'Marco V.', amount: '$820k', asset: 'Yield Delta' },
  { name: 'Chen L.', amount: '$2.1M', asset: 'Institutional ETH' },
  { name: 'Elena S.', amount: '$120k', asset: 'RWA Prime' },
  { name: 'David K.', amount: '$3.4M', asset: 'GoldTrust Alpha Fund' },
  { name: 'Sarah J.', amount: '$900k', asset: 'Sovereign BTC' },
]

const ABOUT_STATS = [
  { label: 'Founded', value: '2026' },
  { label: 'Global Offices', value: '07' },
  { label: 'Security Audits', value: 'Quarterly' },
  { label: 'Client Retention', value: '99.2%' },
]

const TESTIMONIALS = [
  {
    quote: "GoldTrust has redefined how we approach digital asset custody. The precision of their execution is unmatched in the private banking sector.",
    author: "Alexander V.",
    title: "Family Office Principal",
    location: "Zurich"
  },
  {
    quote: "A rare combination of sovereign-grade security and algorithmic transparency. It's the only platform I trust with our core liquidity.",
    author: "Elena Petrova",
    title: "Director of Institutional Wealth",
    location: "Singapore"
  },
  {
    quote: "The interface reflects the service: clean, precise, and profoundly focused on results. Finally, a platform that speaks the language of capital.",
    author: "Julian Thorne",
    title: "UHNW Private Investor",
    location: "London"
  }
]

const TICKER_DATA = [
  { symbol: 'BTC/USD', price: '97,281.04', change: '+2.4%', dir: 'up' },
  { symbol: 'ETH/USD', price: '3,492.11', change: '+1.8%', dir: 'up' },
  { symbol: 'SOL/USD', price: '178.50', change: '+3.1%', dir: 'up' },
  { symbol: 'USDC/USD', price: '1.0001', change: '0.0%', dir: 'flat' },
  { symbol: 'XAU/USD', price: '3,341.20', change: '+0.4%', dir: 'up' },
  { symbol: 'AVAX/USD', price: '42.18', change: '-1.2%', dir: 'down' },
  { symbol: 'LINK/USD', price: '18.93', change: '+0.7%', dir: 'up' },
]

const FEATURES = [
  {
    title: 'Secure Crypto',
    body: 'We keep your digital assets safe in highly protected vaults that are monitored 24/7 around the world.',
    icon: 'lock',
    stats: [
      { label: 'Security', value: 'High Level' },
      { label: 'Insurance', value: 'Protected' },
    ],
  },
  {
    title: 'Smart Trading',
    body: 'Our systems find the best times to buy and sell across 140+ global exchanges to grow your money.',
    icon: 'crosshair',
    stats: [
      { label: 'Profit', value: '12.4% Yearly' },
      { label: 'Risk', value: 'Low' },
    ],
  },
  {
    title: 'Fast Withdraws',
    body: 'Move your money back to your bank account instantly. Your wealth is always ready when you need it.',
    icon: 'clock',
    stats: [
      { label: 'Speed', value: 'Instant' },
      { label: 'Rails', value: 'Swift/Bank' },
    ],
  },
]

const CHART_HEIGHTS = [20, 35, 25, 45, 60, 55, 75, 90, 85, 100]

const STRATEGIES = [
  {
    num: 'OPTION 01',
    title: 'Crypto Investing',
    body: 'Invest directly in Bitcoin and other digital coins with zero risk of losing your access.',
    metric: '+154%',
    metricLabel: '3Y PROFIT',
  },
  {
    num: 'OPTION 02',
    title: 'Stock Exchange',
    body: 'Trade shares in the world’s biggest companies easily from one simple dashboard.',
    metric: '+18.2%',
    metricLabel: 'AVG YEARLY',
  },
  {
    num: 'OPTION 03',
    title: 'Gold Mining',
    body: 'Get direct exposure to gold mining profits and real-world gold assets.',
    metric: '$1.2B',
    metricLabel: 'TOTAL VALUE',
  },
]

const PARTNERS = [
  'J.P. Morgan & Co.',
  'Goldman Sachs',
  'BlackRock',
  'Standard Chartered',
  'HSBC Private Bank',
  'Citadel',
  'Fidelity Digital',
  'Bridgewater',
]

const FAQS = [
  {
    q: 'How secure are my digital assets?',
    a: 'We use military-grade cold storage, multi-signature wallets, and quarterly third-party security audits to ensure your assets are protected against all vectors.'
  },
  {
    q: 'How quickly can I withdraw my funds?',
    a: 'Withdrawals to connected bank accounts are processed instantly via Swift or local bank rails. Cryptocurrency withdrawals to whitelisted addresses are also instant.'
  },
  {
    q: 'What is the minimum investment?',
    a: 'We welcome investors starting at $10,000 to access our premium portfolio strategies across crypto, stocks, and gold.'
  },
  {
    q: 'Do you charge management fees?',
    a: 'We charge a transparent flat 1% annual management fee. No hidden costs, no entry or exit fees.'
  }
]

/* ───────────────────── ICONS ───────────────────── */

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="vault-feature-icon">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconCrosshair() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="vault-feature-icon">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="vault-feature-icon">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

const ICON_MAP: Record<string, () => JSX.Element> = {
  lock: IconLock,
  crosshair: IconCrosshair,
  clock: IconClock,
}

/* ───────────────────── COMPONENT ───────────────────── */

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div 
      className={`reveal reveal-delay-${(index % 3) + 1}`}
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '1.5rem 0',
        cursor: 'pointer',
        userSelect: 'none'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <h4 className="vault-strategy-title" style={{ fontSize: '1.1rem', margin: 0 }}>{q}</h4>
        <span style={{ 
          color: 'var(--accent)', 
          transform: isOpen ? 'rotate(180deg)' : 'none', 
          transition: 'transform 0.3s ease',
          fontSize: '0.8rem'
        }}>
          ▼
        </span>
      </div>
      <div style={{
        maxHeight: isOpen ? '200px' : '0',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        opacity: isOpen ? 1 : 0,
        marginTop: isOpen ? '1rem' : '0',
      }}>
        <p className="vault-strategy-body" style={{ margin: 0, color: 'var(--muted)' }}>{a}</p>
      </div>
    </div>
  )
}

function SparklineChart({ data, color, width, height, glow = false }: { data: number[], color: string, width: number, height: number, glow?: boolean }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d - min) / range) * height;
    return { x, y, value: d };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' ')}`;
  const fillPathD = `M 0,${height} L ${points.map(p => `${p.x},${p.y}`).join(' ')} L ${width},${height} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleX = width / rect.width;
    const svgX = x * scaleX;
    
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < points.length; i++) {
      const diff = Math.abs(points[i].x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    setHoverIndex(closestIdx);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`} 
        style={{ overflow: 'visible', display: 'block', cursor: 'crosshair' }} 
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
          {glow && (
            <filter id={`glow-${color.replace('#', '')}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        <path d={fillPathD} fill={`url(#grad-${color.replace('#', '')})`} />
        <path 
          d={pathD} 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={glow ? `url(#glow-${color.replace('#', '')})` : undefined}
        />
        
        {hoverIndex !== null && (
          <>
            <line 
              x1={points[hoverIndex].x} 
              y1={0} 
              x2={points[hoverIndex].x} 
              y2={height} 
              stroke="var(--muted)" 
              strokeWidth="1" 
              strokeDasharray="4 4" 
            />
            <circle 
              cx={points[hoverIndex].x} 
              cy={points[hoverIndex].y} 
              r="4" 
              fill="var(--bg)" 
              stroke={color} 
              strokeWidth="2" 
            />
          </>
        )}
      </svg>
      
      {hoverIndex !== null && (
        <div style={{
          position: 'absolute',
          top: -30,
          left: `${(points[hoverIndex].x / width) * 100}%`,
          transform: 'translateX(-50%)',
          background: 'oklch(20% 0.01 250)',
          border: '1px solid var(--border)',
          padding: '4px 8px',
          borderRadius: 4,
          color: 'var(--fg)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          ${points[hoverIndex].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
        </div>
      )}
    </div>
  );
}

function MarketExplorer() {
  const [coins, setCoins] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true');
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setCoins(data);
          setSelectedCoin(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, []);

  const filteredCoins = coins.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filteredCoins.length / itemsPerPage));
  const currentCoins = filteredCoins.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <section className="vault-section" id="markets" style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg)' }}>
      <div className="vault-section-header centered reveal">
        <span className="vault-label">Market Intelligence</span>
        <h2 className="vault-section-title">Live Asset Tracking.</h2>
        <p className="vault-section-desc" style={{ margin: '0 auto' }}>
          Monitor global crypto markets in real-time with our institutional-grade charting terminal.
        </p>
      </div>

      <div className="reveal reveal-delay-2" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 'clamp(20px, 4vw, 40px)', flexWrap: 'wrap' }}>
        
        {/* Left Side: Chart Terminal */}
        <div style={{ flex: '1 1 500px', minWidth: 0, background: 'oklch(14% 0.01 250)', border: '0.5px solid var(--border)', padding: 'clamp(16px, 4vw, 32px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {selectedCoin ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)', flexWrap: 'wrap' }}>
                  <img src={selectedCoin.image} alt={selectedCoin.name} style={{ width: 48, height: 48, borderRadius: '50%' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 500 }}>{selectedCoin.name}</h3>
                      <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{selectedCoin.symbol}</span>
                    </div>
                    <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontFamily: 'var(--font-mono)', color: 'var(--fg)', marginTop: 4 }}>
                      ${selectedCoin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>24h Change</div>
                  <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: selectedCoin.price_change_percentage_24h >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {selectedCoin.price_change_percentage_24h > 0 ? '+' : ''}{selectedCoin.price_change_percentage_24h?.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 250, position: 'relative', margin: '20px 0', width: '100%' }}>
                {selectedCoin.sparkline_in_7d?.price ? (
                  <SparklineChart 
                    data={selectedCoin.sparkline_in_7d.price} 
                    color={selectedCoin.price_change_percentage_24h >= 0 ? '#4ade80' : '#f87171'} 
                    width={800} 
                    height={300} 
                    glow={true}
                  />
                ) : (
                  <div style={{ color: 'var(--muted)' }}>No chart data available</div>
                )}
                
                {/* Grid Lines */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to bottom, var(--border) 1px, transparent 1px)', backgroundSize: '100% 20%', opacity: 0.2 }} />
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', marginTop: 'auto', paddingTop: 24, borderTop: '0.5px solid var(--border)' }}>
                <div style={{ flex: '1 1 100px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Market Cap</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>${selectedCoin.market_cap?.toLocaleString()}</div>
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>24h Volume</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>${selectedCoin.total_volume?.toLocaleString()}</div>
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>All Time High</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>${selectedCoin.ath?.toLocaleString()}</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              {loading ? 'Loading market data...' : 'Select an asset to view details'}
            </div>
          )}
        </div>

        {/* Right Side: Asset List */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 24 }}>
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '16px 20px',
                background: 'var(--bg)',
                border: '0.5px solid var(--border)',
                color: 'var(--fg)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {currentCoins.map(coin => (
              <div 
                key={coin.id} 
                onClick={() => setSelectedCoin(coin)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: selectedCoin?.id === coin.id ? 'var(--border)' : 'var(--bg)',
                  border: '0.5px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={e => { if (selectedCoin?.id !== coin.id) e.currentTarget.style.background = 'oklch(16% 0.01 250)' }}
                onMouseLeave={e => { if (selectedCoin?.id !== coin.id) e.currentTarget.style.background = 'var(--bg)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={coin.image} alt={coin.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{coin.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{coin.symbol}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: coin.price_change_percentage_24h >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
            {currentCoins.length === 0 && !loading && (
               <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)' }}>No assets found matching "{search}"</div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '8px 16px', background: 'transparent', border: '0.5px solid var(--border)', color: page === 1 ? 'var(--muted)' : 'var(--fg)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                PREV
              </button>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                PAGE {page} / {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '8px 16px', background: 'transparent', border: '0.5px solid var(--border)', color: page === totalPages ? 'var(--muted)' : 'var(--fg)', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LandingPage({ openAuth }: { openAuth: () => void }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [tickerData, setTickerData] = useState<any[]>(TICKER_DATA)

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,tether,avalanche-2,chainlink,ripple,cardano,dogecoin&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        const data = await res.json();
        if (data && Array.isArray(data)) {
          const formatted = data.map((coin: any) => ({
            symbol: coin.symbol.toUpperCase() + '/USD',
            price: coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
            change: (coin.price_change_percentage_24h > 0 ? '+' : '') + (coin.price_change_percentage_24h || 0).toFixed(2) + '%',
            dir: (coin.price_change_percentage_24h || 0) >= 0 ? 'up' : 'down',
            image: coin.image
          }));
          setTickerData(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch ticker data', err);
      }
    };
    fetchCrypto();
    const interval = setInterval(fetchCrypto, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ── Intersection Observer for reveals ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  /* ── Animated chart bars ── */
  useEffect(() => {
    if (!chartRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [])

  /* ── Mouse-glow & Parallax handler ── */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const hero = e.currentTarget;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // Hero Parallax
    const xPos = (clientX / innerWidth - 0.5) * 30;
    const yPos = (clientY / innerHeight - 0.5) * 30;
    hero.style.setProperty('--hero-x', `${xPos}px`);
    hero.style.setProperty('--hero-y', `${yPos}px`);

    // Mouse Glow
    hero.style.setProperty('--mouse-x', `${clientX}px`);
    hero.style.setProperty('--mouse-y', `${clientY}px`);
  }, []);

  const handleCardTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  const resetCardTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  }, []);

  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="vault-hero" id="hero" onMouseMove={handleMouseMove}>
        <div className="vault-hero-bg">
          <div className="vault-orb vault-orb-1" style={{ transform: 'translate(var(--hero-x), var(--hero-y))' }} />
          <div className="vault-orb vault-orb-2" style={{ transform: 'translate(calc(var(--hero-x) * -1), calc(var(--hero-y) * -1))' }} />
          <div className="vault-grid-pattern" />
        </div>

        <div className="vault-hero-content" style={{ transform: 'translate(calc(var(--hero-x) * 0.2), calc(var(--hero-y) * 0.2))' }}>
          <span className="vault-kicker">Start Investing — Simple & Secure</span>
          <h1 className="vault-hero-title">
            Grow Your Wealth{' '}
            <br />
            <span className="accent-word">With Confidence.</span>
          </h1>
          <p className="vault-hero-subtitle">
            Secure crypto, stock market, and gold mining investments. 
            GOLDTRUST helps you manage your money with professional tools made easy.
          </p>
          <div className="vault-hero-ctas">
            <a href="#" className="vault-btn vault-btn-primary" onClick={(e) => { e.preventDefault(); openAuth(); }}>Get Started</a>
            <a href="#performance" className="vault-btn vault-btn-secondary">View Plans</a>
          </div>

          <div className="vault-hero-stats">
            <div className="vault-stat">
              <div className="vault-stat-value">$4.2B+</div>
              <div className="vault-stat-label">Total Assets Managed</div>
            </div>
            <div className="vault-stat">
              <div className="vault-stat-value">140+</div>
              <div className="vault-stat-label">Global Markets</div>
            </div>
            <div className="vault-stat">
              <div className="vault-stat-value">Instant</div>
              <div className="vault-stat-label">Trading Speed</div>
            </div>
            <div className="vault-stat">
              <div className="vault-stat-value">24/7</div>
              <div className="vault-stat-label">Support Team</div>
            </div>
          </div>
        </div>

        <div className="vault-scroll-indicator">
          <span className="vault-scroll-text">Scroll</span>
          <div className="vault-scroll-line" />
        </div>
      </section>

      {/* ═══════════ TICKER ═══════════ */}
      <div className="vault-ticker">
        <div className="vault-ticker-live">
          <span className="vault-pulse" />
          LIVE
        </div>
        <div className="vault-ticker-track">
          <div className="vault-ticker-inner">
            {[...tickerData, ...tickerData, ...tickerData].map((t, i) => (
              <span className="vault-ticker-item" key={i}>
                {t.image && <img src={t.image} alt={t.symbol} style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} />}
                <span className="vault-ticker-symbol">{t.symbol}</span>
                <span className="vault-ticker-price">{t.price}</span>
                <span className={`vault-ticker-change ${t.dir}`}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="vault-section" id="institutional">
        <div className="vault-section-header reveal">
          <span className="vault-label">Our Service</span>
          <h2 className="vault-section-title">A Better Way to Invest.</h2>
          <p className="vault-section-desc">
            We mix safe storage with fast trading. We help you move from traditional cash 
            to crypto, stocks, and gold easily.
          </p>
        </div>

        <div className="vault-feature-grid">
          {FEATURES.map((f, idx) => {
            const Icon = ICON_MAP[f.icon]
            return (
              <div
                className={`vault-feature-card reveal reveal-delay-${idx + 1}`}
                key={f.title}
                onMouseMove={handleCardTilt}
                onMouseLeave={resetCardTilt}
              >
                <Icon />
                <h3 className="vault-feature-title">{f.title}</h3>
                <p className="vault-feature-body">{f.body}</p>
                <div className="vault-info-stats">
                  {f.stats.map((s) => (
                    <div className="vault-info-stat" key={s.label}>
                      <span className="vault-info-label">{s.label}</span>
                      <div className="vault-info-value">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══════════ NARRATIVE ═══════════ */}
      <section className="vault-section vault-narrative" id="wealth">
        <div className="vault-narrative-split">
          <div className="vault-narrative-visual reveal">
            <svg viewBox="0 0 200 200" fill="none" stroke="var(--accent)" strokeWidth="0.5">
              <g className="vault-svg-ring vault-svg-ring-1">
                <circle cx="100" cy="100" r="90" strokeDasharray="3 3" />
                <circle cx="100" cy="100" r="75" strokeDasharray="6 6" />
              </g>
              <g className="vault-svg-ring vault-svg-ring-2">
                <circle cx="100" cy="100" r="60" strokeDasharray="2 4" />
                <circle cx="100" cy="100" r="45" strokeDasharray="4 8" />
              </g>
              <line x1="100" y1="5" x2="100" y2="195" opacity="0.15" />
              <line x1="5" y1="100" x2="195" y2="100" opacity="0.15" />
              <line x1="20" y1="20" x2="180" y2="180" opacity="0.1" />
              <line x1="180" y1="20" x2="20" y2="180" opacity="0.1" />
              <circle cx="100" cy="100" r="3" fill="var(--accent)" stroke="none" />
              <circle cx="100" cy="100" r="8" strokeWidth="0.3" opacity="0.5" />
            </svg>
          </div>

          <div className="vault-narrative-content reveal reveal-delay-2">
            <span className="vault-label">Money Management</span>
            <h2 className="vault-section-title">
              Protect Your <br />Future.
            </h2>
            <p className="vault-section-desc">
              Our team helps you find the best ways to keep your money safe and grow it for 
              years to come. We handle the hard work for you.
            </p>

            <div className="vault-chart">
              <div className="vault-chart-header">
                <span className="vault-chart-meta">GOLDTRUST INVESTMENT GROWTH (2024-25)</span>
                <span className="vault-chart-meta vault-chart-positive">+42.8%</span>
              </div>
              <div className="vault-chart-bars" ref={chartRef}>
                {CHART_HEIGHTS.map((h, i) => (
                  <div
                    className="vault-chart-bar"
                    key={i}
                    style={{
                      '--bar-height': `${h}%`,
                      '--bar-delay': `${i * 0.08}s`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            </div>

            <a href="#" className="vault-btn vault-btn-primary" onClick={(e) => { e.preventDefault(); openAuth(); }}>Review Portfolio Tiers</a>
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT US ═══════════ */}
      <section className="vault-section" id="about" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="vault-about-split">
          <div className="vault-about-text reveal">
            <span className="vault-label">What We Do</span>
            <h2 className="vault-section-title">Simple Investing for Everyone.</h2>
            <p className="vault-section-desc">
              GoldTrust was built to make investing simple. We help you invest in crypto, 
              the stock market, and gold mining all in one place.
            </p>
            <blockquote className="vault-about-quote">
              "We believe that growing your money should be easy and safe for everyone, 
              no matter where you are starting from."
            </blockquote>
            <p className="vault-section-desc" style={{ marginTop: 24 }}>
              Founded in 2026, we have helped thousands of people grow their money. 
              We use the best security to keep your investments safe while you watch 
              them grow.
            </p>
          </div>

          <div className="vault-about-stats reveal reveal-delay-2">
            {ABOUT_STATS.map((s) => (
              <div className="vault-about-stat" key={s.label}>
                <span className="vault-info-label">{s.label}</span>
                <div className="vault-stat-value" style={{ fontSize: 48 }}>{s.value}</div>
              </div>
            ))}
            <div className="vault-about-stat" style={{ gridColumn: 'span 2', background: 'var(--surface)' }}>
              <span className="vault-info-label">Global Presence</span>
              <p className="vault-section-desc" style={{ fontSize: 14, marginTop: 8 }}>
                Operating from major financial hubs including Zurich, Singapore, London, and New York.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="vault-section" id="testimonials" style={{ background: 'var(--surface)' }}>
        <div className="vault-section-header centered reveal">
          <span className="vault-label">What Our Users Say</span>
          <h2 className="vault-section-title">Join Thousands of Investors.</h2>
          <p className="vault-section-desc" style={{ margin: '0 auto' }}>
            Trusted by people all over the world to manage their crypto, stocks, and gold.
          </p>
        </div>

        <div className="vault-testimonials-grid">
          {TESTIMONIALS.map((t, idx) => (
            <div className={`vault-testimonial-card reveal reveal-delay-${idx + 1}`} key={t.author}>
              <p className="vault-testimonial-quote">{t.quote}</p>
              <div className="vault-testimonial-author">
                <span className="vault-author-name">{t.author}</span>
                <span className="vault-author-title">{t.title} • {t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ MARQUEE ═══════════ */}
      <div className="vault-marquee">
        <div className="vault-marquee-inner">
          {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((p, i) => (
            <span className="vault-partner" key={i}>{p}</span>
          ))}
        </div>
      </div>

      {/* ═══════════ STRATEGIES ═══════════ */}
      <section className="vault-section" id="performance">
        <div className="vault-section-header centered reveal">
          <span className="vault-label">Investment Types</span>
          <h2 className="vault-section-title">More Than Just a Bank.</h2>
        </div>

        <div className="vault-strategy-grid">
          {STRATEGIES.map((s, idx) => (
            <div 
              className={`vault-strategy-card reveal reveal-delay-${idx + 1}`} 
              key={s.title}
              onMouseMove={handleCardTilt}
              onMouseLeave={resetCardTilt}
            >
              <span className="vault-strategy-num">{s.num}</span>
              <h4 className="vault-strategy-title">{s.title}</h4>
              <p className="vault-strategy-body">{s.body}</p>
              <div className="vault-strategy-metric">
                {s.metric}
                <span className="vault-strategy-metric-label">{s.metricLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MarketExplorer />

      {/* ═══════════ FAQ ═══════════ */}
      <section className="vault-section" id="faq" style={{ background: 'var(--surface)' }}>
        <div className="vault-section-header centered reveal">
          <span className="vault-label">Common Questions</span>
          <h2 className="vault-section-title">Frequently Asked Questions.</h2>
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%', padding: '0 1rem' }}>
          {FAQS.map((faq, idx) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} index={idx} />
          ))}
        </div>
      </section>

      <section className="vault-section vault-cta" id="apply">
        <div className="reveal">
          <span className="vault-label" style={{ marginBottom: 32 }}>Last Step</span>
          <h2 className="vault-section-title">Ready to Grow Your Money?</h2>
          <p className="vault-section-desc">
            Open your account today and start investing in crypto, stocks, and gold.
          </p>
          <a href="#" className="vault-btn vault-btn-primary" onClick={(e) => { e.preventDefault(); openAuth(); }}>Start Now</a>
        </div>
      </section>
    </>
  )
}

function AppContent() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [toasts, setToasts] = useState<any[]>([])
  const navigate = useNavigate()

  /* ── Auth Handlers ── */
  const openAuth = useCallback(() => {
    setShowAuth(true)
    setIsRegister(false)
    setMenuOpen(false)
  }, [])

  const closeAuth = useCallback(() => {
    setShowAuth(false)
    setTimeout(() => setIsRegister(false), 400)
  }, [])

  const toggleAuthMode = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsRegister((v) => !v)
  }, [])

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated auth success
    setShowAuth(false)
    navigate('/dashboard')
  }

  /* ── Investment Toast Logic ── */
  const addToast = useCallback(() => {
    const investor = INVESTORS[Math.floor(Math.random() * INVESTORS.length)]
    const id = Math.random().toString(36).substr(2, 9)
    
    setToasts((prev) => [...prev, { ...investor, id, visible: false }])

    // Trigger enter animation
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: true } : t))
      )
    }, 100)

    // Trigger exit animation
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      )
      // Remove from DOM
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 600)
    }, 5000)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      addToast()
      const interval = setInterval(addToast, 8000)
      return () => clearInterval(interval)
    }, 3000)
    return () => clearTimeout(timer)
  }, [addToast])

  /* ── Scroll-aware navbar ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <div className="vault-landing">
      {/* ═══════════ NAVIGATION ═══════════ */}
      <nav className="vault-nav" data-scrolled={scrolled}>
        <a className="vault-logo" href="#">GOLDTRUST</a>

        <div className="vault-nav-links">
          <a href="#institutional" className="vault-nav-link">Institutional</a>
          <a href="#wealth" className="vault-nav-link">Private Wealth</a>
          <a href="#performance" className="vault-nav-link">Performance</a>
          <a href="#security" className="vault-nav-link">Security</a>
        </div>

        <div className="vault-nav-actions">
          <a href="#" className="vault-btn vault-btn-primary vault-btn-nav" onClick={(e) => { e.preventDefault(); openAuth(); }}>Access Portal</a>
          <button
            className="vault-hamburger"
            data-open={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className="vault-mobile-menu" data-open={menuOpen}>
        <a href="#institutional" className="vault-nav-link" onClick={closeMenu}>Institutional</a>
        <a href="#wealth" className="vault-nav-link" onClick={closeMenu}>Private Wealth</a>
        <a href="#performance" className="vault-nav-link" onClick={closeMenu}>Performance</a>
        <a href="#security" className="vault-nav-link" onClick={closeMenu}>Security</a>
        <a href="#" className="vault-btn vault-btn-primary" onClick={(e) => { e.preventDefault(); openAuth(); }} style={{ marginTop: 16 }}>
          Access Portal
        </a>
      </div>

      <LandingPage openAuth={openAuth} />

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="vault-footer">
        <div className="vault-footer-copy">
          &copy; 2025 GOLDTRUST IMPERIAL HOLDINGS LIMITED. ALL RIGHTS RESERVED.
        </div>
        <div className="vault-footer-links">
          <a href="#" className="vault-footer-link">Privacy Policy</a>
          <a href="#" className="vault-footer-link">Terms of Service</a>
          <a href="#" className="vault-footer-link">Compliance</a>
          <a href="#" className="vault-footer-link">Regulatory</a>
        </div>
      </footer>

      {/* ═══════════ TOASTS ═══════════ */}
      <div className="vault-toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`vault-toast ${toast.visible ? 'visible' : ''}`}
          >
            <div className="vault-toast-content">
              <div className="vault-toast-dot" />
              <div style={{ color: 'var(--fg)', fontSize: '0.95rem' }}>
                <span className="vault-toast-name" style={{ fontWeight: 600 }}>{toast.name}</span>
                {' just invested '}
                <span className="vault-toast-amount" style={{ color: 'var(--accent)', fontWeight: 600 }}>{toast.amount}</span>
                {' in '}
                <span className="vault-toast-asset">{toast.asset}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════ AUTH MODAL ═══════════ */}
      <div className="vault-modal-overlay" data-open={showAuth} onClick={(e) => e.target === e.currentTarget && closeAuth()}>
        <div className="vault-auth-card">
          <button className="vault-modal-close" onClick={closeAuth} aria-label="Close modal">&times;</button>
          <div className="vault-auth-logo">GOLDTRUST</div>
          
          <form onSubmit={handleAuthSubmit}>
            <div className="vault-input-group" data-hidden={!isRegister} style={!isRegister ? { height: 0, margin: 0, opacity: 0, overflow: 'hidden', pointerEvents: 'none', padding: 0 } : { transition: 'all 0.3s ease' }}>
              <label className="vault-input-label">Full Name</label>
              <input 
                type="text" 
                className="vault-input" 
                placeholder="James Wellington" 
                required={isRegister}
              />
            </div>
            <div className="vault-input-group">
              <label className="vault-input-label">Identity / Email</label>
              <input 
                type="email" 
                className="vault-input" 
                placeholder="investor@private.vault" 
                required 
              />
            </div>
            <div className="vault-input-group" data-hidden={!isRegister} style={!isRegister ? { height: 0, margin: 0, opacity: 0, overflow: 'hidden', pointerEvents: 'none', padding: 0 } : { transition: 'all 0.3s ease' }}>
              <label className="vault-input-label">Preferred Asset</label>
              <select className="vault-input" required={isRegister} style={{ background: 'none', appearance: 'none' }}>
                <option value="" disabled selected style={{ background: 'var(--bg)' }}>Select an Asset Class</option>
                <option value="crypto" style={{ background: 'var(--bg)' }}>Crypto Portfolio</option>
                <option value="stocks" style={{ background: 'var(--bg)' }}>Stock Exchange</option>
                <option value="gold" style={{ background: 'var(--bg)' }}>Gold Mining</option>
              </select>
            </div>
            <div className="vault-input-group">
              <label className="vault-input-label">{isRegister ? 'New Access Key' : 'Access Key'}</label>
              <input 
                type="password" 
                className="vault-input" 
                placeholder="••••••••••••" 
                required 
              />
            </div>
            
            <button type="submit" className="vault-btn vault-btn-primary" style={{ width: 100 + '%', marginTop: 24 }}>
              {isRegister ? 'Request Access' : 'Verify Access'}
            </button>
          </form>

          <div className="vault-auth-footer">
            {isRegister ? 'Already an investor?' : 'New to GoldTrust?'}
            <a href="#" className="vault-auth-link" onClick={toggleAuthMode}>
              {isRegister ? 'Sign In' : 'Request Access'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
