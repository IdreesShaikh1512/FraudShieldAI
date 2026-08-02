'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'

export default function SettingsPage() {
  const { user } = useAuth()
  const [apiKey, setApiKey] = useState('fs_live_9a8b7c6d5e4f3a2b1c0d')
  const [copied, setCopied] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [criticalThreshold, setCriticalThreshold] = useState('0.85')

  function handleCopyKey() {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleRotateKey() {
    const newKey = 'fs_live_' + Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    setApiKey(newKey)
    alert("API Key rotated successfully! Ensure your backend microservices update their environment settings.")
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="pb-4 border-b border-[#1f1f1f]">
        <h1 className="text-xl font-bold text-white tracking-tight">System Settings & Security Profile</h1>
        <p className="text-xs text-[#888] mt-0.5">Manage API keys, notification triggers, and security credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Account Profile (1 Col) */}
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-5 space-y-4 font-sans">
          <h2 className="text-xs font-mono text-[#888] uppercase tracking-wider">Account Credentials</h2>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-[#555] text-[10px] uppercase block">Full Name</span>
              <span className="text-white font-medium text-sm block mt-0.5">{user?.full_name || 'Administrator'}</span>
            </div>
            <div>
              <span className="text-[#555] text-[10px] uppercase block">Work Email</span>
              <span className="text-[#bbb] block mt-0.5">{user?.email || 'admin@fraudshield.ai'}</span>
            </div>
            <div>
              <span className="text-[#555] text-[10px] uppercase block">Assigned Role</span>
              <span className="text-[#f5a623] font-bold uppercase block mt-0.5">{user?.role || 'admin'}</span>
            </div>
          </div>
        </div>

        {/* API Credentials & Integrations (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Key Manager */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-5 space-y-4">
            <h2 className="text-xs font-mono text-[#888] uppercase tracking-wider">Live API Key Management</h2>
            <p className="text-xs text-[#888] leading-relaxed">
              Use this key to authenticate programmatic requests to <code className="text-[#f5a623] font-mono">POST /api/v1/predict</code> from your payment gateway servers.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="flex-1 px-3 py-2 bg-[#0e0e0e] border border-[#1f1f1f] rounded font-mono text-xs text-[#ccc]"
              />
              <button
                onClick={handleCopyKey}
                className="px-3 py-2 bg-[#0e0e0e] hover:bg-[#181818] border border-[#1f1f1f] text-[#bbb] text-xs font-mono rounded transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button
                onClick={handleRotateKey}
                className="px-3 py-2 bg-rose-950/30 hover:bg-rose-950/50 text-rose-300 border border-rose-800/40 text-xs font-mono rounded transition-colors"
              >
                Rotate Key
              </button>
            </div>
          </div>

          {/* Alert Preferences */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-5 space-y-4">
            <h2 className="text-xs font-mono text-[#888] uppercase tracking-wider">Security Alert Thresholds</h2>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between py-1 border-b border-[#141414]">
                <div>
                  <span className="text-white font-medium block">Dispatch Email Alerts on Critical Fraud</span>
                  <span className="text-[11px] text-[#888]">Send instant PagerDuty/Email alerts when transaction exceeds risk threshold</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                  className="rounded border-[#1f1f1f] bg-[#0e0e0e]"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-white font-medium block">Critical Alert Risk Cutoff</span>
                  <span className="text-[11px] text-[#888]">Minimum risk score probability for critical alert dispatch</span>
                </div>
                <select
                  value={criticalThreshold}
                  onChange={e => setCriticalThreshold(e.target.value)}
                  className="px-2.5 py-1 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-xs font-mono text-white"
                >
                  <option value="0.75">0.75 (Sensitive)</option>
                  <option value="0.85">0.85 (Recommended)</option>
                  <option value="0.90">0.90 (High Precision)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
