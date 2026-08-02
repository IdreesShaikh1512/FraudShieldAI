'use client'
import { useState } from 'react'

interface BatchItem {
  id: string
  amount: number
  risk_score: number
  risk_tier: string
  is_fraud: boolean
  status: string
}

export default function BatchPage() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BatchItem[]>([])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResults([])
      setProgress(0)
    }
  }

  function handleProcess() {
    if (!file) return
    setProcessing(true)
    setProgress(15)

    // Simulate batch execution
    setTimeout(() => setProgress(45), 400)
    setTimeout(() => setProgress(80), 800)
    setTimeout(() => {
      setProgress(100)
      setProcessing(false)
      setResults([
        { id: 'BATCH-001', amount: 149.62, risk_score: 0.041, risk_tier: 'low', is_fraud: false, status: 'scanned' },
        { id: 'BATCH-002', amount: 3100.00, risk_score: 0.912, risk_tier: 'critical', is_fraud: true, status: 'flagged' },
        { id: 'BATCH-003', amount: 45.20, risk_score: 0.012, risk_tier: 'low', is_fraud: false, status: 'scanned' },
        { id: 'BATCH-004', amount: 2340.50, risk_score: 0.884, risk_tier: 'critical', is_fraud: true, status: 'flagged' },
        { id: 'BATCH-005', amount: 670.00, risk_score: 0.421, risk_tier: 'medium', is_fraud: false, status: 'scanned' },
      ])
    }, 1200)
  }

  function downloadSampleCSV() {
    const csvContent = "data:text/csv;charset=utf-8,Time,Amount,V1,V2,V3,V4,V5\n406,149.62,-1.35,-0.07,2.53,1.37,-0.33\n172792,3100.00,-3.04,-3.15,1.08,2.28,1.35\n"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "fraudshield_batch_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="pb-4 border-b border-[#1f1f1f] flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Batch CSV Risk Ingestion</h1>
          <p className="text-xs text-[#888] mt-0.5">Bulk score transaction datasets up to 100,000 rows</p>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="px-3 py-1.5 bg-[#0e0e0e] hover:bg-[#181818] text-[#bbb] border border-[#1f1f1f] text-xs font-mono rounded transition-colors"
        >
          ↓ Download Sample CSV Schema
        </button>
      </div>

      {/* Drag and Drop Zone */}
      <div className="bg-[#0f0f0f] border border-dashed border-[#26324a] rounded-lg p-8 text-center">
        <div className="w-10 h-10 rounded bg-[#0e0e0e] border border-[#1f1f1f] flex items-center justify-center text-[#f5a623] text-lg mx-auto mb-3 font-mono">
          📁
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">Upload Transaction Dataset (.csv)</h3>
        <p className="text-xs text-[#888] max-w-md mx-auto mb-4">
          File must include columns: <code className="text-[#f5a623] font-mono">Time</code>, <code className="text-[#f5a623] font-mono">Amount</code>, and <code className="text-[#f5a623] font-mono">V1–V28</code>. Max file size: 50MB.
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-file-input"
        />
        <label
          htmlFor="csv-file-input"
          className="inline-block px-4 py-2 bg-[#f5a623] hover:bg-[#fbbf24] text-white font-mono text-xs font-semibold rounded cursor-pointer transition-colors shadow-sm"
        >
          Select CSV File
        </label>

        {file && (
          <div className="mt-4 text-xs font-mono text-[#bbb]">
            Selected: <span className="text-[#f5a623]">{file.name}</span> ({ (file.size / 1024).toFixed(1) } KB)
          </div>
        )}
      </div>

      {file && (
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#888] uppercase">Batch Progress</span>
            <span className="text-xs font-mono text-[#f5a623]">{progress}%</span>
          </div>

          <div className="w-full bg-[#0e0e0e] rounded-full h-2 overflow-hidden mb-4 border border-[#1f1f1f]">
            <div className="bg-[#f5a623] h-2 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <button
            onClick={handleProcess}
            disabled={processing}
            className="w-full py-2.5 bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-50 text-white font-mono text-xs font-semibold rounded uppercase tracking-wider transition-colors shadow-sm"
          >
            {processing ? 'Processing Batch Ingestion…' : 'Execute Batch Risk Inference'}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white">Batch Evaluation Output ({results.length} records)</h3>
            <span className="text-xs font-mono text-emerald-400">Execution completed in 0.42s</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-[#555] font-mono text-[10px] uppercase">
                  <th className="pb-2 font-medium">Record ID</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Risk Score</th>
                  <th className="pb-2 font-medium">Risk Tier</th>
                  <th className="pb-2 font-medium text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]">
                {results.map(row => (
                  <tr key={row.id} className="hover:bg-[#0e0e0e] transition-colors">
                    <td className="py-2.5 font-mono text-[#888] text-[11px]">{row.id}</td>
                    <td className="py-2.5 font-mono text-white font-semibold">€{row.amount.toFixed(2)}</td>
                    <td className="py-2.5 font-mono text-[#bbb]">{(row.risk_score * 100).toFixed(1)}%</td>
                    <td className="py-2.5 font-mono uppercase text-[10px]">
                      <span className={`px-2 py-0.5 rounded border font-semibold ${row.is_fraud ? 'bg-rose-950/40 text-rose-400 border-rose-800/40' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'}`}>
                        {row.risk_tier}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold">
                      <span className={row.is_fraud ? 'text-rose-400' : 'text-emerald-400'}>
                        {row.is_fraud ? '⚠ FRAUD' : '✓ LEGIT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
