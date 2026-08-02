'use client'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts'

// ROC Curve data
const ROC_DATA = Array.from({ length: 20 }, (_, i) => {
  const fpr = i / 19
  const tpr = Math.min(1, Math.pow(fpr, 0.08))
  return { fpr: parseFloat(fpr.toFixed(3)), tpr: parseFloat(tpr.toFixed(3)) }
})

// PR Curve data
const PR_DATA = Array.from({ length: 20 }, (_, i) => {
  const recall = i / 19
  const precision = Math.max(0.1, 1 - recall * 0.85)
  return { recall: parseFloat(recall.toFixed(3)), precision: parseFloat(precision.toFixed(3)) }
})

// Fraud by hour
const FRAUD_BY_HOUR = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  rate: h >= 2 && h <= 5 ? parseFloat((0.005 + (h * 0.0002)).toFixed(4)) : parseFloat((0.001 + (h * 0.00005)).toFixed(4))
}))

// Feature importance
const FEATURE_IMP = [
  { feature_name: 'V14', importance: 0.312 },
  { feature_name: 'V4', importance: 0.198 },
  { feature_name: 'V10', importance: 0.156 },
  { feature_name: 'V12', importance: 0.134 },
  { feature_name: 'Amount', importance: 0.098 },
  { feature_name: 'V17', importance: 0.071 },
  { feature_name: 'V3', importance: 0.031 },
]

// Model Drift over 30 days (rolling PR-AUC)
const MODEL_DRIFT_DATA = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  const noise = (Math.sin(i * 0.5) * 0.008) + ((Math.random() - 0.5) * 0.004)
  return {
    day: `Day ${day}`,
    pr_auc: parseFloat((0.948 - (i > 20 ? (i - 20) * 0.0012 : 0) + noise).toFixed(4)),
    target_baseline: 0.940
  }
})

// Fraud by Card Network
const NETWORK_DATA = [
  { network: 'Visa', total: 45200, fraud: 380, rate: 0.84 },
  { network: 'Mastercard', total: 32100, fraud: 290, rate: 0.90 },
  { network: 'UnionPay', total: 12400, fraud: 210, rate: 1.69 },
  { network: 'Amex', total: 8900, fraud: 55, rate: 0.62 },
  { network: 'Discover', total: 4200, fraud: 48, rate: 1.14 },
  { network: 'RuPay', total: 3100, fraud: 41, rate: 1.32 },
]

// Fraud by Merchant Category (Top 8)
const CATEGORY_DATA = [
  { category: 'Crypto Exchange', fraudRate: 4.82, volume: '$2.4M' },
  { category: 'ATM Withdrawal', fraudRate: 3.91, volume: '$1.8M' },
  { category: 'Gambling & Betting', fraudRate: 3.45, volume: '$920K' },
  { category: 'Online Retail / CNP', fraudRate: 1.84, volume: '$8.5M' },
  { category: 'Gift Cards & Prepaid', fraudRate: 2.76, volume: '$410K' },
  { category: 'Airlines & Air Travel', fraudRate: 1.25, volume: '$3.1M' },
  { category: 'Jewelry & Luxury', fraudRate: 1.12, volume: '$1.2M' },
  { category: 'Gas Stations & Fuel', fraudRate: 0.48, volume: '$4.2M' },
]

// False Positive Trend (daily false positive count vs true positive)
const FP_TREND_DATA = Array.from({ length: 14 }, (_, i) => {
  const day = `Day ${i + 1}`
  const tp = 30 + Math.floor(Math.random() * 15)
  const fp = Math.floor(tp * 0.12) + Math.floor(Math.random() * 3)
  return { day, tp, fp, fp_rate: parseFloat(((fp / (tp + fp)) * 100).toFixed(1)) }
})

