import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  tab: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface DashboardTourProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'body',
    title: 'Welcome to GoldTrust Imperial',
    content: 'Welcome, Investor. Let’s take a brief tour of your premium asset management console. This will help you get acquainted with our institutional-grade features.',
    tab: 'overview',
    position: 'center'
  },
  {
    target: '#tour-sidebar',
    title: 'Asset Navigation Console',
    content: 'Use this sidebar to toggle between different modules: Overview, Invest, Portfolio, Wallets, History, and our new Affiliate Portal.',
    tab: 'overview',
    position: 'right'
  },
  {
    target: '#tour-balance-card',
    title: 'Imperial Assets & Balances',
    content: 'Monitor your total portfolio valuation, accumulated yields, and active capital. Balance displays are synchronized with real-time gold-backing values.',
    tab: 'overview',
    position: 'bottom'
  },
  {
    target: '#tour-chart-section',
    title: 'Market Intelligence Engine',
    content: 'Track historical growth, spot prices, and real-time yield performance with our custom interactive intelligence charts.',
    tab: 'overview',
    position: 'top'
  },
  {
    target: '#tour-wallet-btn',
    title: 'Web3 Gateway Connect',
    content: 'Establish secure cryptographic link with your Web3 decentralized wallet (e.g. MetaMask, WalletConnect) to authorize deposit or withdrawals.',
    tab: 'overview',
    position: 'bottom'
  },
  {
    target: '#tour-packages-grid',
    title: 'Strategic Yield Packages',
    content: 'Review and invest in premium strategic packages. Each package specifies minimum capital, duration, and fixed annual percentage yields.',
    tab: 'invest',
    position: 'top'
  },
  {
    target: '#tour-portfolio-assets',
    title: 'Active Contracts Vault',
    content: 'Review terms, maturities, and real-time yields accumulated on all active investment packages currently under custody.',
    tab: 'portfolio',
    position: 'top'
  },
  {
    target: '#tour-wallets-grid',
    title: 'DeFi & Deposit Vaults',
    content: 'Access address details for multi-asset deposits (USDT, BTC, ETH) and view wallet balances linked to your identity.',
    tab: 'wallets',
    position: 'top'
  },
  {
    target: '#tour-history-table',
    title: 'Transaction Audit Trail',
    content: 'Examine complete cryptographically verified receipts of all deposits, packages funded, yields credited, and withdrawals.',
    tab: 'history',
    position: 'top'
  },
  {
    target: '#tour-affiliate-section',
    title: 'Affiliate & Partner Network',
    content: 'Share your custom referral code with external investors. You will earn a recurring 5% commission on any packages they fund.',
    tab: 'affiliate',
    position: 'top'
  },
  {
    target: '#tour-settings-grid',
    title: 'Security & Access Keys',
    content: 'Manage cryptographic keys, API access, two-factor credentials, and review individual member tier benefits.',
    tab: 'settings',
    position: 'top'
  }
];

