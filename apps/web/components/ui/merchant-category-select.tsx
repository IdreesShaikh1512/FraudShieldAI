'use client'

export interface MerchantCategory {
  code: string
  label: string
  icon: string
  group: string
  baselineAmount: number // average expected order amount in USD/EUR
  riskLevel?: 'high' | 'medium' | 'normal'
}

export const MERCHANT_CATEGORIES: MerchantCategory[] = [
  // Retail
  { code: 'grocery', label: 'Grocery & Supermarkets', icon: '🛒', group: 'Retail', baselineAmount: 65 },
  { code: 'online_retail', label: 'Online Retail / eCommerce', icon: '🛍️', group: 'Retail', baselineAmount: 85, riskLevel: 'medium' },
  { code: 'department_store', label: 'Department Stores', icon: '🏬', group: 'Retail', baselineAmount: 140 },
  { code: 'clothing', label: 'Clothing & Apparel', icon: '👗', group: 'Retail', baselineAmount: 110 },
  { code: 'electronics', label: 'Electronics & Tech', icon: '💻', group: 'Retail', baselineAmount: 450 },
  { code: 'home_improvement', label: 'Home Improvement', icon: '🔧', group: 'Retail', baselineAmount: 180 },
  { code: 'furniture', label: 'Furniture & Home Goods', icon: '🛋️', group: 'Retail', baselineAmount: 650 },
  { code: 'sporting_goods', label: 'Sporting Goods', icon: '⚽', group: 'Retail', baselineAmount: 95 },
  { code: 'books_media', label: 'Books, Music & Video', icon: '📚', group: 'Retail', baselineAmount: 35 },
  { code: 'jewelry', label: 'Jewelry & Luxury Goods', icon: '💎', group: 'Retail', baselineAmount: 1200, riskLevel: 'medium' },
  { code: 'pawn_shops', label: 'Pawn Shops & Liquidation', icon: '🏷️', group: 'Retail', baselineAmount: 300, riskLevel: 'high' },
  { code: 'gift_cards', label: 'Gift Cards & Prepaid Vouchers', icon: '🎁', group: 'Retail', baselineAmount: 250, riskLevel: 'high' },
  // Food & Beverage
  { code: 'restaurant', label: 'Restaurants & Dining', icon: '🍽️', group: 'Food & Beverage', baselineAmount: 55 },
  { code: 'fast_food', label: 'Fast Food & QSR', icon: '🍔', group: 'Food & Beverage', baselineAmount: 18 },
  { code: 'cafe', label: 'Cafes & Coffee Shops', icon: '☕', group: 'Food & Beverage', baselineAmount: 12 },
  { code: 'bar_alcohol', label: 'Bars & Alcohol Vendors', icon: '🍺', group: 'Food & Beverage', baselineAmount: 45 },
  { code: 'food_delivery', label: 'Food Delivery Services', icon: '🚴', group: 'Food & Beverage', baselineAmount: 32 },
  // Travel
  { code: 'airline', label: 'Airlines & Air Travel', icon: '✈️', group: 'Travel', baselineAmount: 420, riskLevel: 'medium' },
  { code: 'hotel', label: 'Hotels & Lodging', icon: '🏨', group: 'Travel', baselineAmount: 280, riskLevel: 'medium' },
  { code: 'car_rental', label: 'Car Rentals', icon: '🚗', group: 'Travel', baselineAmount: 190 },
  { code: 'cruise', label: 'Cruise Lines', icon: '🛳️', group: 'Travel', baselineAmount: 1500, riskLevel: 'medium' },
  { code: 'travel_agency', label: 'Travel Agencies & OTAs', icon: '🗺️', group: 'Travel', baselineAmount: 350, riskLevel: 'medium' },
  { code: 'ride_sharing', label: 'Ride Sharing (Uber, Lyft)', icon: '🚕', group: 'Travel', baselineAmount: 24 },
  { code: 'parking', label: 'Parking & Tolls', icon: '🅿️', group: 'Travel', baselineAmount: 15 },
  // Financial Services
  { code: 'atm', label: 'ATM Cash Withdrawal', icon: '🏧', group: 'Financial Services', baselineAmount: 200, riskLevel: 'high' },
  { code: 'bank_transfer', label: 'Wire / Bank Transfer', icon: '🏦', group: 'Financial Services', baselineAmount: 1500, riskLevel: 'high' },
  { code: 'money_transfer', label: 'Money Transfer (Western Union)', icon: '💸', group: 'Financial Services', baselineAmount: 400, riskLevel: 'high' },
  { code: 'crypto_exchange', label: 'Cryptocurrency Exchange', icon: '₿', group: 'Financial Services', baselineAmount: 500, riskLevel: 'high' },
  { code: 'forex', label: 'Forex & Currency Exchange', icon: '💱', group: 'Financial Services', baselineAmount: 800, riskLevel: 'high' },
  { code: 'investment', label: 'Investment Brokerage', icon: '📈', group: 'Financial Services', baselineAmount: 1000, riskLevel: 'medium' },
  { code: 'insurance', label: 'Insurance Premium Payment', icon: '🛡️', group: 'Financial Services', baselineAmount: 220 },
  { code: 'tax_services', label: 'Tax & Accounting Services', icon: '📋', group: 'Financial Services', baselineAmount: 350 },
  // Digital & Subscriptions
  { code: 'streaming', label: 'Streaming Services', icon: '📺', group: 'Digital & Subscriptions', baselineAmount: 15 },
  { code: 'gaming', label: 'Gaming & In-App Purchases', icon: '🎮', group: 'Digital & Subscriptions', baselineAmount: 45, riskLevel: 'medium' },
  { code: 'software_saas', label: 'Software & Cloud SaaS', icon: '🖥️', group: 'Digital & Subscriptions', baselineAmount: 90 },
  { code: 'domain_hosting', label: 'Domain Registration & Hosting', icon: '🌐', group: 'Digital & Subscriptions', baselineAmount: 30, riskLevel: 'medium' },
  { code: 'digital_advertising', label: 'Digital Advertising (Ads)', icon: '📢', group: 'Digital & Subscriptions', baselineAmount: 250 },
  { code: 'marketplace', label: 'Online Marketplace (eBay, Etsy)', icon: '🏪', group: 'Digital & Subscriptions', baselineAmount: 75, riskLevel: 'medium' },
  // Healthcare
  { code: 'pharmacy', label: 'Pharmacy & Drug Stores', icon: '💊', group: 'Healthcare', baselineAmount: 48 },
  { code: 'hospital', label: 'Hospitals & Medical Services', icon: '🏥', group: 'Healthcare', baselineAmount: 320 },
  { code: 'dental', label: 'Dental Clinics', icon: '🦷', group: 'Healthcare', baselineAmount: 210 },
  { code: 'veterinary', label: 'Veterinary Services', icon: '🐾', group: 'Healthcare', baselineAmount: 130 },
  { code: 'telehealth', label: 'Telehealth & Remote Care', icon: '📱', group: 'Healthcare', baselineAmount: 60 },
  // Government & Utilities
  { code: 'utility', label: 'Utilities (Electric, Water)', icon: '⚡', group: 'Government & Utilities', baselineAmount: 110 },
  { code: 'telecom', label: 'Telecom & Mobile Bills', icon: '📡', group: 'Government & Utilities', baselineAmount: 70 },
  { code: 'government', label: 'Government Services & Taxes', icon: '🏛️', group: 'Government & Utilities', baselineAmount: 250 },
  { code: 'postal', label: 'Postal & Courier Services', icon: '📦', group: 'Government & Utilities', baselineAmount: 25 },
  // High Risk
  { code: 'gambling', label: 'Gambling & Sports Betting', icon: '🎰', group: 'High Risk', baselineAmount: 150, riskLevel: 'high' },
  { code: 'adult_content', label: 'Adult Content Services', icon: '🔞', group: 'High Risk', baselineAmount: 30, riskLevel: 'high' },
  { code: 'tobacco', label: 'Tobacco & Vaping Stores', icon: '🚬', group: 'High Risk', baselineAmount: 50, riskLevel: 'medium' },
  { code: 'bail_bonds', label: 'Bail Bond Services', icon: '⚖️', group: 'High Risk', baselineAmount: 1000, riskLevel: 'high' },
  { code: 'unlicensed_pharma', label: 'Online Pharmacy (Unlicensed)', icon: '⚠️', group: 'High Risk', baselineAmount: 120, riskLevel: 'high' },
  // Fuel & Auto
  { code: 'gas_station', label: 'Gas Stations & Fuel', icon: '⛽', group: 'Fuel & Auto', baselineAmount: 45 },
  { code: 'auto_dealer', label: 'Auto Dealers & Sales', icon: '🚘', group: 'Fuel & Auto', baselineAmount: 2500 },
  { code: 'auto_parts', label: 'Auto Parts & Repairs', icon: '🔩', group: 'Fuel & Auto', baselineAmount: 160 },
  // Education
  { code: 'education', label: 'Education & University Tuition', icon: '🎓', group: 'Education', baselineAmount: 1200 },
  { code: 'elearning', label: 'eLearning Platforms', icon: '💡', group: 'Education', baselineAmount: 60 },
]

const GROUPS = [...new Set(MERCHANT_CATEGORIES.map(m => m.group))]

interface MerchantCategorySelectProps {
  value: string
  onChange: (code: string) => void
  label?: string
  id?: string
}

export function MerchantCategorySelect({ value, onChange, label = 'Merchant Category', id = 'merchant-cat' }: MerchantCategorySelectProps) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-xs text-[#bbb] mb-1">{label}</label>}
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-[#0e0e0e] border border-[#1f1f1f] rounded text-xs text-[#ccc] focus:outline-none focus:border-[#f5a623] font-sans cursor-pointer"
      >
        {GROUPS.map(group => (
          <optgroup key={group} label={`── ${group.toUpperCase()} ──`} className="bg-[#080808] text-[#888] font-mono">
            {MERCHANT_CATEGORIES.filter(m => m.group === group).map(m => (
              <option key={m.code} value={m.code} className="bg-[#0e0e0e] text-[#ccc] font-sans py-1">
                {m.icon} {m.label} {m.riskLevel ? `[${m.riskLevel.toUpperCase()} RISK]` : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}
