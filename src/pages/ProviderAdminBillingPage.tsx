import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon'
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon'
import { SyncIcon } from '@patternfly/react-icons/dist/esm/icons/sync-icon'
import { UsersIcon } from '@patternfly/react-icons/dist/esm/icons/users-icon'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Label,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core'
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table'
import {
  buildM360AccountDetailPath,
  formatM360PortalValue,
  getM360AccountStatusLabelColor,
  getM360AccountTenantName,
  getM360ApprovalStatusLabelColor,
  listM360PortalAccounts,
  type M360BillingAccount,
} from '../billing/m360Accounts'
import { M360BillingAccountLink } from '../components/billing/M360BillingAccountLink'
import { ProviderAdminWorkspacePageHeader } from '../components/provider-admin/ProviderAdminWorkspacePageHeader'
import { ExternalLinkButton } from '../components/shared/ExternalLinkButton'
import type { RegisteredOrganization } from '../providerAdmin/organizations'
import { getProviderRegisteredOrganizations } from '../providerSetup/storage'
import { buildProviderOrganizationWorkspacePath } from '../shared/workspaceNavUrl'

const M360_ACCOUNTS_PATH = '/m360/accounts'

function findOrganizationForM360Account(
  account: M360BillingAccount,
  organizations: RegisteredOrganization[],
): RegisteredOrganization | null {
  const references = [
    account.linkedTenantSlug,
    account.externalId,
    account.accountName,
  ].filter((value): value is string => Boolean(value?.trim()))

  return (
    organizations.find((organization) =>
      references.some(
        (reference) =>
          organization.slug === reference ||
          organization.tenantId === reference ||
          organization.name === reference ||
          organization.m360AccountId === reference ||
          organization.billingAccountName === reference,
      ),
    ) ?? null
  )
}

