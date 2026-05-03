import { useState } from 'react';
import { 
  LayoutDashboard, 
  PieChart, 
  TrendingUp, 
  Coins, 
  Wallet, 
  History, 
  Settings, 
  LogOut,
  Gem,
  Menu,
  X
} from 'lucide-react';
import './Dashboard.css';

const PACKAGES = [
  { id: 1, type: 'crypto', name: 'Alpha Bitcoin Core', yield: '+14.2%', min: '$5,000' },
  { id: 2, type: 'stocks', name: 'Blue Chip Tech', yield: '+8.4%', min: '$2,500' },
  { id: 3, type: 'gold', name: 'West African Mining', yield: '+12.1%', min: '$10,000' },
  { id: 4, type: 'crypto', name: 'Ethereum Yield Plus', yield: '+11.8%', min: '$3,000' },
  { id: 5, type: 'stocks', name: 'Emerging Markets', yield: '+15.6%', min: '$1,000' },
  { id: 6, type: 'gold', name: 'Physical Bullion', yield: '+4.2%', min: '$50,000' },
];

const PORTFOLIO_ASSETS = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', amount: '12.4502', value: '$845,200', change: '+2.4%', color: 'var(--accent)' },
  { id: 2, name: 'Ethereum', symbol: 'ETH', amount: '150.25', value: '$342,100', change: '-1.2%', color: '#627EEA' },
  { id: 3, name: 'Physical Gold', symbol: 'AU', amount: '50.00 oz', value: '$102,400', change: '+0.5%', color: '#f3ba2f' },
  { id: 4, name: 'S&P 500 Index', symbol: 'SPX', amount: '240 Units', value: '$118,500', change: '+1.8%', color: '#ffffff' },
];

const WALLETS_DATA = [
  { id: 1, type: 'Main Vault', currency: 'USD', balance: '$45,200.00', address: 'GoldTrust Account #8801' },
  { id: 2, type: 'Crypto Wallet', currency: 'BTC', balance: '0.4502 BTC', address: 'bc1qxy2kg...4v6r' },
  { id: 3, type: 'Crypto Wallet', currency: 'ETH', balance: '4.251 ETH', address: '0x71C7...5C9D' },
];

