import { useEffect, useState, useRef, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import api from './api'
import Dashboard from './dashboard/Dashboard'
import Admin from './admin/Admin'
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
  { label: 'Founded', value: '1996' },
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
    author: "Amira Al-Dahab",
    title: "Sovereign Wealth Strategist",
    location: "Dubai",
    premium: true
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
    num: 'PRIMARY ASSET',
    title: 'Gold Mining',
    body: 'Get direct exposure to gold mining profits and real-world gold assets. Our flagship physical backing strategy.',
    metric: '$1.2B',
    metricLabel: 'TOTAL VALUE',
    featured: true
  },
  {
    num: 'OPTION 02',
    title: 'Crypto Investing',
    body: 'Invest directly in Bitcoin and other digital coins with zero risk of losing your access.',
    metric: '+154%',
    metricLabel: '3Y PROFIT',
  },
  {
    num: 'OPTION 03',
    title: 'Stock Exchange',
    body: 'Trade shares in the world’s biggest companies easily from one simple dashboard.',
    metric: '+18.2%',
    metricLabel: 'AVG YEARLY',
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
    a: 'We welcome investors starting at $50 to access our premium portfolio strategies across crypto, stocks, and gold.'
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

const ICON_MAP: Record<string, () => any> = {
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
    <section className="vault-section vault-section-grid" id="markets" style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg)' }}>
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
          <div className="vault-hero-img-container">
            <img src="/abstract_gold_flow_1778360579462.png" alt="Institutional Wealth" className="vault-hero-img" style={{ transform: 'translate(calc(var(--hero-x) * 0.05), calc(var(--hero-y) * 0.05))' }} />
          </div>
          <div className="vault-orb vault-orb-1" style={{ transform: 'translate(var(--hero-x), var(--hero-y))' }} />
          <div className="vault-orb vault-orb-2" style={{ transform: 'translate(calc(var(--hero-x) * -1), calc(var(--hero-y) * -1))' }} />
          <div className="vault-grid-pattern" />
          <div className="vault-hero-overlay" />
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
      <section className="vault-section vault-section-imaged" id="institutional">
        <div className="vault-section-bg-img">
          <img src="/wealth_man_luxury_office_1778360535864.png" alt="" className="vault-section-bg-photo" />
        </div>
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
            <img src="/crypto_visual_v2.png" alt="GoldTrust Vision" className="vault-visual-img" />
            <div className="vault-visual-overlay" />
            <div className="vault-visual-glow" />
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
      <section className="vault-section vault-section-grid" id="about" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="vault-about-split">
          <div className="vault-about-text reveal">
            <span className="vault-label">Our Journey</span>
            <h2 className="vault-section-title">A Legacy Reborn.</h2>
            <p className="vault-section-desc">
              GoldTrust represents the evolution and triumphant rebirth of our original pioneering vision, <strong>e-gold</strong>. Founded in 1996 as the world's very first successful digital gold currency, e-gold built a historic record by establishing secure, physical gold-backed transactions long before the inception of modern blockchain networks.
            </p>
            <blockquote className="vault-about-quote">
              "Our original conviction remains unchanged: true wealth preservation requires combining the enduring value of physical gold with the frictionless agility of digital systems."
            </blockquote>
            <p className="vault-section-desc" style={{ marginTop: 24 }}>
              At its peak, the platform secured over five million accounts globally, processing billions in gold-backed transfers. While early web-era regulatory transitions and scaling challenges eventually led to a pause in operations, the underlying gold reserves remained fully backed and accounted for. Today, fully restructured, capitalized, and compliant, we return under the GoldTrust banner to bridge physical gold, equities, and modern cryptocurrencies into a single sovereign private wealth ecosystem.
            </p>
          </div>

          <div className="vault-about-visual-container reveal reveal-delay-2">
            <div className="vault-about-visual-inner">
              <img src="/gold_visual.png" alt="Gold Mining" className="vault-about-img" />
              <div className="vault-about-img-overlay" />
              <div className="vault-about-stats-overlay">
                {ABOUT_STATS.map((s) => (
                  <div className="vault-about-stat" key={s.label}>
                    <span className="vault-info-label">{s.label}</span>
                    <div className="vault-stat-value" style={{ fontSize: 32 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="vault-about-presence">
               <span className="vault-info-label">Global Presence</span>
               <p className="vault-section-desc" style={{ fontSize: 13, marginTop: 8 }}>
                 Operating from Zurich, Singapore, London, and New York.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="vault-section vault-section-imaged" id="testimonials" style={{ background: 'var(--surface)' }}>
        <div className="vault-section-bg-img vault-section-bg-right">
          <img src="/hero.png" alt="" className="vault-section-bg-photo" />
        </div>
        <div className="vault-section-header centered reveal">
          <span className="vault-label">What Our Users Say</span>
          <h2 className="vault-section-title">Join Thousands of Investors.</h2>
          <p className="vault-section-desc" style={{ margin: '0 auto' }}>
            Trusted by people all over the world to manage their crypto, stocks, and gold.
          </p>
        </div>

        <div className="vault-testimonials-grid">
          {TESTIMONIALS.map((t, idx) => (
            <div className={`vault-testimonial-card ${t.premium ? 'premium' : ''} reveal reveal-delay-${idx + 1}`} key={t.author}>
              {t.premium && <div className="vault-premium-badge">TOP RATED INVESTOR</div>}
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
      <div className="vault-marquee vault-section-grid">
        <div className="vault-marquee-inner">
          {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((p, i) => (
            <span className="vault-partner" key={i}>{p}</span>
          ))}
        </div>
      </div>

      {/* ═══════════ STRATEGIES ═══════════ */}
      <section className="vault-section vault-section-imaged" id="performance">
        <div className="vault-section-bg-img vault-section-bg-center">
          <img src="/crypto_vault_futuristic_1778360649446.png" alt="" className="vault-section-bg-photo" />
        </div>
        <div className="vault-section-header centered reveal">
          <span className="vault-label">Investment Types</span>
          <h2 className="vault-section-title">More Than Just a Bank.</h2>
        </div>

        <div className="vault-strategy-grid">
          {STRATEGIES.map((s, idx) => (
            <div 
              className={`vault-strategy-card ${s.featured ? 'featured' : ''} reveal reveal-delay-${idx + 1}`} 
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

      <section className="vault-section vault-cta vault-section-imaged" id="apply">
        <div className="vault-section-bg-img vault-section-bg-cta">
          <img src="/wealth_man_luxury_office_1778360535864.png" alt="" className="vault-section-bg-photo" />
        </div>
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
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, text: "Welcome to GOLDTRUST Imperial Holdings. How may we assist your capital objectives today?", sender: 'bot', time: '21:16' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [authForm, setAuthForm] = useState({
    fullName: '',
    email: '',
    password: '',
    preferredAsset: '',
    referralCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  // Draggable FAB state & handlers
  const [fabPosition, setFabPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 })
  const hasDragged = useRef(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    hasDragged.current = false
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startX: fabPosition.x,
      startY: fabPosition.y
    }
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDragged.current = true
    }
    setFabPosition({
      x: dragStart.current.startX + dx,
      y: dragStart.current.startY + dy
    })
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    hasDragged.current = false
    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      startX: fabPosition.x,
      startY: fabPosition.y
    }
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    const dx = touch.clientX - dragStart.current.x
    const dy = touch.clientY - dragStart.current.y
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDragged.current = true
    }
    setFabPosition({
      x: dragStart.current.startX + dx,
      y: dragStart.current.startY + dy
    })
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    } else {
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleTouchMove, handleTouchEnd])
  const [authError, setAuthError] = useState('')
  const [verificationPending, setVerificationPending] = useState(false)
  const [forgotMode, setForgotMode] = useState<'none' | 'request' | 'reset'>('none')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.openLogin) {
      setShowAuth(true)
      setIsRegister(false)
      // Clear location state so refreshing doesn't keep opening it
      navigate(location.pathname, { replace: true, state: {} })
    } else if (location.state?.openRegister) {
      setShowAuth(true)
      setIsRegister(true)
      const savedRef = localStorage.getItem('referralCode')
      if (savedRef) {
        setAuthForm(prev => ({ ...prev, referralCode: savedRef }))
      }
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatMessages = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/chat');
      if (res.data && Array.isArray(res.data)) {
        const formatted = res.data.map((m: any) => ({
          id: m.id,
          text: m.message,
          sender: m.sender_type === 'user' ? 'user' : 'bot',
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        // If we have messages, replace the default welcome
        if (formatted.length > 0) {
          setChatMessages(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat messages', err);
    }
  }, []);

  useEffect(() => {
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchChatMessages]);

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        await api.post('/chat', { message: chatInput });
        setChatInput('');
        fetchChatMessages();
      } catch (err) {
        console.error('Failed to send message', err);
      }
    } else {
      // Guest/Support mode logic
      const userMsg = { id: Date.now(), text: chatInput, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      setChatMessages(prev => [...prev, userMsg])
      const currentEmail = authForm.email;
      const messageToSend = chatInput;
      setChatInput('')

      try {
        await api.post('/chat/support', { 
          message: messageToSend,
          email: currentEmail || 'guest@goldtrust.holding'
        });
        
        // Simulate bot response after successful send
        setTimeout(() => {
          const options = [
            {
              text: "Our institutional support desk is online. For direct communication with our admin desk, please reach out to our private WhatsApp support number: +44 7346 896494"
            },
            {
              text: "Please connect with our private capital advisor directly on WhatsApp for secure account management.",
              html: "Please connect with our private capital advisor directly on WhatsApp for secure account management: <a href='https://wa.me/qr/VAYD6QXDFFJKO1' target='_blank' style='color: var(--accent); text-decoration: underline; font-weight: 600;'>Direct WhatsApp Chat</a>"
            },
            {
              text: "Scan this institutional QR code to start a direct secure session with our advisor on WhatsApp.",
              isImage: true,
              imageUrl: "/1001987453.jpg"
            }
          ];
          const chosen = options[Math.floor(Math.random() * options.length)];
          const botMsg = { 
            id: Date.now() + 1, 
            ...chosen,
            sender: 'bot', 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
          setChatMessages(prev => [...prev, botMsg])
        }, 1500)
      } catch (err) {
        console.error('Failed to send support message', err);
        setTimeout(() => {
          const options = [
            {
              text: "Our messaging system experienced minor latency. Please reach out to our private support number directly via WhatsApp: +44 7346 896494"
            },
            {
              text: "Secure messaging connection timed out. You may connect directly to our administrative team on WhatsApp.",
              html: "Secure messaging connection timed out. You may connect directly to our administrative team on WhatsApp: <a href='https://wa.me/qr/VAYD6QXDFFJKO1' target='_blank' style='color: var(--accent); text-decoration: underline; font-weight: 600;'>Open WhatsApp Support</a>"
            },
            {
              text: "Please scan our secure QR code to reach our private bank support line via WhatsApp.",
              isImage: true,
              imageUrl: "/1001987453.jpg"
            }
          ];
          const chosen = options[Math.floor(Math.random() * options.length)];
          const botMsg = { 
            id: Date.now() + 1, 
            ...chosen,
            sender: 'bot', 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
          setChatMessages(prev => [...prev, botMsg])
        }, 1500)
      }
    }
  }

  /* ── Auth Handlers ── */
  const openAuth = useCallback(() => {
    setShowAuth(true)
    setIsRegister(false)
    setMenuOpen(false)
  }, [])

  const closeAuth = useCallback(() => {
    setShowAuth(false)
    localStorage.removeItem('referralCode')
    setTimeout(() => {
      setIsRegister(false)
      setForgotMode('none')
    }, 400)
  }, [])

  const toggleAuthMode = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsRegister((v) => !v)
    if (isRegister) {
      localStorage.removeItem('referralCode')
    }
    setForgotMode('none')
    setAuthError('')
    setVerificationPending(false)
    setOtp(['', '', '', '', '', ''])
    setShowPassword(false)
  }, [isRegister])

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    try {
      if (isRegister) {
        await api.post('/auth/register', {
          email: authForm.email,
          password: authForm.password,
          fullName: authForm.fullName,
          referralCode: authForm.referralCode
        })
        localStorage.removeItem('referralCode')
        setVerificationPending(true)
      } else {
        const res = await api.post('/auth/login', {
          email: authForm.email,
          password: authForm.password
        })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        setShowAuth(false)
        if (res.data.user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.message || err.response?.data?.error || 'Authentication failed')
      if (err.response?.status === 403 && !isRegister) {
        setVerificationPending(true)
      }
      if (err.response?.status === 423) {
        // Account locked - don't show OTP, just keep showing the error with chat link
        setVerificationPending(false)
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) return

    setAuthLoading(true)
    setAuthError('')
    try {
      await api.post('/auth/verify-otp', {
        email: authForm.email,
        otp: otpString
      })
      setVerificationPending(false)
      setIsRegister(false)
      setAuthError('')
      setOtp(['', '', '', '', '', ''])
      // Inform user they can now login
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Verification failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      await api.post('/auth/resend-otp', { email: authForm.email })
      // Could show a "Code resent" success message here
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Failed to resend code')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authForm.email) return

    setAuthLoading(true)
    setAuthError('')
    try {
      await api.post('/auth/forgot-password', { email: authForm.email })
      setForgotMode('reset')
      setOtp(['', '', '', '', '', ''])
      setAuthError('')
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Failed to send reset code')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleForgotPasswordRequestDirect = async () => {
    if (!authForm.email) return
    setAuthLoading(true)
    setAuthError('')
    try {
      await api.post('/auth/forgot-password', { email: authForm.email })
      setAuthError('Reset code sent successfully to ' + authForm.email)
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Failed to resend code')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleForgotPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6 || !authForm.password) return

    setAuthLoading(true)
    setAuthError('')
    try {
      await api.post('/auth/reset-password', {
        email: authForm.email,
        otp: otpString,
        newPassword: authForm.password
      })
      setForgotMode('none')
      setOtp(['', '', '', '', '', ''])
      setAuthForm({
        ...authForm,
        password: '' // Clear password field for login
      })
      setAuthError('Access Key reset successful. You may now log in.')
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Password reset failed')
    } finally {
      setAuthLoading(false)
    }
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
        <a className="vault-logo" href="#">
          <img src="/logo-trans.png" alt="GoldTrust Logo" className="vault-logo-icon" />
          <span>GOLDTRUST</span>
        </a>

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
        <div className="vault-footer-row">
          <div className="vault-footer-copy">
            &copy; 2026 GOLDTRUST IMPERIAL HOLDINGS LIMITED. ALL RIGHTS RESERVED.
          </div>
          <div className="vault-footer-contact-group">
            <span>Secure Vault Desk: <strong style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)' }}>+44 7346 896494</strong></span>
            <a href="https://wa.me/qr/VAYD6QXDFFJKO1" target="_blank" rel="noopener noreferrer" className="vault-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.054L2 22l5.077-1.331a9.923 9.923 0 004.93 1.315h.005c5.505 0 9.988-4.478 9.99-9.984 0-2.667-1.037-5.176-2.924-7.062C17.191 3.053 14.682 2.001 12.012 2zm6.39 14.159c-.282.793-1.397 1.455-1.921 1.549-.472.085-1.089.158-3.176-.71-2.667-1.111-4.364-3.824-4.498-4.002-.132-.177-1.077-1.431-1.077-2.729 0-1.298.674-1.936.915-2.195.241-.259.527-.324.703-.324.176 0 .352.001.506.008.16.007.375-.061.587.452.219.53.748 1.821.813 1.953.065.132.109.287.021.462-.088.175-.132.287-.264.441-.132.155-.278.347-.396.466-.132.132-.27.276-.117.538.153.262.68 1.118 1.456 1.809.999.892 1.841 1.168 2.105 1.299.264.131.417.109.571-.066.154-.175.66-.766.837-1.028.176-.263.352-.219.594-.131.242.088 1.539.726 1.803.858.264.131.44.197.506.307.066.11.066.634-.216 1.427z"/>
              </svg>
              Direct WhatsApp Support
            </a>
          </div>
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
          <div className="vault-auth-logo">
            <img src="/logo-trans.png" alt="GoldTrust Logo" className="vault-auth-logo-icon" />
            <span>GOLDTRUST</span>
          </div>
          
          <form onSubmit={
            forgotMode === 'request' 
              ? handleForgotPasswordRequest 
              : forgotMode === 'reset' 
              ? handleForgotPasswordReset 
              : verificationPending 
              ? handleVerifyOTP 
              : handleAuthSubmit
          }>
            {authError && (
              <div style={{ 
                padding: '12px', 
                background: 'rgba(248, 113, 113, 0.1)', 
                border: '1px solid #f87171', 
                color: '#f87171', 
                fontSize: '0.85rem', 
                marginBottom: '20px',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span>{authError}</span>
                {authError.toLowerCase().includes('locked') && (
                  <button 
                    type="button"
                    onClick={() => {
                      setChatOpen(true);
                      closeAuth();
                    }}
                    style={{
                      background: '#f87171',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      alignSelf: 'flex-start'
                    }}
                  >
                    MESSAGE ADMIN
                  </button>
                )}
              </div>
            )}

            {forgotMode === 'request' ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 500 }}>Reset Password</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                  Enter your email address and we'll send you a 6-digit security code to reset your password.
                </p>
                <div className="vault-input-group" style={{ textAlign: 'left' }}>
                  <label className="vault-input-label">Identity / Email</label>
                  <input 
                    type="email" 
                    className="vault-input" 
                    placeholder="investor@private.vault" 
                    required 
                    value={authForm.email}
                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  className="vault-btn vault-btn-primary" 
                  style={{ width: '100%', marginTop: '24px', opacity: authLoading ? 0.7 : 1 }}
                  disabled={authLoading}
                >
                  {authLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </div>
            ) : forgotMode === 'reset' ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 500 }}>Reset Password</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '32px' }}>
                  Enter the 6-digit security code sent to <span style={{ color: 'var(--fg)' }}>{authForm.email}</span> and your new access key.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { if (el) otpRefs.current[i] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{
                        width: '45px',
                        height: '55px',
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border)',
                        color: 'var(--accent)',
                        borderRadius: '4px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  ))}
                </div>

                <div className="vault-input-group" style={{ textAlign: 'left' }}>
                  <label className="vault-input-label">New Access Key</label>
                  <div className="vault-password-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="vault-input" 
                      placeholder="••••••••••••" 
                      required 
                      value={authForm.password}
                      onChange={e => setAuthForm({...authForm, password: e.target.value})}
                    />
                    <button 
                      type="button" 
                      className="vault-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="vault-btn vault-btn-primary" 
                  style={{ width: '100%', marginBottom: '20px', marginTop: '24px' }}
                  disabled={authLoading || otp.join('').length !== 6}
                >
                  {authLoading ? 'Resetting...' : 'Reset Access Key'}
                </button>
                
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Didn't receive the code?{' '}
                  <button 
                    type="button" 
                    onClick={handleForgotPasswordRequestDirect}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}
                    disabled={authLoading}
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            ) : verificationPending ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 500 }}>Secure Verification</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '32px' }}>
                  We've sent a 6-digit security code to <span style={{ color: 'var(--fg)' }}>{authForm.email}</span>.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { if (el) otpRefs.current[i] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{
                        width: '45px',
                        height: '55px',
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border)',
                        color: 'var(--accent)',
                        borderRadius: '4px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  ))}
                </div>

                <button 
                  type="submit"
                  className="vault-btn vault-btn-primary" 
                  style={{ width: '100%', marginBottom: '20px' }}
                  disabled={authLoading || otp.join('').length !== 6}
                >
                  {authLoading ? 'Verifying...' : 'Complete Access Request'}
                </button>

                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Didn't receive the code?{' '}
                  <button 
                    type="button" 
                    onClick={handleResendOTP}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}
                    disabled={authLoading}
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="vault-input-group" style={!isRegister ? { height: 0, margin: 0, opacity: 0, overflow: 'hidden', pointerEvents: 'none', padding: 0 } : { transition: 'all 0.3s ease', marginBottom: '20px' }}>
                  <label className="vault-input-label">Full Name</label>
                  <input 
                    type="text" 
                    className="vault-input" 
                    placeholder="James Wellington" 
                    required={isRegister}
                    value={authForm.fullName}
                    onChange={e => setAuthForm({...authForm, fullName: e.target.value})}
                  />
                </div>
                <div className="vault-input-group">
                  <label className="vault-input-label">Identity / Email</label>
                  <input 
                    type="email" 
                    className="vault-input" 
                    placeholder="investor@private.vault" 
                    required 
                    value={authForm.email}
                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                  />
                </div>
                <div className="vault-input-group" style={!isRegister ? { height: 0, margin: 0, opacity: 0, overflow: 'hidden', pointerEvents: 'none', padding: 0 } : { transition: 'all 0.3s ease', marginBottom: '20px' }}>
                  <label className="vault-input-label">Preferred Asset</label>
                  <select 
                    className="vault-input" 
                    required={isRegister} 
                    style={{ background: 'none', appearance: 'none' }}
                    value={authForm.preferredAsset}
                    onChange={e => setAuthForm({...authForm, preferredAsset: e.target.value})}
                  >
                    <option value="" disabled style={{ background: 'var(--bg)' }}>Select an Asset Class</option>
                    <option value="crypto" style={{ background: 'var(--bg)' }}>Crypto Portfolio</option>
                    <option value="stocks" style={{ background: 'var(--bg)' }}>Stock Exchange</option>
                    <option value="gold" style={{ background: 'var(--bg)' }}>Gold Mining</option>
                  </select>
                </div>
                <div className="vault-input-group" style={!isRegister ? { height: 0, margin: 0, opacity: 0, overflow: 'hidden', pointerEvents: 'none', padding: 0 } : { transition: 'all 0.3s ease', marginBottom: '20px' }}>
                  <label className="vault-input-label">Referral Code (Optional)</label>
                  <input 
                    type="text" 
                    className="vault-input" 
                    placeholder="GT-XXXXXX" 
                    value={authForm.referralCode}
                    onChange={e => setAuthForm({...authForm, referralCode: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="vault-input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="vault-input-label">{isRegister ? 'New Access Key' : 'Access Key'}</label>
                    {!isRegister && (
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setForgotMode('request');
                          setAuthError('');
                        }}
                        style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'underline', marginBottom: '6px' }}
                      >
                        Forgot Password?
                      </a>
                    )}
                  </div>
                  <div className="vault-password-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="vault-input" 
                      placeholder="••••••••••••" 
                      required 
                      value={authForm.password}
                      onChange={e => setAuthForm({...authForm, password: e.target.value})}
                    />
                    <button 
                      type="button" 
                      className="vault-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="vault-btn vault-btn-primary" 
                  style={{ width: '100%', marginTop: '24px', opacity: authLoading ? 0.7 : 1 }}
                  disabled={authLoading}
                >
                  {authLoading ? 'Processing...' : (isRegister ? 'Request Access' : 'Verify Access')}
                </button>
              </>
            )}
          </form>

          <div className="vault-auth-footer">
            {forgotMode !== 'none' ? (
              <a href="#" className="vault-auth-link" onClick={(e) => {
                e.preventDefault();
                setForgotMode('none');
                setAuthError('');
                setOtp(['', '', '', '', '', '']);
              }}>
                Back to Sign In
              </a>
            ) : (
              <>
                {isRegister ? 'Already an investor?' : 'New to GoldTrust?'}
                <a href="#" className="vault-auth-link" onClick={toggleAuthMode}>
                  {isRegister ? 'Sign In' : 'Request Access'}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
      {/* ═══════════ LIVE CHAT ═══════════ */}
      <div className={`vault-chat-widget ${chatOpen ? 'open' : ''}`}>
        <div className="vault-chat-header" onClick={() => setChatOpen(!chatOpen)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="vault-chat-status" />
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em' }}>CAPITAL ADVISOR</span>
          </div>
          <button className="vault-chat-toggle">{chatOpen ? '−' : '+'}</button>
        </div>
        
        <div className="vault-chat-body">
          <div className="vault-chat-messages">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`vault-chat-msg ${msg.sender}`}>
                <div className="vault-chat-msg-content">
                  {msg.isImage ? (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>{msg.text}</p>
                      <img src={msg.imageUrl} alt="WhatsApp QR" style={{ maxWidth: '160px', width: '100%', height: 'auto', borderRadius: '4px', border: '1px solid var(--border)', display: 'block', margin: '0 auto' }} />
                    </div>
                  ) : msg.html ? (
                    <span dangerouslySetInnerHTML={{ __html: msg.html }} />
                  ) : (
                    msg.text
                  )}
                </div>
                <div className="vault-chat-msg-time">{msg.time}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <form className="vault-chat-input-area" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="vault-chat-input" 
              placeholder="Inquire about holdings..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="vault-chat-send">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {!chatOpen && (
        <button 
          className="vault-chat-trigger" 
          style={{
            transform: `translate(${fabPosition.x}px, ${fabPosition.y}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={(e) => {
            if (hasDragged.current) {
              e.preventDefault();
              e.stopPropagation();
            } else {
              setChatOpen(true);
            }
          }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <div className="vault-chat-badge" />
        </button>
      )}
    </div>
  )
}


function LoginRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/', { replace: true, state: { openLogin: true } })
  }, [navigate])
  return null
}

function RegisterRedirect() {
  const navigate = useNavigate()
  const [searchParams] = useState(new URLSearchParams(window.location.search))
  
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      localStorage.setItem('referralCode', ref)
    }
    navigate('/', { replace: true, state: { openRegister: true } })
  }, [navigate, searchParams])
  
  return null
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/register" element={<RegisterRedirect />} />
      </Routes>
    </Router>
  )
}

export default App
