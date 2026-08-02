'use client'
import { useState } from 'react'

interface ModelVersion {
  version: string
  model_name: string
  trained_at: string
  pr_auc: number
  f1_minority: number
  recall_at_90p: number
  roc_auc: number
  inference_latency: string
  memory_usage: string
  dataset_rows: number
  dataset_hash: string
  notes: string
}

const MODELS: ModelVersion[] = [
  {
    version: 'v2.1.4',
    model_name: 'Dual-Ensemble (Logistic Regression + Isolation Forest)',
    trained_at: '2026-08-01T10:00:00Z',
    pr_auc: 0.947,
    f1_minority: 0.884,
    recall_at_90p: 0.812,
    roc_auc: 0.984,
    inference_latency: '14.2 ms',
    memory_usage: '240 MB',
    dataset_rows: 284807,
    dataset_hash: 'sha256:7f9a2b8e...104c',
    notes: 'Current production ensemble. Combines 70% weighted supervised LogReg with 30% unsupervised anomaly scoring.',
  },
  {
    version: 'v2.0.1',
    model_name: 'LightGBM Candidate (Shadow Mode)',
    trained_at: '2026-07-28T14:30:00Z',
    pr_auc: 0.952,
    f1_minority: 0.891,
    recall_at_90p: 0.825,
    roc_auc: 0.988,
    inference_latency: '18.6 ms',
    memory_usage: '380 MB',
    dataset_rows: 284807,
    dataset_hash: 'sha256:7f9a2b8e...104c',
    notes: 'Gradient boosting model evaluation candidate. Higher precision on minority class but increased latency.',
  },
  {
    version: 'v1.0.0',
    model_name: 'Single Logistic Regression Baseline',
    trained_at: '2026-07-15T10:00:00Z',
    pr_auc: 0.831,
    f1_minority: 0.807,
    recall_at_90p: 0.721,
    roc_auc: 0.971,
    inference_latency: '4.8 ms',
    memory_usage: '45 MB',
    dataset_rows: 284807,
    dataset_hash: 'sha256:7f9a2b8e...104c',
    notes: 'Legacy baseline without Isolation Forest unsupervised ensemble layer.',
  },
]

