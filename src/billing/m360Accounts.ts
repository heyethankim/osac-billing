import type { RegisteredOrganization } from '../providerAdmin/organizations'

export type M360AccountLifecycleStatus = 'Active' | 'Inactive' | null

export type M360ApprovalStatus = 'Draft' | 'Approved'

export type M360BillingAccount = {
  /** Primary identifier used by OSAC onboarding and lookups. */
  accountId: string
  /** M360 account number column; `null` renders as NA. */
  accountNumber: string | null
  /** OSAC-style tenant name for this billing account. */
  accountName: string | null
  accountStatus: M360AccountLifecycleStatus
  approvalStatus: M360ApprovalStatus
  /** OSAC tenant name when this M360 account is already associated. */
  externalId: string | null
  /** OSAC tenant slug linked to this account, if any. */
  linkedTenantSlug: string | null
}

export type M360RateCard = {
  id: string
  name: string
  region: string
}

export type M360AccountsApiState = 'idle' | 'loading' | 'ready' | 'error'

const DEMO_M360_ACCOUNTS: M360BillingAccount[] = [
  {
    accountId: 'ACCT-NSB-2048',
    accountNumber: 'ACCT-NSB-2048',
    accountName: 'north-summit-bank',
    accountStatus: 'Active',
    approvalStatus: 'Approved',
    externalId: 'north-summit-bank',
    linkedTenantSlug: 'northsummit',
  },
  {
    accountId: 'ACCT-HLC-3910',
    accountNumber: 'ACCT-HLC-3910',
    accountName: 'harborline-capital',
    accountStatus: 'Active',
    approvalStatus: 'Approved',
    externalId: 'harborline-capital',
    linkedTenantSlug: 'harborline',
  },
  {
    accountId: 'ACCT-BSFG-2026',
    accountNumber: 'ACCT-BSFG-2026',
    accountName: 'bluesolace-financial-group',
    accountStatus: 'Active',
    approvalStatus: 'Approved',
    externalId: null,
    linkedTenantSlug: null,
  },
  {
    accountId: 'ACCT-SPT-1042',
    accountNumber: 'ACCT-SPT-1042',
    accountName: 'silverpine-trust',
    accountStatus: 'Inactive',
    approvalStatus: 'Draft',
    externalId: null,
    linkedTenantSlug: null,
  },
  {
    accountId: 'ACCT-CRC-1187',
    accountNumber: 'ACCT-CRC-1187',
    accountName: 'cedar-ridge-credit',
    accountStatus: 'Inactive',
    approvalStatus: 'Draft',
    externalId: null,
    linkedTenantSlug: null,
  },
  {
    accountId: 'ACCT-RWM-1104',
    accountNumber: 'ACCT-RWM-1104',
    accountName: 'redwood-mutual',
    accountStatus: 'Active',
    approvalStatus: 'Approved',
    externalId: null,
    linkedTenantSlug: null,
  },
]

/** Default selections for the tenant onboarding wizard demo. */
export const DEFAULT_ONBOARDING_M360_ACCOUNT_NAME = 'redwood-mutual'
export const DEFAULT_ONBOARDING_RATE_CARD_ID = 'rate-enterprise-us'
export const BLUESOLACE_ONBOARDING_M360_ACCOUNT_NAME = 'bluesolace-financial-group'

export const DEMO_M360_RATE_CARDS: M360RateCard[] = [
  { id: 'rate-enterprise-us', name: 'Enterprise — US', region: 'United States' },
  { id: 'rate-enterprise-eu', name: 'Enterprise — EU', region: 'European Union' },
  { id: 'rate-standard-us', name: 'Standard — US', region: 'United States' },
  { id: 'rate-gov-us', name: 'Government — US', region: 'United States' },
]

/** Simulated M360 account API latency. */
const M360_API_DELAY_MS = 250

