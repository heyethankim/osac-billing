import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  AlertActionLink,
  Button,
  Content,
  FormGroup,
  Label,
} from '@patternfly/react-core'
import { CheckIcon } from '@patternfly/react-icons/dist/esm/icons/check-icon'
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon'
import {
  getOrganizationSetupSignal,
  isTenantBillingConfigured,
  resolveTenantSetupStatus,
  type RegisteredOrganization,
} from '../../providerAdmin/organizations'
import { buildProviderOrganizationWorkspacePath } from '../../shared/workspaceNavUrl'

export function normalizeEnterpriseTenantIds(
  value: string | readonly string[] | undefined,
): string[] {
  if (Array.isArray(value)) {
    return [...new Set(value.map((entry) => String(entry).trim()).filter(Boolean))]
  }

  if (typeof value !== 'string') {
    return []
  }

  const trimmed = value.trim()
  return trimmed ? [trimmed] : []
}

function getVipTenantStatusLabelColor(
  organization: RegisteredOrganization,
): 'green' | 'orange' | 'grey' {
  const status = resolveTenantSetupStatus(organization)
  if (status === 'ready') {
    return 'green'
  }
  if (status === 'billing_configured') {
    return 'orange'
  }
  return 'grey'
}

type VipEnterpriseOrganizationFieldProps = {
  organizations: RegisteredOrganization[]
  selectedTenantIds: string[]
  onSelectedTenantIdsChange: (tenantIds: string[]) => void
  onRegisterOrganization?: () => void
  fieldIdPrefix: string
}

