'use client'
import { useState } from 'react'
import { ALL_COUNTRIES } from '@/components/ui/country-select'
import { MERCHANT_CATEGORIES } from '@/components/ui/merchant-category-select'

export interface Transaction {
  id: string
  amount: number
  currency: string
  country: string
  merchantCategory: string
  merchantName: string
  cardNetwork: string
  cardType: string
  channel: string
  riskScore: number
  fraudProbability: number
  verdict: 'approve' | 'review' | 'challenge' | 'block'
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'false_positive'
  timestamp: string
  analyst?: string
  notes?: string
  caseId?: string
  shap?: { feature: string; value: number; contribution: number }[]
}

interface InvestigationDrawerProps {
  transaction: Transaction | null
  onClose: () => void
  onStatusChange?: (id: string, status: Transaction['status']) => void
  onVerdictChange?: (id: string, verdict: Transaction['verdict']) => void
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-950/50 text-amber-400 border-amber-800' },
  escalated: { label: 'Escalated', cls: 'bg-rose-950/50 text-rose-400 border-rose-800' },
  resolved: { label: 'Resolved', cls: 'bg-emerald-950/50 text-emerald-400 border-emerald-800' },
  false_positive: { label: 'False Positive', cls: 'bg-[#181818] text-[#888] border-[#222]' },
}

const VERDICT_STYLE: Record<string, string> = {
  approve: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  review: 'bg-amber-600 hover:bg-amber-500 text-white',
  challenge: 'bg-orange-600 hover:bg-orange-500 text-white',
  block: 'bg-rose-600 hover:bg-rose-500 text-white',
}

const RISK_COLOR = (score: number) => {
  if (score >= 80) return 'text-red-400'
  if (score >= 60) return 'text-rose-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-emerald-400'
}

const BAR_COLOR = (score: number) => {
  if (score >= 80) return 'bg-red-500'
  if (score >= 60) return 'bg-rose-500'
  if (score >= 40) return 'bg-amber-400'
  return 'bg-emerald-500'
}

