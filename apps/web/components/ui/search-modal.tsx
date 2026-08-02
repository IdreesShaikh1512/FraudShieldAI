'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

interface SearchResult {
  id: string
  type: 'transaction' | 'merchant' | 'country' | 'case'
  title: string
  subtitle?: string
  meta?: string
  risk?: 'low' | 'medium' | 'high' | 'critical'
}

const MOCK_RESULTS: SearchResult[] = [
  { id: 'TXN-78234', type: 'transaction', title: 'TXN-78234', subtitle: 'Amazon.co.uk — £247.00', meta: '2 min ago', risk: 'high' },
  { id: 'TXN-78211', type: 'transaction', title: 'TXN-78211', subtitle: 'Shell — €43.20', meta: '14 min ago', risk: 'low' },
  { id: 'TXN-78199', type: 'transaction', title: 'TXN-78199', subtitle: 'Binance — $2,890.00', meta: '31 min ago', risk: 'critical' },
  { id: 'TXN-78140', type: 'transaction', title: 'TXN-78140', subtitle: 'Ryanair — €189.00', meta: '1 hr ago', risk: 'medium' },
  { id: 'CASE-4421', type: 'case', title: 'CASE-4421', subtitle: 'Escalated — Crypto transaction cluster', meta: 'Open', risk: 'critical' },
  { id: 'CASE-4389', type: 'case', title: 'CASE-4389', subtitle: 'Review — ATM withdrawal pattern', meta: 'In Progress', risk: 'high' },
  { id: 'CASE-4201', type: 'case', title: 'CASE-4201', subtitle: 'Resolved — False positive confirmed', meta: 'Closed', risk: 'low' },
  { id: 'MC-KFC', type: 'merchant', title: 'KFC International', subtitle: 'Fast Food & QSR', meta: 'MCC 5812' },
  { id: 'MC-BINANCE', type: 'merchant', title: 'Binance', subtitle: 'Cryptocurrency Exchange', meta: 'MCC 6051', risk: 'high' },
  { id: 'MC-AMAZON', type: 'merchant', title: 'Amazon', subtitle: 'Online Retail / eCommerce', meta: 'MCC 5999' },
  { id: 'MC-SHELL', type: 'merchant', title: 'Shell', subtitle: 'Gas Stations & Fuel', meta: 'MCC 5541' },
  { id: 'CO-NG', type: 'country', title: 'Nigeria', subtitle: 'High-risk jurisdiction', meta: 'NG • 🇳🇬', risk: 'high' },
  { id: 'CO-RU', type: 'country', title: 'Russia', subtitle: 'Sanctioned jurisdiction', meta: 'RU • 🇷🇺', risk: 'critical' },
  { id: 'CO-US', type: 'country', title: 'United States', subtitle: 'Low-risk jurisdiction', meta: 'US • 🇺🇸', risk: 'low' },
]

const TYPE_ICON: Record<string, string> = {
  transaction: '⧉',
  case: '📁',
  merchant: '🏪',
  country: '🌐'
}

const RISK_STYLE: Record<string, string> = {
  low:      'text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20',
  medium:   'text-[#f5a623] bg-[#f5a623]/10 border border-[#f5a623]/20',
  high:     'text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/20',
  critical: 'text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20',
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = query.length < 1
    ? MOCK_RESULTS.slice(0, 8)
    : MOCK_RESULTS.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        (r.subtitle || '').toLowerCase().includes(query.toLowerCase())
      )

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); setActiveIndex(0) }
  }, [open])

  useEffect(() => { setActiveIndex(0) }, [query])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape')    { e.preventDefault(); onClose() }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter')     { e.preventDefault(); onClose() }
  }, [open, results.length, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80" />
      <div
        className="relative w-full max-w-xl bg-[#0e0e0e] border border-[#222] rounded shadow-2xl overflow-hidden fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a]">
          <svg className="w-3.5 h-3.5 text-[#444] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search transactions, cases, merchants, countries…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[12px] font-mono text-[#f0f0f0] placeholder-[#333] focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#444] hover:text-[#888]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <kbd className="hidden sm:flex items-center px-1.5 py-0.5 text-[9px] font-mono text-[#333] bg-[#111] border border-[#1f1f1f] rounded">ESC</kbd>
        </div>

        {/* Category label */}
        {!query && (
          <div className="px-4 py-2 text-[9px] font-mono text-[#333] uppercase tracking-widest border-b border-[#141414]">
            Recent & Suggested
          </div>
        )}

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-[11px] text-[#444] font-mono">No results for &ldquo;{query}&rdquo;</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === activeIndex ? 'bg-[#f5a623]/8 border-l-2 border-[#f5a623] pl-[14px]' : 'hover:bg-[#141414] border-l-2 border-transparent'
                }`}
              >
                <span className="text-[#333] text-[11px] font-mono w-4 shrink-0">{TYPE_ICON[r.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] font-mono ${i === activeIndex ? 'text-[#f5a623]' : 'text-[#ccc]'}`}>{r.title}</div>
                  {r.subtitle && <div className="text-[10px] text-[#444] truncate">{r.subtitle}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.meta && <span className="text-[9px] font-mono text-[#333]">{r.meta}</span>}
                  {r.risk && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${RISK_STYLE[r.risk]}`}>
                      {r.risk}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#141414] flex items-center gap-4 text-[9px] font-mono text-[#333]">
          <span><kbd className="px-1 bg-[#111] border border-[#1f1f1f] rounded">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 bg-[#111] border border-[#1f1f1f] rounded">↵</kbd> open</span>
          <span><kbd className="px-1 bg-[#111] border border-[#1f1f1f] rounded">Esc</kbd> close</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span>Live Index</span>
          </div>
        </div>
      </div>
    </div>
  )
}
