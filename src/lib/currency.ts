/**
 * Qtuor — Currency Converter Utility
 *
 * Static exchange rates (USD-based) for the plans page currency switcher.
 * In production, these should be fetched from a live API (e.g. exchangerate.host).
 * For the demo, rates are approximate as of mid-2026 and manually updated.
 */

export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  flag: string
  rate: number // 1 USD = X in this currency
  locale: string
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar',           symbol: '$',   flag: '🇺🇸', rate: 1,      locale: 'en-US' },
  { code: 'PKR', name: 'Pakistani Rupee',     symbol: 'Rs',  flag: '🇵🇰', rate: 282.50, locale: 'ur-PK' },
  { code: 'GBP', name: 'British Pound',       symbol: '£',   flag: '🇬🇧', rate: 0.79,   locale: 'en-GB' },
  { code: 'EUR', name: 'Euro',                symbol: '€',   flag: '🇪🇺', rate: 0.92,   locale: 'de-DE' },
  { code: 'SAR', name: 'Saudi Riyal',         symbol: '﷼',   flag: '🇸🇦', rate: 3.75,   locale: 'ar-SA' },
  { code: 'AED', name: 'UAE Dirham',          symbol: 'د.إ', flag: '🇦🇪', rate: 3.67,   locale: 'ar-AE' },
  { code: 'CAD', name: 'Canadian Dollar',     symbol: 'C$',  flag: '🇨🇦', rate: 1.37,   locale: 'en-CA' },
  { code: 'MYR', name: 'Malaysian Ringgit',   symbol: 'RM',  flag: '🇲🇾', rate: 4.42,   locale: 'ms-MY' },
  { code: 'QAR', name: 'Qatari Riyal',        symbol: '﷼',   flag: '🇶🇦', rate: 3.64,   locale: 'ar-QA' },
  { code: 'KWD', name: 'Kuwaiti Dinar',       symbol: 'د.ك', flag: '🇰🇼', rate: 0.31,   locale: 'ar-KW' },
  { code: 'BHD', name: 'Bahraini Dinar',      symbol: 'د.ب', flag: '🇧🇭', rate: 0.38,   locale: 'ar-BH' },
  { code: 'OMR', name: 'Omani Rial',          symbol: 'ر.ع.',flag: '🇴🇲', rate: 0.38,   locale: 'ar-OM' },
  { code: 'TRY', name: 'Turkish Lira',        symbol: '₺',   flag: '🇹🇷', rate: 32.45,  locale: 'tr-TR' },
  { code: 'IDR', name: 'Indonesian Rupiah',   symbol: 'Rp',  flag: '🇮🇩', rate: 16250,  locale: 'id-ID' },
  { code: 'ZAR', name: 'South African Rand',  symbol: 'R',   flag: '🇿🇦', rate: 18.25,  locale: 'en-ZA' },
]

/** Default currency for the platform (Pakistan-focused) */
export const DEFAULT_CURRENCY = 'PKR'

/**
 * Convert a USD amount to the target currency.
 */
export function convertFromUSD(usdAmount: number, targetCurrency: string): number {
  const currency = CURRENCIES.find((c) => c.code === targetCurrency)
  if (!currency) return usdAmount
  return usdAmount * currency.rate
}

/**
 * Format a price in the target currency with proper symbol and decimals.
 */
export function formatPrice(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode)
  if (!currency) return `$${amount.toFixed(2)}`

  // For currencies with very large denominations (IDR, PKR), show no decimals
  // For currencies with small denominations (KWD, BHD, OMR), show 3 decimals
  // For others, show 2 decimals
  let decimals = 2
  if (currency.rate >= 100) decimals = 0
  else if (currency.rate < 1) decimals = 3

  const formatted = amount.toFixed(decimals)

  // Use symbol + amount format
  return `${currency.symbol}${formatted}`
}

/**
 * Format a price with both symbol and currency code (for the converter display).
 */
export function formatPriceWithCode(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode)
  if (!currency) return `$${amount.toFixed(2)} USD`

  let decimals = 2
  if (currency.rate >= 100) decimals = 0
  else if (currency.rate < 1) decimals = 3

  const formatted = amount.toFixed(decimals)
  return `${currency.symbol}${formatted} ${currency.code}`
}
