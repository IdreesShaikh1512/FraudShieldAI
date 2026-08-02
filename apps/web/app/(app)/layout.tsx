'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Animated logo */}
          <div className="w-10 h-10 rounded border border-[#f5a623]/40 bg-[#f5a623]/5 flex items-center justify-center">
            <span className="text-[14px] font-bold text-[#f5a623] font-mono">FS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#444] text-[11px] font-mono">Hydrating SOC Session…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#080808] flex text-[#f0f0f0]">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto bg-[#080808]">
          {children}
        </main>
      </div>
    </div>
  )
}
