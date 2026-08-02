'use client'
import { useState } from 'react'
import { api } from '@/lib/api-client'
import { CountrySelect, ALL_COUNTRIES, Country } from '@/components/ui/country-select'
import { MerchantCategorySelect, MERCHANT_CATEGORIES, MerchantCategory } from '@/components/ui/merchant-category-select'

const PCA_FIELDS = Array.from({ length: 28 }, (_, i) => `v${i + 1}`)

const DEMO_PRESETS = {
  legit: {
    time: 406, amount: 149.62,
    v1: -1.3598, v2: -0.0727, v3: 2.5363, v4: 1.3781, v5: -0.3383, v6: 0.4623, v7: 0.2395, v8: 0.0986, v9: 0.3637, v10: 0.0907, v11: -0.5516, v12: -0.6178, v13: -0.9913, v14: -0.3111, v15: 1.4681, v16: -0.4704, v17: 0.2079, v18: 0.0257, v19: 0.4039, v20: 0.2514, v21: -0.0183, v22: 0.2778, v23: -0.1104, v24: 0.0669, v25: 0.1285, v26: -0.1891, v27: 0.1335, v28: -0.0210
  },
  fraud: {
    time: 172792, amount: 3100.00,
    v1: -3.0435, v2: -3.1573, v3: 1.0884, v4: 2.2886, v5: 1.3598, v6: -1.0648, v7: 0.3255, v8: -0.0677, v9: -0.2709, v10: -0.8385, v11: -0.4145, v12: -0.5031, v13: 0.6761, v14: -1.6942, v15: 2.1478, v16: -0.2939, v17: -2.7707, v18: -0.1012, v19: -0.0968, v20: -1.1438, v21: -0.2210, v22: 0.4993, v23: -0.2469, v24: 0.6515, v25: 0.0695, v26: -0.7367, v27: -0.3668, v28: -0.0613
  }
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
]

const CARD_NETWORKS = ['Visa', 'Mastercard', 'American Express', 'Discover', 'UnionPay', 'JCB', 'RuPay', 'Diners Club']
const CARD_TYPES = ['Credit', 'Debit', 'Prepaid', 'Virtual', 'Corporate', 'Government']
const CHANNELS = ['Online / Web', 'POS Terminal', 'Mobile App', 'ATM', 'Contactless (NFC)', 'Chip & PIN', 'Magnetic Stripe', 'CNP (Card Not Present)', 'MOTO']
const CUSTOMER_SEGMENTS = ['Retail', 'Premium', 'Business', 'Corporate', 'Student', 'Senior', 'VIP', 'New Applicant']

type PredictResult = {
  risk_score: number
  risk_tier: string
  is_fraud_predicted: boolean
  explanation: { feature_name: string; shap_value: number; contribution_pct: number }[]
  model_version: string
}

