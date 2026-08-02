'use client'
import { useState, useEffect, useRef } from 'react'
import { InvestigationDrawer, Transaction } from '@/components/ui/investigation-drawer'
import { ALL_COUNTRIES } from '@/components/ui/country-select'

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-98402',
    amount: 3100.00,
    currency: 'USD',
    country: 'NG',
    merchantCategory: 'crypto_exchange',
    merchantName: 'Fast Transfer Ltd',
    cardNetwork: 'Visa',
    cardType: 'Credit',
    channel: 'Online / Web',
    riskScore: 92,
    fraudProbability: 92.4,
    verdict: 'block',
    status: 'escalated',
    timestamp: new Date().toISOString(),
    caseId: 'CASE-4421',
    analyst: 'analyst@fraudshield.ai',
    notes: 'Pattern matches known card-not-present velocity attack from high-risk jurisdiction.',
  },
  {
    id: 'TXN-98401',
    amount: 2340.50,
    currency: 'EUR',
    country: 'RU',
    merchantCategory: 'atm',
    merchantName: 'Global Cash Terminal',
    cardNetwork: 'Mastercard',
    cardType: 'Debit',
    channel: 'ATM',
    riskScore: 88,
    fraudProbability: 88.1,
    verdict: 'block',
    status: 'open',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    caseId: 'CASE-4420',
  },
  {
    id: 'TXN-98400',
    amount: 1250.00,
    currency: 'USD',
    country: 'CN',
    merchantCategory: 'online_retail',
    merchantName: 'Global Express Market',
    cardNetwork: 'UnionPay',
    cardType: 'Credit',
    channel: 'Online / Web',
    riskScore: 74,
    fraudProbability: 73.8,
    verdict: 'challenge',
    status: 'in_progress',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    caseId: 'CASE-4419',
    analyst: 'analyst@fraudshield.ai',
  },
  {
    id: 'TXN-98399',
    amount: 89.99,
    currency: 'GBP',
    country: 'GB',
    merchantCategory: 'grocery',
    merchantName: 'Tesco Supermarket',
    cardNetwork: 'Visa',
    cardType: 'Debit',
    channel: 'POS Terminal',
    riskScore: 4,
    fraudProbability: 3.8,
    verdict: 'approve',
    status: 'resolved',
    timestamp: new Date(Date.now() - 450000).toISOString(),
  },
  {
    id: 'TXN-98398',
    amount: 670.00,
    currency: 'EUR',
    country: 'FR',
    merchantCategory: 'airline',
    merchantName: 'Ryanair Flight Booking',
    cardNetwork: 'Mastercard',
    cardType: 'Credit',
    channel: 'Online / Web',
    riskScore: 48,
    fraudProbability: 48.2,
    verdict: 'review',
    status: 'in_progress',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'TXN-98397',
    amount: 45.20,
    currency: 'EUR',
    country: 'DE',
    merchantCategory: 'grocery',
    merchantName: 'Aldi Süd',
    cardNetwork: 'Visa',
    cardType: 'Debit',
    channel: 'Contactless (NFC)',
    riskScore: 2,
    fraudProbability: 1.9,
    verdict: 'approve',
    status: 'resolved',
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'TXN-98396',
    amount: 12.50,
    currency: 'EUR',
    country: 'NL',
    merchantCategory: 'gas_station',
    merchantName: 'Shell Station Rotterdam',
    cardNetwork: 'Mastercard',
    cardType: 'Debit',
    channel: 'Chip & PIN',
    riskScore: 6,
    fraudProbability: 5.7,
    verdict: 'approve',
    status: 'resolved',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'TXN-98395',
    amount: 550.00,
    currency: 'USD',
    country: 'CN',
    merchantCategory: 'gambling',
    merchantName: 'BetWorld International',
    cardNetwork: 'Visa',
    cardType: 'Prepaid',
    channel: 'Online / Web',
    riskScore: 82,
    fraudProbability: 81.5,
    verdict: 'block',
    status: 'open',
    timestamp: new Date(Date.now() - 1500000).toISOString(),
    caseId: 'CASE-4415',
  },
]

