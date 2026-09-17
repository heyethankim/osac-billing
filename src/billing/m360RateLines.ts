import type { CatalogServiceId } from '../providerSetup/templateDemo'
import type { RateCard } from '../providerSetup/templateDemo'
import type { ProviderCatalogDraft } from '../providerSetup/storage'
import { DEFAULT_ONBOARDING_RATE_CARD_ID } from './m360Accounts'

export type M360BillableService = CatalogServiceId

export type M360RateLineBillingUnit = 'per-instance' | 'per-endpoint'

export type M360RateLine = {
  id: string
  rateCardId: string
  serviceId: M360BillableService
  resourceLabel: string
  resourceShortLabel: string
  hourlyRate: number
  monthlyRate: number
  currency: string
  billingUnit: M360RateLineBillingUnit
  catalogItemId?: string
  instanceTypeId?: string
}

export const DEFAULT_M360_RATE_CARD_ID = DEFAULT_ONBOARDING_RATE_CARD_ID

const DEMO_CATALOG_ITEM_IDS = {
  bareMetalGpuTraining: 'cat-bm-gpu-training',
  bareMetalDenseGpu: 'cat-bm-dense-gpu',
  clusterNodeSets: 'cat-node-sets-fc430',
  vmNetworkAttachments: 'cat-vm-net-attach',
} as const

function line(
  partial: Omit<M360RateLine, 'currency'> & { currency?: string },
): M360RateLine {
  return {
    currency: 'USD',
    ...partial,
  }
}