const HISTORY_DATA = [
  { id: 1, type: 'Investment', asset: 'Alpha Bitcoin Core', amount: '-$5,000.00', date: '2026-05-01 14:20', status: 'Completed' },
  { id: 2, type: 'Yield Dist.', asset: 'Physical Bullion', amount: '+$420.50', date: '2026-04-30 09:15', status: 'Completed' },
  { id: 3, type: 'Deposit', asset: 'USD Wallet', amount: '+$50,000.00', date: '2026-04-28 11:45', status: 'Completed' },
  { id: 4, type: 'Withdrawal', asset: 'USD Wallet', amount: '-$2,500.00', date: '2026-04-25 16:30', status: 'Completed' },
  { id: 5, type: 'Investment', asset: 'Blue Chip Tech', amount: '-$2,500.00', date: '2026-04-20 10:00', status: 'Completed' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="vault-dashboard">
      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className={`vault-sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="vault-sidebar-logo">
          GOLDTRUST
          <X 
            size={20} 
            className="vault-mobile-only" 
            style={{ cursor: 'pointer' }} 
            onClick={() => setIsSidebarOpen(false)} 
          />
        </div>
        
        <nav className="vault-sidebar-nav">
          <div className={`vault-sidebar-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleNavClick('overview')}>
            <LayoutDashboard size={18} /> Overview
          </div>
          <div className={`vault-sidebar-link ${activeTab === 'invest' ? 'active' : ''}`} onClick={() => handleNavClick('invest')}>
            <TrendingUp size={18} /> Invest
          </div>
          <div className={`vault-sidebar-link ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => handleNavClick('portfolio')}>
            <PieChart size={18} /> Portfolio
          </div>
          <div className={`vault-sidebar-link ${activeTab === 'wallets' ? 'active' : ''}`} onClick={() => handleNavClick('wallets')}>
            <Wallet size={18} /> Wallets
          </div>
          <div className={`vault-sidebar-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => handleNavClick('history')}>
            <History size={18} /> History
          </div>
          <div style={{ marginTop: 'auto' }} className={`vault-sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleNavClick('settings')}>
            <Settings size={18} /> Settings
          </div>
        </nav>

        <div className="vault-sidebar-footer">
          <div className="vault-user-info">
            <div className="vault-user-avatar">JW</div>
            <div className="vault-user-details">
              <span className="vault-user-name">James Wellington</span>
              <span className="vault-user-role">Elite Member</span>
            </div>
            <LogOut size={16} className="vault-muted" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </aside>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="vault-db-main">
        <header className="vault-db-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Menu 
              size={20} 
              className="vault-mobile-only" 
              style={{ cursor: 'pointer' }} 
              onClick={() => setIsSidebarOpen(true)} 
            />
            <h2 className="vault-db-title">
              {activeTab === 'overview' && 'Portfolio Overview'}
              {activeTab === 'invest' && 'GoldTrust Packages'}
              {activeTab === 'portfolio' && 'Imperial Assets'}
              {activeTab === 'wallets' && 'Imperial Wallets'}
              {activeTab === 'history' && 'Transaction History'}
              {activeTab === 'settings' && 'Imperial Settings'}
            </h2>
          </div>
          <div className="vault-db-actions">
            <button className="vault-btn vault-btn-primary vault-btn-nav" style={{ padding: '8px 20px' }}>Deposit Funds</button>
          </div>
        </header>

        <div className="vault-db-body">
          {activeTab === 'overview' && (
            <div className="vault-db-grid">
              {/* Balance Card */}
              <div className="vault-card vault-card-balance">
                <div className="vault-balance-header">
                  <div>
                    <span className="vault-balance-label">Total Portfolio Value</span>
                    <div className="vault-balance-amount">
                      $1,248,590.00 <span className="vault-balance-change">+2.4%</span>
                    </div>
                  </div>
                  <TrendingUp size={24} color="var(--success)" />
                </div>
                <div style={{ display: 'flex', gap: '32px', marginTop: 'auto' }}>
                  <div>
                    <span className="vault-balance-label">Total Profit</span>
                    <div style={{ fontSize: '18px', marginTop: '4px' }}>+$142,300</div>
                  </div>
                  <div>
                    <span className="vault-balance-label">Invested Funds</span>
                    <div style={{ fontSize: '18px', marginTop: '4px' }}>$1,106,290</div>
                  </div>
                </div>
              </div>

              {/* Asset Allocation */}
              <div className="vault-card vault-card-assets">
                <span className="vault-balance-label">Asset Allocation</span>
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Coins size={14} color="var(--accent)" /> Crypto
                    </div>
                    <span>45%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gem size={14} color="#f3ba2f" /> Gold
                    </div>
                    <span>30%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={14} color="#ffffff" /> Stocks
                    </div>
                    <span>25%</span>
                  </div>
                </div>
              </div>

              {/* Quick Invest */}
              <div className="vault-card vault-card-packages">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="vault-balance-label">Featured Packages</span>
                  <span className="vault-auth-link" style={{ fontSize: '11px', cursor: 'pointer' }} onClick={() => setActiveTab('invest')}>View All</span>
                </div>
                
                <div className="vault-packages-row">
                  {PACKAGES.slice(0, 3).map(pkg => (
                    <div key={pkg.id} className="vault-package-item">
                      <div className="vault-package-header-row">
                        <span className="vault-package-tag">{pkg.type}</span>
                        {pkg.type === 'crypto' && <Coins size={12} color="var(--accent)" />}
                        {pkg.type === 'gold' && <Gem size={12} color="#f3ba2f" />}
                        {pkg.type === 'stocks' && <TrendingUp size={12} color="#ffffff" />}
                      </div>
                      <h4 className="vault-package-name">{pkg.name}</h4>
                      <div className="vault-package-yield">{pkg.yield} <span style={{ fontSize: '10px', color: 'var(--muted)' }}>ROI</span></div>
                      <div className="vault-package-min">Min Investment: {pkg.min}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invest' && (
            <div className="vault-db-grid">
               <div className="vault-card vault-card-packages">
                <div className="vault-packages-row">
                  {PACKAGES.map(pkg => (
                    <div key={pkg.id} className="vault-package-item">
                      <div className="vault-package-header-row">
                        <span className="vault-package-tag">{pkg.type}</span>
                        {pkg.type === 'crypto' && <Coins size={12} color="var(--accent)" />}
                        {pkg.type === 'gold' && <Gem size={12} color="#f3ba2f" />}
                        {pkg.type === 'stocks' && <TrendingUp size={12} color="#ffffff" />}
                      </div>
                      <h4 className="vault-package-name">{pkg.name}</h4>
                      <div className="vault-package-yield">{pkg.yield}</div>
                      <div className="vault-package-min">Min Investment: {pkg.min}</div>
                      <button className="vault-btn vault-btn-primary" style={{ width: '100%', marginTop: '20px', padding: '10px' }}>Invest Now</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="vault-db-grid">
              <div className="vault-card vault-card-packages">
                <div className="vault-table-container">
                  <table className="vault-table">
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Balance</th>
                        <th>Value (USD)</th>
                        <th>24h Change</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PORTFOLIO_ASSETS.map(asset => (
                        <tr key={asset.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: 8, height: 8, background: asset.color }} />
                              <div>
                                <div style={{ fontWeight: 500 }}>{asset.name}</div>
                                <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{asset.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{asset.amount}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{asset.value}</td>
                          <td style={{ color: asset.change.startsWith('+') ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
                            {asset.change}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="vault-auth-link" style={{ fontSize: '11px' }}>Trade</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallets' && (
            <div className="vault-db-grid">
              {WALLETS_DATA.map(wallet => (
                <div key={wallet.id} className="vault-card" style={{ gridColumn: 'span 4' }}>
                  <div className="vault-balance-label" style={{ marginBottom: '16px' }}>{wallet.type}</div>
                  <div style={{ fontSize: '24px', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>{wallet.balance}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>
                    {wallet.address}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    <button className="vault-btn vault-btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '11px' }}>Deposit</button>
                    <button className="vault-btn vault-btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '11px' }}>Send</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="vault-db-grid">
              <div className="vault-card vault-card-packages">
                <div className="vault-table-container">
                  <table className="vault-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Asset/Package</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {HISTORY_DATA.map(item => (
                        <tr key={item.id}>
                          <td style={{ color: 'var(--accent)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>{item.type}</td>
                          <td>{item.asset}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: item.amount.startsWith('+') ? 'var(--success)' : 'inherit' }}>
                            {item.amount}
                          </td>
                          <td style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.date}</td>
                          <td>
                            <span style={{ fontSize: '10px', background: 'rgba(0,255,0,0.1)', color: 'var(--success)', padding: '2px 8px' }}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="vault-db-grid">
              <div className="vault-card vault-card-profile">
                <span className="vault-balance-label">Profile Information</span>
                <div style={{ marginTop: '24px' }}>
                  <div className="vault-user-avatar" style={{ width: '64px', height: '64px', fontSize: '24px', marginBottom: '16px' }}>JW</div>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="vault-balance-label" style={{ display: 'block', marginBottom: '4px' }}>Display Name</label>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>James Wellington</div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="vault-balance-label" style={{ display: 'block', marginBottom: '4px' }}>Email Address</label>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--muted)' }}>j.wellington@private.vault</div>
                  </div>
                  <button className="vault-btn vault-btn-secondary" style={{ width: '100%', marginTop: '12px' }}>Update Profile</button>
                </div>
              </div>

              <div className="vault-card vault-card-security">
                <span className="vault-balance-label">Security & Privacy</span>
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>Two-Factor Authentication</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Secure your account with a secondary verification step.</div>
                    </div>
                    <span style={{ color: 'var(--success)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enabled</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>API Access Keys</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Manage your institutional API keys for algorithmic trading.</div>
                    </div>
                    <button className="vault-auth-link" style={{ fontSize: '11px' }}>Manage Keys</button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>Session Management</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>You are currently logged in on 2 devices.</div>
                    </div>
                    <button className="vault-auth-link" style={{ fontSize: '11px', color: 'var(--danger)' }}>Revoke All</button>
                  </div>
                </div>
              </div>

              <div className="vault-card" style={{ gridColumn: 'span 12', marginTop: '24px' }}>
                <span className="vault-balance-label">Tier Benefits (Elite Member)</span>
                <div className="vault-tier-grid">
                  <div className="vault-tier-item">
                    <div className="vault-tier-value">0.1%</div>
                    <div className="vault-tier-label">Trading Fees</div>
                  </div>
                  <div className="vault-tier-item">
                    <div className="vault-tier-value">24/7</div>
                    <div className="vault-tier-label">Concierge Desk</div>
                  </div>
                  <div className="vault-tier-item">
                    <div className="vault-tier-value">UNLIMITED</div>
                    <div className="vault-tier-label">Vault Storage</div>
                  </div>
                  <div className="vault-tier-item">
                    <div className="vault-tier-value">EARLY</div>
                    <div className="vault-tier-label">Deal Access</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