const SAMPLE_MERCHANTS = [
  { name: 'Amazon.com', cat: 'online_retail', c: 'US' },
  { name: 'Binance Crypto', cat: 'crypto_exchange', c: 'NG' },
  { name: 'Euronet ATM', cat: 'atm', c: 'RU' },
  { name: 'Starbucks Coffee', cat: 'cafe', c: 'US' },
  { name: 'Apple Store Online', cat: 'electronics', c: 'CA' },
  { name: 'Lufthansa Airlines', cat: 'airline', c: 'DE' },
  { name: 'Uber Ride', cat: 'ride_sharing', c: 'GB' },
  { name: 'Bet365 Sports', cat: 'gambling', c: 'CN' },
]

const SAMPLE_NETWORKS = ['Visa', 'Mastercard', 'American Express', 'UnionPay']
const SAMPLE_CHANNELS = ['Online / Web', 'POS Terminal', 'ATM', 'Mobile App', 'Contactless (NFC)']

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-950/50 text-amber-400 border-amber-800' },
  escalated: { label: 'Escalated', cls: 'bg-rose-950/50 text-rose-400 border-rose-800' },
  resolved: { label: 'Resolved', cls: 'bg-emerald-950/50 text-emerald-400 border-emerald-800' },
  false_positive: { label: 'False Positive', cls: 'bg-[#181818] text-[#888] border-[#222]' },
}

