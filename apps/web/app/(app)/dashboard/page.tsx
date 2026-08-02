'use client'
import useSWR from 'swr'
import { api } from '@/lib/api-client'
import type { KPIData } from '@/types/api'

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100
    const y = 28 - ((val - min) / (max - min || 1)) * 22
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <svg className="w-20 h-7 overflow-visible" viewBox="0 0 100 30">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

function RiskBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
    high:     'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20',
    medium:   'bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/20',
    low:      'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
  }
  return (
    <span className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase rounded border font-bold ${styles[tier] ?? styles.low}`}>
      {tier}
    </span>
  )
}

const MOCK_RECENT = [
  { id: 'TXN-98402', amount: 3100.00, risk_tier: 'critical', is_fraud_predicted: true,  country_code: 'NG', created_at: '2026-08-02T22:15:00Z', merchant_name: 'Fast Transfer Ltd',     merchant_category: 'wire_transfer' },
  { id: 'TXN-98401', amount: 2340.50, risk_tier: 'critical', is_fraud_predicted: true,  country_code: 'RU', created_at: '2026-08-02T22:10:00Z', merchant_name: 'Global Electronics',    merchant_category: 'atm' },
  { id: 'TXN-98400', amount: 1250.00, risk_tier: 'high',     is_fraud_predicted: true,  country_code: 'CN', created_at: '2026-08-02T22:05:00Z', merchant_name: 'Online Shop XY',        merchant_category: 'online_retail' },
  { id: 'TXN-98399', amount:   89.99, risk_tier: 'low',      is_fraud_predicted: false, country_code: 'GB', created_at: '2026-08-02T22:00:00Z', merchant_name: 'Tesco Supermarket',     merchant_category: 'grocery' },
  { id: 'TXN-98398', amount:  670.00, risk_tier: 'medium',   is_fraud_predicted: false, country_code: 'FR', created_at: '2026-08-02T21:55:00Z', merchant_name: 'Ryanair Air Booking',   merchant_category: 'airline' },
  { id: 'TXN-98397', amount:   45.20, risk_tier: 'low',      is_fraud_predicted: false, country_code: 'DE', created_at: '2026-08-02T21:50:00Z', merchant_name: 'Aldi Süd',              merchant_category: 'grocery' },
]

export default function DashboardPage() {
  const { data: kpis } = useSWR('kpis', async () => {
    try { return await api.analytics.kpis(30) as unknown as KPIData } catch { return null }
  })

  const displayKPIs = kpis || {
    total_transactions: 284807,
    total_fraud: 492,
    fraud_rate: 0.00172,
    avg_risk_score: 0.087,
    active_model_version: 'v1.0.0',
    period_label: 'Last 30 days',
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">

      {/* ── Alert Ribbon ──────────────────────────────── */}
      <div className="bg-[#111] border border-[#1f1f1f] border-l-2 border-l-[#f5a623] rounded px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] dot-live" />
          <span className="text-[12px] font-semibold text-white">Live Monitoring Stream Active</span>
          <span className="text-[#2a2a2a]">|</span>
          <span className="text-[11px] text-[#555]">2 critical anomaly alerts detected in the last hour</span>
        </div>
        <a href="/transactions" className="text-[11px] text-[#f5a623] hover:text-[#fbbf24] font-mono transition-colors">
          View Stream →
        </a>
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Volume Analyzed',
            value: displayKPIs.total_transactions.toLocaleString(),
            sub: 'Transactions · 30d window',
            spark: [120, 140, 135, 160, 180, 210, 240],
            color: '#f5a623',
          },
          {
            label: 'Fraud Detections',
            value: displayKPIs.total_fraud.toLocaleString(),
            sub: 'Flagged by dual ensemble',
            spark: [4, 7, 5, 12, 8, 14, 11],
            color: '#ef4444',
          },
          {
            label: 'System Fraud Rate',
            value: `${(displayKPIs.fraud_rate * 100).toFixed(3)}%`,
            sub: 'Prevalence baseline: 0.172%',
            spark: [0.15, 0.18, 0.16, 0.21, 0.17, 0.19, 0.17],
            color: '#f97316',
          },
          {
            label: 'Avg Model Confidence',
            value: `${(displayKPIs.avg_risk_score * 100).toFixed(1)}%`,
            sub: 'Mean risk probability',
            spark: [82, 85, 84, 87, 86, 88, 87],
            color: '#22c55e',
          },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-4 hover:border-[#2a2a2a] transition-colors">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-mono text-[#444] uppercase tracking-widest leading-tight">{kpi.label}</span>
              <Sparkline data={kpi.spark} color={kpi.color} />
            </div>
            <div className="text-[26px] font-bold font-mono leading-none" style={{ color: kpi.color }}>{kpi.value}</div>
            <span className="text-[10px] text-[#444] mt-2 block">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Main Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Live Threat Ledger */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#1c1c1c] rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[13px] font-semibold text-white">Live Threat Detection Ledger</h2>
              <p className="text-[10px] text-[#444] mt-0.5">Real-time risk scoring output</p>
            </div>
            <a href="/transactions" className="text-[10px] text-[#f5a623] hover:text-[#fbbf24] font-mono transition-colors">
              View All Logs →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-[#3a3a3a] font-mono text-[9px] uppercase tracking-widest">
                  <th className="pb-2.5 font-medium pr-4">Txn Ref</th>
                  <th className="pb-2.5 font-medium pr-4">Amount</th>
                  <th className="pb-2.5 font-medium pr-4">Merchant</th>
                  <th className="pb-2.5 font-medium pr-4">Ctry</th>
                  <th className="pb-2.5 font-medium pr-4">Risk</th>
                  <th className="pb-2.5 font-medium text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]">
                {MOCK_RECENT.map(row => (
                  <tr key={row.id} className="hover:bg-[#111] transition-colors group">
                    <td className="py-2.5 font-mono text-[#444] text-[10px] pr-4">{row.id}</td>
                    <td className="py-2.5 font-mono text-white font-semibold text-[11px] pr-4">
                      €{row.amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-[#888] text-[11px] pr-4 max-w-[140px] truncate">{row.merchant_name}</td>
                    <td className="py-2.5 font-mono text-[#555] text-[10px] pr-4">{row.country_code}</td>
                    <td className="py-2.5 pr-4"><RiskBadge tier={row.risk_tier} /></td>
                    <td className="py-2.5 text-right font-mono text-[10px]">
                      <span className={`font-bold ${row.is_fraud_predicted ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {row.is_fraud_predicted ? '⚠ FRAUD' : '✓ LEGIT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Status Panel */}
        <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-white">Active Model Stack</h2>
              <span className="text-[9px] font-mono bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 px-2 py-0.5 rounded font-bold uppercase">ONLINE</span>
            </div>

            <div className="space-y-0.5 font-mono text-[11px]">
              {[
                { label: 'Active Version',       value: displayKPIs.active_model_version, color: 'text-white' },
                { label: 'Supervised Model',     value: 'Logistic Regression',            color: 'text-[#60a5fa]' },
                { label: 'Anomaly Detector',     value: 'Isolation Forest',               color: 'text-[#a78bfa]' },
                { label: 'Ensemble Weights',     value: '0.7 LR + 0.3 IF',               color: 'text-[#888]' },
                { label: 'PR-AUC',               value: '0.847',                          color: 'text-[#22c55e]' },
                { label: 'ROC-AUC',              value: '0.979',                          color: 'text-[#22c55e]' },
                { label: 'Inference Latency',    value: '< 1.2ms',                        color: 'text-[#f5a623]' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#141414] last:border-0">
                  <span className="text-[#444]">{row.label}</span>
                  <span className={`font-semibold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#1a1a1a] space-y-2">
            <a
              href="/models"
              className="block text-center py-2 bg-[#f5a623]/10 hover:bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/20 text-[11px] font-mono rounded transition-colors"
            >
              Inspect Model Registry →
            </a>
            <a
              href="/analytics"
              className="block text-center py-2 bg-[#111] hover:bg-[#181818] text-[#555] border border-[#1c1c1c] text-[11px] font-mono rounded transition-colors hover:text-[#888]"
            >
              Risk Analytics →
            </a>
          </div>
        </div>
      </div>

      {/* ── Quick Actions Strip ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { href: '/predict', label: 'Run Single Prediction', sub: 'Analyze one transaction', icon: '⚡', accent: true },
          { href: '/batch',   label: 'Upload Batch CSV',      sub: 'Process bulk transactions', icon: '📊', accent: false },
          { href: '/reports', label: 'Compliance Report',     sub: 'Generate audit exports',   icon: '🛡', accent: false },
        ].map(action => (
          <a
            key={action.href}
            href={action.href}
            className={`flex items-center gap-3 p-4 rounded border transition-all group ${
              action.accent
                ? 'bg-[#f5a623]/8 border-[#f5a623]/20 hover:bg-[#f5a623]/12 hover:border-[#f5a623]/35'
                : 'bg-[#0f0f0f] border-[#1c1c1c] hover:bg-[#111] hover:border-[#2a2a2a]'
            }`}
          >
            <div className={`w-8 h-8 rounded flex items-center justify-center text-sm flex-shrink-0 ${
              action.accent ? 'bg-[#f5a623]/15' : 'bg-[#141414]'
            }`}>
              {action.icon}
            </div>
            <div className="min-w-0">
              <div className={`text-[12px] font-semibold ${action.accent ? 'text-[#f5a623]' : 'text-white'}`}>{action.label}</div>
              <div className="text-[10px] text-[#444]">{action.sub}</div>
            </div>
            <svg className={`w-3.5 h-3.5 ml-auto flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${action.accent ? 'text-[#f5a623]/50' : 'text-[#333]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
      </div>

    </div>
  )
}
