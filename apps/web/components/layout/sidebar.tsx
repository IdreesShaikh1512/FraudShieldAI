'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface NavSection {
  title: string
  items: { href: string; label: string; iconName: string; roles?: string[]; badge?: string }[]
}

const navSections: NavSection[] = [
  {
    title: 'MONITORING',
    items: [
      { href: '/dashboard', label: 'Overview', iconName: 'dashboard' },
      { href: '/transactions', label: 'Live Transactions', iconName: 'transactions', badge: 'LIVE' },
    ]
  },
  {
    title: 'DETECTION ENGINE',
    items: [
      { href: '/predict', label: 'Single Prediction', iconName: 'lightning' },
      { href: '/batch', label: 'Batch CSV Upload', iconName: 'upload' },
      { href: '/analytics', label: 'Risk Analytics', iconName: 'analytics' },
    ]
  },
  {
    title: 'GOVERNANCE',
    items: [
      { href: '/models', label: 'Model Registry', iconName: 'model' },
      { href: '/reports', label: 'Compliance Reports', iconName: 'report' },
      { href: '/settings', label: 'Settings & Security', iconName: 'settings' },
    ]
  }
]

function NavIcon({ name }: { name: string }) {
  const cls = 'w-[15px] h-[15px] flex-shrink-0'
  switch (name) {
    case 'dashboard':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    case 'transactions':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
    case 'lightning':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    case 'upload':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
    case 'analytics':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    case 'model':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
    case 'report':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    case 'settings':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    default:
      return <span className={cls} />
  }
}

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <aside className="w-56 bg-[#080808] border-r border-[#1c1c1c] flex flex-col fixed left-0 top-0 h-full z-20 select-none">
      {/* Brand Header */}
      <div className="h-12 px-4 flex items-center gap-2.5 border-b border-[#1c1c1c]">
        {/* Logo mark */}
        <div className="w-6 h-6 rounded border border-[#f5a623]/40 bg-[#f5a623]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-[#f5a623] font-mono tracking-tight">FS</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-bold text-white tracking-tight leading-none">FraudShield AI</span>
          <span className="text-[9px] text-[#444] font-mono mt-0.5">SOC Console v2.1.4</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
        {navSections.map(section => {
          const visibleItems = section.items.filter(item => !item.roles || item.roles.includes(user?.role || ''))
          if (visibleItems.length === 0) return null

          return (
            <div key={section.title}>
              <div className="text-[9px] font-bold text-[#3a3a3a] uppercase tracking-widest px-2 mb-1 font-mono">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-[12px] font-medium transition-all duration-100 ${
                        isActive
                          ? 'bg-[#f5a623]/10 text-[#f5a623] border-l-2 border-[#f5a623] pl-[6px]'
                          : 'text-[#666] hover:bg-[#141414] hover:text-[#ccc] border-l-2 border-transparent'
                      }`}
                    >
                      <NavIcon name={item.iconName} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isActive
                            ? 'bg-[#f5a623]/20 text-[#f5a623]'
                            : 'bg-[#1a1a1a] text-[#555]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom User Pill */}
      <div className="px-3 py-3 border-t border-[#1c1c1c]">
        {user && (
          <div className="flex items-center gap-2.5 px-1.5 py-1">
            <div className="w-6 h-6 rounded bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623] text-[10px] font-mono font-bold flex-shrink-0">
              {user.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-medium text-[#ccc] truncate leading-none">{user.full_name}</span>
              <span className="text-[9px] text-[#444] font-mono capitalize mt-0.5">{user.role}</span>
            </div>
            {/* Online indicator */}
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] flex-shrink-0" />
          </div>
        )}
      </div>
    </aside>
  )
}
