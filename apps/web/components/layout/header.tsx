'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import { SearchModal } from '@/components/ui/search-modal'

interface Notification {
  id: string
  title: string
  desc: string
  time: string
  type: 'critical' | 'warning' | 'info'
  read?: boolean
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Critical Risk Flagged', desc: 'Txn #98402 from NG (Amount: $3,100.00) triggered Isolation Forest anomaly threshold', time: '4m ago', type: 'critical' },
  { id: '2', title: 'Model SLA Status', desc: 'Active ensemble-v2.1.4 PR-AUC maintained at 0.947 across 10,000 predictions', time: '1h ago', type: 'info' },
  { id: '3', title: 'Analyst Case Override', desc: 'Analyst (analyst@fraudshield.ai) marked Txn #98394 as False Positive', time: '3h ago', type: 'warning' },
  { id: '4', title: 'Batch CSV Processed', desc: 'Ingested 500 records from batch_march_v2.csv with zero schema errors', time: '5h ago', type: 'info' },
]

export function Header() {
  const { user } = useAuth()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => !n.read).length

  // Global ⌘K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleLogout() {
    try { await api.auth.logout() } catch {}
    router.push('/login')
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <>
      <header className="h-12 bg-[#080808] border-b border-[#1c1c1c] flex items-center justify-between px-5 sticky top-0 z-30">
        {/* Left: Environment & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0f0f0f] border border-[#222] px-2.5 py-1 rounded text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] dot-live" />
            <span className="text-[#f5a623] font-semibold">PRODUCTION</span>
            <span className="text-[#333]">|</span>
            <span className="text-[#555]">v2.1.4</span>
          </div>
          <span className="text-[#333] text-[11px] select-none">/</span>
          <span className="text-[#555] text-[11px] font-medium">Enterprise SOC Operations</span>
        </div>

        {/* Center: Quick Search Trigger */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 bg-[#0e0e0e] border border-[#1f1f1f] text-[#555] px-3 py-1.5 rounded text-[11px] w-72 hover:border-[#333] hover:text-[#888] transition-colors text-left"
        >
          <svg className="w-3 h-3 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 truncate">Search transactions, merchants…</span>
          <kbd className="bg-[#111] border border-[#2a2a2a] text-[#444] px-1.5 py-0.5 rounded text-[9px] font-mono">⌘K</kbd>
        </button>

        {/* Right: Health, Notifications & Profile */}
        <div className="flex items-center gap-2">

          {/* System Health Status Widget */}
          <button
            onClick={() => setShowHealthModal(v => !v)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#333] text-[11px] font-mono text-[#555] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[#888]">SOC Health</span>
            <span className="text-[#555]">14ms</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-[#555] hover:text-[#ccc] rounded transition-colors relative"
              title="Notifications"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#f5a623] rounded-full" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0e0e0e] border border-[#222] rounded shadow-2xl z-50 overflow-hidden fade-in">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1c1c1c]">
                  <span className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-widest">Audit Alerts</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] font-mono text-[#f5a623] hover:text-[#fbbf24]">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#1a1a1a]">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 text-xs transition-colors ${n.read ? 'opacity-50' : 'hover:bg-[#111]'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-mono text-[10px] font-bold ${
                          n.type === 'critical' ? 'text-[#ef4444]' :
                          n.type === 'warning'  ? 'text-[#f5a623]' :
                          'text-[#60a5fa]'
                        }`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#444]">{n.time}</span>
                      </div>
                      <p className="text-[#666] text-[10px] leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-[#1a1a1a] text-center">
                  <span className="text-[9px] font-mono text-[#333]">Live SOC Feed Connected</span>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-[#222]" />

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-[#111] transition-colors"
            >
              <div className="w-6 h-6 rounded bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center justify-center text-[10px] font-mono text-[#f5a623] font-bold">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[11px] font-medium text-[#ccc] leading-none">{user?.full_name || 'Fraud Analyst'}</div>
                <div className="text-[9px] font-mono text-[#444] leading-none mt-0.5 uppercase">{user?.role || 'ANALYST'}</div>
              </div>
              <svg className="w-3 h-3 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0e0e0e] border border-[#222] rounded shadow-2xl z-50 p-1 fade-in">
                <div className="px-3 py-2 border-b border-[#1a1a1a] text-[10px] text-[#444] font-mono mb-1">
                  Signed in as <strong className="text-[#888] block truncate mt-0.5">{user?.email || 'analyst@fraudshield.ai'}</strong>
                </div>
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-3 py-2 text-[11px] text-[#888] hover:bg-[#141414] hover:text-[#ccc] rounded transition-colors font-mono"
                >
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-[11px] text-[#ef4444] hover:bg-[#141414] rounded transition-colors font-mono"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global ⌘K Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* System Health Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowHealthModal(false)}>
          <div className="bg-[#0e0e0e] border border-[#222] rounded p-5 w-full max-w-md shadow-2xl fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-[#1c1c1c] mb-4">
              <h3 className="text-[11px] font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                SOC System Health Diagnostics
              </h3>
              <button onClick={() => setShowHealthModal(false)} className="text-[#444] hover:text-[#ccc] text-sm">✕</button>
            </div>
            <div className="space-y-2 font-mono text-[11px]">
              {[
                { name: 'FastAPI Prediction Engine', status: 'HEALTHY', latency: '14ms', dot: '#22c55e' },
                { name: 'PostgreSQL Database Cluster', status: 'HEALTHY', latency: '3ms', dot: '#22c55e' },
                { name: 'Ensemble Model Memory (SHAP)', status: 'LOADED', latency: '240MB', dot: '#f5a623' },
                { name: 'Async Batch Processing Worker', status: 'IDLE', latency: '0 in queue', dot: '#555' },
                { name: 'Audit Log Chain Integrity', status: 'VERIFIED', latency: '0 errors', dot: '#22c55e' },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between p-2.5 bg-[#0a0a0a] border border-[#1c1c1c] rounded">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                    <span className="text-[#888]">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#22c55e] font-bold block text-[10px]">{s.status}</span>
                    <span className="text-[9px] text-[#444]">{s.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