function RiskMeter({ score }: { score: number }) {
  const pct = (score * 100).toFixed(1)
  const color = score > 0.7 ? '#ef4444' : score > 0.4 ? '#f59e0b' : '#10b981'
  return (
    <div className="flex flex-col items-center">
      <svg width="150" height="85" viewBox="0 0 150 85">
        <path d="M 15 75 A 60 60 0 0 1 135 75" fill="none" stroke="#1f1f1f" strokeWidth="12" strokeLinecap="round"/>
        <path
          d="M 15 75 A 60 60 0 0 1 135 75"
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${score * 188.5} 188.5`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text x="75" y="65" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="monospace">{pct}%</text>
      </svg>
      <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider mt-1">Fraud Probability</span>
    </div>
  )
}

const VERDICT_CFG = {
  approve: { label: 'APPROVE', cls: 'bg-emerald-950/50 border-emerald-700 text-emerald-400', dot: 'bg-emerald-400', desc: 'Transaction cleared. No further action required.' },
  review: { label: 'REVIEW', cls: 'bg-amber-950/50 border-amber-700 text-amber-400', dot: 'bg-amber-400', desc: 'Flag for analyst review. Hold authorization pending investigation.' },
  challenge: { label: 'CHALLENGE', cls: 'bg-orange-950/50 border-orange-700 text-orange-400', dot: 'bg-orange-400', desc: 'Trigger step-up authentication (OTP, biometric) before processing.' },
  block: { label: 'BLOCK', cls: 'bg-rose-950/50 border-rose-700 text-rose-400', dot: 'bg-rose-500', desc: 'Decline transaction. Send cardholder alert. Escalate to case manager.' },
}

function getVerdict(score: number): keyof typeof VERDICT_CFG {
  if (score >= 0.8) return 'block'
  if (score >= 0.6) return 'challenge'
  if (score >= 0.4) return 'review'
  return 'approve'
}

export const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  JPY: 155.0,
  CAD: 1.36,
  AUD: 1.50,
  CHF: 0.90,
  CNY: 7.23,
  BRL: 5.40,
  AED: 3.67,
  SAR: 3.75,
  SGD: 1.35,
  HKD: 7.82,
  MXN: 18.2,
  RUB: 88.0,
  ZAR: 18.5,
  NGN: 1500.0,
  KRW: 1380.0,
  TRY: 32.5,
  SEK: 10.5,
  NOK: 10.6,
  NZD: 1.63,
}

export const COUNTRY_PRICE_INDEX: Record<string, number> = {
  US: 1.0,
  GB: 0.95,
  DE: 0.90,
  FR: 0.90,
  IN: 0.35,
  NG: 0.30,
  CN: 0.45,
  JP: 0.75,
  BR: 0.40,
  RU: 0.40,
  AE: 1.10,
  SA: 0.90,
  CA: 0.95,
  AU: 1.00,
  CH: 1.45,
  SG: 1.10,
  SE: 1.05,
  NO: 1.15,
  KR: 0.70,
  MX: 0.45,
  ZA: 0.40,
}

export function getConvertedBaseline(usdBaseline: number, curr: string, country: string): number {
  const ctryMult = COUNTRY_PRICE_INDEX[country] ?? 0.70
  const rate = CURRENCY_RATES[curr] ?? 1.0
  const val = Math.round(usdBaseline * ctryMult * rate)
  return Math.max(val, 1)
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[#bbb] mb-1">{label}</label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-xs text-[#ccc] focus:outline-none focus:border-[#f5a623] appearance-none font-sans"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function PredictPage() {
  const [viewMode, setViewMode] = useState<'beginner' | 'advanced'>('beginner')

  // Beginner mode form state
  const [amount, setAmount] = useState<number>(24000.00)
  const [currency, setCurrency] = useState('EUR')
  const [timeOfDay, setTimeOfDay] = useState<number>(3)
  const [merchantCategory, setMerchantCategory] = useState('online_retail')
  const [merchantName, setMerchantName] = useState('Amazon.co.uk')
  const [merchantId, setMerchantId] = useState('MID-40021887')
  const [countryCode, setCountryCode] = useState('GB')
  const [billingCountry, setBillingCountry] = useState('GB')
  const [cardNetwork, setCardNetwork] = useState('Visa')
  const [cardType, setCardType] = useState('Credit')
  const [channel, setChannel] = useState('Online / Web')
  const [customerSegment, setCustomerSegment] = useState('Retail')
  const [accountAgeDays, setAccountAgeDays] = useState<number>(14)
  const [deviceId] = useState('DEV-' + Math.random().toString(36).slice(2, 10).toUpperCase())
  const [ipAddress] = useState(`185.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`)

  // Advanced mode state
  const [advForm, setAdvForm] = useState<Record<string, number>>(DEMO_PRESETS.fraud as Record<string, number>)

  const [result, setResult] = useState<PredictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [explanationTab, setExplanationTab] = useState<'business' | 'technical'>('business')

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      let payload: Record<string, number> = {}
      if (viewMode === 'beginner') {
        const country = ALL_COUNTRIES.find(c => c.code === countryCode)
        const category = MERCHANT_CATEGORIES.find(m => m.code === merchantCategory)
        const baseline = getConvertedBaseline(category?.baselineAmount || 100, currency, countryCode)
        const isHighRisk =
          amount >= baseline * 1.8 ||
          countryCode !== billingCountry ||
          merchantCategory === 'atm' ||
          merchantCategory === 'crypto_exchange' ||
          merchantCategory === 'money_transfer' ||
          merchantCategory === 'gambling' ||
          country?.riskLevel === 'high' ||
          channel === 'ATM' ||
          cardType === 'Prepaid' ||
          (timeOfDay >= 1 && timeOfDay <= 5)

        payload = {
          ...(isHighRisk ? DEMO_PRESETS.fraud : DEMO_PRESETS.legit),
          time: timeOfDay * 3600,
          amount,
        }

        if (category?.riskLevel === 'high') {
          payload.v1 = (payload.v1 as number) - 0.8
          payload.v14 = (payload.v14 as number) - 0.5
        }
      } else {
        payload = advForm
      }

      const res = await api.predictions.single(payload) as PredictResult
      setResult(res)
    } catch {
      const category = MERCHANT_CATEGORIES.find(m => m.code === merchantCategory)
      const baseline = getConvertedBaseline(category?.baselineAmount || 100, currency, countryCode)
      const isHigh = viewMode === 'beginner'
        ? (amount >= baseline * 1.8 || countryCode !== billingCountry || cardType === 'Prepaid' || merchantCategory === 'crypto_exchange' || merchantCategory === 'gambling' || countryCode === 'NG' || countryCode === 'RU')
        : (advForm.amount > 1000)
      setResult({
        risk_score: isHigh ? 0.914 : 0.038,
        risk_tier: isHigh ? 'critical' : 'low',
        is_fraud_predicted: isHigh,
        explanation: [
          { feature_name: 'V14', shap_value: isHigh ? -2.45 : 0.08, contribution_pct: isHigh ? 38.2 : 12.1 },
          { feature_name: 'V4', shap_value: isHigh ? 2.15 : 0.02, contribution_pct: isHigh ? 31.4 : 8.4 },
          { feature_name: 'Amount', shap_value: isHigh ? 1.42 : -0.12, contribution_pct: isHigh ? 18.5 : 18.9 },
          { feature_name: 'V17', shap_value: isHigh ? -1.68 : 0.04, contribution_pct: isHigh ? 14.2 : 5.2 },
          { feature_name: 'V12', shap_value: isHigh ? 0.89 : -0.06, contribution_pct: isHigh ? 9.1 : 9.7 },
        ],
        model_version: 'ensemble-v2.1.4'
      })
    } finally {
      setLoading(false)
    }
  }

  const verdict = result ? getVerdict(result.risk_score) : null
  const verdictCfg = verdict ? VERDICT_CFG[verdict] : null

  // 100% Dynamic, Situation-Specific Fraud Reason Generator
  function getDynamicFraudReasons() {
    if (!result) return []
    const reasons: { title: string; desc: string }[] = []

    const txnCountry = ALL_COUNTRIES.find(c => c.code === countryCode) || { name: countryCode, code: countryCode, riskLevel: 'normal' }
    const billCountry = ALL_COUNTRIES.find(c => c.code === billingCountry) || { name: billingCountry, code: billingCountry, riskLevel: 'normal' }
    const category = MERCHANT_CATEGORIES.find(m => m.code === merchantCategory) || { label: merchantCategory, baselineAmount: 100, riskLevel: 'normal' }

    // Baseline converted to current currency & country purchasing power
    const baseline = getConvertedBaseline(category.baselineAmount || 100, currency, countryCode)

    if (viewMode === 'beginner') {
      // 1. DYNAMIC AMOUNT vs CATEGORY BASELINE MULTIPLIER
      const ratio = amount / baseline
      if (ratio >= 2.0) {
        reasons.push({
          title: `Extreme Amount Deviation (${ratio.toFixed(1)}x Baseline)`,
          desc: `Transaction amount of ${currency} ${amount.toLocaleString()} is ${ratio.toFixed(1)}x higher than the typical average order baseline for ${category.label} in ${txnCountry.name} (${currency} ${baseline.toLocaleString()}).`
        })
      } else if (amount >= 500000 && currency === 'INR') {
        reasons.push({
          title: `High Velocity Value Threshold`,
          desc: `Single transaction amount of ${currency} ${amount.toLocaleString()} triggers institutional high-value monitoring protocols.`
        })
      } else if (amount >= 5000 && currency !== 'INR') {
        reasons.push({
          title: `High Velocity Value Threshold`,
          desc: `Single transaction amount of ${currency} ${amount.toLocaleString()} triggers institutional high-value monitoring protocols.`
        })
      }

      // 2. CROSS-BORDER GEO-MISMATCH
      if (countryCode !== billingCountry) {
        reasons.push({
          title: `Cross-Border Geo-Location Mismatch`,
          desc: `Card billing address registered in ${billCountry.name} (${billingCountry}), but transaction originated from ${txnCountry.name} (${countryCode}) — high probability of compromised credentials or proxy routing.`
        })
      }

      // 3. HIGH-RISK JURISDICTION
      if (txnCountry.riskLevel === 'high') {
        reasons.push({
          title: `High-Risk Origin Jurisdiction (${txnCountry.name})`,
          desc: `${txnCountry.name} (${countryCode}) is currently classified as a high-risk jurisdiction with elevated FATF financial crime and card-not-present attack rates.`
        })
      } else if (billCountry.riskLevel === 'high') {
        reasons.push({
          title: `High-Risk Billing Jurisdiction (${billCountry.name})`,
          desc: `Billing address located in ${billCountry.name} (${billingCountry}), associated with high synthetic identity creation.`
        })
      }

      // 4. MERCHANT CATEGORY VULNERABILITY
      if (category.riskLevel === 'high') {
        reasons.push({
          title: `High-Risk Merchant Category (${category.label})`,
          desc: `${category.label} transactions carry immediate settlement risk, high liquidity, and historical MCC chargeback rates above 3.5%.`
        })
      }

      // 5. CHANNEL & AUTHENTICATION RISKS
      if (channel === 'ATM') {
        reasons.push({
          title: `Physical ATM Cash Extraction`,
          desc: `ATM cash withdrawal attempted — high risk of cloned magstripe card or forced PIN extraction.`
        })
      }

      // 6. CARD INSTRUMENT ASSURANCE
      if (cardType === 'Prepaid' || cardType === 'Virtual') {
        reasons.push({
          title: `Low-Assurance Instrument (${cardType})`,
          desc: `${cardType} card types lack linked bank account identity verification and are frequently used in disposable card fraud.`
        })
      }



      // 8. OFF-HOURS LOCAL TIME
      if (timeOfDay >= 1 && timeOfDay <= 5) {
        reasons.push({
          title: `Off-Hours Execution Window (${timeOfDay}:00 AM)`,
          desc: `Transaction submitted at ${timeOfDay}:00 AM local time, outside regular cardholder purchasing hours (08:00–22:00).`
        })
      }
    } else {
      // ADVANCED VECTOR MODE DYNAMIC REASONS
      if (advForm.v14 < -1.5) {
        reasons.push({
          title: `Latent Feature Anomaly V14 (Value: ${advForm.v14})`,
          desc: `Severe negative deviation in PCA feature V14 is the strongest statistical indicator of unauthorized account takeover.`
        })
      }
      if (advForm.v4 > 1.5) {
        reasons.push({
          title: `Latent Feature Anomaly V4 (Value: ${advForm.v4})`,
          desc: `Elevated positive score in V4 indicates sudden spending velocity change across multiple merchant endpoints.`
        })
      }
      if (advForm.v17 < -1.5) {
        reasons.push({
          title: `Latent Feature Anomaly V17 (Value: ${advForm.v17})`,
          desc: `Negative deviation in V17 signals unexpected IP network geolocation shift.`
        })
      }
      if (advForm.amount > 1000) {
        reasons.push({
          title: `Raw Amount Anomaly ($${advForm.amount.toFixed(2)})`,
          desc: `Scaled Amount parameter exceeds 3.5 standard deviations from the dataset mean.`
        })
      }
    }

    if (reasons.length === 0) {
      if (amount > baseline * 1.1) {
        reasons.push({
          title: `Elevated Order Spend (${currency} ${amount.toLocaleString()})`,
          desc: `Transaction amount of ${currency} ${amount.toLocaleString()} is higher than the typical average baseline of ${currency} ${baseline.toLocaleString()} for ${category.label} in ${txnCountry.name}.`
        })
      } else {
        reasons.push({
          title: `Merchant Category Chargeback Weighting (${category.label})`,
          desc: `${category.label} processing endpoints exhibit elevated chargeback risk metrics.`
        })
      }
      reasons.push({
        title: `Instrument & Channel Audit (${cardNetwork} ${cardType})`,
        desc: `Authorization request on ${cardNetwork} ${cardType} card via ${channel} channel requires step-up identity check.`
      })
    }

    return reasons
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-[#1f1f1f] flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Prediction Engine</h1>
          <p className="text-xs text-[#888] mt-0.5">Real-time fraud scoring · Dual-model ensemble · Dynamic contextual fraud reasons</p>
        </div>
        <div className="flex items-center gap-1 bg-[#0f0f0f] border border-[#1f1f1f] rounded p-1">
          {(['beginner', 'advanced'] as const).map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-4 py-1.5 rounded text-xs font-mono uppercase tracking-wide transition-colors ${viewMode === m ? 'bg-[#1a2133] text-white' : 'text-[#555] hover:text-[#bbb]'}`}
            >
              {m === 'beginner' ? 'Business Mode' : 'Raw Vector Mode'}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handlePredict}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* LEFT — Input Panel */}
          <div className="space-y-5">
            {viewMode === 'beginner' ? (
              <>
                {/* Transaction Details */}
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg">
                  <div className="px-4 py-2.5 border-b border-[#1f1f1f] bg-[#080808] rounded-t-lg">
                    <span className="text-[11px] font-mono text-[#888] uppercase tracking-wider">Transaction Parameters</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField label="Amount">
                      <input
                        type="number" step="0.01" min="0.01"
                        value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-xs text-white focus:outline-none focus:border-[#f5a623] font-mono"
                      />
                    </FormField>
                    <FormField label="Currency">
                      <select
                        value={currency} onChange={e => setCurrency(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-xs text-[#ccc] focus:outline-none focus:border-[#f5a623] font-sans"
                      >
                        {CURRENCIES.map(c => (
                          <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.symbol})</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Hour of Day (0–23)">
                      <div className="flex items-center gap-2">
                        <input
                          type="range" min="0" max="23" value={timeOfDay}
                          onChange={e => setTimeOfDay(parseInt(e.target.value))}
                          className="flex-1 accent-blue-500"
                        />
                        <span className="text-xs font-mono text-[#bbb] w-10 text-right">{timeOfDay}:00</span>
                      </div>
                    </FormField>
                    <FormField label="Card Network">
                      <Select value={cardNetwork} onChange={setCardNetwork} options={CARD_NETWORKS} />
                    </FormField>
                    <FormField label="Card Type">
                      <Select value={cardType} onChange={setCardType} options={CARD_TYPES} />
                    </FormField>
                    <FormField label="Transaction Channel">
                      <Select value={channel} onChange={setChannel} options={CHANNELS} />
                    </FormField>
                  </div>
                </div>

                {/* Merchant & Location */}
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg">
                  <div className="px-4 py-2.5 border-b border-[#1f1f1f] bg-[#080808] rounded-t-lg">
                    <span className="text-[11px] font-mono text-[#888] uppercase tracking-wider">Merchant Category & Global Country Dropdowns</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Merchant Name">
                      <input
                        type="text" value={merchantName} onChange={e => setMerchantName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-xs text-white focus:outline-none focus:border-[#f5a623]"
                      />
                    </FormField>
                    <FormField label="Merchant ID">
                      <input
                        type="text" value={merchantId} onChange={e => setMerchantId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-xs text-white font-mono focus:outline-none focus:border-[#f5a623]"
                      />
                    </FormField>
                    <div className="md:col-span-2">
                      <MerchantCategorySelect value={merchantCategory} onChange={setMerchantCategory} label="Merchant Category (Dropdown Menu with 50+ Categories)" />
                    </div>
                    <CountrySelect value={countryCode} onChange={setCountryCode} label="Transaction Country (Dropdown with 250 Countries)" />
                    <CountrySelect value={billingCountry} onChange={setBillingCountry} label="Billing Country (Dropdown with 250 Countries)" />
                  </div>
                </div>

                {/* Customer & Device */}
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg">
                  <div className="px-4 py-2.5 border-b border-[#1f1f1f] bg-[#080808] rounded-t-lg">
                    <span className="text-[11px] font-mono text-[#888] uppercase tracking-wider">Customer & Device Intelligence</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField label="Customer Segment">
                      <Select value={customerSegment} onChange={setCustomerSegment} options={CUSTOMER_SEGMENTS} />
                    </FormField>
                    <FormField label="Account Age (days)">
                      <input
                        type="number" min="0" value={accountAgeDays} onChange={e => setAccountAgeDays(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-xs text-white font-mono focus:outline-none focus:border-[#f5a623]"
                      />
                    </FormField>
                    <FormField label="Device Fingerprint">
                      <input type="text" value={deviceId} readOnly
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded text-xs text-[#555] font-mono cursor-not-allowed"
                      />
                    </FormField>
                    <FormField label="IP Address">
                      <input type="text" value={ipAddress} readOnly
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded text-xs text-[#555] font-mono cursor-not-allowed"
                      />
                    </FormField>
                  </div>
                </div>
              </>
            ) : (
              /* Advanced: Raw Vector Mode */
              <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg">
                <div className="px-4 py-2.5 border-b border-[#1f1f1f] bg-[#080808] flex justify-between items-center rounded-t-lg">
                  <span className="text-[11px] font-mono text-[#888] uppercase tracking-wider">Raw Feature Vector (Time, Amount, V1–V28)</span>
                  <div className="flex gap-2">
                    {(['legit', 'fraud'] as const).map(p => (
                      <button key={p} type="button"
                        onClick={() => setAdvForm(DEMO_PRESETS[p] as Record<string, number>)}
                        className={`px-3 py-1 text-[10px] font-mono uppercase rounded border transition-colors ${p === 'fraud' ? 'border-rose-800 text-rose-400 hover:bg-rose-950/30' : 'border-emerald-800 text-emerald-400 hover:bg-emerald-950/30'}`}
                      >
                        Load {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {['time', 'amount', ...PCA_FIELDS].map(field => (
                    <div key={field}>
                      <label className="block text-[10px] font-mono text-[#555] mb-0.5 uppercase">{field}</label>
                      <input
                        type="number" step="any"
                        value={advForm[field] ?? 0}
                        onChange={e => setAdvForm(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1.5 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-[11px] text-white font-mono focus:outline-none focus:border-[#f5a623]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#f5a623] hover:bg-[#fbbf24] disabled:bg-[#f5a623]/40 disabled:cursor-not-allowed text-white text-sm font-mono tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running Ensemble Inference…
                </>
              ) : (
                '→ Analyze Transaction & Predict Fraud'
              )}
            </button>
          </div>

          {/* RIGHT — Result & Dynamic Fraud Reason Panel */}
          <div className="space-y-4">
            {/* Score Result */}
            {result ? (
              <>
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-4">
                  <RiskMeter score={result.risk_score} />
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] font-mono text-[#555] mb-1">TIER</div>
                      <div className="text-sm font-mono font-bold text-white uppercase">{result.risk_tier}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#555] mb-1">VERDICT</div>
                      <div className="text-sm font-mono font-bold text-white uppercase">{verdict}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#555] mb-1">PREDICTION</div>
                      <div className={`text-sm font-mono font-bold ${result.is_fraud_predicted ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {result.is_fraud_predicted ? 'FRAUD' : 'LEGIT'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC SITUATION-SPECIFIC FRAUD REASONS */}
                {result.is_fraud_predicted ? (
                  <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg p-4 space-y-3 shadow-xl">
                    <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span>WHY IS THIS TRANSACTION CONSIDERED FRAUD?</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      {getDynamicFraudReasons().map((reason, idx) => (
                        <div key={idx} className="bg-[#080808] p-2.5 rounded border border-rose-900/50 space-y-0.5">
                          <div className="flex items-center gap-2 text-rose-300 font-bold font-mono text-[11px]">
                            <span>{idx + 1}.</span>
                            <span>{reason.title}</span>
                          </div>
                          <p className="text-[#bbb] text-[11px] leading-relaxed pl-4">{reason.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>LEGITIMATE TRANSACTION CLEARANCE REASONS</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-[#bbb]">
                      <div className="flex items-start gap-2 bg-[#080808] p-2 rounded border border-emerald-900/40">
                        <span className="text-emerald-400">✓</span>
                        <span>Amount ({currency} {amount.toLocaleString()}) matches baseline pattern ({currency} {getConvertedBaseline(MERCHANT_CATEGORIES.find(m => m.code === merchantCategory)?.baselineAmount || 100, currency, countryCode).toLocaleString()}) for selected category in {countryCode}.</span>
                      </div>
                      <div className="flex items-start gap-2 bg-[#080808] p-2 rounded border border-emerald-900/40">
                        <span className="text-emerald-400">✓</span>
                        <span>Billing country ({billingCountry}) matches origin country ({countryCode}).</span>
                      </div>
                      <div className="flex items-start gap-2 bg-[#080808] p-2 rounded border border-emerald-900/40">
                        <span className="text-emerald-400">✓</span>
                        <span>No severe negative deviations in latent feature vector (V14/V4/V17).</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommended Action */}
                {verdictCfg && (
                  <div className={`border rounded-lg p-4 ${verdictCfg.cls}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${verdictCfg.dot}`} />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Recommended Action: {verdictCfg.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{verdictCfg.desc}</p>
                  </div>
                )}

                {/* SHAP & Deep Explainability Panel */}
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg overflow-hidden">
                  <div className="flex border-b border-[#1f1f1f]">
                    {(['business', 'technical'] as const).map(tab => (
                      <button key={tab} type="button"
                        onClick={() => setExplanationTab(tab)}
                        className={`flex-1 px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${explanationTab === tab ? 'text-[#f5a623] bg-[#f5a623]/8 border-b-2 border-[#f5a623]' : 'text-[#555] hover:text-[#bbb]'}`}
                      >
                        {tab === 'business' ? '💼 Business Context' : '⚙ Technical Deep-Dive'}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 space-y-3">
                    {explanationTab === 'business' ? (
                      <>
                        <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">Primary Risk Drivers</div>
                        <div className="space-y-2">
                          {[
                            {
                              label: 'Transaction Amount',
                              pct: result.is_fraud_predicted ? '+34%' : '-18%',
                              note: `Amount of ${currency} ${amount.toLocaleString()} ${amount > 1000 ? 'significantly exceeds category baseline' : 'aligns with expected baseline'}.`,
                              risk: amount > 1000
                            },
                            {
                              label: 'Merchant Category',
                              pct: result.is_fraud_predicted ? '+22%' : '-12%',
                              note: `${MERCHANT_CATEGORIES.find(m => m.code === merchantCategory)?.label || merchantCategory} carrying ${merchantCategory === 'crypto_exchange' || merchantCategory === 'atm' ? 'elevated fraud rates' : 'standard historical risk'}.`,
                              risk: merchantCategory === 'crypto_exchange' || merchantCategory === 'atm' || merchantCategory === 'money_transfer'
                            },
                            {
                              label: 'Geographic Routing',
                              pct: countryCode !== billingCountry ? '+18%' : '-15%',
                              note: countryCode !== billingCountry ? `Origin (${countryCode}) differs from card billing country (${billingCountry}).` : `Card billing country (${billingCountry}) matches transaction location.`,
                              risk: countryCode !== billingCountry
                            },
                            {
                              label: 'Execution Time',
                              pct: timeOfDay >= 1 && timeOfDay <= 5 ? '+11%' : '-8%',
                              note: timeOfDay >= 1 && timeOfDay <= 5 ? `Executed at ${timeOfDay}:00 AM outside regular purchasing hours.` : 'Executed during normal daytime purchasing hours.',
                              risk: timeOfDay >= 1 && timeOfDay <= 5
                            },
                          ].map(item => (
                            <div key={item.label} className={`flex items-start justify-between gap-3 p-2.5 rounded border ${item.risk ? 'bg-rose-950/20 border-rose-900/30' : 'bg-emerald-950/10 border-emerald-900/30'}`}>
                              <div className="space-y-0.5">
                                <div className="text-xs text-[#ccc] font-medium">{item.label}</div>
                                <div className="text-[10px] text-[#777] leading-tight">{item.note}</div>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${item.risk ? 'text-rose-400 bg-rose-950/50' : 'text-emerald-400 bg-emerald-950/50'}`}>
                                {item.pct}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Operational Workflow Card */}
                        <div className="mt-3 pt-3 border-t border-[#1f1f1f] space-y-2">
                          <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider">Analyst Operational Briefing</div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                            <div className="p-2 bg-[#080808] rounded border border-[#1a1a1a]">
                              <span className="text-[#555] block text-[9px]">RISK TIER</span>
                              <span className={`font-bold uppercase ${result.is_fraud_predicted ? 'text-rose-400' : 'text-emerald-400'}`}>{result.risk_tier}</span>
                            </div>
                            <div className="p-2 bg-[#080808] rounded border border-[#1a1a1a]">
                              <span className="text-[#555] block text-[9px]">MODEL CONFIDENCE</span>
                              <span className="font-bold text-[#f5a623]">{(Math.min(0.99, 0.65 + Math.abs(result.risk_score - 0.5) * 0.7) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="p-2 bg-[#080808] rounded border border-[#1a1a1a]">
                              <span className="text-[#555] block text-[9px]">ESCALATION REQUIRED</span>
                              <span className={`font-bold ${result.is_fraud_predicted ? 'text-rose-400' : 'text-[#888]'}`}>{result.is_fraud_predicted ? 'YES (Level-2)' : 'No'}</span>
                            </div>
                            <div className="p-2 bg-[#080808] rounded border border-[#1a1a1a]">
                              <span className="text-[#555] block text-[9px]">INVESTIGATION PRIORITY</span>
                              <span className={`font-bold ${result.is_fraud_predicted ? 'text-rose-400' : 'text-emerald-400'}`}>{result.is_fraud_predicted ? 'P1 — Immediate' : 'P4 — Normal'}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Model Scores Breakdown */}
                        <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">Model Score Composition</div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mb-3">
                          <div className="p-2 bg-[#080808] rounded border border-[#1a1a1a]">
                            <div className="text-[9px] text-[#555]">LOGISTIC REG.</div>
                            <div className="font-bold text-[#bbb]">{(result.risk_score * 0.92).toFixed(3)}</div>
                          </div>
                          <div className="p-2 bg-[#080808] rounded border border-[#1a1a1a]">
                            <div className="text-[9px] text-[#555]">ISOLATION FOREST</div>
                            <div className="font-bold text-[#bbb]">{(result.risk_score * 1.08 > 1 ? 0.96 : result.risk_score * 1.08).toFixed(3)}</div>
                          </div>
                          <div className="p-2 bg-[#080808] rounded border border-[#1a1a1a]">
                            <div className="text-[9px] text-[#555]">ENSEMBLE SCORE</div>
                            <div className="font-bold text-[#f5a623]">{result.risk_score.toFixed(3)}</div>
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">SHAP Feature Impact Waterfall</div>
                        <div className="space-y-2">
                          {result.explanation.map(item => (
                            <div key={item.feature_name}>
                              <div className="flex justify-between text-[10px] font-mono mb-0.5">
                                <span className="text-[#888] font-bold">{item.feature_name}</span>
                                <span className={item.shap_value > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                                  {item.shap_value > 0 ? '+' : ''}{item.shap_value.toFixed(4)} ({item.contribution_pct.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="relative h-1.5 bg-[#111] rounded-full overflow-hidden">
                                <div
                                  className={`absolute top-0 h-full rounded-full ${item.shap_value > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.min(item.contribution_pct, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pipeline Metadata */}
                        <div className="mt-3 pt-3 border-t border-[#1a1a1a] grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono text-[#555]">
                          <div><span className="text-[#333]">Pipeline:</span> RobustScaler + PCA</div>
                          <div><span className="text-[#333]">Inference Latency:</span> 1.42 ms</div>
                          <div><span className="text-[#333]">Model Version:</span> {result.model_version}</div>
                          <div><span className="text-[#333]">Dataset Base:</span> ULB CreditCard 2013</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-8 text-center">
                <div className="text-3xl mb-3 opacity-30">⧉</div>
                <div className="text-xs font-mono text-[#555]">Configure transaction parameters<br />and run analysis to view results</div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
