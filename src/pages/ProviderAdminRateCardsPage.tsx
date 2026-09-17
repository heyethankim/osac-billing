import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon'
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon'
import { GlobeIcon } from '@patternfly/react-icons/dist/esm/icons/globe-icon'
import { MoneyBillIcon } from '@patternfly/react-icons/dist/esm/icons/money-bill-icon'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Label,
  Title,
} from '@patternfly/react-core'
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table'
import {
  canPublishCatalogItemToTenants,
  getCatalogItemM360Pricing,
  listUnpricedCatalogItems,
  M360_RATE_CARD_PORTAL_URL,
} from '../billing/m360'
import {
  countM360RateLines,
  DEFAULT_M360_RATE_CARD_ID,
  formatM360RateLineSummary,
  getM360RateLineServiceLabel,
  listM360RateLines,
  resolveCatalogItemMappedCatalogName,
} from '../billing/m360RateLines'
import { DEMO_M360_RATE_CARDS } from '../billing/m360Accounts'
import { CatalogItemRateDisplay } from '../components/billing/CatalogItemRateDisplay'
import { M360RateStatusLabel } from '../components/billing/M360RateStatusLabel'
import { ProviderAdminWorkspacePageHeader } from '../components/provider-admin/ProviderAdminWorkspacePageHeader'
import { ExternalLinkButton } from '../components/shared/ExternalLinkButton'
import type { ProviderCatalogDraft } from '../providerSetup/storage'
import { getProviderCatalogItems, getProviderRegisteredOrganizations } from '../providerSetup/storage'
import {
  CatalogEnterpriseTenantLinks,
  getCatalogEnterpriseTenantIds,
} from '../components/provider-admin/VipEnterpriseOrganizationField'
import type { RegisteredOrganization } from '../providerAdmin/organizations'
import { buildProviderOrganizationWorkspacePath } from '../shared/workspaceNavUrl'

const PROVIDER_BILLING_NAV_PATH = '/provider/workspace?nav=administration-billing'

type BlockedTenantRef = {
  organizationId: string | null
  name: string
}

function formatCatalogVisibilityLabel(scope: string): string {
  return scope === 'vip-enterprise' ? 'VIP enterprise' : 'Global public'
}

function resolveBlockedCatalogTenants(
  unpricedItems: ProviderCatalogDraft[],
  organizations: RegisteredOrganization[],
): BlockedTenantRef[] {
  const seen = new Set<string>()
  const tenants: BlockedTenantRef[] = []

  for (const item of unpricedItems) {
    const pricing = getCatalogItemM360Pricing(item)
    const tenantIds = pricing.tenantName
      ? [pricing.tenantName]
      : getCatalogEnterpriseTenantIds(item)

    for (const tenantId of tenantIds) {
      if (seen.has(tenantId)) {
        continue
      }

      seen.add(tenantId)
      const organization = organizations.find(
        (entry) =>
          entry.tenantId === tenantId ||
          entry.name === tenantId ||
          entry.slug === tenantId,
      )

      tenants.push({
        organizationId: organization?.id ?? null,
        name: organization?.name ?? tenantId,
      })
    }
  }

  return tenants
}

