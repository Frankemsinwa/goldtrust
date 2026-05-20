import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { 
  useAccount, 
  useBalance, 
  useSendTransaction, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseEther } from 'viem';
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
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Banknote,
  Send,
  Copy,
  Users
} from 'lucide-react';
import './Dashboard.css';
import TradingChart from './TradingChart';
import DashboardTour from './DashboardTour';

// Mock data kept as fallback for structural safety, but replaced by API data in useEffect


export default function Dashboard() {
  const [user] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Real Data State
  const [packages, setPackages] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Market Engine State
  const [totalProfit, setTotalProfit] = useState(0);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [chartInvestment, setChartInvestment] = useState<any>(null);
  const [chartTimeframe, setChartTimeframe] = useState<'1H'|'1D'|'1W'|'1M'>('1H');
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState('0.00');

  const [investStep, setInvestStep] = useState<'idle' | 'input' | 'confirming' | 'processing' | 'success'>('idle');
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [investPaymentMethod, setInvestPaymentMethod] = useState<'web3' | 'internal' | null>(null);
  const [] = useState('');
  const [investError, setInvestError] = useState('');

  // Deposit State
  const [depositStep, setDepositStep] = useState<'idle' | 'method' | 'amount' | 'instructions' | 'proof' | 'processing' | 'success'>('idle');
  const [depositMethod, setDepositMethod] = useState<'bank' | 'wise' | 'crypto' | 'card' | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositProof, setDepositProof] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<'btc' | 'eth' | 'sol' | 'usdt'>('btc');

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, text: "Welcome back to your Private Capital Portal. How may we assist your holdings today?", sender: 'bot', time: '09:00' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Web3 Hooks
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const lastConnectedAddress = useRef<string | null>(null);

  // Wagmi Transaction Hooks
  const { 
    data: hash, 
    error: sendError, 
    isPending: _isSendPending, 
    sendTransaction 
  } = useSendTransaction();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({ 
    hash, 
  });

  const fetchData = useCallback(async () => {
    try {
      const [pkgsRes, invRes, wallRes, histRes, refRes] = await Promise.all([
        api.get('/packages'),
        api.get('/investments'),
        api.get('/wallets'),
        api.get('/transactions'),
        api.get('/referrals').catch(err => {
          console.error('Referrals API error:', err);
          return { data: null };
        })
      ]);
      setPackages(pkgsRes.data);
      setInvestments(invRes.data);
      setWallets(wallRes.data);
      setHistory(histRes.data);
      if (refRes && refRes.data) {
        setReferralStats(refRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  }, []);

  useEffect(() => {
    const completed = localStorage.getItem('vault_tour_completed');
    if (completed !== 'true') {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const fetchProfit = async () => {
      try {
        const res = await api.get('/portfolio/performance');
        setTotalProfit(res.data.profit);
      } catch (err) {}
    };
    fetchProfit();
    const interval = setInterval(fetchProfit, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = useCallback(async () => {
    if (!chartInvestment) return;
    try {
      const res = await api.get(`/investments/${chartInvestment.id}/market-data/${chartTimeframe}`);
      setChartData(res.data.chartData);
      setCurrentPrice(res.data.currentPrice);
      setPriceChange(res.data.priceChange);
    } catch (err) {}
  }, [chartInvestment, chartTimeframe]);

  useEffect(() => {
    fetchMarketData();
    let interval: any;
    if (chartModalOpen) {
      interval = setInterval(fetchMarketData, 5000);
    }
    return () => clearInterval(interval);
  }, [fetchMarketData, chartModalOpen]);

  const openChart = (inv: any) => {
    setChartInvestment(inv);
    setChartModalOpen(true);
    setChartTimeframe('1H');
  };

  useEffect(() => {
    fetchData();
    
    // Background polling for live yield ticks
    const fetchLiveYields = async () => {
      try {
        const [pkgsRes, invRes] = await Promise.all([
          api.get('/packages'),
          api.get('/investments')
        ]);
        setPackages(pkgsRes.data);
        setInvestments(invRes.data);
      } catch (err) {}
    };
    const liveInterval = setInterval(fetchLiveYields, 5000);
    
    // Restore Pending Deposit from LocalStorage
    const savedMethod = localStorage.getItem('pendingDepositMethod');
    const savedAmount = localStorage.getItem('pendingDepositAmount');
    const savedStep = localStorage.getItem('pendingDepositStep');
    const savedCrypto = localStorage.getItem('pendingDepositCrypto');
    
    if (savedMethod && savedAmount && savedStep && savedStep !== 'idle' && savedStep !== 'success') {
      setDepositMethod(savedMethod as any);
      setDepositAmount(savedAmount);
      if (savedCrypto) {
        setSelectedCrypto(savedCrypto as any);
      }
      // We don't auto-open the modal, just show the FAB
    }

    return () => clearInterval(liveInterval);
  }, [fetchData]);

  // Sync Deposit State to LocalStorage
  useEffect(() => {
    if (depositStep !== 'idle' && depositStep !== 'success') {
      localStorage.setItem('pendingDepositMethod', depositMethod || '');
      localStorage.setItem('pendingDepositAmount', depositAmount);
      localStorage.setItem('pendingDepositStep', depositStep);
      localStorage.setItem('pendingDepositCrypto', selectedCrypto);
    } else if (depositStep === 'success' || depositStep === 'idle') {
      localStorage.removeItem('pendingDepositMethod');
      localStorage.removeItem('pendingDepositAmount');
      localStorage.removeItem('pendingDepositStep');
      localStorage.removeItem('pendingDepositCrypto');
    }
  }, [depositStep, depositMethod, depositAmount, selectedCrypto]);

  // Auto-sync linked wallet with backend when address changes
  useEffect(() => {
    if (isConnected && address && address !== lastConnectedAddress.current) {
      const syncWallet = async () => {
        try {
          await api.post('/wallet/link', { walletAddress: address });
          fetchData();
          lastConnectedAddress.current = address;
        } catch (err) {
          console.error('Auto-sync wallet failed', err);
        }
      };
      syncWallet();
    }
  }, [isConnected, address, fetchData]);

  const fetchChatMessages = useCallback(async () => {
    try {
      const res = await api.get('/chat');
      if (res.data && Array.isArray(res.data)) {
        const formatted = res.data.map((m: any) => ({
          id: m.id,
          text: m.message,
          sender: m.sender_type === 'user' ? 'user' : 'bot',
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        if (formatted.length > 0) {
          setChatMessages(formatted);
        }
      }
    } catch (err) {
      console.error('Dashboard chat fetch failed', err);
    }
  }, []);

  useEffect(() => {
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchChatMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    try {
      await api.post('/chat', { message: chatInput });
      setChatInput('');
      fetchChatMessages();
    } catch (err) {
      console.error('Dashboard message send failed', err);
    }
  };

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  // Effect to handle post-transaction recording
  useEffect(() => {
    if (isConfirmed && hash && selectedPkg) {
      const recordInvestment = async () => {
        setInvestStep('processing');
        try {
          await api.post('/wallet/verify-tx', {
            txHash: hash,
            packageId: selectedPkg.id,
            amount: investAmount
          });
          setInvestStep('success');
          fetchData();
        } catch (err: any) {
          setInvestError(err.response?.data?.error || 'Verification failed, but transaction was successful on-chain. Please contact support.');
          setInvestStep('input');
        }
      };
      recordInvestment();
    }
  }, [isConfirmed, hash, selectedPkg, investAmount, fetchData]);

  useEffect(() => {
    if (sendError) {
      setInvestError(sendError.message || 'Transaction rejected or failed');
      setInvestStep('input');
    }
  }, [sendError]);

  const startInvest = (pkg: any) => {
    setSelectedPkg(pkg);
    setInvestStep('input');
    setInvestAmount(pkg.min_investment.toString());
    setInvestError('');
    setInvestPaymentMethod(null);
  };

  const processInvest = async () => {
    if (!investAmount || !riskAccepted) return;
    
    // If it's crypto and we haven't picked a method yet, go to selection
    if (selectedPkg.type === 'crypto' && !investPaymentMethod) {
      setInvestStep('method' as any); // Temporary cast for the new step
      return;
    }

    // Execution based on method
    if (selectedPkg.type === 'crypto' && investPaymentMethod === 'web3') {
      if (!isConnected) {
        open();
        return;
      }
      
      try {
        setInvestStep('confirming');
        const ethAmount = (parseFloat(investAmount) / 3500).toFixed(6);
        
        sendTransaction({
          to: '0xad5FBC2145c97F24351c433eBE0950Ff9431b765', 
          value: parseEther(ethAmount),
        });
      } catch (err: any) {
        setInvestError(err.message || 'Failed to initiate transaction');
        setInvestStep('input');
      }
    } else {
      // Internal balance flow (default for stocks/gold or if selected for crypto)
      executeInternalInvest();
    }
  };

  const executeInternalInvest = async () => {
    setInvestStep('processing');
    setInvestError('');
    try {
      await api.post('/investments', {
        packageId: selectedPkg.id,
        amount: investAmount
      });
      setInvestStep('success');
      fetchData();
    } catch (err: any) {
      setInvestError(err.response?.data?.error || 'Investment failed');
      setInvestStep('input');
    }
  };

  const closeInvest = () => {
    setInvestStep('idle');
    setSelectedPkg(null);
    setInvestAmount('');
    setRiskAccepted(false);
  };

  const closeDeposit = () => {
    setDepositStep('idle');
    // We don't clear method/amount here if they want to use the FAB
    // But if they manually close, we might want to keep the FAB available
    // unless they specifically 'Cancel' it. For now, closing the modal
    // keeps the FAB alive if it was mid-flow.
  };

  const cancelDeposit = () => {
    setDepositStep('idle');
    setDepositMethod(null);
    setDepositAmount('');
    setDepositProof('');
    setSelectedCrypto('btc');
    localStorage.removeItem('pendingDepositMethod');
    localStorage.removeItem('pendingDepositAmount');
    localStorage.removeItem('pendingDepositStep');
    localStorage.removeItem('pendingDepositCrypto');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDepositSubmit = async () => {
    setDepositStep('processing');
    try {
      await api.post('/transactions', {
        type: 'DEPOSIT',
        amount: depositAmount,
        status: 'pending',
        metadata: {
          method: depositMethod,
          proof: depositProof,
          cryptoCurrency: selectedCrypto
        }
      });
      setDepositStep('success');
      fetchData();
    } catch (err) {
      console.error('Deposit request failed', err);
      setDepositStep('amount');
    }
  };

  const cryptoAssets = {
    btc: {
      label: 'Bitcoin (BTC)',
      network: 'Bitcoin Network',
      address: '14wYNynPn4Sc7jB4ecZ133o5ZvzSr3wqmj'
    },
    eth: {
      label: 'Ethereum (ETH)',
      network: 'ERC20 Network',
      address: '0xa8155b13c25a4b6c70d7877303a3dd69ca12b444'
    },
    sol: {
      label: 'Solana (SOL)',
      network: 'Solana Network',
      address: 'EKWiVoL7rF8PqSowtkwcHJBMe5Y5dDSdXx8sZwpQ69ZA'
    },
    usdt: {
      label: 'Tether (USDT)',
      network: 'TRC20 Network',
      address: 'TWAcMv27vtWFtBxJeC8AvuZ1dtryjjpe71'
    }
  };

  const currentAsset = cryptoAssets[selectedCrypto] || cryptoAssets.btc;

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
        
        <nav id="tour-sidebar" className="vault-sidebar-nav">
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
          <div className={`vault-sidebar-link ${activeTab === 'affiliate' ? 'active' : ''}`} onClick={() => handleNavClick('affiliate')}>
            <Users size={18} /> Affiliates
          </div>
          <div className="vault-sidebar-link" onClick={() => setIsTourOpen(true)} style={{ color: 'var(--accent)', marginTop: 'auto' }}>
            <Gem size={18} /> System Guide
          </div>
          <div className={`vault-sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleNavClick('settings')}>
            <Settings size={18} /> Settings
          </div>
        </nav>

        <div className="vault-sidebar-footer">
          <div className="vault-user-info">
            <div className="vault-user-avatar">{user.fullName?.split(' ').map((n:any) => n[0]).join('')}</div>
            <div className="vault-user-details">
              <span className="vault-user-name">{user.fullName}</span>
              <span className="vault-user-role">{user.tier} Member</span>
            </div>
            <LogOut size={16} className="vault-muted" style={{ cursor: 'pointer' }} onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }} />
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
              {activeTab === 'affiliate' && 'Imperial Affiliate Portal'}
              {activeTab === 'settings' && 'Imperial Settings'}
            </h2>
          </div>
          <div className="vault-db-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              id="tour-wallet-btn"
              className="vault-btn vault-btn-secondary" 
              style={{ padding: '8px 20px', fontSize: '11px' }}
              onClick={() => open()}
            >
              {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
            </button>
            <button 
              className="vault-btn vault-btn-primary vault-btn-nav" 
              style={{ padding: '8px 20px' }}
              onClick={() => setDepositStep('method')}
            >
              Deposit Funds
            </button>
          </div>
        </header>

        <div className="vault-db-body">
          {activeTab === 'overview' && (
            <div className="vault-db-grid">
              {/* Balance Card */}
              <div id="tour-balance-card" className="vault-card vault-card-balance">
                <div className="vault-balance-header">
                  <div>
                    <span className="vault-balance-label">Total Portfolio Value</span>
                    <div className="vault-balance-amount">
                      ${investments.reduce((acc, inv) => acc + parseFloat(inv.amount), 0).toLocaleString()} <span className="vault-balance-change">+2.4%</span>
                    </div>
                  </div>
                  <TrendingUp size={24} color="var(--success)" />
                </div>
                <div style={{ display: 'flex', gap: '32px', marginTop: 'auto' }}>
                  <div>
                    <span className="vault-balance-label">Total Profit</span>
                    <div style={{ fontSize: '18px', marginTop: '4px', color: totalProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {totalProfit >= 0 ? '+' : '-'}${Math.abs(totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span className="vault-balance-label">Internal Balance</span>
                    <div style={{ fontSize: '18px', marginTop: '4px' }}>
                      ${parseFloat(wallets.find(w => w.type === 'USD')?.balance || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Allocation */}
              <div id="tour-chart-section" className="vault-card vault-card-assets">
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
                  {packages.slice(0, 3).map(pkg => (
                    <div key={pkg.id} className="vault-package-item">
                      <div className="vault-package-header-row">
                        <span className="vault-package-tag">{pkg.type}</span>
                        {pkg.type === 'crypto' && <Coins size={12} color="var(--accent)" />}
                        {pkg.type === 'gold' && <Gem size={12} color="#f3ba2f" />}
                        {pkg.type === 'stocks' && <TrendingUp size={12} color="#ffffff" />}
                      </div>
                      <h4 className="vault-package-name">{pkg.name}</h4>
                      <div className="vault-package-yield" style={{ color: pkg.yield?.startsWith('-') ? 'var(--danger)' : 'var(--success)' }}>
                        {pkg.yield} <span style={{ fontSize: '10px', color: 'var(--muted)' }}>ROI</span>
                      </div>
                      <div className="vault-package-min">Min Investment: ${pkg.min_investment}</div>
                      <button 
                        className="vault-btn vault-btn-primary" 
                        style={{ width: '100%', marginTop: '16px', padding: '10px', fontSize: '10px' }}
                        onClick={() => startInvest(pkg)}
                      >
                        Invest Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invest' && (
            <div className="vault-db-grid">
               <div id="tour-packages-grid" className="vault-card vault-card-packages">
                <div className="vault-packages-row">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="vault-package-item">
                      <div className="vault-package-header-row">
                        <span className="vault-package-tag">{pkg.type}</span>
                        {pkg.type === 'crypto' && <Coins size={12} color="var(--accent)" />}
                        {pkg.type === 'gold' && <Gem size={12} color="#f3ba2f" />}
                        {pkg.type === 'stocks' && <TrendingUp size={12} color="#ffffff" />}
                      </div>
                      <h4 className="vault-package-name">{pkg.name}</h4>
                      <div className="vault-package-yield" style={{ color: pkg.yield?.startsWith('-') ? 'var(--danger)' : 'var(--success)' }}>{pkg.yield}</div>
                      <div className="vault-package-min">Min Investment: ${pkg.min_investment}</div>
                      <button 
                        className="vault-btn vault-btn-primary" 
                        style={{ width: '100%', marginTop: '20px', padding: '10px' }}
                        onClick={() => startInvest(pkg)}
                      >
                        Invest Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="vault-db-grid">
              <div id="tour-portfolio-assets" className="vault-card vault-card-packages">
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
                      {investments.map(inv => (
                        <tr key={inv.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: 8, height: 8, background: inv.package_type === 'crypto' ? 'var(--accent)' : '#f3ba2f' }} />
                              <div>
                                <div style={{ fontWeight: 500 }}>{inv.package_name}</div>
                                <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{inv.package_type.toUpperCase()}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>Active</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>${parseFloat(inv.amount).toLocaleString()}</td>
                          <td style={{ color: inv.yield?.startsWith('-') ? 'var(--danger)' : 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                            {inv.yield}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="vault-auth-link" style={{ fontSize: '11px' }} onClick={() => openChart(inv)}>Manage</button>
                          </td>
                        </tr>
                      ))}
                      {investments.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>No active investments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallets' && (
            <div id="tour-wallets-grid" className="vault-db-grid">
              {wallets.map(wallet => (
                <div key={wallet.id} className="vault-card" style={{ gridColumn: 'span 4' }}>
                  <div className="vault-balance-label" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {wallet.type === 'USD' ? (
                      <>
                        <ShieldCheck size={12} color="var(--accent)" />
                        Imperial Balance (Escrow)
                      </>
                    ) : (
                      <>
                        {wallet.type} Wallet
                        {wallet.type === 'EXTERNAL' && wallet.address?.toLowerCase() === address?.toLowerCase() && (
                          <span style={{ color: 'var(--success)', fontSize: '9px' }}>(Connected)</span>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '24px', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    {wallet.type === 'USD' && (
                      <>${parseFloat(wallet.balance || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                    )}
                    {wallet.type === 'EXTERNAL' && (() => {
                      const isConnected = wallet.address?.toLowerCase() === address?.toLowerCase();
                      if (isConnected && balanceData) {
                        const parsed = parseFloat(balanceData.formatted);
                        const display = isNaN(parsed) ? '0.0000' : parsed.toFixed(4);
                        return <>{display} {balanceData.symbol || 'ETH'}</>;
                      }
                      return <>{wallet.balance || '0.0000'} ETH</>;
                    })()}
                    {wallet.type !== 'USD' && wallet.type !== 'EXTERNAL' && (
                      <>{wallet.balance} {wallet.type}</>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '24px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {wallet.type === 'USD' ? 'Institutional Escrow Account' : (wallet.address || 'External Address')}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    <button 
                      className="vault-btn vault-btn-secondary" 
                      style={{ width: '100%', padding: '8px', fontSize: '11px' }}
                      onClick={() => wallet.type === 'USD' ? setDepositStep('method') : open()}
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              ))}
              <div className="vault-card" style={{ gridColumn: 'span 4', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => open()}>
                <div style={{ textAlign: 'center' }}>
                  <Wallet size={24} color="var(--muted)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Link New Wallet</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="vault-db-grid">
              <div id="tour-history-table" className="vault-card vault-card-packages">
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
                      {history.map(item => (
                        <tr key={item.id}>
                          <td style={{ color: 'var(--accent)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>{item.type}</td>
                          <td>{item.metadata?.packageName || item.type}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: item.type === 'DEPOSIT' ? 'var(--success)' : 'inherit' }}>
                            {item.type === 'DEPOSIT' ? '+' : '-'}${parseFloat(item.amount).toLocaleString()}
                          </td>
                          <td style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(item.created_at).toLocaleString()}</td>
                          <td>
                            <span style={{ 
                              fontSize: '10px', 
                              background: item.status === 'completed' ? 'rgba(0,255,0,0.1)' : 'rgba(255,165,0,0.1)', 
                              color: item.status === 'completed' ? 'var(--success)' : 'orange', 
                              padding: '2px 8px' 
                            }}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>No transaction history found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div id="tour-settings-grid" className="vault-db-grid">
              <div className="vault-card vault-card-profile">
                <span className="vault-balance-label">Profile Information</span>
                <div style={{ marginTop: '24px' }}>
                  <div className="vault-user-avatar" style={{ width: '64px', height: '64px', fontSize: '24px', marginBottom: '16px' }}>JW</div>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="vault-balance-label" style={{ display: 'block', marginBottom: '4px' }}>Display Name</label>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>{user.fullName}</div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="vault-balance-label" style={{ display: 'block', marginBottom: '4px' }}>Email Address</label>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--muted)' }}>{user.email}</div>
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
                <span className="vault-balance-label">Tier Benefits ({user.tier} Member)</span>
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

          {activeTab === 'affiliate' && (
            <div id="tour-affiliate-section" className="vault-db-grid">
              {/* Stats Cards */}
              <div className="vault-card" style={{ gridColumn: 'span 6' }}>
                <div className="vault-balance-header" style={{ marginBottom: '16px' }}>
                  <div style={{ width: '100%' }}>
                    <span className="vault-balance-label">Your Referral Link</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                      <input 
                        type="text" 
                        readOnly 
                        value={referralStats?.referralCode ? `${window.location.origin}/register?ref=${referralStats.referralCode}` : 'Generating...'} 
                        style={{ 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '4px', 
                          padding: '8px 12px', 
                          color: '#fff', 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: '12px', 
                          width: '100%',
                          outline: 'none'
                        }} 
                      />
                      <button 
                        className="vault-btn vault-btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                        onClick={() => copyToClipboard(referralStats?.referralCode ? `${window.location.origin}/register?ref=${referralStats.referralCode}` : '')}
                      >
                        <Copy size={14} /> {isCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                  Share this link with potential investors. You'll receive a 5% commission on any packages they fund.
                </div>
              </div>

              <div className="vault-card" style={{ gridColumn: 'span 3' }}>
                <span className="vault-balance-label">Referral Earnings</span>
                <div style={{ fontSize: '24px', fontFamily: 'var(--font-display)', margin: '12px 0 4px 0', color: 'var(--success)' }}>
                  ${(referralStats?.totalEarned || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Credited to Imperial Balance</span>
              </div>

              <div className="vault-card" style={{ gridColumn: 'span 3' }}>
                <span className="vault-balance-label">Performance Overview</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>{referralStats?.referredCount || 0}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Total Referrals</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent)' }}>{referralStats?.investedReferredCount || 0}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Active Investors</div>
                  </div>
                </div>
              </div>

              {/* Referred Users list */}
              <div className="vault-card" style={{ gridColumn: 'span 12', marginTop: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span className="vault-balance-label">Referred Network</span>
                </div>
                <div className="vault-table-container">
                  <table className="vault-table">
                    <thead>
                      <tr>
                        <th>Investor</th>
                        <th>Email</th>
                        <th>Date Joined</th>
                        <th>Active Investments</th>
                        <th>Total Invested</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralStats?.referredUsers?.map((refUser: any) => (
                        <tr key={refUser.id}>
                          <td style={{ fontWeight: 500 }}>{refUser.full_name}</td>
                          <td style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{refUser.email}</td>
                          <td style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(refUser.created_at).toLocaleDateString()}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{refUser.investment_count || 0}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>${parseFloat(refUser.total_invested || 0).toLocaleString()}</td>
                          <td>
                            <span style={{ 
                              fontSize: '10px', 
                              background: refUser.investment_count > 0 ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,255,0.05)', 
                              color: refUser.investment_count > 0 ? 'var(--success)' : 'var(--muted)', 
                              padding: '2px 8px',
                              borderRadius: '2px'
                            }}>
                              {refUser.investment_count > 0 ? 'Active Investor' : 'Registered'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!referralStats?.referredUsers || referralStats.referredUsers.length === 0) && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
                            No referrals yet. Share your link to start building your network.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commission ledger */}
              <div className="vault-card" style={{ gridColumn: 'span 12', marginTop: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span className="vault-balance-label">Commission Ledger</span>
                </div>
                <div className="vault-table-container">
                  <table className="vault-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Investor</th>
                        <th>Strategy / Package</th>
                        <th>Investment Amount</th>
                        <th>Commission (5%)</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralStats?.commissions?.map((comm: any) => (
                        <tr key={comm.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>TX-{comm.id}</td>
                          <td>{comm.metadata?.referredUserName || 'N/A'}</td>
                          <td>{comm.metadata?.packageName || 'N/A'}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>${parseFloat(comm.metadata?.investmentAmount || 0).toLocaleString()}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)', fontWeight: 500 }}>
                            +${parseFloat(comm.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(comm.created_at).toLocaleString()}</td>
                          <td>
                            <span style={{ 
                              fontSize: '10px', 
                              background: 'rgba(0,255,0,0.1)', 
                              color: 'var(--success)', 
                              padding: '2px 8px',
                              borderRadius: '2px'
                            }}>
                              {comm.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!referralStats?.commissions || referralStats.commissions.length === 0) && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
                            No commission payouts recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ INVESTMENT FLOW MODAL ═══════════ */}
        {investStep !== 'idle' && (
          <div className="vault-modal-overlay" data-open="true" onClick={(e) => e.target === e.currentTarget && closeInvest()}>
            <div className="vault-auth-card" style={{ maxWidth: '500px' }}>
              <button className="vault-modal-close" onClick={closeInvest}>&times;</button>
              
              {investStep === 'input' && (
                <div className="reveal revealed">
                  <div className="vault-package-tag" style={{ marginBottom: '8px' }}>Institutional Investment</div>
                  <h3 className="vault-db-title" style={{ marginBottom: '8px' }}>{selectedPkg?.name}</h3>
                  <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '32px' }}>
                    Configure your capital allocation for this {selectedPkg?.type} strategy.
                  </div>

                  {investError && (
                    <div style={{ padding: '12px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid #f87171', color: '#f87171', fontSize: '0.85rem', marginBottom: '20px', borderRadius: '4px' }}>
                      {investError}
                    </div>
                  )}

                  <div className="vault-input-group">
                    <label className="vault-balance-label">Investment Amount (USD)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: '12px', color: 'var(--accent)' }}>$</span>
                      <input 
                        type="number" 
                        className="vault-input" 
                        style={{ paddingLeft: '20px' }}
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '8px' }}>
                      Minimum requirement: ${selectedPkg?.min_investment}
                    </div>
                  </div>

                  <div className="vault-card" style={{ background: 'var(--surface)', padding: '20px', borderRadius: '4px', margin: '24px 0', border: '0.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <AlertCircle size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: '12px', color: 'var(--fg)', lineHeight: 1.5 }}>
                        By proceeding, you acknowledge the risk of capital fluctuations and agree to the 12-month lock-up period for institutional yield optimization.
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', cursor: 'pointer', userSelect: 'none' }}>
                      <input 
                        type="checkbox" 
                        checked={riskAccepted} 
                        onChange={(e) => setRiskAccepted(e.target.checked)} 
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>I accept the terms & conditions</span>
                    </label>
                  </div>

                  <button 
                    className="vault-btn vault-btn-primary" 
                    style={{ width: '100%', marginTop: '8px' }}
                    disabled={!riskAccepted || parseFloat(investAmount) < parseFloat(selectedPkg?.min_investment)}
                    onClick={processInvest}
                  >
                    {selectedPkg?.type === 'crypto' ? 'Choose Payment Method' : 'Confirm & Execute'} <ArrowRight size={14} style={{ marginLeft: '8px' }} />
                  </button>
                </div>
              )}

              {investStep === ('method' as any) && (
                <div className="reveal revealed">
                  <div className="vault-package-tag" style={{ marginBottom: '8px' }}>Payment Method</div>
                  <h3 className="vault-db-title" style={{ marginBottom: '8px' }}>Choose Funding Source</h3>
                  <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '32px' }}>
                    Select how you would like to fund this ${parseFloat(investAmount).toLocaleString()} {selectedPkg?.name} investment.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div 
                      className="vault-package-item" 
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}
                      onClick={() => { setInvestPaymentMethod('web3'); setInvestStep('input'); }}
                    >
                      <div style={{ background: 'rgba(55,114,255,0.1)', padding: '10px', borderRadius: '4px' }}>
                        <Wallet size={20} color="#3772ff" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>Connected Web3 Wallet</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {isConnected ? `Pay with ${address?.slice(0,6)}...${address?.slice(-4)}` : 'Connect your MetaMask or Trust Wallet'}
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--muted)" />
                    </div>

                    <div 
                      className="vault-package-item" 
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}
                      onClick={() => { setInvestPaymentMethod('internal'); setInvestStep('input'); }}
                    >
                      <div style={{ background: 'rgba(212,175,55,0.1)', padding: '10px', borderRadius: '4px' }}>
                        <Gem size={20} color="var(--accent)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>Imperial Balance (Escrow)</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          Current balance: ${parseFloat(wallets.find(w => w.type === 'USD')?.balance || '0').toLocaleString()}
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--muted)" />
                    </div>
                  </div>

                  <button className="vault-auth-link" style={{ width: '100%', marginTop: '24px', fontSize: '11px' }} onClick={() => setInvestStep('input')}>Back to Configuration</button>
                </div>
              )}

              {investStep === 'confirming' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }} className="reveal revealed">
                  <div className="vault-loader-container">
                    <div className="vault-institutional-loader" />
                  </div>
                  <h3 className="vault-db-title" style={{ marginTop: '32px' }}>Waiting for Signature</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '12px' }}>
                    Please confirm the transaction in your connected wallet to allocate <strong>${investAmount}</strong>.
                  </p>
                  <div style={{ marginTop: '24px', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    ESTIMATED: {(parseFloat(investAmount) / 3500).toFixed(6)} ETH
                  </div>
                </div>
              )}

              {(investStep === 'processing' || isConfirming) && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="vault-loader-container">
                    <div className="vault-institutional-loader" />
                  </div>
                  <h3 className="vault-db-title" style={{ marginTop: '32px' }}>
                    {isConfirming ? 'Confirming On-Chain' : 'Processing Transaction'}
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '12px' }}>
                    {isConfirming 
                      ? 'Waiting for network confirmation... This usually takes less than 30 seconds.' 
                      : 'Securing assets through institutional liquidity nodes...'}
                  </p>
                  {hash && (
                    <a 
                      href={`https://etherscan.io/tx/${hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="vault-auth-link"
                      style={{ display: 'block', marginTop: '20px', fontSize: '11px' }}
                    >
                      View on Etherscan
                    </a>
                  )}
                </div>
              )}

              {investStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }} className="reveal revealed">
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                    <ShieldCheck size={48} color="var(--success)" />
                  </div>
                  <h3 className="vault-db-title">Investment Successful</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '12px', marginBottom: '32px' }}>
                    Your capital has been successfully allocated to <strong>{selectedPkg?.name}</strong>. You can monitor performance in your history tab.
                  </p>
                  <button className="vault-btn vault-btn-secondary" style={{ width: '100%' }} onClick={closeInvest}>
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ═══════════ DEPOSIT FLOW MODAL ═══════════ */}
        {depositStep !== 'idle' && (
          <div className="vault-modal-overlay" data-open="true" onClick={(e) => e.target === e.currentTarget && closeDeposit()}>
            <div className="vault-auth-card" style={{ maxWidth: '500px' }}>
              <button className="vault-modal-close" onClick={closeDeposit}>&times;</button>

              {depositStep === 'method' && (
                <div className="reveal revealed">
                  <div className="vault-package-tag" style={{ marginBottom: '8px' }}>Imperial Funding</div>
                  <h3 className="vault-db-title" style={{ marginBottom: '8px' }}>Select Method</h3>
                  <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '32px' }}>
                    Choose your preferred channel for funding your escrow balance.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div 
                      className="vault-package-item" 
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}
                      onClick={() => { setDepositMethod('crypto'); setDepositStep('amount'); }}
                    >
                      <div style={{ background: 'rgba(243,186,47,0.1)', padding: '10px', borderRadius: '4px' }}>
                        <Coins size={20} color="#f3ba2f" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>Manual Crypto Transfer</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Transfer BTC/USDT directly to platform vaults.</div>
                      </div>
                      <ArrowRight size={14} color="var(--muted)" />
                    </div>
                  </div>
                </div>
              )}

              {depositStep === 'amount' && (
                <div className="reveal revealed">
                  <div className="vault-package-tag" style={{ marginBottom: '8px' }}>Funding Amount</div>
                  <h3 className="vault-db-title" style={{ marginBottom: '8px' }}>Deposit Amount</h3>
                  <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '32px' }}>
                    Enter the total USD value you wish to allocate to your escrow.
                  </div>

                  <div className="vault-input-group">
                    <label className="vault-balance-label">Amount (USD)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: '12px', color: 'var(--accent)' }}>$</span>
                      <input 
                        type="number" 
                        className="vault-input" 
                        style={{ paddingLeft: '20px' }}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button 
                    className="vault-btn vault-btn-primary" 
                    style={{ width: '100%', marginTop: '32px' }}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                    onClick={() => setDepositStep('instructions')}
                  >
                    Generate Instructions <ArrowRight size={14} style={{ marginLeft: '8px' }} />
                  </button>
                  <button className="vault-auth-link" style={{ width: '100%', marginTop: '16px', fontSize: '11px' }} onClick={() => setDepositStep('method')}>Back to Methods</button>
                </div>
              )}

              {depositStep === 'instructions' && (
                <div className="reveal revealed">
                  <div className="vault-package-tag" style={{ marginBottom: '8px' }}>Payment Details</div>
                  <h3 className="vault-db-title" style={{ marginBottom: '12px' }}>Follow Instructions</h3>
                  
                  <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '4px', border: '0.5px solid var(--border)', marginBottom: '24px' }}>
                    {depositMethod === 'wise' && (
                      <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                        <div style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>Wise Recipient</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span>Email:</span>
                          <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => copyToClipboard('treasury@goldtrust.vault')}>
                            treasury@goldtrust.vault <Copy size={10} style={{ marginLeft: '4px' }} />
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>Account Name:</span>
                          <span>GoldTrust Imperial Holdings</span>
                        </div>
                      </div>
                    )}

                    {depositMethod === 'bank' && (
                      <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                        <div style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>Bank Details (SWIFT)</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>Bank:</span>
                          <span>Standard Chartered Bank</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>Account:</span>
                          <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => copyToClipboard('9021-3942-8811')}>
                            9021-3942-8811 <Copy size={10} style={{ marginLeft: '4px' }} />
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>SWIFT Code:</span>
                          <span>SCBLGB2L</span>
                        </div>
                      </div>
                    )}

                    {depositMethod === 'crypto' && (
                      <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                        <div style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '12px' }}>
                          Select Cryptocurrency
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                          {(['btc', 'eth', 'sol', 'usdt'] as const).map((cryptoKey) => {
                            const isSelected = selectedCrypto === cryptoKey;
                            const labels = {
                              btc: 'BTC',
                              eth: 'ETH (ERC20)',
                              sol: 'SOL',
                              usdt: 'USDT (TRC20)'
                            };
                            return (
                              <button
                                key={cryptoKey}
                                type="button"
                                onClick={() => setSelectedCrypto(cryptoKey)}
                                style={{
                                  flex: '1 1 calc(50% - 8px)',
                                  background: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg)',
                                  color: isSelected ? 'var(--accent)' : 'var(--muted)',
                                  border: '1px solid',
                                  borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                                  padding: '10px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontFamily: 'var(--font-mono)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  textAlign: 'center',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}
                              >
                                {labels[cryptoKey]}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>
                          {currentAsset.label} Address ({currentAsset.network})
                        </div>
                        <div style={{ 
                          padding: '16px', 
                          background: 'var(--bg)', 
                          border: '1px dashed var(--border)', 
                          wordBreak: 'break-all', 
                          textAlign: 'center', 
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease',
                        }} onClick={() => copyToClipboard(currentAsset.address)}>
                          {currentAsset.address}
                          <div style={{ fontSize: '9px', marginTop: '8px', color: 'var(--muted)' }}>Click to copy address</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '32px', textAlign: 'center' }}>
                    Once payment is sent, please provide the reference or transaction hash to finalize your request.
                  </div>

                  <button 
                    className="vault-btn vault-btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => setDepositStep('proof')}
                  >
                    I Have Sent Funds <ArrowRight size={14} style={{ marginLeft: '8px' }} />
                  </button>
                  {isCopied && <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--success)', marginTop: '12px' }}>Details copied to clipboard</div>}
                </div>
              )}

              {depositStep === 'proof' && (
                <div className="reveal revealed">
                  <div className="vault-package-tag" style={{ marginBottom: '8px' }}>Final Step</div>
                  <h3 className="vault-db-title" style={{ marginBottom: '8px' }}>Payment Proof</h3>
                  <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '32px' }}>
                    Provide the reference number, hash, or transfer ID for manual verification.
                  </div>

                  <div className="vault-input-group">
                    <label className="vault-balance-label">Reference / Transaction ID</label>
                    <input 
                      type="text" 
                      className="vault-input" 
                      value={depositProof}
                      onChange={(e) => setDepositProof(e.target.value)}
                      placeholder="e.g. W923485723"
                      autoFocus
                    />
                  </div>

                  <button 
                    className="vault-btn vault-btn-primary" 
                    style={{ width: '100%', marginTop: '32px' }}
                    disabled={!depositProof}
                    onClick={handleDepositSubmit}
                  >
                    Submit Request <ShieldCheck size={14} style={{ marginLeft: '8px' }} />
                  </button>
                  <button className="vault-auth-link" style={{ width: '100%', marginTop: '16px', fontSize: '11px' }} onClick={() => setDepositStep('instructions')}>Back to Details</button>
                </div>
              )}

              {depositStep === 'processing' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="vault-loader-container">
                    <div className="vault-institutional-loader" />
                  </div>
                  <h3 className="vault-db-title" style={{ marginTop: '32px' }}>Initiating Deposit</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '12px' }}>
                    Generating institutional ledger entries...
                  </p>
                </div>
              )}

              {depositStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }} className="reveal revealed">
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                    <CheckCircle2 size={48} color="var(--accent)" />
                  </div>
                  <h3 className="vault-db-title">Request Submitted</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '12px', marginBottom: '32px' }}>
                    Your deposit of <strong>${depositAmount}</strong> via <strong>{depositMethod?.toUpperCase()}</strong> is pending verification. Most deposits are processed within 1-2 hours.
                  </p>
                  <button className="vault-btn vault-btn-secondary" style={{ width: '100%' }} onClick={closeDeposit}>
                    View History
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ MARKET CHART MODAL ═══════════ */}
        {chartModalOpen && chartInvestment && (
          <div className="vault-modal-overlay" data-open="true" onClick={(e) => e.target === e.currentTarget && setChartModalOpen(false)}>
            <div className="vault-auth-card" style={{ maxWidth: '820px', width: '94%', padding: '24px' }}>
              <button className="vault-modal-close" onClick={() => setChartModalOpen(false)}>&times;</button>
              
              <div className="reveal revealed">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div className="vault-package-tag" style={{ marginBottom: '8px' }}>{chartInvestment.package_type.toUpperCase()} MARKET</div>
                    <h3 className="vault-db-title">{chartInvestment.package_name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      Active Allocation: ${parseFloat(chartInvestment.amount).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', color: parseFloat(priceChange) >= 0 ? '#26a69a' : '#ef5350' }}>
                      ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: parseFloat(priceChange) >= 0 ? '#26a69a' : '#ef5350', marginTop: '2px' }}>
                      {parseFloat(priceChange) >= 0 ? '+' : ''}{priceChange}%
                    </div>
                  </div>
                </div>

                {/* TIMEFRAME SELECTOR */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {(['1H', '1D', '1W', '1M'] as const).map(tf => (
                    <button 
                      key={tf}
                      onClick={() => setChartTimeframe(tf)}
                      style={{ 
                        background: chartTimeframe === tf ? 'rgba(255,255,255,0.08)' : 'transparent', 
                        color: chartTimeframe === tf ? '#fff' : 'var(--muted)',
                        border: '1px solid',
                        borderColor: chartTimeframe === tf ? 'rgba(255,255,255,0.15)' : 'transparent',
                        padding: '5px 14px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.04em',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* PREMIUM CANDLESTICK CHART */}
                <TradingChart
                  data={chartData}
                  currentPrice={currentPrice}
                  priceChange={priceChange}
                  timeframe={chartTimeframe}
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ PENDING DEPOSIT FAB ═══════════ */}
        {depositStep === 'idle' && depositMethod && depositAmount && (
          <div className="vault-fab" onClick={() => setDepositStep(localStorage.getItem('pendingDepositStep') as any || 'instructions')}>
            <div className="vault-fab-icon">
              <Banknote size={16} />
            </div>
            <div className="vault-fab-text">
              Continue Deposit (${depositAmount})
            </div>
            <X 
              size={14} 
              style={{ marginLeft: '8px', cursor: 'pointer', opacity: 0.6 }} 
              onClick={(e) => {
                e.stopPropagation();
                cancelDeposit();
              }}
            />
          </div>
        )}

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
                  <div className="vault-chat-msg-content">{msg.text}</div>
                  <div className="vault-chat-msg-time">{msg.time}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <form className="vault-chat-input-area" onSubmit={handleSendChatMessage}>
              <input 
                type="text" 
                className="vault-chat-input" 
                placeholder="Inquire about holdings..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="vault-chat-send">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>

        {!chatOpen && (
          <button className="vault-chat-trigger" onClick={() => setChatOpen(true)}>
            <Gem size={24} />
            <div className="vault-chat-badge" />
          </button>
        )}
      </main>

      <DashboardTour 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </div>
  );
}
