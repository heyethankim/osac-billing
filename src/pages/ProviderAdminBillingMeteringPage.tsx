import { useMemo } from 'react'
import {
  Card,
  CardBody,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
} from '@patternfly/react-core'
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table'
import {
  getOrganizationM360AccountId,
  getOrganizationM360ConnectionStatus,
  listUnpricedCatalogItems,
} from '../billing/m360'
import { M360RateStatusLabel } from '../components/billing/M360RateStatusLabel'
import { ProviderAdminWorkspacePageHeader } from '../components/provider-admin/ProviderAdminWorkspacePageHeader'
import {
  getProviderCatalogItems,
  getProviderRegisteredOrganizations,
} from '../providerSetup/storage'

export function ProviderAdminBillingMeteringPage() {
  const catalogItems = useMemo(() => getProviderCatalogItems(), [])
  const organizations = useMemo(() => getProviderRegisteredOrganizations(), [])
  const unpricedItems = useMemo(() => listUnpricedCatalogItems(catalogItems), [catalogItems])
  const connectedTenants = organizations.filter(
    (organization) => getOrganizationM360ConnectionStatus(organization) === 'connected',
  ).length

  return (
    <div className="provider-admin-workspace-page provider-admin-billing">
      <ProviderAdminWorkspacePageHeader
        kicker="Administration"
        title="Billing & metering"
        lede="OSAC reads tenant mappings and rate cards from M360. Commercial setup stays in M360; OSAC gates publish and provisioning when pricing is missing."
      />

      <div className="provider-admin-billing__summary">
        <Card>
          <CardTitle>M360 integration</CardTitle>
          <CardBody>
            <DescriptionList isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>Connected tenants</DescriptionListTerm>
                <DescriptionListDescription>
                  {connectedTenants} of {organizations.length}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Unpriced catalog items</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label color={unpricedItems.length > 0 ? 'orange' : 'green'} isCompact>
                    {unpricedItems.length}
                  </Label>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </div>

      <Card className="provider-admin-billing__table-card">
        <CardTitle>Tenant M360 mappings</CardTitle>
        <CardBody>
          <Table aria-label="Tenant M360 mappings" variant="compact">
            <Thead>
              <Tr>
                <Th>Tenant</Th>
                <Th>M360 account</Th>
                <Th>Connection</Th>
              </Tr>
            </Thead>
            <Tbody>
              {organizations.map((organization) => {
                const status = getOrganizationM360ConnectionStatus(organization)
                const statusColor =
                  status === 'connected' ? 'green' : status === 'pending' ? 'orange' : 'red'

                return (
                  <Tr key={organization.id}>
                    <Td dataLabel="Tenant">{organization.displayName ?? organization.name}</Td>
                    <Td dataLabel="M360 account">
                      <code>{getOrganizationM360AccountId(organization)}</code>
                    </Td>
                    <Td dataLabel="Connection">
                      <Label color={statusColor} isCompact>
                        {status === 'connected'
                          ? 'Connected'
                          : status === 'pending'
                            ? 'Pending'
                            : 'Not found'}
                      </Label>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {unpricedItems.length > 0 ? (
        <Card className="provider-admin-billing__table-card">
          <CardTitle>Catalog items blocked by missing M360 rates</CardTitle>
          <CardBody>
            <Content component="p">
              These offerings cannot be published or provisioned until a matching rate card exists
              in M360.
            </Content>
            <Table aria-label="Unpriced catalog items" variant="compact">
              <Thead>
                <Tr>
                  <Th>Catalog item</Th>
                  <Th>Pricing status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {unpricedItems.map((item) => (
                  <Tr key={item.catalogItemId}>
                    <Td dataLabel="Catalog item">{item.displayName}</Td>
                    <Td dataLabel="Pricing status">
                      <M360RateStatusLabel item={item} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
