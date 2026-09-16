import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon'
import { PendingIcon } from '@patternfly/react-icons/dist/esm/icons/pending-icon'
import { EllipsisVIcon } from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon'
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon'
import { useState } from 'react'
import {
  Button,
  ClipboardCopy,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Dropdown,
  DropdownItem,
  DropdownList,
  FormGroup,
  Label,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Title,
} from '@patternfly/react-core'
import {
  getOrganizationDisplayName,
  getOrganizationM360AccountId,
  getOrganizationM360ConnectionStatus,
} from '../../billing/m360'
import { M360ConnectionStatusField } from '../billing/M360ConnectionStatusField'
import { EntityDetailsPageShell } from '../shared/EntityDetailsPageShell'
import { EntityDetailsActionsDropdown } from '../shared/EntityDetailsActionsDropdown'
import {
  getOrganizationActivationSteps,
  getOrganizationOsacLoginPath,
  getTenantSetupStatusColor,
  getTenantSetupStatusLabel,
  hasPendingIdpInvite,
  identityProviderConnectedByLabel,
  isOrganizationReadyForLogin,
  isTenantReadyForProvisioning,
  resolveBreakGlassUsername,
  resolveIdentityProviderConnectedBy,
  resolveTenantSetupStatus,
  isHarborlineCapitalOrganization,
  resolveOrganizationCompanyLogo,
  type OrganizationActivationStep,
  type RegisteredOrganization,
} from '../../providerAdmin/organizations'
import { AdditionalEmailDomainsValue } from './AdditionalEmailDomainsField'
import { AddTenantAdministratorWizard } from '../tenant-admin/AddTenantAdministratorWizard'
import { OrganizationResourceUsageSection } from './OrganizationResourceUsageSection'
import { IDP_MANAGER_ROLES_COPY } from '../../idpManager/constants'
import {
  getAssignableTenantRole,
  listRoleAssignments,
  removeRoleAssignment,
  type TenantAdministrator,
} from '../../tenantAdmin/administrators'

type OrganizationDetailsPageProps = {
  organization: RegisteredOrganization
  onBack: () => void
  onEdit?: () => void
  onRemove?: () => void
  onReviewBilling?: (organization: RegisteredOrganization) => void
  onReviewIdentityProvider?: (organization: RegisteredOrganization) => void
  onReviewRoles?: (organization: RegisteredOrganization) => void
  onOrganizationChange?: (organization: RegisteredOrganization) => void
}

function formatRegisteredAt(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getIdentityProviderStepMeta(organization: RegisteredOrganization): string | null {
  if (!organization.identityProviderConnected) {
    if (hasPendingIdpInvite(organization)) {
      return organization.idpManagerEmail
        ? `Invite sent to ${organization.idpManagerEmail}`
        : 'Waiting on IdP manager'
    }
    return null
  }

  const parts = [
    organization.identityProviderProtocol,
    organization.identityProviderDisplayName || organization.identityProviderName,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : organization.identityProviderName
}

function AccountPersonRow({
  admin,
  onRequestRemove,
}: {
  admin: TenantAdministrator
  onRequestRemove: (admin: TenantAdministrator) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <li className="provider-admin-organizations__account-person">
      <div className="provider-admin-organizations__account-person-main">
        <Content component="p" className="provider-admin-organizations__primary-cell">
          {admin.name}
        </Content>
        <Content component="p" className="provider-admin-organizations__secondary-cell">
          {admin.email}
        </Content>
        <Label
          color={getAssignableTenantRole(admin.roleId).color}
          isCompact
          className="provider-admin-organizations__account-person-role"
        >
          {getAssignableTenantRole(admin.roleId).label}
        </Label>
      </div>
      <Dropdown
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={() => setIsOpen(false)}
          popperProps={{ position: 'right' }}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              variant="plain"
              isExpanded={isOpen}
              onClick={() => setIsOpen((open) => !open)}
              icon={<EllipsisVIcon />}
              aria-label={`Actions for ${admin.name}`}
            />
          )}
        >
          <DropdownList>
            <DropdownItem
              value="remove"
              isDanger
              onClick={() => onRequestRemove(admin)}
            >
              Remove
            </DropdownItem>
          </DropdownList>
        </Dropdown>
    </li>
  )
}