export function InvestigationDrawer({ transaction: tx, onClose, onStatusChange, onVerdictChange }: InvestigationDrawerProps) {
  const [notes, setNotes] = useState(tx?.notes || '')
  const [activeTab, setActiveTab] = useState<'overview' | 'shap' | 'audit'>('overview')

  if (!tx) return null

  const country = ALL_COUNTRIES.find(c => c.code === tx.country)
  const category = MERCHANT_CATEGORIES.find(m => m.code === tx.merchantCategory)
  const status = STATUS_BADGE[tx.status] || STATUS_BADGE.open

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/50" />
      {/* Drawer */}
      <div
        className="w-[480px] bg-[#0e0e0e] border-l border-[#1f1f1f] flex flex-col h-full overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#1f1f1f]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-white">{tx.id}</span>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase ${status.cls}`}>{status.label}</span>
            </div>
            {tx.caseId && <div className="text-[11px] font-mono text-[#555]">Case: {tx.caseId}</div>}
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#bbb] transition-colors p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Risk Score Banner */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-[#1f1f1f] bg-[#080808]">
          <div>
            <div className="text-[10px] font-mono text-[#555] mb-0.5">RISK SCORE</div>
            <div className={`text-2xl font-mono font-bold ${RISK_COLOR(tx.riskScore)}`}>{tx.riskScore}</div>
          </div>
          <div className="flex-1">
            <div className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${BAR_COLOR(tx.riskScore)}`} style={{ width: `${tx.riskScore}%` }} />
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#555] mb-0.5">FRAUD PROB</div>
            <div className={`text-lg font-mono font-semibold ${RISK_COLOR(tx.fraudProbability)}`}>{tx.fraudProbability.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#555] mb-0.5">ACTION</div>
            <div className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold ${VERDICT_STYLE[tx.verdict]}`}>{tx.verdict}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1f1f1f]">
          {(['overview', 'shap', 'audit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-[#f5a623] border-b-2 border-[#f5a623]' : 'text-[#555] hover:text-[#bbb]'}`}
            >
              {tab === 'shap' ? 'Explainability' : tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {activeTab === 'overview' && (
            <>
              {/* Transaction Details */}
              <section>
                <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">Transaction Details</div>
                <div className="bg-[#080808] border border-[#1f1f1f] rounded-lg overflow-hidden">
                  {[
                    ['Amount', `${tx.currency} ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
                    ['Timestamp', new Date(tx.timestamp).toLocaleString()],
                    ['Channel', tx.channel],
                    ['Card Network', tx.cardNetwork],
                    ['Card Type', tx.cardType],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] last:border-0">
                      <span className="text-xs text-[#555]">{label}</span>
                      <span className="text-xs font-mono text-[#ccc]">{val}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Merchant & Location */}
              <section>
                <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">Merchant & Location</div>
                <div className="bg-[#080808] border border-[#1f1f1f] rounded-lg overflow-hidden">
                  {[
                    ['Merchant', tx.merchantName],
                    ['Category', category ? `${category.icon} ${category.label}` : tx.merchantCategory],
                    ['Country', country ? `${country.flag} ${country.name} (${country.code})` : tx.country],
                    ['Country Risk', country?.riskLevel ? country.riskLevel.toUpperCase() : 'NORMAL'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] last:border-0">
                      <span className="text-xs text-[#555]">{label}</span>
                      <span className="text-xs font-mono text-[#ccc]">{val}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Analyst Controls */}
              <section>
                <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">Case Status</div>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {(Object.keys(STATUS_BADGE) as Array<Transaction['status']>).map(s => (
                    <button
                      key={s}
                      onClick={() => onStatusChange?.(tx.id, s)}
                      className={`py-1.5 rounded text-[10px] font-mono uppercase tracking-wide border transition-colors ${tx.status === s ? STATUS_BADGE[s].cls : 'border-[#1f1f1f] text-[#555] hover:border-slate-600 hover:text-[#bbb]'}`}
                    >
                      {STATUS_BADGE[s].label}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">Analyst Verdict</div>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {(['approve', 'review', 'challenge', 'block'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => onVerdictChange?.(tx.id, v)}
                      className={`py-1.5 rounded text-[10px] font-mono uppercase tracking-wide border transition-all ${tx.verdict === v ? VERDICT_STYLE[v] + ' ring-1 ring-white/20' : 'border-[#1f1f1f] text-[#555] hover:border-slate-500 hover:text-[#bbb]'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-1.5">Analyst Notes</div>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add investigation notes…"
                  className="w-full px-3 py-2 bg-[#080808] border border-[#1f1f1f] rounded text-xs text-[#ccc] placeholder-slate-600 focus:outline-none focus:border-[#f5a623] resize-none"
                />
              </section>
            </>
          )}

          {activeTab === 'shap' && (
            <section>
              <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">SHAP Feature Contributions</div>
              <div className="space-y-2">
                {(tx.shap || generateMockSHAP(tx)).map(item => (
                  <div key={item.feature} className="bg-[#080808] border border-[#1f1f1f] rounded-lg px-3 py-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-[#bbb]">{item.feature}</span>
                      <span className={`text-xs font-mono ${item.contribution > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.contribution > 0 ? '+' : ''}{item.contribution.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#555]">value={item.value.toFixed(3)}</span>
                      <div className="flex-1 relative h-1 bg-[#1f1f1f] rounded-full overflow-hidden">
                        {item.contribution > 0 ? (
                          <div
                            className="absolute right-1/2 top-0 h-full bg-rose-500 rounded-l"
                            style={{ width: `${Math.min(Math.abs(item.contribution) * 200, 50)}%` }}
                          />
                        ) : (
                          <div
                            className="absolute left-1/2 top-0 h-full bg-emerald-500 rounded-r"
                            style={{ width: `${Math.min(Math.abs(item.contribution) * 200, 50)}%` }}
                          />
                        )}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600" />
                      </div>
                      <span className="text-[10px] font-mono text-[#555]">{(Math.abs(item.contribution) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-[#080808] border border-[#1f1f1f] rounded-lg text-[10px] font-mono text-[#555]">
                <span className="text-rose-400">Red</span> = pushes toward fraud · <span className="text-emerald-400">Green</span> = pushes toward legitimate
              </div>
            </section>
          )}

          {activeTab === 'audit' && (
            <section>
              <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">Audit Trail</div>
              <div className="space-y-2">
                {generateAuditTrail(tx).map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] mt-1.5 shrink-0" />
                      {i < 4 && <div className="w-px flex-1 bg-[#1f1f1f] mt-1" />}
                    </div>
                    <div className="pb-3">
                      <div className="text-xs text-[#bbb]">{event.action}</div>
                      <div className="text-[10px] font-mono text-[#555] mt-0.5">{event.actor} · {event.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1f1f1f] bg-[#080808] flex justify-between items-center">
          <span className="text-[10px] font-mono text-[#444]">FraudShield · Ensemble v2.1.4</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-mono text-[#888] border border-[#1f1f1f] rounded hover:border-slate-600 hover:text-[#ccc] transition-colors">
              Export JSON
            </button>
            <button className="px-3 py-1.5 text-xs font-mono text-white bg-[#f5a623] rounded hover:bg-[#fbbf24] transition-colors">
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function generateMockSHAP(tx: Transaction) {
  return [
    { feature: 'V14', value: -3.421, contribution: 0.312 },
    { feature: 'V4', value: 2.184, contribution: 0.187 },
    { feature: 'Amount', value: tx.amount, contribution: tx.amount > 1000 ? 0.143 : -0.089 },
    { feature: 'V17', value: -1.23, contribution: 0.097 },
    { feature: 'V12', value: 0.89, contribution: -0.054 },
    { feature: 'V10', value: -0.45, contribution: 0.032 },
    { feature: 'Time', value: 43200, contribution: -0.021 },
    { feature: 'V3', value: 1.12, contribution: -0.011 },
  ]
}

function generateAuditTrail(tx: Transaction) {
  return [
    { action: 'Transaction ingested by detection engine', actor: 'FraudShield Engine', time: new Date(tx.timestamp).toLocaleTimeString() },
    { action: 'Dual-model ensemble scoring completed', actor: 'ML Pipeline v2.1', time: new Date(new Date(tx.timestamp).getTime() + 120).toLocaleTimeString() },
    { action: `Risk score ${tx.riskScore} — verdict: ${tx.verdict.toUpperCase()}`, actor: 'Rule Engine', time: new Date(new Date(tx.timestamp).getTime() + 350).toLocaleTimeString() },
    { action: 'Case created and assigned to queue', actor: 'Case Manager', time: new Date(new Date(tx.timestamp).getTime() + 500).toLocaleTimeString() },
    { action: 'Analyst opened investigation', actor: tx.analyst || 'analyst@fraudshield.io', time: 'Just now' },
  ]
}
