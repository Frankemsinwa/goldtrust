import { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, TrendingUp, MessageSquare, Wallet,
  Shield, Settings, LogOut, Menu, Send, Eye, Ban, CheckCircle2, Coins
} from 'lucide-react';
import './Admin.css';

/* ───────── MOCK DATA ───────── */



const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'transactions', label: 'Transactions', icon: Wallet },
  { id: 'tasks', label: 'Tasks', icon: Coins },
  { id: 'chat', label: 'Live Chat', icon: MessageSquare },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
];

import api from '../api';

const minRoiSuggestion = (minInvestment: any) => {
  const min = parseFloat(minInvestment) || 0;
  if (min < 1000) return 3;
  if (min < 5000) return 6;
  if (min < 10000) return 9;
  if (min < 50000) return 12;
  return 14;
};

/* ───────── COMPONENT ───────── */

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Real Data State
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Task management state
  const [adminTasks, setAdminTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', how_to: '', link: '', reward: '0.5' });
  const [viewingSubmissionProof, setViewingSubmissionProof] = useState<string | null>(null);
  const [rejectingSubmission, setRejectingSubmission] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const activeChat = chats.find(c => c.user_id === selectedChat);

  const fetchChatHistory = useCallback(async (userId: number) => {
    try {
      const res = await api.get(`/admin/chats/${userId}`);
      setChatHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchChatHistory(selectedChat);
      const interval = setInterval(() => fetchChatHistory(selectedChat), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat, fetchChatHistory]);

  const fetchAdminData = useCallback(async () => {
    try {
      const [statsRes, usersRes, invRes, txRes, chatsRes, pkgsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/investments'),
        api.get('/admin/transactions'),
        api.get('/admin/chats'),
        api.get('/admin/packages')
      ]);

      // Parse metadata for transactions if it's a string
      const parseMeta = (data: any[]) => data.map(item => ({
        ...item,
        metadata: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata
      }));

      const processedStats = {
        ...statsRes.data,
        recentActivity: parseMeta(statsRes.data.recentActivity || [])
      };

      setStats(processedStats);
      setUsers(usersRes.data);
      setInvestments(invRes.data);
      setTransactions(parseMeta(txRes.data));
      setChats(chatsRes.data);
      setPackages(pkgsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTaskData = useCallback(async () => {
    try {
      const [tasksRes, subsRes] = await Promise.all([
        api.get('/admin/tasks'),
        api.get('/admin/task-submissions')
      ]);
      setAdminTasks(tasksRes.data);
      setSubmissions(subsRes.data);
    } catch (err) {
      console.error('Failed to fetch task data', err);
    }
  }, []);

  const handleCreateTask = async () => {
    try {
      await api.post('/admin/tasks', taskForm);
      setTaskForm({ title: '', description: '', how_to: '', link: '', reward: '0.5' });
      fetchTaskData();
      alert('Task created');
    } catch (err) {
      console.error('Failed to create task', err);
      alert('Failed to create task');
    }
  };

  const handleToggleTask = async (id: number, status: string) => {
    try {
      await api.put(`/admin/tasks/${id}/status`, { status });
      fetchTaskData();
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const handleReviewSubmission = async (id: number, action: string) => {
    if (action === 'reject') {
      setRejectingSubmission(id);
      setRejectReason('');
      return;
    }
    try {
      await api.put(`/admin/task-submissions/${id}`, { action });
      fetchTaskData();
    } catch (err) {
      console.error('Failed to review submission', err);
      alert('Failed to review submission');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingSubmission) return;
    try {
      await api.put(`/admin/task-submissions/${rejectingSubmission}`, { action: 'reject', reason: rejectReason });
      fetchTaskData();
      setRejectingSubmission(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject submission', err);
      alert('Failed to reject submission');
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchTaskData();
  }, [fetchAdminData, fetchTaskData]);

  const handleNav = (id: string) => { setTab(id); setSidebarOpen(false); };

  const handleManageInvestment = async (id: number, status: string) => {
    try {
      await api.put(`/admin/investments/${id}`, { status });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to manage investment', err);
    }
  };

  const handleApproveTransaction = async (id: number, status: string) => {
    try {
      await api.put(`/admin/transactions/${id}`, { status });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to approve transaction', err);
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;
    try {
      await api.put(`/admin/packages/${editingPackage.id}`, editingPackage);
      setEditingPackage(null);
      fetchAdminData();
      alert('Package updated successfully');
    } catch (err) {
      console.error('Failed to update package', err);
      alert('Failed to update package');
    }
  };

  const sendReply = async (userId: number) => {
    if (!replyText.trim()) return;
    try {
      await api.post(`/admin/chats/${userId}/reply`, { message: replyText });
      setReplyText('');
      fetchChatHistory(userId);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to send reply', err);
    }
  };

  const handleToggleBlock = async (userId: number, isBlocked: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/block`, { isBlocked });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to toggle user block status', err);
    }
  };

  const tabTitle: Record<string, string> = {
    overview: 'Command Center', users: 'Registered Users', investments: 'Investment Ledger',
    transactions: 'Platform Transactions', tasks: 'Earn Tasks', chat: 'Live Support', security: 'Security & Compliance', settings: 'Platform Settings'
  };

  return (
    <div className="admin-dashboard">
      <aside className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-logo">
          <span>GOLDTRUST</span>
          <span className="admin-badge">ADMIN</span>
        </div>
        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map(n => (
            <div key={n.id} className={`admin-sidebar-link ${tab === n.id ? 'active' : ''}`} onClick={() => handleNav(n.id)}>
              <n.icon size={18} /> {n.label}
              {n.id === 'chat' && chats.some(c => c.unread) && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', marginLeft: 'auto' }} />}
            </div>
          ))}
          <div style={{ marginTop: 'auto' }}>
            <div className="admin-sidebar-link" onClick={() => window.location.href = '/'}>
              <LogOut size={18} /> Exit Admin
            </div>
          </div>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Menu size={20} className="admin-mobile-toggle" onClick={() => setSidebarOpen(true)} />
            <h2 className="admin-header-title">{tabTitle[tab]}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </header>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="vault-loader-container">
              <div className="vault-institutional-loader" />
            </div>
          </div>
        ) : (
          <div className="admin-body">
          {/* ═══ OVERVIEW ═══ */}
          {tab === 'overview' && (<>
            <div className="admin-stats-row">
              {[
                { label: 'Total AUM', value: `$${parseFloat(stats?.stats?.totalAUM || '0').toLocaleString()}`, change: 'Real-time', dir: 'up' },
                { label: 'Registered Users', value: stats?.stats?.totalUsers || '0', change: 'Live count', dir: 'up' },
                { label: 'Active Investments', value: stats?.stats?.activeInvestments || '0', change: 'Total active', dir: 'up' },
                { label: 'Pending Requests', value: stats?.stats?.pendingWithdrawals || '0', change: 'Awaiting action', dir: 'down' },
              ].map(s => (
                <div className="admin-stat-card" key={s.label}>
                  <div className="admin-stat-label">{s.label}</div>
                  <div className="admin-stat-value">{s.value}</div>
                  <div className={`admin-stat-change ${s.dir}`}>{s.change}</div>
                </div>
              ))}
            </div>

            <div className="admin-panels">
              <div className="admin-panel">
                <div className="admin-panel-header"><span className="admin-panel-title">Recent Activity</span></div>
                <div className="admin-panel-body">
                  {(stats?.recentActivity || []).map((a: any, i: number) => (
                    <div key={i} style={{ padding: '12px 24px', borderBottom: '0.5px solid oklch(20% 0.01 250)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13 }}>{a.full_name} performed {a.type.toLowerCase()} of ${parseFloat(a.amount).toLocaleString()}</span>
                        {a.metadata?.proofImageUrl && (
                          <button 
                            className="admin-action-btn" 
                            style={{ padding: '2px 8px', fontSize: 10 }}
                            onClick={() => setViewingProof(a.metadata.proofImageUrl.startsWith('http') ? a.metadata.proofImageUrl : `${api.defaults.baseURL?.replace('/api', '') || ''}${a.metadata.proofImageUrl}`)}
                          >
                            View Proof
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: 16 }}>{new Date(a.created_at).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header"><span className="admin-panel-title">Top Investors</span></div>
                <div className="admin-panel-body">
                  {users.slice(0, 5).map(u => (
                    <div key={u.id} style={{ padding: '12px 24px', borderBottom: '0.5px solid oklch(20% 0.01 250)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{u.full_name}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>{u.tier} Member</div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>)}

          {/* ═══ USERS ═══ */}
          {tab === 'users' && (
            <div className="admin-panel admin-panel-full">
              <div className="admin-panel-header">
                <span className="admin-panel-title">{users.length} Registered Users</span>
              </div>
              <div className="admin-panel-body">
                <table className="admin-table">
                  <thead><tr><th>User</th><th>Tier</th><th>Joined</th><th>KYC</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{u.full_name}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{u.email}</div>
                        </td>
                        <td><span style={{ color: u.tier === 'Elite' ? 'var(--accent)' : 'var(--fg)' }}>{u.tier}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td><span className={`admin-status ${u.kyc_status}`}>{u.kyc_status}</span></td>
                        <td>
                          <span className={`admin-status ${u.is_blocked ? 'rejected' : 'active'}`}>
                            {u.is_blocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="admin-action-btn" style={{ marginRight: 12 }}><Eye size={14} /></button>
                          {u.is_blocked ? (
                            <button 
                              className="admin-action-btn" 
                              style={{ background: 'var(--success)', color: 'white' }}
                              onClick={() => handleToggleBlock(u.id, false)}
                              title="Unblock User"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          ) : (
                            <button 
                              className="admin-action-btn danger" 
                              onClick={() => handleToggleBlock(u.id, true)}
                              title="Block User"
                            >
                              <Ban size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ INVESTMENTS ═══ */}
          {tab === 'investments' && (
            <div className="admin-panel admin-panel-full">
              <div className="admin-panel-header">
                <span className="admin-panel-title">{investments.length} Total Investments</span>
              </div>
              <div className="admin-panel-body">
                <table className="admin-table">
                  <thead><tr><th>User</th><th>Package</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                  <tbody>
                    {investments.map(inv => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 500 }}>{inv.full_name}</td>
                        <td>{inv.package_name}</td>
                        <td><span style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{inv.package_type}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>${parseFloat(inv.amount).toLocaleString()}</td>
                        <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                        <td><span className={`admin-status ${inv.status}`}>{inv.status}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          {inv.status === 'pending' && (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button className="admin-action-btn" onClick={() => handleManageInvestment(inv.id, 'active')}><CheckCircle2 size={14} /> Approve</button>
                              <button className="admin-action-btn danger" onClick={() => handleManageInvestment(inv.id, 'rejected')}><Ban size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ TRANSACTIONS ═══ */}
          {tab === 'transactions' && (
            <div className="admin-panel admin-panel-full">
              <div className="admin-panel-header">
                <span className="admin-panel-title">Transaction Requests</span>
              </div>
              <div className="admin-panel-body">
                <table className="admin-table">
                  <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Details</th><th>Date</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id}>
                        <td style={{ fontWeight: 500 }}>{tx.full_name}</td>
                        <td><span style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase' }}>{tx.type}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>${parseFloat(tx.amount).toLocaleString()}</td>
                        <td style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {tx.metadata?.method && <div>Method: <span style={{ color: 'var(--fg)', textTransform: 'uppercase' }}>{tx.metadata.method}</span></div>}
                          {tx.metadata?.proof && <div style={{ wordBreak: 'break-all', marginTop: 2 }}>Proof: {tx.metadata.proof}</div>}
                          {tx.metadata?.proofImageUrl && (
                            <div 
                              style={{ 
                                marginTop: 8, 
                                cursor: 'pointer', 
                                border: '1px solid var(--border)', 
                                borderRadius: 4, 
                                overflow: 'hidden', 
                                width: 80, 
                                height: 50,
                                background: 'var(--bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onClick={() => setViewingProof(tx.metadata.proofImageUrl.startsWith('http') ? tx.metadata.proofImageUrl : `${api.defaults.baseURL?.replace('/api', '') || ''}${tx.metadata.proofImageUrl}`)}
                              title="Click to expand"
                            >
                              <img 
                                src={tx.metadata.proofImageUrl.startsWith('http') ? tx.metadata.proofImageUrl : `${api.defaults.baseURL?.replace('/api', '') || ''}${tx.metadata.proofImageUrl}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                alt="Proof" 
                              />
                            </div>
                          )}
                          {tx.type === 'WITHDRAWAL' && tx.metadata && (
                            <div style={{ marginTop: '4px' }}>
                              <div style={{ color: 'var(--accent)' }}>{tx.metadata.blockchain} ({tx.metadata.network})</div>
                              <div style={{ wordBreak: 'break-all', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{tx.metadata.destinationAddress}</div>
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td><span className={`admin-status ${tx.status}`}>{tx.status}</span></td>
                        <td style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          {tx.metadata?.proofImageUrl && (
                            <button
                              className="admin-action-btn"
                              onClick={() => setViewingProof(tx.metadata.proofImageUrl.startsWith('http') ? tx.metadata.proofImageUrl : `${api.defaults.baseURL?.replace('/api', '') || ''}${tx.metadata.proofImageUrl}`)}
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          {tx.status === 'pending' && (<>
                            <button className="admin-action-btn" onClick={() => handleApproveTransaction(tx.id, 'completed')}><CheckCircle2 size={14} /></button>
                            <button className="admin-action-btn danger" onClick={() => handleApproveTransaction(tx.id, 'rejected')}><Ban size={14} /></button>
                          </>)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ LIVE CHAT ═══ */}
          {tab === 'chat' && (
            <div className="admin-panels" style={{ height: 'calc(100vh - 180px)' }}>
              <div className="admin-panel" style={{ maxHeight: 'none' }}>
                <div className="admin-panel-header"><span className="admin-panel-title">Conversations</span></div>
                <div className="admin-panel-body">
                  <div className="admin-chat-list">
                    {chats.map(c => (
                      <div key={c.id} className={`admin-chat-item ${selectedChat === c.user_id ? 'selected' : ''}`} onClick={() => setSelectedChat(c.user_id)}>
                        <div className="admin-chat-avatar">{c.full_name[0]}</div>
                        <div className="admin-chat-preview">
                          <div className="admin-chat-preview-name">{c.full_name}</div>
                          <div className="admin-chat-preview-msg">{c.message}</div>
                        </div>
                        {c.sender_type === 'user' && <div className="admin-chat-unread" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="admin-panel" style={{ maxHeight: 'none' }}>
                {activeChat ? (
                  <div className="admin-chat-window">
                    <div className="admin-panel-header">
                      <span className="admin-panel-title">{activeChat.full_name}</span>
                    </div>
                    <div className="admin-chat-messages">
                      {chatHistory.map(msg => (
                        <div key={msg.id} className={`admin-chat-msg ${msg.sender_type === 'user' ? 'from-user' : 'from-admin'}`}>
                          {msg.message}
                          <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <form className="admin-chat-reply" onSubmit={(e) => { e.preventDefault(); sendReply(activeChat.user_id); }}>
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type a reply..." />
                      <button type="submit" className="vault-btn vault-btn-primary"><Send size={14} /></button>
                    </form>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>
                    Select a conversation
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ SECURITY ═══ */}
          {tab === 'security' && (
            <div className="admin-panels">
              {[
                { title: 'Platform Security', items: [
                  { label: 'SSL Certificate', value: 'Active — Expires 2027-03-15', color: 'var(--success)' },
                  { label: 'DDoS Protection', value: 'Cloudflare Enterprise', color: 'var(--success)' },
                  { label: 'Last Penetration Test', value: '2026-04-20 — 0 Critical', color: 'var(--success)' },
                ]},
                { title: 'Compliance', items: [
                  { label: 'KYC Verified Users', value: '6 / 7', color: 'var(--accent)' },
                  { label: 'AML Flags', value: '0 Active', color: 'var(--success)' },
                  { label: 'Regulatory Filing', value: 'Q2 2026 — Due June 30', color: 'oklch(80% 0.15 80)' },
                ]},
              ].map(panel => (
                <div className="admin-panel" key={panel.title}>
                  <div className="admin-panel-header"><span className="admin-panel-title">{panel.title}</span></div>
                  <div className="admin-panel-body" style={{ padding: '8px 0' }}>
                    {panel.items.map(item => (
                      <div key={item.label} style={{ padding: '16px 24px', borderBottom: '0.5px solid oklch(20% 0.01 250)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13 }}>{item.label}</span>
                        <span style={{ fontSize: 12, color: item.color, fontFamily: 'var(--font-mono)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ TASKS ═══ */}
          {tab === 'tasks' && (
            <div className="admin-panels">
              <div className="admin-panel">
                <div className="admin-panel-header"><span className="admin-panel-title">Create Task</span></div>
                <div className="admin-panel-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="vault-input-group">
                    <label className="vault-label">Task Title</label>
                    <input
                      type="text"
                      className="vault-input"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="e.g. Follow us on X"
                    />
                  </div>
                  <div className="vault-input-group">
                    <label className="vault-label">How to Complete (instructions for investor)</label>
                    <textarea
                      className="vault-input"
                      rows={3}
                      value={taskForm.how_to}
                      onChange={(e) => setTaskForm({ ...taskForm, how_to: e.target.value })}
                      placeholder="Describe step-by-step how the investor completes this task and what proof is expected."
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div className="vault-input-group">
                    <label className="vault-label">Task Link</label>
                    <input
                      type="text"
                      className="vault-input"
                      value={taskForm.link}
                      onChange={(e) => setTaskForm({ ...taskForm, link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="vault-input-group">
                    <label className="vault-label">Reward per Completion ($)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="vault-input"
                      value={taskForm.reward}
                      onChange={(e) => setTaskForm({ ...taskForm, reward: e.target.value })}
                    />
                  </div>
                  <button className="vault-btn vault-btn-primary" onClick={handleCreateTask} disabled={!taskForm.title}>Create Task</button>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header"><span className="admin-panel-title">Active Tasks</span></div>
                <div className="admin-panel-body" style={{ padding: '8px 0' }}>
                  {adminTasks.length === 0 && (
                    <div style={{ padding: '24px', color: 'var(--muted)', fontSize: '12px', textAlign: 'center' }}>No tasks yet.</div>
                  )}
                  {adminTasks.map(t => (
                    <div key={t.id} style={{ padding: '12px 24px', borderBottom: '0.5px solid oklch(20% 0.01 250)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>${parseFloat(t.reward).toFixed(2)} reward • {t.status}</div>
                      </div>
                      <button
                        className="admin-action-btn"
                        onClick={() => handleToggleTask(t.id, t.status === 'active' ? 'inactive' : 'active')}
                      >
                        {t.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
                <div className="admin-panel-header"><span className="admin-panel-title">Task Submissions</span></div>
                <div className="admin-panel-body" style={{ padding: '8px 0' }}>
                  {submissions.length === 0 && (
                    <div style={{ padding: '24px', color: 'var(--muted)', fontSize: '12px', textAlign: 'center' }}>No submissions yet.</div>
                  )}
                  {submissions.map(s => (
                    <div key={s.id} style={{ padding: '16px 24px', borderBottom: '0.5px solid oklch(20% 0.01 250)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{s.task_title}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.full_name} • {s.email}</div>
                        <span style={{
                          fontSize: '10px',
                          background: s.status === 'pending' ? 'rgba(255,165,0,0.1)' : s.status === 'approved' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                          color: s.status === 'pending' ? 'orange' : s.status === 'approved' ? 'var(--success)' : 'var(--danger)',
                          padding: '2px 8px', marginTop: '6px', display: 'inline-block', textTransform: 'uppercase'
                        }}>
                          {s.status}
                        </span>
                        {s.rejected_reason && (
                          <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>Reason: {s.rejected_reason}</div>
                        )}
                      </div>
                      {s.proof_url && (
                        <button className="admin-action-btn" onClick={() => setViewingSubmissionProof(s.proof_url)}>View Proof</button>
                      )}
                      {s.status === 'pending' && (
                        <>
                          <button className="admin-action-btn" style={{ background: 'var(--success)', color: '#000' }} onClick={() => handleReviewSubmission(s.id, 'approve')}>
                            <CheckCircle2 size={14} style={{ marginRight: 6 }} /> Approve
                          </button>
                          <button className="admin-action-btn" style={{ background: 'var(--danger)', color: '#fff' }} onClick={() => handleReviewSubmission(s.id, 'reject')}>
                            <Ban size={14} style={{ marginRight: 6 }} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {tab === 'settings' && (
            <div className="admin-panels">
              <div className="admin-panel">
                <div className="admin-panel-header"><span className="admin-panel-title">Platform Configuration</span></div>
                <div className="admin-panel-body" style={{ padding: '24px' }}>
                  {[
                    { label: 'Platform Name', value: 'GOLDTRUST IMPERIAL HOLDINGS' },
                    { label: 'Support Email', value: 'support@goldtrust.io' },
                    { label: 'Min Investment', value: '$50' },
                    { label: 'Max Withdrawal/Day', value: '$100,000' },
                  ].map(s => (
                    <div key={s.label} style={{ marginBottom: 20 }}>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>{s.label}</label>
                      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8, fontSize: 14 }}>{s.value}</div>
                    </div>
                  ))}
                  <button className="vault-btn vault-btn-secondary" style={{ width: '100%', marginTop: 12 }}>Save Changes</button>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header"><span className="admin-panel-title">Investment Packages</span></div>
                <div className="admin-panel-body" style={{ padding: '8px 0' }}>
                  {packages.map(p => (
                    <div key={p.id} style={{ padding: '12px 24px', borderBottom: '0.5px solid oklch(20% 0.01 250)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>${parseFloat(p.min_investment).toLocaleString()} – ${parseFloat(p.max_investment || p.min_investment).toLocaleString()} Range • {p.yield} Total ROI</span>
                      </div>
                      <button className="admin-action-btn" onClick={() => setEditingPackage(p)}>Edit</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </main>

      {editingPackage && (
        <div className="vault-modal-overlay">
          <div className="vault-modal">
            <div className="vault-modal-header">
              <h3 className="vault-modal-title">Edit Package</h3>
            </div>
            <div className="vault-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="vault-input-group">
                <label className="vault-label">Package Name</label>
                <input 
                  type="text" 
                  className="vault-input" 
                  value={editingPackage.name} 
                  onChange={(e) => setEditingPackage({...editingPackage, name: e.target.value})}
                />
              </div>
              <div className="vault-input-group">
                <label className="vault-label">Type (crypto, stocks, gold)</label>
                <input 
                  type="text" 
                  className="vault-input" 
                  value={editingPackage.type} 
                  onChange={(e) => setEditingPackage({...editingPackage, type: e.target.value})}
                />
              </div>
              <div className="vault-input-group">
                <label className="vault-label">Min Investment ($)</label>
                <input 
                  type="number" 
                  className="vault-input" 
                  value={editingPackage.min_investment} 
                  onChange={(e) => setEditingPackage({...editingPackage, min_investment: e.target.value})}
                />
              </div>
              <div className="vault-input-group">
                <label className="vault-label">Max Investment ($)</label>
                <input 
                  type="number" 
                  className="vault-input" 
                  value={editingPackage.max_investment || ''} 
                  onChange={(e) => setEditingPackage({...editingPackage, max_investment: e.target.value})}
                  placeholder="e.g. 1000"
                />
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: 8 }}>
                  Must be greater than or equal to the minimum.
                </div>
              </div>
              <div className="vault-input-group">
                <label className="vault-label">Total ROI (%)</label>
                <input 
                  type="number" 
                  className="vault-input" 
                  value={editingPackage.yield?.replace(/[^0-9.\-]/g, '') || ''} 
                  onChange={(e) => setEditingPackage({...editingPackage, yield: `${e.target.value}%`})}
                />
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: 8 }}>
                  Total ROI at the 12-month lock-up, prorated for shorter terms. Suggested for this price tier: {minRoiSuggestion(editingPackage.min_investment)}% — override anytime.
                </div>
              </div>
            </div>
            <div className="vault-modal-footer">
              <button className="vault-btn vault-btn-secondary" onClick={() => setEditingPackage(null)}>Cancel</button>
              <button className="vault-btn vault-btn-primary" onClick={handleUpdatePackage}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {viewingProof && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setViewingProof(null)}
        >
          <div
            className="admin-modal"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              position: 'relative',
              padding: '10px',
              backgroundColor: 'var(--surface)',
              borderRadius: '8px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                right: -15,
                top: -15,
                background: 'var(--accent)',
                border: 'none',
                color: '#000',
                width: 30,
                height: 30,
                borderRadius: '50%',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
              onClick={() => setViewingProof(null)}
            >
              &times;
            </button>
            <img
              src={viewingProof}
              alt="Proof"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}

      {viewingSubmissionProof && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
          }}
          onClick={() => setViewingSubmissionProof(null)}
        >
          <div
            className="admin-modal"
            style={{
              maxWidth: '90%', maxHeight: '90%', position: 'relative', padding: '10px',
              backgroundColor: 'var(--surface)', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute', right: -15, top: -15, background: 'var(--accent)', border: 'none', color: '#000',
                width: 30, height: 30, borderRadius: '50%', fontSize: 20, cursor: 'pointer', fontWeight: 'bold'
              }}
              onClick={() => setViewingSubmissionProof(null)}
            >
              &times;
            </button>
            <img
              src={viewingSubmissionProof}
              alt="Task Proof"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}

      {rejectingSubmission && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
          }}
          onClick={() => setRejectingSubmission(null)}
        >
          <div
            className="admin-modal"
            style={{
              width: '100%', maxWidth: 420, position: 'relative', padding: '24px',
              backgroundColor: 'var(--surface)', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="vault-modal-title" style={{ marginBottom: '16px' }}>Reject Submission</h3>
            <div className="vault-input-group">
              <label className="vault-label">Reason (shown to investor)</label>
              <textarea
                className="vault-input"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Proof does not match the task requirements."
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <div className="vault-modal-footer" style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="vault-btn vault-btn-secondary" onClick={() => setRejectingSubmission(null)}>Cancel</button>
              <button className="vault-btn vault-btn-primary" onClick={handleConfirmReject}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