export function ProviderAdminBillingPage() {
  const accounts = useMemo(() => listM360PortalAccounts(), [])
  const organizations = useMemo(() => getProviderRegisteredOrganizations(), [])
  const activeCount = accounts.filter((account) => account.accountStatus === 'Active').length
  const inactiveCount = accounts.filter((account) => account.accountStatus === 'Inactive').length
  const linkedCount = accounts.filter(
    (account) => account.externalId || account.linkedTenantSlug,
  ).length
  const tenantsWithBilling = organizations.filter(
    (organization) =>
      organization.m360AccountId?.trim() || organization.billingAccountId.trim(),
  ).length
  const inactiveAccounts = accounts.filter((account) => account.accountStatus === 'Inactive')

  return (
    <div className="provider-admin-workspace-page provider-admin-billing">
      <ProviderAdminWorkspacePageHeader
        kicker="Administration"
        title="Billing"
        lede="Billing accounts live in M360. OSAC reads status here to gate tenant onboarding and catalog publish."
        action={
          <ExternalLinkButton href={M360_ACCOUNTS_PATH} variant="primary">
            Open M360 accounts
          </ExternalLinkButton>
        }
      />

      <div className="provider-admin-billing__kpi-grid provider-admin-billing__kpi-grid--three">
        <Card isFullHeight className="provider-admin-billing__kpi-card">
          <CardHeader>
            <CardTitle>
              <CheckCircleIcon className="provider-admin-billing__kpi-icon" aria-hidden />
              Active billing accounts
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title headingLevel="h2" size="4xl" className="provider-admin-billing__kpi-value">
              {activeCount}
            </Title>
            <Content component="p" className="provider-admin-billing__kpi-hint">
              <Link to={M360_ACCOUNTS_PATH} className="provider-admin-billing__kpi-detail-link">
                {accounts.length} accounts
              </Link>{' '}
              synced from M360
            </Content>
          </CardBody>
        </Card>

        <Card isFullHeight className="provider-admin-billing__kpi-card">
          <CardHeader>
            <CardTitle>
              <UsersIcon className="provider-admin-billing__kpi-icon" aria-hidden />
              Linked tenants
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title headingLevel="h2" size="4xl" className="provider-admin-billing__kpi-value">
              {linkedCount}
              <span className="provider-admin-billing__kpi-value-suffix">
                {' '}
                / {tenantsWithBilling}
              </span>
            </Title>
            <Content component="p" className="provider-admin-billing__kpi-hint">
              Tenants with an M360 billing account assigned in OSAC
            </Content>
            <div className="provider-admin-billing__kpi-bar" aria-hidden>
              <div
                className="provider-admin-billing__kpi-bar-fill"
                style={{
                  width:
                    tenantsWithBilling > 0
                      ? `${Math.round((linkedCount / tenantsWithBilling) * 100)}%`
                      : '0%',
                }}
              />
            </div>
          </CardBody>
        </Card>

        <Card
          isFullHeight
          className={[
            'provider-admin-billing__kpi-card',
            inactiveCount > 0 ? 'provider-admin-billing__kpi-card--warning' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <CardHeader>
            <CardTitle>
              <ExclamationTriangleIcon className="provider-admin-billing__kpi-icon" aria-hidden />
              Inactive accounts
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Title
              headingLevel="h2"
              size="4xl"
              className={[
                'provider-admin-billing__kpi-value',
                inactiveCount > 0 ? 'provider-admin-billing__kpi-value--warning' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {inactiveCount}
            </Title>
            {inactiveCount > 0 ? (
              <Content component="p" className="provider-admin-billing__kpi-detail">
                {inactiveAccounts.map((account, index) => {
                  const accountName = getM360AccountTenantName(account)

                  return (
                    <Fragment key={account.accountId}>
                      {index > 0 ? ', ' : null}
                      <Link
                        to={buildM360AccountDetailPath(accountName)}
                        className="provider-admin-billing__kpi-detail-link"
                      >
                        {accountName}
                      </Link>
                    </Fragment>
                  )
                })}{' '}
                {inactiveAccounts.length === 1 ? 'is' : 'are'} inactive in M360.
              </Content>
            ) : (
              <Content component="p" className="provider-admin-billing__kpi-hint">
                No inactive billing accounts
              </Content>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="provider-admin-billing__table-card">
        <CardHeader>
          <CardTitle>M360 billing accounts</CardTitle>
        </CardHeader>
        <CardBody>
          <Toolbar className="provider-admin-billing__table-toolbar">
            <ToolbarContent alignItems="center">
              <ToolbarGroup gap={{ default: 'gapSm' }}>
                <ToolbarItem>
                  <Button variant="secondary" icon={<SyncIcon aria-hidden />} iconPosition="end">
                    Refresh
                  </Button>
                </ToolbarItem>
              </ToolbarGroup>
              <ToolbarGroup align={{ default: 'alignEnd' }} gap={{ default: 'gapSm' }}>
                <ToolbarItem>
                  <Content component="p" className="provider-admin-billing__table-meta">
                    {accounts.length} accounts
                  </Content>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>

          <Table
            aria-label="M360 billing accounts"
            className="provider-admin-billing__table catalog-data-table"
          >
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Account number</Th>
                <Th>Status</Th>
                <Th>Approval</Th>
                <Th>External ID</Th>
                <Th>Linked tenant</Th>
              </Tr>
            </Thead>
            <Tbody>
              {accounts.map((account) => {
                const accountName = getM360AccountTenantName(account)
                const statusColor = getM360AccountStatusLabelColor(account.accountStatus)
                const approvalColor = getM360ApprovalStatusLabelColor(account.approvalStatus)
                const linkedOrganization = findOrganizationForM360Account(account, organizations)
                const linkedTenantLabel =
                  linkedOrganization?.name ||
                  account.linkedTenantSlug ||
                  account.externalId

                return (
                  <Tr
                    key={account.accountId}
                    className={
                      account.accountStatus === 'Inactive'
                        ? 'provider-admin-billing__table-row--inactive'
                        : undefined
                    }
                  >
                    <Td dataLabel="Name">
                      <M360BillingAccountLink
                        to={buildM360AccountDetailPath(accountName)}
                        className="provider-admin-billing__account-link"
                      >
                        {formatM360PortalValue(account.accountName)}
                      </M360BillingAccountLink>
                    </Td>
                    <Td dataLabel="Account number">
                      {formatM360PortalValue(account.accountNumber)}
                    </Td>
                    <Td dataLabel="Status">
                      {statusColor ? (
                        <Label color={statusColor} isCompact>{account.accountStatus}</Label>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td dataLabel="Approval">
                      <Label color={approvalColor} isCompact>{account.approvalStatus}</Label>
                    </Td>
                    <Td dataLabel="External ID">
                      {formatM360PortalValue(account.externalId)}
                    </Td>
                    <Td dataLabel="Linked tenant">
                      {linkedOrganization ? (
                        <Link
                          to={buildProviderOrganizationWorkspacePath(linkedOrganization.id)}
                          className="provider-admin-billing__tenant-link"
                        >
                          {linkedTenantLabel}
                        </Link>
                      ) : (
                        formatM360PortalValue(linkedTenantLabel)
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
  )
}