/** Billable SKU lines seeded per M360 rate card profile. */
export const DEMO_M360_RATE_LINES: M360RateLine[] = [
  // Enterprise — US
  line({
    id: 'line-enterprise-us-bm-small',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'baremetal',
    resourceLabel: 'Small · 16 vCPU · 128 GB · CPU-only',
    resourceShortLabel: 'Bare metal — Small',
    hourlyRate: 3.2,
    monthlyRate: 2150,
    billingUnit: 'per-instance',
    instanceTypeId: 'small',
  }),
  line({
    id: 'line-enterprise-us-bm-medium',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'baremetal',
    resourceLabel: 'Medium · 32 vCPU · 256 GB · A100 40 GB',
    resourceShortLabel: 'Bare metal — Medium',
    hourlyRate: 8.5,
    monthlyRate: 5200,
    billingUnit: 'per-instance',
    catalogItemId: DEMO_CATALOG_ITEM_IDS.bareMetalDenseGpu,
    instanceTypeId: 'medium',
  }),
  line({
    id: 'line-enterprise-us-bm-large',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'baremetal',
    resourceLabel: 'Large · 64 vCPU · 512 GB · A100 80 GB',
    resourceShortLabel: 'Bare metal — Large',
    hourlyRate: 4.25,
    monthlyRate: 2850,
    billingUnit: 'per-instance',
    catalogItemId: DEMO_CATALOG_ITEM_IDS.bareMetalGpuTraining,
    instanceTypeId: 'large',
  }),
  line({
    id: 'line-enterprise-us-cluster-small',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'cluster',
    resourceLabel: 'OpenShift small · 3 control plane · 3 workers',
    resourceShortLabel: 'Cluster — OpenShift small',
    hourlyRate: 22,
    monthlyRate: 14800,
    billingUnit: 'per-instance',
    catalogItemId: DEMO_CATALOG_ITEM_IDS.clusterNodeSets,
    instanceTypeId: 'ocp-small',
  }),
  line({
    id: 'line-enterprise-us-cluster-medium',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'cluster',
    resourceLabel: 'OpenShift medium · 3 control plane · 6 workers',
    resourceShortLabel: 'Cluster — OpenShift medium',
    hourlyRate: 38,
    monthlyRate: 25500,
    billingUnit: 'per-instance',
    instanceTypeId: 'ocp-medium',
  }),
  line({
    id: 'line-enterprise-us-cluster-gpu',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'cluster',
    resourceLabel: 'OpenShift GPU · 3 control plane · 2 GPU workers',
    resourceShortLabel: 'Cluster — OpenShift GPU',
    hourlyRate: 52,
    monthlyRate: 34800,
    billingUnit: 'per-instance',
    instanceTypeId: 'ocp-gpu',
  }),
  line({
    id: 'line-enterprise-us-vm-small',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'virtual-machine',
    resourceLabel: 'Small · 4 vCPU · 16 GB',
    resourceShortLabel: 'Virtual machine — Small',
    hourlyRate: 0.48,
    monthlyRate: 320,
    billingUnit: 'per-instance',
    instanceTypeId: 'small',
  }),
  line({
    id: 'line-enterprise-us-vm-medium',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'virtual-machine',
    resourceLabel: 'Medium · 8 vCPU · 32 GB',
    resourceShortLabel: 'Virtual machine — Medium',
    hourlyRate: 0.96,
    monthlyRate: 640,
    billingUnit: 'per-instance',
    instanceTypeId: 'medium',
  }),
  line({
    id: 'line-enterprise-us-vm-large',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'virtual-machine',
    resourceLabel: 'Large · 16 vCPU · 64 GB',
    resourceShortLabel: 'Virtual machine — Large',
    hourlyRate: 1.92,
    monthlyRate: 1280,
    billingUnit: 'per-instance',
    instanceTypeId: 'large',
  }),
  line({
    id: 'line-enterprise-us-vm-net',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'virtual-machine',
    resourceLabel: 'Multi-NIC · 4 vCPU · 16 GB',
    resourceShortLabel: 'Virtual machine — Multi-NIC',
    hourlyRate: 1.25,
    monthlyRate: 850,
    billingUnit: 'per-instance',
    catalogItemId: DEMO_CATALOG_ITEM_IDS.vmNetworkAttachments,
    instanceTypeId: 'small',
  }),
  line({
    id: 'line-enterprise-us-model-small',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'models',
    resourceLabel: 'Inference small · 2 vCPU · 8 GiB · 1 replica',
    resourceShortLabel: 'Models — Inference small',
    hourlyRate: 0.18,
    monthlyRate: 120,
    billingUnit: 'per-endpoint',
    instanceTypeId: 'model-small',
  }),
  line({
    id: 'line-enterprise-us-model-medium',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'models',
    resourceLabel: 'Inference medium · 4 vCPU · 16 GiB · 2 replicas',
    resourceShortLabel: 'Models — Inference medium',
    hourlyRate: 0.42,
    monthlyRate: 280,
    billingUnit: 'per-endpoint',
    instanceTypeId: 'model-medium',
  }),
  line({
    id: 'line-enterprise-us-model-gpu',
    rateCardId: 'rate-enterprise-us',
    serviceId: 'models',
    resourceLabel: 'GPU model serving · A100-backed runtime',
    resourceShortLabel: 'Models — GPU serving',
    hourlyRate: 2.4,
    monthlyRate: 1600,
    billingUnit: 'per-endpoint',
    instanceTypeId: 'model-gpu',
  }),

  // Enterprise — EU (higher regional multiplier on key lines)
  line({
    id: 'line-enterprise-eu-bm-large',
    rateCardId: 'rate-enterprise-eu',
    serviceId: 'baremetal',
    resourceLabel: 'Large · 64 vCPU · 512 GB · A100 80 GB',
    resourceShortLabel: 'Bare metal — Large',
    hourlyRate: 4.68,
    monthlyRate: 3135,
    billingUnit: 'per-instance',
    catalogItemId: DEMO_CATALOG_ITEM_IDS.bareMetalGpuTraining,
    instanceTypeId: 'large',
  }),
  line({
    id: 'line-enterprise-eu-cluster-small',
    rateCardId: 'rate-enterprise-eu',
    serviceId: 'cluster',
    resourceLabel: 'OpenShift small · 3 control plane · 3 workers',
    resourceShortLabel: 'Cluster — OpenShift small',
    hourlyRate: 24.2,
    monthlyRate: 16280,
    billingUnit: 'per-instance',
    catalogItemId: DEMO_CATALOG_ITEM_IDS.clusterNodeSets,
    instanceTypeId: 'ocp-small',
  }),

  // Standard — US (subset)
  line({
    id: 'line-standard-us-bm-large',
    rateCardId: 'rate-standard-us',
    serviceId: 'baremetal',
    resourceLabel: 'Large · 64 vCPU · 512 GB · A100 80 GB',
    resourceShortLabel: 'Bare metal — Large',
    hourlyRate: 5.1,
    monthlyRate: 3420,
    billingUnit: 'per-instance',
    catalogItemId: DEMO_CATALOG_ITEM_IDS.bareMetalGpuTraining,
    instanceTypeId: 'large',
  }),
  line({
    id: 'line-standard-us-cluster-small',
    rateCardId: 'rate-standard-us',
    serviceId: 'cluster',
    resourceLabel: 'OpenShift small · 3 control plane · 3 workers',
    resourceShortLabel: 'Cluster — OpenShift small',
    hourlyRate: 26,
    monthlyRate: 17480,
    billingUnit: 'per-instance',
    catalogItemId: DEMO_CATALOG_ITEM_IDS.clusterNodeSets,
    instanceTypeId: 'ocp-small',
  }),

  // Government — US
  line({
    id: 'line-gov-us-bm-large',
    rateCardId: 'rate-gov-us',
    serviceId: 'baremetal',
    resourceLabel: 'Large · 64 vCPU · 512 GB · A100 80 GB',
    resourceShortLabel: 'Bare metal — Large',
    hourlyRate: 4.85,
    monthlyRate: 3250,
    billingUnit: 'per-instance',
    catalogItemId: DEMO_CATALOG_ITEM_IDS.bareMetalGpuTraining,
    instanceTypeId: 'large',
  }),
]