const VERDICT_BADGE: Record<string, string> = {
  approve: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60',
  review: 'bg-amber-950/40 text-amber-400 border-amber-800/60',
  challenge: 'bg-orange-950/40 text-orange-400 border-orange-800/60',
  block: 'bg-rose-950/40 text-rose-400 border-rose-800/60',
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verdictFilter, setVerdictFilter] = useState('all')
  const [activeTxn, setActiveTxn] = useState<Transaction | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [newestId, setNewestId] = useState<string | null>(null)
  const nextSeq = useRef(98403)

  // Live real-time transaction streaming effect
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      const isFraud = Math.random() < 0.25 // 25% chance of high risk in live stream
      const m = SAMPLE_MERCHANTS[Math.floor(Math.random() * SAMPLE_MERCHANTS.length)]
      const amount = isFraud ? parseFloat((800 + Math.random() * 3000).toFixed(2)) : parseFloat((10 + Math.random() * 250).toFixed(2))
      const riskScore = isFraud ? Math.floor(75 + Math.random() * 23) : Math.floor(1 + Math.random() * 30)
      const id = `TXN-${nextSeq.current++}`

      let verdict: Transaction['verdict'] = 'approve'
      if (riskScore >= 80) verdict = 'block'
      else if (riskScore >= 60) verdict = 'challenge'
      else if (riskScore >= 40) verdict = 'review'

      const newTx: Transaction = {
        id,
        amount,
        currency: m.c === 'US' ? 'USD' : m.c === 'GB' ? 'GBP' : 'EUR',
        country: m.c,
        merchantCategory: m.cat,
        merchantName: m.name,
        cardNetwork: SAMPLE_NETWORKS[Math.floor(Math.random() * SAMPLE_NETWORKS.length)],
        cardType: isFraud ? 'Prepaid' : 'Credit',
        channel: SAMPLE_CHANNELS[Math.floor(Math.random() * SAMPLE_CHANNELS.length)],
        riskScore,
        fraudProbability: parseFloat((riskScore * 0.98).toFixed(1)),
        verdict,
        status: isFraud ? 'open' : 'resolved',
        timestamp: new Date().toISOString(),
        caseId: isFraud ? `CASE-${Math.floor(4422 + Math.random() * 100)}` : undefined,
      }

      setTransactions(prev => [newTx, ...prev.slice(0, 49)]) // Keep top 50 in memory
      setNewestId(id)

      setTimeout(() => setNewestId(null), 1500)
    }, 3500)

    return () => clearInterval(interval)
  }, [isLive])

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase()
    const matchSearch =
      t.id.toLowerCase().includes(q) ||
      t.merchantName.toLowerCase().includes(q) ||
      t.country.toLowerCase().includes(q) ||
      (t.caseId || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchVerdict = verdictFilter === 'all' || t.verdict === verdictFilter
    return matchSearch && matchStatus && matchVerdict
  })

  function handleStatusChange(id: string, status: Transaction['status']) {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    if (activeTxn?.id === id) setActiveTxn(prev => prev ? { ...prev, status } : null)
  }

  function handleVerdictChange(id: string, verdict: Transaction['verdict']) {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, verdict } : t))
    if (activeTxn?.id === id) setActiveTxn(prev => prev ? { ...prev, verdict } : null)
  }

  function exportCSV() {
    const header = "ID,Amount,Currency,Merchant,Country,CardNetwork,RiskScore,Verdict,Status,Timestamp\n"
    const body = filtered
      .map(t => `${t.id},${t.amount},${t.currency},"${t.merchantName}",${t.country},${t.cardNetwork},${t.riskScore},${t.verdict},${t.status},${t.timestamp}`)
      .join("\n")
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fraudshield_investigations_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-[#1f1f1f] flex flex-wrap gap-4 justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Live Transaction Stream</h1>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
                isLive ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400' : 'bg-[#111111] border-[#222] text-[#888]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span>{isLive ? 'LIVE FEED ACTIVE (3s)' : 'FEED PAUSED'}</span>
            </button>
          </div>
          <p className="text-xs text-[#888] mt-1">Real-time payment gateway ingest · Click any row to inspect case drawer</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#555]">
            Stream count: <strong className="text-white">{transactions.length}</strong> txns
          </span>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-[#0e0e0e] hover:bg-[#181818] text-[#bbb] border border-[#1f1f1f] text-xs font-mono rounded transition-colors flex items-center gap-1.5"
          >
            <span>↓</span> Export Stream CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 items-center bg-[#0f0f0f] border border-[#1f1f1f] p-3 rounded-lg">
        <input
          type="text"
          placeholder="Search by Txn ID, case ID, merchant, country…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#f5a623] min-w-72"
        />

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#555] uppercase">Case Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-xs text-[#bbb] font-mono focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#555] uppercase">Verdict:</span>
          <select
            value={verdictFilter}
            onChange={e => setVerdictFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-xs text-[#bbb] font-mono focus:outline-none"
          >
            <option value="all">All Verdicts</option>
            <option value="approve">Approve</option>
            <option value="review">Review</option>
            <option value="challenge">Challenge</option>
            <option value="block">Block</option>
          </select>
        </div>

        {(search || statusFilter !== 'all' || verdictFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setVerdictFilter('all') }}
            className="text-xs text-[#f5a623] hover:text-[#fbbf24] font-mono ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#080808] text-[#555] border-b border-[#1f1f1f] text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Txn ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Merchant</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3 text-center">Risk Score</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3">Case Status</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]/60 text-[#bbb]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-[#555]">
                    No transactions match current filters
                  </td>
                </tr>
              ) : (
                filtered.map(t => {
                  const country = ALL_COUNTRIES.find(c => c.code === t.country)
                  const status = STATUS_BADGE[t.status] || STATUS_BADGE.open
                  const isNew = t.id === newestId

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setActiveTxn(t)}
                      className={`hover:bg-[#151c2e] cursor-pointer transition-all duration-500 ${
                        isNew ? 'bg-[#f5a623]/8 ring-1 ring-[#f5a623]/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-white flex items-center gap-2">
                        {isNew && <span className="w-2 h-2 rounded-full bg-[#f5a623] animate-ping" />}
                        <span>{t.id}</span>
                        {t.caseId && <span className="block text-[10px] font-normal text-[#555]">{t.caseId}</span>}
                      </td>
                      <td className="px-4 py-3 text-white font-semibold">
                        {t.currency} {t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[#ccc] truncate max-w-44">{t.merchantName}</div>
                        <div className="text-[10px] text-[#555]">{t.channel}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="mr-1">{country?.flag || '🌐'}</span>
                        <span className="text-[#bbb]">{country?.name || t.country}</span>
                      </td>
                      <td className="px-4 py-3 text-[#888]">{t.cardNetwork} ({t.cardType})</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold ${t.riskScore >= 80 ? 'bg-red-950/60 text-red-400' : t.riskScore >= 50 ? 'bg-amber-950/60 text-amber-400' : 'bg-emerald-950/60 text-emerald-400'}`}>
                          {t.riskScore}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${VERDICT_BADGE[t.verdict]}`}>
                          {t.verdict}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] uppercase ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#555]">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[#f5a623] hover:text-[#fbbf24] text-xs">Drawer →</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Drawer */}
      <InvestigationDrawer
        transaction={activeTxn}
        onClose={() => setActiveTxn(null)}
        onStatusChange={handleStatusChange}
        onVerdictChange={handleVerdictChange}
      />
    </div>
  )
}