export default function DashboardTour({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab,
  setIsSidebarOpen 
}: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ display: 'none' });
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialOffset = useRef({ x: 0, y: 0 });

  // Reset drag offset when step changes
  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
  }, [currentStep]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    
    // Ignore drags started on buttons, icons, or links
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('svg') || target.closest('a')) {
      return;
    }
    
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialOffset.current = { ...dragOffset };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setDragOffset({
      x: initialOffset.current.x + dx,
      y: initialOffset.current.y + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const activeStepData = TOUR_STEPS[currentStep];

  // Handle Tab changes automatically before showing step highlight
  useEffect(() => {
    if (!isOpen) return;

    if (activeStepData.tab && activeStepData.tab !== activeTab) {
      setActiveTab(activeStepData.tab);
    }
  }, [currentStep, isOpen]);

  // Handle mobile sidebar visibility automatically based on current step
  useEffect(() => {
    if (!isOpen || !setIsSidebarOpen) return;

    // Step 1 targets `#tour-sidebar`, so open it. For any other step, close it.
    if (currentStep === 1) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [currentStep, isOpen, setIsSidebarOpen]);

  // Recalculate dimensions when step, activeTab or viewport size changes
  useEffect(() => {
    if (!isOpen) {
      setHighlightStyle({ display: 'none' });
      setTooltipStyle({ display: 'none' });
      return;
    }

    const { target } = activeStepData;
    const targetElement = target === 'body' ? null : document.querySelector(target);

    // Smooth scroll target element into viewport center on step change if it's offscreen
    if (targetElement) {
      const r = targetElement.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isInViewport = 
        r.top >= 0 &&
        r.left >= 0 &&
        r.bottom <= vh &&
        r.right <= vw;

      if (!isInViewport) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    const updatePosition = () => {
      // Small timeout to allow smooth scrolling and mobile sidebar sliding to fully settle
      setTimeout(() => {
        const { target, position } = activeStepData;
        const targetElement = target === 'body' ? null : document.querySelector(target);

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isMobile = vw < 768;

        const tooltipWidth = isMobile ? Math.min(vw - 32, 340) : 340;
        // Premium default estimated height
        const tooltipHeight = tooltipRef.current?.offsetHeight || 190;

        if (!targetElement || target === 'body') {
          // Center Position for modal when no target or target is body
          setHighlightStyle({ display: 'none' });
          setTooltipStyle({
            position: 'fixed',
            top: `${(vh - tooltipHeight) / 2}px`,
            left: `${(vw - tooltipWidth) / 2}px`,
            zIndex: 10002,
            width: `${tooltipWidth}px`
          });
          return;
        }

        const rect = targetElement.getBoundingClientRect();
        
        // Highlight Box styling (glowing animated breathing box overlaying the target)
        setHighlightStyle({
          display: 'block',
          position: 'fixed',
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          zIndex: 10001,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
          border: '1.5px solid rgba(212, 175, 55, 0.6)',
          borderRadius: '6px',
          pointerEvents: 'none',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: 'vaultPulse 2s infinite ease-in-out'
        });

        // Tooltip placement logic relative to highlighted bounds
        const padding = 16;
        let top = 0;
        let left = 0;

        if (isMobile) {
          // Horizontal centering on mobile layout
          left = (vw - tooltipWidth) / 2;
          
          // Smart collision avoidance: place tooltip in opposite half from target center
          const targetCenterY = rect.top + rect.height / 2;
          if (targetCenterY < vh / 2) {
            top = vh - tooltipHeight - 24; // Target in upper half -> tooltip in bottom
          } else {
            top = 24; // Target in lower half -> tooltip in top
          }
        } else {
          // Premium Desktop Layout Placement
          const isHugeTarget = rect.height > vh * 0.6;

          if (isHugeTarget) {
            left = (vw - tooltipWidth) / 2;
            top = vh - tooltipHeight - 32;
          } else {
            if (position === 'bottom') {
              top = rect.bottom + padding;
              left = rect.left + rect.width / 2 - tooltipWidth / 2;
            } else if (position === 'top') {
              top = rect.top - tooltipHeight - padding;
              left = rect.left + rect.width / 2 - tooltipWidth / 2;
            } else if (position === 'right') {
              top = rect.top + rect.height / 2 - tooltipHeight / 2;
              left = rect.right + padding;
            } else if (position === 'left') {
              top = rect.top + rect.height / 2 - tooltipHeight / 2;
              left = rect.left - tooltipWidth - padding;
            }
          }
        }

        // Viewport boundaries enforcement: keep it inside the screen margins (16px)
        left = Math.max(16, Math.min(left, vw - tooltipWidth - 16));
        top = Math.max(16, Math.min(top, vh - tooltipHeight - 16));

        // Apply dynamic placement
        setTooltipStyle({
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          zIndex: 10002,
          width: `${tooltipWidth}px`
        });
      }, 300);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, activeTab, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('vault_tour_completed', 'true');
    setCurrentStep(0);
    onClose();
  };

  return (
    <>
      <style>{`
        @keyframes vaultPulse {
          0% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 12px 1px rgba(212, 175, 55, 0.3);
            border-color: rgba(212, 175, 55, 0.5);
          }
          50% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 22px 4px rgba(212, 175, 55, 0.7);
            border-color: rgba(212, 175, 55, 0.9);
          }
          100% {
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 12px 1px rgba(212, 175, 55, 0.3);
            border-color: rgba(212, 175, 55, 0.5);
          }
        }
        @keyframes vaultTooltipEntrance {
          from {
            opacity: 0;
            transform: translate3d(0, 15px, 0) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        .vault-tour-tooltip-animate {
          animation: vaultTooltipEntrance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Dim overlay cutout backdrop */}
      <div style={highlightStyle} />

      {/* When no highlight box is rendered, render standard dark backdrop */}
      {activeStepData.target === 'body' && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 10000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={handleComplete}
        />
      )}

      {/* Interactive Tooltip Card */}
      <div 
        key={currentStep}
        ref={tooltipRef}
        className="vault-card vault-tour-tooltip vault-tour-tooltip-animate"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          ...tooltipStyle,
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
          background: 'rgba(14, 15, 17, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 0 15px rgba(212,175,55,0.05)',
          borderRadius: '8px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span 
            className="vault-balance-label" 
            style={{ 
              color: 'var(--accent)', 
              fontSize: '9px',
              borderBottom: '1px solid rgba(212,175,55,0.2)',
              paddingBottom: '2px',
              letterSpacing: '0.1em'
            }}
          >
            SYSTEM GUIDE — STEP {currentStep + 1} OF {TOUR_STEPS.length}
          </span>
          <X 
            size={16} 
            className="vault-muted" 
            style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
            onClick={handleComplete}
          />
        </div>

        {/* Elegant Gold Progress Bar */}
        <div style={{
          height: '2px',
          width: '100%',
          background: 'rgba(212, 175, 55, 0.1)',
          borderRadius: '1px',
          marginBottom: '16px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--accent), #f3e5ab)',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>

        <h3 
          style={{ 
            fontSize: '16px', 
            fontFamily: 'var(--font-display)', 
            marginBottom: '8px',
            color: '#fff' 
          }}
        >
          {activeStepData.title}
        </h3>

        <p 
          style={{ 
            fontSize: '12px', 
            lineHeight: '1.6', 
            color: 'var(--muted)',
            marginBottom: '24px' 
          }}
        >
          {activeStepData.content}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="vault-auth-link" 
            style={{ fontSize: '11px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={handleComplete}
          >
            Skip Tour
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button 
                className="vault-btn vault-btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={handlePrev}
              >
                <ArrowLeft size={12} /> Back
              </button>
            )}
            <button 
              className="vault-btn vault-btn-primary" 
              style={{ padding: '6px 16px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={handleNext}
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