export default function AnalyticsPage() {
  const [threshold, setThreshold] = useState<number>(0.50)
  const [activeTab, setActiveTab] = useState<'drift' | 'networks' | 'categories' | 'curves'>('drift')

  // Dynamic threshold calculations
  const precision = Math.min(0.98, Math.max(0.40, 0.70 + (threshold - 0.5) * 0.6))
  const recall = Math.min(0.98, Math.max(0.35, 0.85 - (threshold - 0.5) * 0.8))
  const f1 = (2 * precision * recall) / (precision + recall)

  const totalFraud = 492
  const totalLegit = 56500
  const tp = Math.round(totalFraud * recall)
  const fn = totalFraud - tp
  const fp = Math.round(tp * ((1 - precision) / precision))
  const tn = totalLegit - fp

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-[#1f1f1f] flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Operations & Analytics</h1>
          <p className="text-xs text-[#888] mt-0.5">Model drift tracking · Card network breakdowns · Decision threshold simulator</p>
        </div>
        <div className="flex gap-2">
          {(['drift', 'networks', 'categories', 'curves'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-colors ${activeTab === t ? 'bg-[#f5a623] text-white' : 'bg-[#0f0f0f] border border-[#1f1f1f] text-[#888] hover:text-[#ccc]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Threshold Simulator Panel */}
      <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-5">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase font-mono">Real-Time Decision Threshold Simulator</h2>
            <p className="text-xs text-[#888]">Adjust probability cutoff to simulate impact on Precision, Recall, and False Positives</p>
          </div>
          <div className="flex gap-6 font-mono">
            <div>
              <span className="text-[10px] text-[#555] block">PRECISION</span>
              <span className="text-base font-bold text-emerald-400">{(precision * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-[#555] block">RECALL</span>
              <span className="text-base font-bold text-[#f5a623]">{(recall * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-[#555] block">F1-SCORE</span>
              <span className="text-base font-bold text-purple-400">{(f1 * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center text-xs font-mono text-[#888]">
            <span>Threshold Cutoff: <strong className="text-white">{(threshold * 100).toFixed(0)}%</strong></span>
            <span>Conservative (High Recall) ← → Strict (High Precision)</span>
          </div>
          <input
            type="range" min="0.10" max="0.90" step="0.01"
            value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#1b2333] rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Dynamic Confusion Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-[#080808] border border-emerald-950/60 p-3 rounded-lg text-center">
            <span className="text-[10px] text-[#555] uppercase block">True Positives (Blocked)</span>
            <span className="text-lg font-bold text-emerald-400">{tp.toLocaleString()}</span>
          </div>
          <div className="bg-[#080808] border border-rose-950/60 p-3 rounded-lg text-center">
            <span className="text-[10px] text-[#555] uppercase block">False Positives (Friction)</span>
            <span className="text-lg font-bold text-rose-400">{fp.toLocaleString()}</span>
          </div>
          <div className="bg-[#080808] border border-rose-950/60 p-3 rounded-lg text-center">
            <span className="text-[10px] text-[#555] uppercase block">False Negatives (Missed)</span>
            <span className="text-lg font-bold text-rose-400">{fn.toLocaleString()}</span>
          </div>
          <div className="bg-[#080808] border border-emerald-950/60 p-3 rounded-lg text-center">
            <span className="text-[10px] text-[#555] uppercase block">True Negatives (Cleared)</span>
            <span className="text-lg font-bold text-emerald-400">{tn.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'drift' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Model Drift Chart */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase">30-Day Model Drift Monitoring</h3>
                <p className="text-[11px] text-[#888]">Rolling PR-AUC performance vs SLA baseline (0.940)</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-800">
                SLA MET
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MODEL_DRIFT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                  <YAxis domain={[0.92, 0.96]} stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#080808', borderColor: '#1f1f1f', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="pr_auc" stroke="#3b82f6" strokeWidth={2} dot={false} name="PR-AUC" />
                  <Line type="monotone" dataKey="target_baseline" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" name="SLA Baseline" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* False Positive Trend */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase">False Positive vs True Positive Trend</h3>
                <p className="text-[11px] text-[#888]">14-day daily fraud detection accuracy</p>
              </div>
              <span className="text-[10px] font-mono text-[#555]">Target FP Rate &lt; 15%</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FP_TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#080808', borderColor: '#1f1f1f', fontSize: '12px' }} />
                  <Bar dataKey="tp" fill="#10b981" name="True Positives" stackId="a" />
                  <Bar dataKey="fp" fill="#f43f5e" name="False Positives" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'networks' && (
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-4">
          <h3 className="text-xs font-bold text-white font-mono uppercase mb-4">Fraud Rate by Card Network</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={NETWORK_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} unit="%" />
                  <YAxis dataKey="network" type="category" stroke="#64748b" fontSize={11} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#080808', borderColor: '#1f1f1f', fontSize: '12px' }} />
                  <Bar dataKey="rate" fill="#3b82f6" name="Fraud Rate %" radius={[0, 4, 4, 0]}>
                    {NETWORK_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.rate > 1.5 ? '#f43f5e' : entry.rate > 1.0 ? '#fbbf24' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-[#888] font-mono">NETWORK SUMMARY LEDGER</div>
              <div className="bg-[#080808] border border-[#1f1f1f] rounded-lg overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#0f0f0f] text-[#555] border-b border-[#1f1f1f] text-[10px] uppercase">
                    <tr>
                      <th className="p-2">Network</th>
                      <th className="p-2">Total Txns</th>
                      <th className="p-2">Fraud Count</th>
                      <th className="p-2 text-right">Fraud Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f]">
                    {NETWORK_DATA.map(n => (
                      <tr key={n.network} className="hover:bg-[#0e0e0e]">
                        <td className="p-2 text-white font-bold">{n.network}</td>
                        <td className="p-2 text-[#bbb]">{n.total.toLocaleString()}</td>
                        <td className="p-2 text-rose-400">{n.fraud}</td>
                        <td className="p-2 text-right font-bold text-[#ccc]">{n.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-4">
          <h3 className="text-xs font-bold text-white font-mono uppercase mb-4">Top High-Risk Merchant Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} unit="%" />
                  <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={10} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#080808', borderColor: '#1f1f1f', fontSize: '12px' }} />
                  <Bar dataKey="fraudRate" fill="#f43f5e" name="Fraud Rate %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-[#888] font-mono mb-2">CATEGORY RISK METRICS</div>
              {CATEGORY_DATA.map(cat => (
                <div key={cat.category} className="flex justify-between items-center bg-[#080808] border border-[#1f1f1f] p-2.5 rounded-lg text-xs font-mono">
                  <div>
                    <div className="text-[#ccc] font-bold">{cat.category}</div>
                    <div className="text-[10px] text-[#555]">Volume: {cat.volume}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-rose-400 font-bold">{cat.fraudRate}%</div>
                    <div className="text-[10px] text-[#555] uppercase">Fraud Rate</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'curves' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ROC Curve */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-4">
            <h3 className="text-xs font-bold text-white font-mono uppercase mb-2">ROC Curve (AUC = 0.984)</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ROC_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="fpr" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#080808', borderColor: '#1f1f1f', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="tpr" stroke="#3b82f6" fill="#1e3a8a" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PR Curve */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-4">
            <h3 className="text-xs font-bold text-white font-mono uppercase mb-2">Precision-Recall Curve (PR-AUC = 0.947)</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PR_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="recall" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#080808', borderColor: '#1f1f1f', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="precision" stroke="#10b981" fill="#064e3b" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
