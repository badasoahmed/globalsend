export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "NGN" | "INR" | "MXN" | "PHP";

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  flag: string;
  symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", symbol: "¥" },
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬", symbol: "₦" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", symbol: "₹" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽", symbol: "MX$" },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭", symbol: "₱" },
];

export const CURRENCY_MAP: Record<string, CurrencyInfo> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
);

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "EU", name: "European Union", flag: "🇪🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
];

export const COUNTRY_MAP: Record<string, CountryInfo> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
);

export function getCountryFlag(countryCode: string): string {
  return COUNTRY_MAP[countryCode]?.flag ?? "🌍";
}

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCY_MAP[code] ?? { code: code as CurrencyCode, name: code, flag: "💱", symbol: code };
}

export function formatCurrency(amount: number, currency: string): string {
  const info = getCurrencyInfo(currency);
  if (currency === "JPY" || currency === "NGN") {
    return `${info.symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${info.symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const FLAT_FEE = 2;
export const PERCENTAGE_FEE = 0.01;

export function calculateFee(amount: number): number {
  return FLAT_FEE + amount * PERCENTAGE_FEE;
}

export function calculateTotal(amount: number): number {
  return amount + calculateFee(amount);
}
