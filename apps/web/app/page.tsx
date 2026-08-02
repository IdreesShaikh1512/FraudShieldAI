'use client'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0] font-sans selection:bg-[#f5a623] selection:text-black">

      {/* ── Top Navbar ───────────────────────────────────── */}
      <header className="border-b border-[#1c1c1c] bg-[#080808]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded border border-[#f5a623]/40 bg-[#f5a623]/10 flex items-center justify-center">
              <span className="text-[11px] font-bold text-[#f5a623] font-mono">FS</span>
            </div>
            <span className="font-bold text-[13px] text-white tracking-tight">FraudShield AI</span>
            <span className="text-[9px] font-mono bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25 px-2 py-0.5 rounded uppercase tracking-widest">Enterprise SOC</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-[#555]">
            <a href="#features" className="hover:text-[#ccc] transition-colors">Features</a>
            <a href="#architecture" className="hover:text-[#ccc] transition-colors">Architecture</a>
            <a href="#compliance" className="hover:text-[#ccc] transition-colors">Compliance</a>
            <Link
              href="/login"
              className="px-4 py-2 bg-[#f5a623] hover:bg-[#fbbf24] text-black font-bold text-[11px] uppercase tracking-wider rounded transition-colors"
            >
              Launch Platform →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111] border border-[#222] text-[10px] font-mono mb-8 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] dot-live" />
          <span className="text-[#888]">Real-Time Transaction Risk & Governance Platform</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.08] mb-2">
          Sub-Millisecond
          <br />
          <span className="text-[#f5a623]">Fraud Detection</span>
        </h1>
        <p className="text-[#888] mt-2 text-[13px]">for Modern Financial Infrastructure</p>

        <p className="text-[#666] text-[13px] max-w-2xl mx-auto mt-6 leading-relaxed">
          FraudShield AI combines supervised classification with unsupervised anomaly detection
          to catch known attack vectors and novel fraud schemes in real time.
        </p>

        <div className="flex items-center justify-center gap-3 mt-10">
          <Link
            href="/login"
            className="px-7 py-3 bg-[#f5a623] hover:bg-[#fbbf24] text-black font-bold text-[12px] uppercase tracking-wider rounded transition-colors"
          >
            Access SOC Console
          </Link>
          <a
            href="#architecture"
            className="px-7 py-3 bg-transparent hover:bg-[#111] text-[#888] hover:text-[#ccc] font-semibold text-[12px] uppercase tracking-wider rounded border border-[#222] hover:border-[#333] transition-all"
          >
            Technical Architecture
          </a>
        </div>

        {/* Live Metrics Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mt-16 text-left">
          {[
            { label: 'Classification Latency', value: '<1.2ms',  sub: 'P99 inference benchmark' },
            { label: 'PR-AUC Score',           value: '0.847',   sub: 'Precision-Recall on test set' },
            { label: 'ROC-AUC Score',           value: '0.979',   sub: 'Calibrated threshold' },
            { label: 'Recall @ 90% Precision',  value: '74.3%',   sub: 'Targeted fraud capture rate' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-4 hover:border-[#2a2a2a] transition-colors">
              <span className="text-[9px] font-mono text-[#444] uppercase tracking-widest">{stat.label}</span>
              <div className="text-[26px] font-bold font-mono text-[#f5a623] mt-1 leading-none">{stat.value}</div>
              <span className="text-[10px] text-[#555] mt-1.5 block">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Grid ─────────────────────────────────── */}
      <section id="features" className="border-t border-[#1c1c1c] bg-[#080808] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[9px] font-mono text-[#f5a623] uppercase tracking-widest">Enterprise Capabilities</span>
            <h2 className="text-2xl font-bold text-white mt-2">Engineered for High-Throughput Fraud Operations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Dual-Model Ensemble',
                desc: 'Combines Logistic Regression for calibrated probability scores with Isolation Forest for unsupervised zero-day anomaly detection.',
                icon: '⚡',
              },
              {
                title: 'Local & Global SHAP',
                desc: 'Every prediction is accompanied by top-5 SHAP feature contribution scores, eliminating black-box decision risk for audit teams.',
                icon: '🔍',
              },
              {
                title: 'Append-Only Audit Trail',
                desc: 'Every user action, prediction override, and model deployment is recorded in an immutable audit ledger for strict regulatory compliance.',
                icon: '🛡',
              },
              {
                title: 'Batch CSV Processing',
                desc: 'Process historical transaction datasets in bulk with schema validation, progress tracking, and exported scoring reports.',
                icon: '📊',
              },
              {
                title: 'Role-Based Access Control',
                desc: 'Granular administrative control enforcing Admin, Analyst, and Auditor permissions across all endpoints.',
                icon: '🔐',
              },
              {
                title: 'Interactive Threshold Tuning',
                desc: 'Dynamically shift risk decision boundaries to observe real-time trade-offs across Precision, Recall, and False Positives.',
                icon: '⚙',
              },
            ].map(f => (
              <div key={f.title} className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-6 hover:border-[#2a2a2a] hover:bg-[#111] transition-all group">
                <div className="w-8 h-8 rounded bg-[#f5a623]/10 border border-[#f5a623]/20 flex items-center justify-center text-[14px] mb-4 group-hover:bg-[#f5a623]/15 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-[13px] font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[11px] text-[#555] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technical Architecture ───────────────────────── */}
      <section id="architecture" className="border-t border-[#1c1c1c] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded p-8">
            <span className="text-[9px] font-mono text-[#f5a623] uppercase tracking-widest">Pipeline Design</span>
            <h2 className="text-xl font-bold text-white mt-2 mb-6">Clean Architecture & ML Engineering Standards</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-[12px] text-[#888] leading-relaxed mb-5">
                  FraudShield AI is architected strictly following Clean Architecture guidelines. ML feature preprocessing
                  (RobustScaler on Amount, StandardScaler on Time) is completely isolated from synthetic enrichment variables
                  to guarantee zero data leakage.
                </p>
                <div className="space-y-2 text-[11px] font-mono text-[#666]">
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> 80/20 Stratified Train-Test Split</div>
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> Preprocessor fitted exclusively on training set</div>
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> Ensemble score = 0.7 × LogReg + 0.3 × IsoForest</div>
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> SQLite / PostgreSQL schema compatibility</div>
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> SHAP local & global explainability per inference</div>
                </div>
              </div>

              <div className="bg-[#080808] border border-[#1c1c1c] rounded p-4 font-mono text-[11px] text-[#888] overflow-x-auto">
                <div className="text-[#333] mb-3 text-[10px]">// ML Inference Pipeline Flow</div>
                <div className="text-[#f5a623]">Input: Transaction [Time, Amount, V1–V28]</div>
                <div className="text-[#333] mt-1">  │</div>
                <div className="text-[#666]">  ├── 1. FraudPreprocessor.transform(X)</div>
                <div className="text-[#666]">  ├── 2. LogisticRegression.predict_proba() → P_lr</div>
                <div className="text-[#666]">  ├── 3. IsolationForest.score_samples()  → P_if</div>
                <div className="text-[#666]">  ├── 4. Score = 0.7 × P_lr + 0.3 × P_if</div>
                <div className="text-[#666]">  └── 5. SHAPExplainer.get_local_explanation()</div>
                <div className="text-[#22c55e] mt-3">Output: RiskScore · RiskTier · Top-5 SHAP Features</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compliance Section ───────────────────────────── */}
      <section id="compliance" className="border-t border-[#1c1c1c] bg-[#080808] py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-[9px] font-mono text-[#f5a623] uppercase tracking-widest">Regulatory Compliance</span>
          <h2 className="text-2xl font-bold text-white mt-2 mb-10">Built for Regulated Financial Environments</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['PCI DSS Level 1', 'ISO 27001', 'SOC 2 Type II', 'GDPR', 'Basel III', 'FATF Alignment'].map(badge => (
              <div key={badge} className="px-4 py-2 bg-[#0f0f0f] border border-[#222] rounded text-[11px] font-mono text-[#666] hover:border-[#f5a623]/25 hover:text-[#888] transition-colors">
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Strip ────────────────────────────────────── */}
      <section className="border-t border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to Deploy FraudShield AI?</h2>
          <p className="text-[#555] text-[12px] mb-8">Access the SOC console and start analyzing transactions in minutes.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#f5a623] hover:bg-[#fbbf24] text-black font-bold text-[12px] uppercase tracking-wider rounded transition-colors"
          >
            Access SOC Console →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-[#1c1c1c] py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-mono text-[#333]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-[#f5a623]/30 bg-[#f5a623]/5 flex items-center justify-center">
              <span className="text-[8px] text-[#f5a623]">FS</span>
            </div>
            <span>FraudShield AI · Enterprise Credit Card Fraud Detection System v1.0.0</span>
          </div>
          <span>FastAPI + Next.js App Router + Clean Architecture</span>
        </div>
      </footer>

    </div>
  )
}