function ActivationStepRow({
  step,
  organization,
  onReviewBilling,
  onReviewIdentityProvider,
}: {
  step: OrganizationActivationStep
  organization: RegisteredOrganization
  onReviewBilling?: (organization: RegisteredOrganization) => void
  onReviewIdentityProvider?: (organization: RegisteredOrganization) => void
}) {
  const idpMeta = step.id === 'idp' ? getIdentityProviderStepMeta(organization) : null
  const connectedBy =
    step.id === 'idp' ? resolveIdentityProviderConnectedBy(organization) : null
  const idpConnectedByLabel = connectedBy
    ? identityProviderConnectedByLabel(connectedBy)
    : null
  const billingMeta =
    step.id === 'billing_account' && organization.billingAccountName
      ? organization.billingAccountName
      : step.id === 'rate_card' && organization.m360RateCardName
        ? organization.m360RateCardName
        : null
  const canReviewBilling =
    (step.id === 'billing_account' ||
      step.id === 'rate_card' ||
      step.id === 'billing_linked') &&
    !step.complete &&
    typeof onReviewBilling === 'function'
  const canReviewIdp =
    step.id === 'idp' &&
    !step.complete &&
    typeof onReviewIdentityProvider === 'function' &&
    isTenantReadyForProvisioning(organization)

  return (
    <li
      className={[
        'provider-admin-organizations__status-step',
        step.complete
          ? 'provider-admin-organizations__status-step--complete'
          : 'provider-admin-organizations__status-step--pending',
      ].join(' ')}
    >
      <span className="provider-admin-organizations__status-step-icon" aria-hidden>
        {step.complete ? (
          <CheckCircleIcon className="provider-admin-organizations__status-step-check" />
        ) : (
          <PendingIcon className="provider-admin-organizations__status-step-pending" />
        )}
      </span>
      <div className="provider-admin-organizations__status-step-content">
        {canReviewBilling ? (
          <Button
            variant="link"
            isInline
            className="provider-admin-organizations__status-step-link"
            onClick={() => onReviewBilling(organization)}
          >
            {step.label}
          </Button>
        ) : null}
        {canReviewIdp ? (
          <Button
            variant="link"
            isInline
            className="provider-admin-organizations__status-step-link"
            onClick={() => onReviewIdentityProvider(organization)}
          >
            {step.label}
          </Button>
        ) : null}
        {!canReviewBilling && !canReviewIdp ? (
          <span className="provider-admin-organizations__status-step-label">{step.label}</span>
        ) : null}
        <span className="pf-v6-screen-reader">
          {step.complete ? ', complete' : ', not complete'}
        </span>
        {idpMeta || idpConnectedByLabel ? (
          <Content component="p" className="provider-admin-organizations__status-step-meta">
            {idpMeta ? (
              organization.identityProviderConnected ? (
                <code>{idpMeta}</code>
              ) : (
                idpMeta
              )
            ) : null}
            {idpMeta && idpConnectedByLabel ? ' · ' : null}
            {idpConnectedByLabel}
          </Content>
        ) : null}
        {billingMeta ? (
          <Content component="p" className="provider-admin-organizations__status-step-meta">
            {billingMeta}
          </Content>
        ) : null}
      </div>
    </li>
  )
}

function getDetailsBreakGlassUsername(organization: RegisteredOrganization): string | null {
  if (resolveIdentityProviderConnectedBy(organization) === 'provider-admin') {
    return null
  }
  const username = resolveBreakGlassUsername(organization)
  return username.trim() || null
}