function cloneAccounts(): M360BillingAccount[] {
  return DEMO_M360_ACCOUNTS.map((account) => ({ ...account }))
}

export function listM360PortalAccounts(): M360BillingAccount[] {
  return cloneAccounts()
}

export function formatM360PortalValue(value: string | null | undefined): string {
  const normalized = value?.trim()
  return normalized ? normalized : '—'
}

export function getM360AccountTenantName(account: M360BillingAccount): string {
  return account.accountName?.trim() || account.externalId?.trim() || account.accountId
}

export function formatM360AccountOptionLabel(account: M360BillingAccount): string {
  return getM360AccountTenantName(account)
}

export function formatM360AccountStatusLabel(status: M360AccountLifecycleStatus): string {
  if (status === 'Active') {
    return 'Active'
  }
  if (status === 'Inactive') {
    return 'Inactive'
  }
  return '—'
}

export function getM360AccountStatusLabelColor(
  status: M360AccountLifecycleStatus,
): 'green' | 'grey' | undefined {
  if (status === 'Active') {
    return 'green'
  }
  if (status === 'Inactive') {
    return 'grey'
  }
  return undefined
}

export function getM360ApprovalStatusLabelColor(
  status: M360ApprovalStatus,
): 'green' | 'orange' {
  return status === 'Approved' ? 'green' : 'orange'
}

export function findM360AccountById(accountId: string): M360BillingAccount | null {
  return findM360AccountByReference(accountId)
}

export function findM360AccountByReference(
  reference: string,
  accounts: readonly M360BillingAccount[] = DEMO_M360_ACCOUNTS,
): M360BillingAccount | null {
  const normalized = reference.trim()
  if (!normalized) {
    return null
  }

  return (
    accounts.find(
      (account) =>
        account.accountName?.trim() === normalized ||
        account.externalId?.trim() === normalized ||
        account.accountId === normalized,
    ) ?? null
  )
}

export function findM360AccountByTenantName(
  tenantName: string,
  accounts: readonly M360BillingAccount[],
): M360BillingAccount | null {
  const normalized = tenantName.trim()
  if (!normalized) {
    return null
  }

  return accounts.find(
    (account) =>
      account.externalId === normalized || account.accountName?.trim() === normalized,
  ) ?? null
}

export function isM360AccountLinkedToAnotherTenant(
  account: M360BillingAccount,
  tenantSlug: string,
): boolean {
  if (!account.linkedTenantSlug) {
    return false
  }

  return account.linkedTenantSlug !== tenantSlug
}

export function getM360AccountLinkConflictMessage(
  account: M360BillingAccount,
): string {
  const linkedTenant = account.externalId?.trim() || account.linkedTenantSlug
  return `This M360 billing account is already linked to another OSAC tenant (${linkedTenant}).`
}

function isOnboardingEligibleAccount(account: M360BillingAccount): boolean {
  return (
    Boolean(account.accountName?.trim()) &&
    account.accountStatus === 'Active' &&
    account.approvalStatus === 'Approved'
  )
}

export async function fetchM360BillingAccounts(): Promise<M360BillingAccount[]> {
  await new Promise((resolve) => window.setTimeout(resolve, M360_API_DELAY_MS))
  return cloneAccounts().filter(isOnboardingEligibleAccount)
}

/** Demo helper: mark an account as linked after onboarding completes. */
export function linkM360AccountInDemoStore(
  tenantName: string,
  organization: Pick<RegisteredOrganization, 'name' | 'slug'>,
): void {
  const account = findM360AccountByReference(tenantName)
  if (!account) {
    return
  }

  account.externalId = organization.name.trim()
  account.linkedTenantSlug = organization.slug
}

export function findM360RateCard(rateCardId: string): M360RateCard | null {
  const normalized = rateCardId.trim()
  if (!normalized) {
    return null
  }

  return DEMO_M360_RATE_CARDS.find((card) => card.id === normalized) ?? null
}