export function VipEnterpriseOrganizationField({
  organizations,
  selectedTenantIds,
  onSelectedTenantIdsChange,
  onRegisterOrganization,
  fieldIdPrefix,
}: VipEnterpriseOrganizationFieldProps) {
  const selectedIdSet = new Set(normalizeEnterpriseTenantIds(selectedTenantIds))
  const selectedOrganizations = organizations.filter((organization) =>
    selectedIdSet.has(organization.tenantId),
  )
  const hasBillingIncompleteSelection = selectedOrganizations.some(
    (organization) => !isTenantBillingConfigured(organization),
  )

  const toggleOrganization = (tenantId: string) => {
    if (selectedIdSet.has(tenantId)) {
      onSelectedTenantIdsChange([...selectedIdSet].filter((id) => id !== tenantId))
      return
    }

    onSelectedTenantIdsChange([...selectedIdSet, tenantId])
  }

  if (organizations.length === 0) {
    return (
      <Alert
        variant="warning"
        isInline
        title="No tenants yet"
        className="provider-admin-catalog__vip-empty-alert"
        actionLinks={
          onRegisterOrganization ? (
            <AlertActionLink component="button" onClick={onRegisterOrganization}>
              Register a tenant
            </AlertActionLink>
          ) : undefined
        }
      >
        <Content component="p">
          VIP enterprise needs at least one registered tenant to target. Register a tenant
          inline, or save this catalog item as unpublished and assign tenants later. You can
          also switch to Global public to publish now.
        </Content>
      </Alert>
    )
  }

  return (
    <div className="provider-admin-catalog__vip-enterprise-field">
      <FormGroup
        label="Select one or more enterprise tenants"
        fieldId={`${fieldIdPrefix}-enterprise-organizations`}
        isRequired
      >
        <div
          className="provider-admin-catalog__vip-org-cards"
          role="group"
          aria-label="Enterprise tenants"
        >
          {organizations.map((organization) => {
            const isSelected = selectedIdSet.has(organization.tenantId)
            const cardId = `${fieldIdPrefix}-enterprise-${organization.tenantId}`
            const setupSignal = getOrganizationSetupSignal(organization)
            const statusLabel = setupSignal ?? 'Ready for provisioning'
            return (
              <button
                key={organization.id}
                type="button"
                id={cardId}
                className={`provider-admin-catalog__vip-org-card${
                  isSelected ? ' provider-admin-catalog__vip-org-card--selected' : ''
                }`}
                aria-pressed={isSelected}
                onClick={() => toggleOrganization(organization.tenantId)}
              >
                <span
                  className={`provider-admin-catalog__vip-org-card-indicator${
                    isSelected ? ' provider-admin-catalog__vip-org-card-indicator--selected' : ''
                  }`}
                  aria-hidden
                >
                  {isSelected ? <CheckIcon /> : null}
                </span>
                <span className="provider-admin-catalog__vip-org-card-name">
                  {organization.name.trim() || organization.tenantId}
                </span>
                <Label
                  color={getVipTenantStatusLabelColor(organization)}
                  isCompact
                  className="provider-admin-catalog__vip-org-card-status"
                >
                  {statusLabel}
                </Label>
              </button>
            )
          })}
        </div>
      </FormGroup>

      {hasBillingIncompleteSelection ? (
        <Alert
          variant="warning"
          isInline
          title="Publishing stays blocked until billing is configured"
          className="provider-admin-catalog__vip-billing-alert"
        >
          <Content component="p">
            Selected tenants without billing setup can still be assigned to VIP catalog items, but
            pricing and publish remain blocked until tenant registration links an M360 billing
            account.
          </Content>
        </Alert>
      ) : null}

      {onRegisterOrganization ? (
        <div className="provider-admin-catalog__vip-orgs-hint">
          <span className="provider-admin-catalog__vip-orgs-hint-icon" aria-hidden>
            <InfoCircleIcon />
          </span>
          <div className="provider-admin-catalog__vip-orgs-hint-content">
            <Content component="p" className="provider-admin-catalog__vip-orgs-hint-title">
              Don&apos;t see the tenant you need?{' '}
              <Button
                variant="link"
                isInline
                className="provider-admin-catalog__vip-orgs-hint-link"
                onClick={onRegisterOrganization}
              >
                Register a tenant
              </Button>
            </Content>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function formatVipEnterpriseVisibilityLabel(
  organizations: RegisteredOrganization[],
  enterpriseTenantIdOrIds: string | readonly string[] | undefined,
): string {
  const tenantIds = normalizeEnterpriseTenantIds(enterpriseTenantIdOrIds)
  if (tenantIds.length === 0) {
    return 'VIP enterprise · Restricted — unassigned'
  }

  const names = tenantIds.map((tenantId) => {
    const organization = organizations.find((entry) => entry.tenantId === tenantId)
    return organization?.name ?? tenantId
  })

  if (names.length === 1) {
    return `VIP enterprise · ${names[0]}`
  }

  if (names.length === 2) {
    return `VIP enterprise · ${names[0]}, ${names[1]}`
  }

  return `VIP enterprise · ${names[0]} +${names.length - 1} more`
}

export function getCatalogEnterpriseTenantIds(item: {
  enterpriseTenantId?: string
  enterpriseTenantIds?: string[]
}): string[] {
  if (item.enterpriseTenantIds?.length) {
    return normalizeEnterpriseTenantIds(item.enterpriseTenantIds)
  }

  return normalizeEnterpriseTenantIds(item.enterpriseTenantId)
}

export function CatalogEnterpriseTenantLinks({
  organizations,
  enterpriseTenantIds,
}: {
  organizations: RegisteredOrganization[]
  enterpriseTenantIds: string[]
}) {
  if (enterpriseTenantIds.length === 0) {
    return null
  }

  return (
    <>
      {enterpriseTenantIds.map((tenantId, index) => {
        const organization = organizations.find((entry) => entry.tenantId === tenantId)
        const name = organization?.name ?? tenantId
        const organizationPathId = organization?.id

        return (
          <Fragment key={tenantId}>
            {index > 0 ? ', ' : null}
            {organizationPathId ? (
              <Link
                to={buildProviderOrganizationWorkspacePath(organizationPathId)}
                className="provider-admin-network-inventory__related-link"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </Fragment>
        )
      })}
    </>
  )
}
