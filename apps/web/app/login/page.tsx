'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'

const inputCls = 'w-full px-3 py-2 bg-[#0a0a0a] border border-[#222] rounded text-[#f0f0f0] text-[12px] font-mono placeholder-[#333] focus:outline-none focus:border-[#f5a623] focus:shadow-[0_0_0_1px_rgba(245,166,35,0.2)] transition-all'
const labelCls = 'block text-[9px] font-mono text-[#444] uppercase tracking-widest mb-1.5'

export default function AuthPage() {
  const router = useRouter()
  const { mutate } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await api.auth.login(email, password)
      await mutate()
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally { setLoading(false) }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await api.auth.register(email, password, fullName)
      await api.auth.login(email, password)
      await mutate()
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally { setLoading(false) }
  }

  function fillDemo(role: 'admin' | 'analyst' | 'auditor') {
    setMode('signin')
    const creds = {
      admin:   { email: 'admin@fraudshield.ai',   password: 'Admin@123456' },
      analyst: { email: 'analyst@fraudshield.ai', password: 'Analyst@123456' },
      auditor: { email: 'auditor@fraudshield.ai', password: 'Auditor@123456' },
    }
    setEmail(creds[role].email)
    setPassword(creds[role].password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0] flex items-center justify-center p-4 font-sans selection:bg-[#f5a623] selection:text-black">

      {/* Background accent lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-screen bg-gradient-to-b from-[#f5a623]/15 via-[#f5a623]/5 to-transparent" />
      </div>

      <div className="w-full max-w-[340px] relative z-10">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded border border-[#f5a623]/40 bg-[#f5a623]/8 flex items-center justify-center mb-3">
            <span className="text-[16px] font-bold text-[#f5a623] font-mono">FS</span>
          </div>
          <h1 className="text-[18px] font-bold tracking-tight text-white">FraudShield AI</h1>
          <p className="text-[10px] text-[#444] mt-1 font-mono">Enterprise Fraud Operations Console</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded p-6">

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 bg-[#0a0a0a] p-0.5 rounded border border-[#1a1a1a] mb-6">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                className={`py-2 text-[11px] font-mono font-medium rounded transition-all ${
                  mode === m
                    ? 'bg-[#f5a623] text-black shadow-sm'
                    : 'text-[#444] hover:text-[#888]'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 px-3 py-2 rounded bg-[#ef4444]/8 border border-[#ef4444]/20 text-[#ef4444] text-[11px] flex items-center gap-2 font-mono">
              <span>⚠</span> {error}
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className={labelCls}>Work Email</label>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@fraudshield.ai"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>
              <button
                id="signin-submit"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-50 text-black font-bold rounded text-[11px] uppercase tracking-wider font-mono transition-colors mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.49 8.49l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.49-8.49l2.83-2.83" />
                    </svg>
                    Authenticating…
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Alex Rivera"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Work Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="alex@company.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className={inputCls}
                />
              </div>
              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#f5a623] hover:bg-[#fbbf24] disabled:opacity-50 text-black font-bold rounded text-[11px] uppercase tracking-wider font-mono transition-colors mt-1"
              >
                {loading ? 'Registering…' : 'Create Account →'}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-[#1a1a1a]">
            <p className="text-[9px] text-[#333] mb-2.5 text-center font-mono uppercase tracking-widest">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(['admin', 'analyst', 'auditor'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="py-1.5 text-[10px] font-mono rounded bg-[#111] hover:bg-[#161616] text-[#555] hover:text-[#f5a623] border border-[#1a1a1a] hover:border-[#f5a623]/25 transition-all capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[9px] font-mono text-[#2a2a2a] mt-5">
          FraudShield AI v1.0 · Protected by Enterprise Security Architecture
        </p>
      </div>
    </div>
  )
}