export function ProviderAdminRateCardsPage() {
  const catalogItems = useMemo(() => getProviderCatalogItems(), [])
  const organizations = useMemo(() => getProviderRegisteredOrganizations(), [])
  const unpricedItems = useMemo(() => listUnpricedCatalogItems(catalogItems), [catalogItems])
  const blockedTenants = useMemo(
    () => resolveBlockedCatalogTenants(unpricedItems, organizations),
    [unpricedItems, organizations],
  )
  const [selectedRateCardId, setSelectedRateCardId] = useState(DEFAULT_M360_RATE_CARD_ID)
  const selectedRateCard =
    DEMO_M360_RATE_CARDS.find((card) => card.id === selectedRateCardId) ??
    DEMO_M360_RATE_CARDS[0]
  const selectedRateLines = useMemo(
    () => listM360RateLines(selectedRateCard?.id ?? DEFAULT_M360_RATE_CARD_ID),
    [selectedRateCard?.id],
  )
  const pricedCount = catalogItems.length - unpricedItems.length
  const coveragePercent =
    catalogItems.length > 0 ? Math.round((pricedCount / catalogItems.length) * 100) : 100
  const sortedCatalogItems = useMemo(
    () =>
      [...catalogItems].sort((left, right) => {
        const leftBlocked = canPublishCatalogItemToTenants(left) ? 1 : 0
        const rightBlocked = canPublishCatalogItemToTenants(right) ? 1 : 0
        return leftBlocked - rightBlocked
      }),
    [catalogItems],
  )

  return (
    <div className="provider-admin-workspace-page provider-admin-billing provider-admin-rate-cards">
      <ProviderAdminWorkspacePageHeader
        kicker="Administration"
        title="Rate cards"
        lede="Rate cards in M360 define billable OSAC resources. Catalog SKUs resolve to a rate line before tenants can publish or launch."
        action={
          <ExternalLinkButton href={M360_RATE_CARD_PORTAL_URL} variant="primary">
            Open M360 rate cards
          </ExternalLinkButton>
        }
      />

      <div className="provider-admin-billing__kpi-grid provider-admin-billing__kpi-grid--three">
        <Card isFullHeight className="provider-admin-billing__kpi-card">
          <CardHeader>
            <CardTitle>
              <MoneyBillIcon className="provider-admin-billing__kpi-icon" aria-hidden />
              Rate lines
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title headingLevel="h2" size="4xl" className="provider-admin-billing__kpi-value">
              {countM360RateLines(selectedRateCard?.id ?? DEFAULT_M360_RATE_CARD_ID)}
            </Title>
            <Content component="p" className="provider-admin-billing__kpi-hint">
              Billable resources on {selectedRateCard?.name ?? 'selected rate card'}
            </Content>
          </CardBody>
        </Card>

        <Card isFullHeight className="provider-admin-billing__kpi-card">
          <CardHeader>
            <CardTitle>
              <CheckCircleIcon className="provider-admin-billing__kpi-icon" aria-hidden />
              Catalog items priced
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title headingLevel="h2" size="4xl" className="provider-admin-billing__kpi-value">
              {pricedCount}
              <span className="provider-admin-billing__kpi-value-suffix">
                {' '}
                / {catalogItems.length}
              </span>
            </Title>
            <Content component="p" className="provider-admin-billing__kpi-hint">
              Items with a matching M360 rate line
            </Content>
            <div className="provider-admin-billing__kpi-bar" aria-hidden>
              <div
                className="provider-admin-billing__kpi-bar-fill"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
          </CardBody>
        </Card>

        <Card
          isFullHeight
          className={[
            'provider-admin-billing__kpi-card',
            unpricedItems.length > 0 ? 'provider-admin-billing__kpi-card--warning' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <CardHeader>
            <CardTitle>
              <ExclamationTriangleIcon className="provider-admin-billing__kpi-icon" aria-hidden />
              Publish blocked
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title
              headingLevel="h2"
              size="4xl"
              className={[
                'provider-admin-billing__kpi-value',
                unpricedItems.length > 0 ? 'provider-admin-billing__kpi-value--warning' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {unpricedItems.length}
            </Title>
            {unpricedItems.length > 0 ? (
              <Content component="p" className="provider-admin-billing__kpi-detail">
                {blockedTenants.length > 0 ? (
                  <>
                    Fix billing for{' '}
                    {blockedTenants.map((tenant, index) => (
                      <Fragment key={tenant.name}>
                        {index > 0 ? ', ' : null}
                        {tenant.organizationId ? (
                          <Link
                            to={buildProviderOrganizationWorkspacePath(tenant.organizationId)}
                            className="provider-admin-billing__kpi-detail-link"
                          >
                            {tenant.name}
                          </Link>
                        ) : (
                          tenant.name
                        )}
                      </Fragment>
                    ))}{' '}
                    or add the{' '}
                  </>
                ) : (
                  <>
                    Fix{' '}
                    <Link
                      to={PROVIDER_BILLING_NAV_PATH}
                      className="provider-admin-billing__kpi-detail-link"
                    >
                      tenant billing
                    </Link>{' '}
                    or add the{' '}
                  </>
                )}
                <span className="provider-admin-billing__kpi-detail-link">M360 rate line</span>.
              </Content>
            ) : (
              <Content component="p" className="provider-admin-billing__kpi-hint">
                All catalog items can publish
              </Content>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="provider-admin-rate-cards__layout">
        <Card className="provider-admin-billing__table-card">
          <CardHeader>
            <CardTitle>M360 rate cards</CardTitle>
          </CardHeader>
          <CardBody>
            <Content component="p" className="provider-admin-billing__section-lede">
              Select a rate card to inspect billable resource lines. Tenants inherit pricing from
              the card assigned during onboarding.
            </Content>
            <div className="provider-admin-rate-cards__grid">
              {DEMO_M360_RATE_CARDS.map((rateCard) => {
                const isSelected = rateCard.id === selectedRateCard?.id

                return (
                  <button
                    key={rateCard.id}
                    type="button"
                    className={[
                      'provider-admin-rate-cards__tile',
                      isSelected ? 'provider-admin-rate-cards__tile--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedRateCardId(rateCard.id)}
                  >
                    <Content component="p" className="provider-admin-rate-cards__tile-name">
                      {rateCard.name}
                    </Content>
                    <Label color="blue" isCompact className="provider-admin-rate-cards__tile-region">
                      <GlobeIcon aria-hidden />
                      {rateCard.region}
                    </Label>
                    <Content component="p" className="provider-admin-rate-cards__tile-meta">
                      {countM360RateLines(rateCard.id)} rate lines
                    </Content>
                    <code className="provider-admin-rate-cards__tile-id">{rateCard.id}</code>
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>

        <Card className="provider-admin-billing__table-card provider-admin-rate-cards__lines-card">
          <CardHeader>
            <CardTitle>Rate lines — {selectedRateCard?.name}</CardTitle>
          </CardHeader>
          <CardBody>
            <Content component="p" className="provider-admin-billing__section-lede">
              Each line prices a billable OSAC resource profile. Catalog items map by SKU or by
              service + instance type.
            </Content>
            <Table
              aria-label={`Rate lines for ${selectedRateCard?.name ?? 'rate card'}`}
              className="provider-admin-billing__table catalog-data-table"
            >
              <Thead>
                <Tr>
                  <Th>Service</Th>
                  <Th>Resource</Th>
                  <Th>Rate</Th>
                  <Th>Catalog item</Th>
                </Tr>
              </Thead>
              <Tbody>
                {selectedRateLines.length > 0 ? (
                  selectedRateLines.map((line) => {
                    const catalogName = resolveCatalogItemMappedCatalogName(line, catalogItems)

                    return (
                      <Tr key={line.id}>
                        <Td dataLabel="Service">{getM360RateLineServiceLabel(line.serviceId)}</Td>
                        <Td dataLabel="Resource">{line.resourceLabel}</Td>
                        <Td dataLabel="Rate">{formatM360RateLineSummary(line)}</Td>
                        <Td dataLabel="Catalog item">
                          {catalogName ?? (
                            <span className="provider-admin-rate-cards__catalog-unmapped">
                              Available — not in catalog
                            </span>
                          )}
                        </Td>
                      </Tr>
                    )
                  })
                ) : (
                  <Tr>
                    <Td colSpan={4}>
                      No rate lines configured for this rate card yet.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        <Card className="provider-admin-billing__table-card provider-admin-rate-cards__coverage-card">
          <CardHeader>
            <CardTitle>Catalog pricing coverage</CardTitle>
          </CardHeader>
          <CardBody>
            <Content component="p" className="provider-admin-billing__section-lede">
              Every catalog item must resolve to a rate line on the applicable M360 rate card
              before tenants can publish workloads.
            </Content>
            <Table
              aria-label="Catalog pricing coverage"
              className="provider-admin-billing__table catalog-data-table"
            >
              <Thead>
                <Tr>
                  <Th>Catalog item</Th>
                  <Th>Visibility</Th>
                  <Th>Enterprise tenant</Th>
                  <Th>M360 pricing</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedCatalogItems.map((item) => {
                  const pricing = getCatalogItemM360Pricing(item)
                  const enterpriseTenantIds =
                    item.enterpriseTenantIds?.length
                      ? item.enterpriseTenantIds
                      : item.enterpriseTenantId
                        ? [item.enterpriseTenantId]
                        : []

                  return (
                    <Tr
                      key={item.catalogItemId}
                      className={
                        pricing.status === 'missing'
                          ? 'provider-admin-billing__table-row--inactive'
                          : undefined
                      }
                    >
                      <Td dataLabel="Catalog item">{item.displayName}</Td>
                      <Td dataLabel="Visibility">
                        <Label
                          color={item.scope === 'vip-enterprise' ? 'purple' : 'grey'}
                          isCompact
                        >
                          {formatCatalogVisibilityLabel(item.scope)}
                        </Label>
                      </Td>
                      <Td dataLabel="Enterprise tenant">
                        {enterpriseTenantIds.length > 0 ? (
                          <CatalogEnterpriseTenantLinks
                            organizations={organizations}
                            enterpriseTenantIds={enterpriseTenantIds}
                          />
                        ) : item.scope === 'vip-enterprise' ? (
                          '—'
                        ) : (
                          'All'
                        )}
                      </Td>
                      <Td dataLabel="M360 pricing">
                        {pricing.status === 'configured' ? (
                          <CatalogItemRateDisplay item={item} />
                        ) : (
                          <M360RateStatusLabel
                            item={item}
                            pricing={pricing}
                            hideWhenConfigured={false}
                            linkLabelToM360={pricing.reason === 'm360_account_inactive'}
                          />
                        )}
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
