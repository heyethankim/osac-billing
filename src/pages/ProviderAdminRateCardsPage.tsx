import { useMemo } from 'react'
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon'
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon'
import { GlobeIcon } from '@patternfly/react-icons/dist/esm/icons/globe-icon'
import { MoneyBillIcon } from '@patternfly/react-icons/dist/esm/icons/money-bill-icon'
import {
  Alert,
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
import { DEMO_M360_RATE_CARDS } from '../billing/m360Accounts'
import { CatalogItemRateDisplay } from '../components/billing/CatalogItemRateDisplay'
import { M360RateStatusLabel } from '../components/billing/M360RateStatusLabel'
import { ProviderAdminWorkspacePageHeader } from '../components/provider-admin/ProviderAdminWorkspacePageHeader'
import { ExternalLinkButton } from '../components/shared/ExternalLinkButton'
import { getProviderCatalogItems, getProviderRegisteredOrganizations } from '../providerSetup/storage'
import { CatalogEnterpriseTenantLinks } from '../components/provider-admin/VipEnterpriseOrganizationField'

function formatCatalogScopeLabel(scope: string): string {
  return scope === 'vip-enterprise' ? 'VIP enterprise' : 'Platform'
}

export function ProviderAdminRateCardsPage() {
  const catalogItems = useMemo(() => getProviderCatalogItems(), [])
  const organizations = useMemo(() => getProviderRegisteredOrganizations(), [])
  const unpricedItems = useMemo(() => listUnpricedCatalogItems(catalogItems), [catalogItems])
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
        title="Rate card"
        lede="Rate cards are authored in M360. OSAC maps catalog SKUs to those rates and blocks publish when pricing or tenant billing is incomplete."
        action={
          <ExternalLinkButton href={M360_RATE_CARD_PORTAL_URL}>
            Open M360 rate cards
          </ExternalLinkButton>
        }
      />

      <div className="provider-admin-billing__kpi-grid provider-admin-billing__kpi-grid--three">
        <Card isFullHeight className="provider-admin-billing__kpi-card">
          <CardHeader>
            <CardTitle>
              <MoneyBillIcon className="provider-admin-billing__kpi-icon" aria-hidden />
              Rate cards in M360
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title headingLevel="h2" size="4xl" className="provider-admin-billing__kpi-value">
              {DEMO_M360_RATE_CARDS.length}
            </Title>
            <Content component="p" className="provider-admin-billing__kpi-hint">
              Enterprise and standard pricing profiles available for onboarding
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
              Items ready to publish to tenants
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
            <Content component="p" className="provider-admin-billing__kpi-hint">
              {unpricedItems.length > 0
                ? 'Missing M360 rate or tenant billing is incomplete'
                : 'All catalog items can publish'}
            </Content>
          </CardBody>
        </Card>
      </div>

      {unpricedItems.length > 0 ? (
        <Alert
          variant="warning"
          title="Catalog publish is blocked for some items"
          className="provider-admin-billing__alert"
          isInline
        >
          <Content component="p">
            Resolve tenant billing or add the matching M360 rate before publishing VIP catalog
            items to enterprise tenants.
          </Content>
        </Alert>
      ) : (
        <Alert
          variant="success"
          title="Catalog pricing coverage is complete"
          className="provider-admin-billing__alert"
          isInline
        />
      )}

      <div className="provider-admin-rate-cards__layout">
        <Card className="provider-admin-billing__table-card">
          <CardHeader>
            <CardTitle>Available rate cards</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="provider-admin-rate-cards__grid">
              {DEMO_M360_RATE_CARDS.map((rateCard) => (
                <div key={rateCard.id} className="provider-admin-rate-cards__tile">
                  <Content component="p" className="provider-admin-rate-cards__tile-name">
                    {rateCard.name}
                  </Content>
                  <Label color="blue" isCompact className="provider-admin-rate-cards__tile-region">
                    <GlobeIcon aria-hidden />
                    {rateCard.region}
                  </Label>
                  <code className="provider-admin-rate-cards__tile-id">{rateCard.id}</code>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="provider-admin-billing__table-card provider-admin-rate-cards__coverage-card">
          <CardHeader>
            <CardTitle>Catalog pricing coverage</CardTitle>
          </CardHeader>
          <CardBody>
            <Content component="p" className="provider-admin-billing__section-lede">
              Every catalog item must resolve to an M360 rate before tenants can launch workloads.
            </Content>
            <Table
              aria-label="Catalog pricing coverage"
              variant="compact"
              className="provider-admin-billing__table catalog-data-table"
            >
              <Thead>
                <Tr>
                  <Th>Catalog item</Th>
                  <Th>Scope</Th>
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
                      <Td dataLabel="Scope">
                        <Label
                          color={item.scope === 'vip-enterprise' ? 'purple' : 'grey'}
                          isCompact
                        >
                          {formatCatalogScopeLabel(item.scope)}
                        </Label>
                      </Td>
                      <Td dataLabel="Enterprise tenant">
                        {enterpriseTenantIds.length > 0 ? (
                          <CatalogEnterpriseTenantLinks
                            organizations={organizations}
                            enterpriseTenantIds={enterpriseTenantIds}
                          />
                        ) : (
                          '—'
                        )}
                      </Td>
                      <Td dataLabel="M360 pricing">
                        {pricing.status === 'configured' ? (
                          <CatalogItemRateDisplay item={item} />
                        ) : (
                          <M360RateStatusLabel item={item} pricing={pricing} hideWhenConfigured={false} />
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