export function OrganizationDetailsPage({
  organization,
  onBack,
  onEdit,
  onRemove,
  onReviewBilling,
  onReviewIdentityProvider,
  onReviewRoles,
  onOrganizationChange,
}: OrganizationDetailsPageProps) {
  const activationSteps = getOrganizationActivationSteps(organization)
  const tenantSetupStatus = resolveTenantSetupStatus(organization)
  const roleAssignments = listRoleAssignments(organization)
  const companyLogoSrc = isHarborlineCapitalOrganization(organization)
    ? null
    : resolveOrganizationCompanyLogo(organization)
  const breakGlassUsername = getDetailsBreakGlassUsername(organization)
  const showBreakGlassAccount = Boolean(breakGlassUsername)
  const [isAssignRolesOpen, setIsAssignRolesOpen] = useState(false)
  const [administratorPendingRemove, setAdministratorPendingRemove] =
    useState<TenantAdministrator | null>(null)
  const canAssignRoles = organization.identityProviderConnected

  const handleAssignRoles = () => {
    if (!canAssignRoles) {
      return
    }
    if (onReviewRoles) {
      onReviewRoles(organization)
      return
    }
    setIsAssignRolesOpen(true)
  }

  const handleRoleAssigned = (updated: RegisteredOrganization) => {
    onOrganizationChange?.(updated)
    setIsAssignRolesOpen(false)
  }

  const handleConfirmRemoveAdministrator = () => {
    if (!administratorPendingRemove) {
      return
    }

    const updated = removeRoleAssignment(organization, administratorPendingRemove.email)
    if (updated) {
      onOrganizationChange?.(updated)
    }
    setAdministratorPendingRemove(null)
  }

  if (isAssignRolesOpen) {
    return (
      <AddTenantAdministratorWizard
        isOpen
        organization={organization}
        breadcrumbAncestors={[
          { label: 'Tenants', onNavigate: onBack },
          { label: organization.name, onNavigate: () => setIsAssignRolesOpen(false) },
        ]}
        title={IDP_MANAGER_ROLES_COPY.wizardTitle}
        submitLabel={IDP_MANAGER_ROLES_COPY.wizardSubmitLabel}
        showRoleCatalog
        onClose={() => setIsAssignRolesOpen(false)}
        onAdded={handleRoleAssigned}
      />
    )
  }

  return (
    <>
    <EntityDetailsPageShell
      parentLabel="Tenants"
      onBack={onBack}
      title={getOrganizationDisplayName(organization)}
      titleId="tenant-details-title"
      description="Tenant details for billing, identity domain, and workspace access."
      actions={
        onEdit || onRemove ? (
          <EntityDetailsActionsDropdown onEdit={onEdit} onRemove={onRemove} removeLabel="Remove" />
        ) : undefined
      }
    >
      <div className="entity-details-page__columns entity-details-page__columns--with-rail">
        <div className="entity-details-page__main-stack">
          <div className="entity-details-page__columns entity-details-page__columns--2">
            <div className="entity-details-page__column">
              <Title headingLevel="h2" size="lg" className="entity-details-page__section-title">
                Overview
              </Title>
              <DescriptionList
                isCompact
                className="entity-details-page__dl"
                aria-label="Tenant overview"
              >
                <DescriptionListGroup>
                  <DescriptionListTerm>Setup status</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label color={getTenantSetupStatusColor(tenantSetupStatus)} isCompact>
                      {getTenantSetupStatusLabel(tenantSetupStatus)}
                    </Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Status</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label color={organization.status === 'Active' ? 'green' : 'orange'} isCompact>
                      {organization.status}
                    </Label>
                    {organization.status === 'Pending activation' &&
                    isOrganizationReadyForLogin(organization) ? (
                      <Content
                        component="p"
                        className="provider-admin-organizations__setup-signal provider-admin-organizations__drawer-ready-signal"
                      >
                        Ready for login
                      </Content>
                    ) : null}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Company logo</DescriptionListTerm>
                  <DescriptionListDescription>
                    {companyLogoSrc ? (
                      <div className="provider-admin-organizations__logo-preview">
                        <img
                          src={companyLogoSrc}
                          alt={organization.logoFileName || organization.name}
                        />
                      </div>
                    ) : (
                      '—'
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Primary email domain</DescriptionListTerm>
                  <DescriptionListDescription>
                    {organization.primaryDomain || '—'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Additional email domains</DescriptionListTerm>
                  <DescriptionListDescription>
                    <AdditionalEmailDomainsValue domains={organization.additionalDomains ?? []} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>OSAC URL</DescriptionListTerm>
                  <DescriptionListDescription>
                    <span className="provider-admin-organizations__osac-url">
                      <code>{getOrganizationOsacLoginPath(organization.slug)}</code>
                    </span>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Billing configuration</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getOrganizationM360AccountId(organization) ? (
                      <>
                        <Content component="p" className="provider-admin-organizations__secondary-cell">
                          {organization.billingAccountName || 'M360 billing account'}
                        </Content>
                        <Content component="p" className="provider-admin-organizations__secondary-cell">
                          <code>Tenant name: {getOrganizationM360AccountId(organization)}</code>
                        </Content>
                        {organization.m360RateCardName ? (
                          <Content component="p" className="provider-admin-organizations__secondary-cell">
                            Rate card: {organization.m360RateCardName}
                          </Content>
                        ) : (
                          <Content component="p" className="provider-admin-organizations__secondary-cell">
                            Rate card required
                          </Content>
                        )}
                        <M360ConnectionStatusField
                          accountId={getOrganizationM360AccountId(organization)}
                          status={getOrganizationM360ConnectionStatus(organization)}
                        />
                      </>
                    ) : (
                      <Content component="p" className="provider-admin-organizations__secondary-cell">
                        No M360 billing account configured.
                        {onReviewBilling ? (
                          <>
                            {' '}
                            <Button
                              variant="link"
                              isInline
                              onClick={() => onReviewBilling(organization)}
                            >
                              Complete billing setup
                            </Button>
                          </>
                        ) : null}
                      </Content>
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Registered</DescriptionListTerm>
                  <DescriptionListDescription>
                    {formatRegisteredAt(organization.createdAt)}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </div>

            <div className="entity-details-page__column">
              <Title headingLevel="h2" size="lg" className="entity-details-page__section-title">
                Tenant setup
              </Title>
              <ol
                className="provider-admin-organizations__status-steps"
                aria-label="Tenant setup progress"
              >
                {activationSteps.map((step) => (
                  <ActivationStepRow
                    key={step.id}
                    step={step}
                    organization={organization}
                    onReviewBilling={onReviewBilling}
                    onReviewIdentityProvider={onReviewIdentityProvider}
                  />
                ))}
              </ol>
            </div>
          </div>

          <div className="entity-details-page__column">
            <OrganizationResourceUsageSection organization={organization} />
          </div>
        </div>

        <div className="entity-details-page__rail-stack">
          <div className="entity-details-page__column entity-details-page__column--config">
            <div className="entity-details-page__column-block">
              <div className="entity-details-page__section-header entity-details-page__section-header--config provider-admin-organizations__accounts-header">
                <Title
                  headingLevel="h2"
                  size="md"
                  className="entity-details-page__section-title entity-details-page__section-title--config"
                >
                  Roles
                </Title>
                {canAssignRoles ? (
                  <Button
                    variant="link"
                    isInline
                    icon={<PlusCircleIcon />}
                    className="provider-admin-organizations__accounts-add"
                    onClick={handleAssignRoles}
                  >
                    Assign roles
                  </Button>
                ) : null}
              </div>
              {roleAssignments.length === 0 ? (
                <Content component="p" className="provider-admin-organizations__secondary-cell">
                  {canAssignRoles
                    ? IDP_MANAGER_ROLES_COPY.emptyBody
                    : 'Connect the identity provider before assigning roles.'}
                </Content>
              ) : (
                <ul
                  className="provider-admin-organizations__account-people"
                  aria-label="Assigned roles"
                >
                  {roleAssignments.map((admin) => (
                    <AccountPersonRow
                      key={admin.email}
                      admin={admin}
                      onRequestRemove={setAdministratorPendingRemove}
                    />
                  ))}
                </ul>
              )}
            </div>
            {showBreakGlassAccount && breakGlassUsername ? (
            <div className="entity-details-page__column-block">
              <Title
                headingLevel="h2"
                size="md"
                className="entity-details-page__section-title entity-details-page__section-title--config"
              >
                Break-glass account
              </Title>
              <div className="provider-admin-organizations__break-glass">
                <FormGroup label="Username" fieldId="tenant-break-glass-username">
                  <ClipboardCopy
                    id="tenant-break-glass-username"
                    isReadOnly
                    isCode
                    hoverTip="Copy username"
                    clickTip="Username copied"
                    textAriaLabel="Break-glass username"
                  >
                    {breakGlassUsername}
                  </ClipboardCopy>
                </FormGroup>
                <Content
                  component="p"
                  className="provider-admin-organizations__secondary-cell"
                >
                  Local login for the IdP manager. Does not use the tenant IdP.
                </Content>
              </div>
            </div>
            ) : null}
          </div>
        </div>
      </div>
    </EntityDetailsPageShell>
    <Modal
      variant={ModalVariant.small}
      isOpen={administratorPendingRemove !== null}
      onClose={() => setAdministratorPendingRemove(null)}
      aria-labelledby="remove-organization-administrator-title"
      aria-describedby="remove-organization-administrator-description"
    >
      <ModalHeader
        title="Are you sure?"
        titleIconVariant="warning"
        labelId="remove-organization-administrator-title"
      />
      <ModalBody>
        <Content component="p" id="remove-organization-administrator-description">
          {administratorPendingRemove ? (
            <>
              <strong>{administratorPendingRemove.name}</strong> will lose their assigned role on
              this tenant. This cannot be undone.
            </>
          ) : (
            'This administrator will lose tenant admin access to this tenant.'
          )}
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button variant="danger" onClick={handleConfirmRemoveAdministrator}>
          Remove
        </Button>
        <Button variant="link" onClick={() => setAdministratorPendingRemove(null)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
    </>
  )
}
