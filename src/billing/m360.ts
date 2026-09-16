import { findM360AccountByReference, getM360AccountTenantName } from './m360Accounts'
import type { RegisteredOrganization } from '../providerAdmin/organizations'
import type { ProviderCatalogDraft } from '../providerSetup/storage'
import { resolveRateCard, type RateCard } from '../providerSetup/templateDemo'

export type M360ConnectionStatus = 'connected' | 'pending' | 'not_found'

export type M360RatePricingStatus = 'configured' | 'missing'

export type CatalogItemM360Pricing = {
  status: M360RatePricingStatus
  hourlyRate: number | null
  label: string
}

const M360_CONFIGURED_RATES_STORAGE_KEY = 'osac-m360-configured-catalog-rates'

/** Catalog items that ship without an M360 rate in the demo seed. */
export const DEMO_UNCONFIGURED_M360_CATALOG_ITEM_IDS = new Set([
  'cat-bm-dense-gpu',
])

export const M360_RATE_CARD_PORTAL_URL = 'https://m360.example.com/rate-cards'

export const DEMO_PROJECT_BUDGET_REMAINING_USD = 53

export function getOrganizationDisplayName(organization: RegisteredOrganization): string {
  return organization.displayName?.trim() || organization.name
}

export function getOrganizationM360AccountId(organization: RegisteredOrganization): string {
  return getOrganizationM360TenantName(organization)
}

export function getOrganizationM360TenantName(organization: RegisteredOrganization): string {
  const reference =
    organization.m360AccountId?.trim() || organization.billingAccountId.trim()
  if (!reference) {
    return ''
  }

  const account = findM360AccountByReference(reference)
  return account ? getM360AccountTenantName(account) : reference
}

export function getOrganizationM360ConnectionStatus(
  organization: RegisteredOrganization,
): M360ConnectionStatus {
  if (organization.m360ConnectionStatus) {
    return organization.m360ConnectionStatus
  }

  return resolveM360ConnectionStatus(getOrganizationM360AccountId(organization))
}

export function resolveM360ConnectionStatus(tenantName: string): M360ConnectionStatus {
  const normalized = tenantName.trim()
  if (!normalized) {
    return 'pending'
  }

  if (findM360AccountByReference(normalized)) {
    return 'connected'
  }

  return 'not_found'
}

export function formatM360ConnectionStatusLabel(status: M360ConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected'
    case 'pending':
      return 'Pending validation'
    case 'not_found':
      return 'Account not found'
  }
}

export function getM360ConnectionStatusColor(
  status: M360ConnectionStatus,
): 'green' | 'orange' | 'red' {
  switch (status) {
    case 'connected':
      return 'green'
    case 'pending':
      return 'orange'
    case 'not_found':
      return 'red'
  }
}

function readConfiguredCatalogRateIds(): Set<string> {
  try {
    const raw = localStorage.getItem(M360_CONFIGURED_RATES_STORAGE_KEY)
    if (!raw) {
      return new Set()
    }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return new Set()
    }

    return new Set(parsed.filter((value): value is string => typeof value === 'string'))
  } catch {
    return new Set()
  }
}

function writeConfiguredCatalogRateIds(ids: Set<string>): void {
  localStorage.setItem(M360_CONFIGURED_RATES_STORAGE_KEY, JSON.stringify(Array.from(ids)))
}

export function isCatalogItemM360RateConfigured(catalogItemId: string): boolean {
  if (readConfiguredCatalogRateIds().has(catalogItemId)) {
    return true
  }

  return !DEMO_UNCONFIGURED_M360_CATALOG_ITEM_IDS.has(catalogItemId)
}

export function markCatalogItemM360RateConfigured(catalogItemId: string): void {
  const next = readConfiguredCatalogRateIds()
  next.add(catalogItemId)
  writeConfiguredCatalogRateIds(next)
}

export function getCatalogItemM360Pricing(
  item: Pick<ProviderCatalogDraft, 'catalogItemId' | 'rateCard'>,
): CatalogItemM360Pricing {
  const rateCard = resolveRateCard(item)
  const configured = isCatalogItemM360RateConfigured(item.catalogItemId)

  if (!configured) {
    return {
      status: 'missing',
      hourlyRate: null,
      label: 'Unconfigured / Rate missing',
    }
  }

  return {
    status: 'configured',
    hourlyRate: rateCard.hourlyRate,
    label: `Configured: $${rateCard.hourlyRate.toFixed(2)}/hr`,
  }
}

export function canPublishCatalogItemToTenants(
  item: Pick<ProviderCatalogDraft, 'catalogItemId' | 'rateCard'>,
): boolean {
  return getCatalogItemM360Pricing(item).status === 'configured'
}

export function getM360RateCardConfigureUrl(catalogItemId: string): string {
  return `${M360_RATE_CARD_PORTAL_URL}?sku=${encodeURIComponent(catalogItemId)}`
}

export function formatHourlyEstimate(rateCard: RateCard): string {
  return `$${rateCard.hourlyRate.toFixed(2)}/hr`
}

export function estimateLaunchHourlyCost(options: {
  catalogItem: Pick<ProviderCatalogDraft, 'catalogItemId' | 'rateCard'>
  instanceType?: string
  bootDiskSizeGiB?: number
}): number | null {
  const pricing = getCatalogItemM360Pricing(options.catalogItem)
  if (pricing.status !== 'configured' || pricing.hourlyRate === null) {
    return null
  }

  let hourly = pricing.hourlyRate
  const bootDiskGiB = options.bootDiskSizeGiB ?? 0
  if (bootDiskGiB > 100) {
    hourly += ((bootDiskGiB - 100) / 100) * 0.05
  }

  const instanceType = options.instanceType?.toLowerCase() ?? ''
  if (instanceType.includes('gpu') || instanceType.includes('a100')) {
    hourly *= 1.08
  }

  return hourly
}

export function formatLaunchCostEstimate(hourly: number | null): string {
  if (hourly === null) {
    return 'Rate unavailable'
  }

  return `Est. ${formatHourlyEstimate({ hourlyRate: hourly, monthlyRate: 0, currency: 'USD', billingUnit: 'per-instance' })}`
}

export function listUnpricedCatalogItems(
  items: ProviderCatalogDraft[],
): ProviderCatalogDraft[] {
  return items.filter((item) => !canPublishCatalogItemToTenants(item))
}

/** Publish wizard guardrail for templates that map to demo unpriced SKUs. */
export function isTemplateM360RateConfigured(templateRefId: string): boolean {
  if (templateRefId === 'bm-hpe-dl380-a100') {
    return isCatalogItemM360RateConfigured('cat-bm-dense-gpu')
  }

  return true
}
