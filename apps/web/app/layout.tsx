import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'FraudShield AI | Enterprise Fraud Detection Platform',
  description: 'Real-time, explainable AI-powered credit card fraud detection for enterprise risk teams.',
  keywords: ['fraud detection', 'machine learning', 'credit card fraud', 'AI', 'fintech'],
  openGraph: { title: 'FraudShield AI', description: 'Enterprise fraud detection powered by ML', type: 'website' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.variable} bg-slate-950 text-[#f0f0f0] min-h-screen antialiased`}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