export default function ModelsPage() {
  const [activeVersion, setActiveVersion] = useState('v2.1.4')
  const [showModelCard, setShowModelCard] = useState<ModelVersion | null>(null)

  function handleActivate(version: string) {
    setActiveVersion(version)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-[#1f1f1f] flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Model Governance & Registry</h1>
          <p className="text-xs text-[#888] mt-0.5">Version tracking · Deployment controls · Inference latency & memory SLAs</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-[#888] bg-[#0f0f0f] border border-[#1f1f1f] px-3 py-1.5 rounded">
          <span>Active Registry:</span>
          <strong className="text-emerald-400">{activeVersion}</strong>
        </div>
      </div>

      {/* Model Cards */}
      <div className="space-y-4">
        {MODELS.map(m => {
          const isActive = m.version === activeVersion
          return (
            <div key={m.version} className={`bg-[#0f0f0f] border rounded-lg p-5 transition-colors ${isActive ? 'border-[#f5a623]/60 shadow-lg' : 'border-[#1f1f1f]'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1 font-mono">
                    <span className="text-sm font-bold text-white">{m.model_name}</span>
                    <span className="text-xs text-[#f5a623] bg-blue-950/40 border border-[#f5a623]/30/40 px-2 py-0.5 rounded">{m.version}</span>
                    {isActive ? (
                      <span className="text-[10px] bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Active Production
                      </span>
                    ) : (
                      <span className="text-[10px] bg-[#181818] text-[#888] border border-[#222] px-2 py-0.5 rounded font-mono uppercase">
                        Archived / Candidate
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#888] leading-relaxed">{m.notes}</p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-[#555] mt-2">
                    <span>Trained: {new Date(m.trained_at).toLocaleDateString()}</span>
                    <span>Dataset: {m.dataset_rows.toLocaleString()} rows</span>
                    <span>Hash: {m.dataset_hash}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowModelCard(m)}
                    className="px-3 py-1.5 bg-[#0e0e0e] hover:bg-[#181818] border border-[#1f1f1f] text-[#bbb] font-mono text-xs rounded transition-colors"
                  >
                    Model Card
                  </button>
                  {!isActive && (
                    <button
                      onClick={() => handleActivate(m.version)}
                      className="px-3 py-1.5 bg-[#f5a623] hover:bg-[#fbbf24] text-white font-mono text-xs font-semibold rounded transition-colors"
                    >
                      Rollback / Deploy
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 font-mono text-xs">
                <div className="bg-[#0e0e0e] border border-[#1f1f1f] p-2.5 rounded text-center">
                  <span className="text-[10px] text-[#555] uppercase block">PR-AUC</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{m.pr_auc.toFixed(3)}</span>
                </div>
                <div className="bg-[#0e0e0e] border border-[#1f1f1f] p-2.5 rounded text-center">
                  <span className="text-[10px] text-[#555] uppercase block">ROC-AUC</span>
                  <span className="text-sm font-bold text-[#f5a623] mt-0.5 block">{m.roc_auc.toFixed(3)}</span>
                </div>
                <div className="bg-[#0e0e0e] border border-[#1f1f1f] p-2.5 rounded text-center">
                  <span className="text-[10px] text-[#555] uppercase block">F1 Minority</span>
                  <span className="text-sm font-bold text-purple-400 mt-0.5 block">{m.f1_minority.toFixed(3)}</span>
                </div>
                <div className="bg-[#0e0e0e] border border-[#1f1f1f] p-2.5 rounded text-center">
                  <span className="text-[10px] text-[#555] uppercase block">Recall @ 90% Prec</span>
                  <span className="text-sm font-bold text-amber-400 mt-0.5 block">{(m.recall_at_90p * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-[#0e0e0e] border border-[#1f1f1f] p-2.5 rounded text-center">
                  <span className="text-[10px] text-[#555] uppercase block">Latency</span>
                  <span className="text-sm font-bold text-[#ccc] mt-0.5 block">{m.inference_latency}</span>
                </div>
                <div className="bg-[#0e0e0e] border border-[#1f1f1f] p-2.5 rounded text-center">
                  <span className="text-[10px] text-[#555] uppercase block">Memory</span>
                  <span className="text-sm font-bold text-[#ccc] mt-0.5 block">{m.memory_usage}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Model Card Modal */}
      {showModelCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowModelCard(null)}>
          <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start pb-3 border-b border-[#1f1f1f]">
              <div>
                <h3 className="text-base font-bold text-white font-mono">{showModelCard.model_name}</h3>
                <span className="text-xs font-mono text-[#f5a623]">Version {showModelCard.version}</span>
              </div>
              <button onClick={() => setShowModelCard(null)} className="text-[#555] hover:text-white">✕</button>
            </div>

            <div className="space-y-3 font-mono text-xs text-[#bbb]">
              <div>
                <h4 className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Architecture & Rationale</h4>
                <p className="bg-[#080808] border border-[#1f1f1f] p-3 rounded leading-relaxed text-[#888]">
                  Ensemble combines calibrated Logistic Regression (70% weight) with Isolation Forest anomaly detection (30% weight). Designed specifically for severe class imbalance (0.172% fraud prevalence).
                </p>
              </div>

              <div>
                <h4 className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Training Parameters</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#080808] border border-[#1f1f1f] p-2 rounded">
                    <span className="text-[#555] block">Optimizer / Solver</span>
                    <span className="text-white">liblinear (L2 penalty, C=1.0)</span>
                  </div>
                  <div className="bg-[#080808] border border-[#1f1f1f] p-2 rounded">
                    <span className="text-[#555] block">Class Weighting</span>
                    <span className="text-white">balanced (inverse frequency)</span>
                  </div>
                  <div className="bg-[#080808] border border-[#1f1f1f] p-2 rounded">
                    <span className="text-[#555] block">Isolation Trees</span>
                    <span className="text-white">200 estimators (n_jobs=-1)</span>
                  </div>
                  <div className="bg-[#080808] border border-[#1f1f1f] p-2 rounded">
                    <span className="text-[#555] block">Contamination</span>
                    <span className="text-white">0.00172 (172 bps)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Ethical & Compliance Notes</h4>
                <p className="bg-[#080808] border border-[#1f1f1f] p-3 rounded leading-relaxed text-[#888]">
                  Features V1–V28 are PCA-anonymized numerical transformations. Demographics, PII, race, gender, and protected features are strictly excluded from model inference.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1f1f1f] flex justify-end">
              <button
                onClick={() => setShowModelCard(null)}
                className="px-4 py-1.5 bg-[#0e0e0e] hover:bg-[#181818] text-[#bbb] font-mono text-xs border border-[#1f1f1f] rounded"
              >
                Close Model Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