const SERVICE_LABELS: Record<M360BillableService, string> = {
  baremetal: 'Bare metal',
  cluster: 'Cluster',
  'virtual-machine': 'Virtual machine',
  models: 'Models',
}

export function getM360RateLineServiceLabel(serviceId: M360BillableService): string {
  return SERVICE_LABELS[serviceId]
}

export function listM360RateLines(rateCardId?: string): M360RateLine[] {
  if (!rateCardId?.trim()) {
    return [...DEMO_M360_RATE_LINES]
  }

  const normalized = rateCardId.trim()
  return DEMO_M360_RATE_LINES.filter((entry) => entry.rateCardId === normalized)
}

export function m360RateLineToRateCard(line: M360RateLine): RateCard {
  return {
    hourlyRate: line.hourlyRate,
    monthlyRate: line.monthlyRate,
    currency: line.currency,
    billingUnit: line.billingUnit === 'per-endpoint' ? 'per-instance' : 'per-instance',
  }
}

export function formatM360RateLineSummary(line: M360RateLine): string {
  const hourly = line.hourlyRate.toFixed(2)
  const monthly = line.monthlyRate.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const unit = line.billingUnit === 'per-endpoint' ? 'per endpoint' : 'per instance'
  return `$${hourly}/hr · $${monthly}/mo ${unit}`
}

export function formatM360RateLineCatalogSummary(line: M360RateLine): string {
  return `${formatM360RateLineSummary(line)} for ${line.resourceShortLabel}`
}

type CatalogRateLineMatchInput = Pick<
  ProviderCatalogDraft,
  'catalogItemId' | 'serviceId' | 'instanceTypeId'
>

export function findM360RateLineForCatalogItem(
  item: CatalogRateLineMatchInput,
  rateCardId: string,
): M360RateLine | null {
  const lines = listM360RateLines(rateCardId)
  const byCatalogId = lines.find((line) => line.catalogItemId === item.catalogItemId)
  if (byCatalogId) {
    return byCatalogId
  }

  const serviceId = item.serviceId ?? 'baremetal'
  const instanceTypeId = item.instanceTypeId?.trim()
  if (!instanceTypeId) {
    return null
  }

  return (
    lines.find(
      (line) => line.serviceId === serviceId && line.instanceTypeId === instanceTypeId,
    ) ?? null
  )
}

export function resolveCatalogItemMappedCatalogName(
  line: M360RateLine,
  catalogItems: readonly ProviderCatalogDraft[],
): string | null {
  if (!line.catalogItemId) {
    return null
  }

  return (
    catalogItems.find((item) => item.catalogItemId === line.catalogItemId)?.displayName ?? null
  )
}

export function countM360RateLines(rateCardId: string): number {
  return listM360RateLines(rateCardId).length
}

export function listM360RateLineHeadlines(rateCardId: string, limit = 3): string[] {
  return listM360RateLines(rateCardId)
    .slice(0, limit)
    .map((entry) => formatM360RateLineCatalogSummary(entry))
}
