import {
  Brand,
  Bullseye,
  Button,
  Card,
  CardBody,
  Content,
  Divider,
  Flex,
  FlexItem,
  Icon,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core'
import { css } from '@patternfly/react-styles'
import alignmentStyles from '@patternfly/react-styles/css/utilities/Alignment/alignment'
import { CrownIcon } from '@patternfly/react-icons/dist/esm/icons/crown-icon'
import { UserIcon } from '@patternfly/react-icons/dist/esm/icons/user-icon'
import { UsersIcon } from '@patternfly/react-icons/dist/esm/icons/users-icon'
import { Fragment, type ReactNode } from 'react'
import { RouterButton } from '../components/RouterButton'
import { BMAAS_LANDING_LAST_UPDATED } from '../bmaasLandingLastUpdated'
import redHatHatLogoUrl from '../assets/Logo-RedHat-Hat-Color-RGB.svg?url'

type PrototypeLink = {
  label: string
  to: string
  companionSeparator?: string
  companionLink?: {
    label: string
    to: string
  }
}

type RoleBlockProps = {
  id: string
  title: string
  description: string
  icon: ReactNode
  actions: ReactNode
  prototypeLinks?: PrototypeLink[]
}

function RoleBlock({ id, title, description, icon, actions, prototypeLinks = [] }: RoleBlockProps) {
  return (
    <Flex
      component="section"
      direction={{ default: 'column' }}
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapLg' }}
      fullWidth={{ default: 'fullWidth' }}
      className={css(alignmentStyles.textAlignCenter)}
      aria-labelledby={id}
    >
      <span className="bmaas-role-landing__icon-wrap" aria-hidden>
        <Icon size="lg">{icon}</Icon>
      </span>
      <Title id={id} headingLevel="h2" size="lg">
        {title}
      </Title>
      <div className="bmaas-role-landing__cta">
        <Content component="p" className="bmaas-role-landing__description">
          {description}
        </Content>
        {actions}
      </div>
      {prototypeLinks.length > 0 ? (
        <FlexItem>
          <Stack hasGutter>
            {prototypeLinks.map((link) => (
              <StackItem key={`${link.label}-${link.to}`}>
                <Flex
                  gap={{ default: 'gapSm' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                  justifyContent={{ default: 'justifyContentCenter' }}
                  flexWrap={{ default: 'wrap' }}
                >
                  {link.companionLink ? (
                    <>
                      <span className="bmaas-role-landing__prototype-link-prefix">
                        <RouterButton variant="link" isInline to={link.to}>
                          {link.label}
                        </RouterButton>
                        {link.companionSeparator?.includes(',') ? ',' : link.companionSeparator}
                      </span>
                      <RouterButton variant="link" isInline to={link.companionLink.to}>
                        {link.companionLink.label}
                      </RouterButton>
                    </>
                  ) : (
                    <RouterButton variant="link" isInline to={link.to}>
                      {link.label}
                    </RouterButton>
                  )}
                </Flex>
              </StackItem>
            ))}
          </Stack>
        </FlexItem>
      ) : null}
    </Flex>
  )
}

function SingleEnterActions({
  to,
  disabled = false,
  ariaLabel,
}: {
  to?: string
  disabled?: boolean
  ariaLabel: string
}) {
  if (disabled || !to) {
    return (
      <Button variant="primary" isBlock isDisabled aria-label={ariaLabel}>
        Enter
      </Button>
    )
  }

  return (
    <RouterButton variant="primary" isBlock to={to} aria-label={ariaLabel}>
      Enter
    </RouterButton>
  )
}

export function BmaasLandingPage() {
  const providerPrototypeLinks: PrototypeLink[] = [
    {
      label: 'Tenants',
      to: '/provider/workspace?nav=administration-organizations',
      companionSeparator: ', ',
      companionLink: {
        label: 'IdP Manager',
        to: '/idp-manager/bluesolace',
      },
    },
    {
      label: 'M360 billing account',
      to: '/m360/accounts',
    },
  ]

  const roles: RoleBlockProps[] = [
    {
      id: 'bmaas-landing-role-provider-title',
      title: 'Provider Admin',
      description: 'Register tenants, link M360 billing accounts, and assign rate cards.',
      icon: <CrownIcon />,
      actions: <SingleEnterActions to="/provider" ariaLabel="Enter Provider Admin demo" />,
      prototypeLinks: providerPrototypeLinks,
    },
    {
      id: 'bmaas-landing-role-tenant-admin-title',
      title: 'Tenant Admin',
      description: 'Manage tenant billing, cost allocation, and usage for your organization.',
      icon: <UserIcon />,
      actions: (
        <SingleEnterActions to="/tenant-admin/northsummit" ariaLabel="Enter Tenant Admin demo" />
      ),
    },
    {
      id: 'bmaas-landing-role-tenant-user-title',
      title: 'Tenant User',
      description: 'Launch workloads with cost estimates and view billing-related usage.',
      icon: <UsersIcon />,
      actions: (
        <SingleEnterActions to="/tenant-user/northsummit" ariaLabel="Enter Tenant User demo" />
      ),
    },
  ]

  return (
    <Bullseye className="bmaas-role-landing">
      <Flex
        className="bmaas-role-landing__wrap"
        direction={{ default: 'column' }}
        alignItems={{ default: 'alignItemsCenter' }}
        gap={{ default: 'gap2xl' }}
        flexWrap={{ default: 'nowrap' }}
      >
        <FlexItem>
          <Flex
            component="header"
            direction={{ default: 'column' }}
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapMd' }}
            className={css(alignmentStyles.textAlignCenter)}
          >
            <Brand src={redHatHatLogoUrl} alt="Red Hat" heights={{ default: '52px' }} />
            <Title headingLevel="h1" size="4xl">
              Red Hat OSAC Billing Prototypes 0.3
            </Title>
            <Content component="p">Select a role to access the customized interface.</Content>
          </Flex>
        </FlexItem>

        <FlexItem className="bmaas-role-landing__roles">
          <Card component="article">
            <CardBody>
              <Flex
                direction={{ default: 'column', lg: 'row' }}
                alignItems={{ default: 'alignItemsStretch' }}
                gap={{ default: 'gapLg' }}
              >
                {roles.map((role, index) => (
                  <Fragment key={role.id}>
                    {index > 0 ? (
                      <Divider
                        orientation={{
                          default: 'horizontal',
                          lg: 'vertical',
                        }}
                      />
                    ) : null}
                    <FlexItem flex={{ default: 'flex_1' }}>
                      <RoleBlock {...role} />
                    </FlexItem>
                  </Fragment>
                ))}
              </Flex>
            </CardBody>
          </Card>
        </FlexItem>

        <FlexItem>
          <Flex
            component="footer"
            direction={{ default: 'column' }}
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapMd' }}
            className={css(alignmentStyles.textAlignCenter)}
          >
            <Flex
              gap={{ default: 'gapSm' }}
              alignItems={{ default: 'alignItemsCenter' }}
              justifyContent={{ default: 'justifyContentCenter' }}
              flexWrap={{ default: 'wrap' }}
            >
              <span className="bmaas-role-landing__prototype-link-prefix">
                <Button
                  variant="link"
                  component="a"
                  isInline
                  href="https://redhat.atlassian.net/browse/OSAC-3788"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OSAC-3788
                </Button>
                <span aria-hidden>,</span>
              </span>
              <Button
                variant="link"
                component="a"
                isInline
                href="https://redhat.atlassian.net/browse/OSAC-3877"
                target="_blank"
                rel="noopener noreferrer"
              >
                OSAC-3877
              </Button>
            </Flex>
            <div className="bmaas-role-landing__credits">
              <Content component="p">
                Created by{' '}
                <Button
                  variant="link"
                  component="a"
                  isInline
                  href="https://redhat.enterprise.slack.com/archives/D021Q4YKTBR"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ethan Kim
                </Button>
                {' & '}
                <Button
                  variant="link"
                  component="a"
                  isInline
                  href="https://redhat.enterprise.slack.com/archives/D08ABCFSWGW"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kyle Baker
                </Button>
                {' - OpenShift UXD'}
              </Content>
              <Content component="p">Last updated: {BMAAS_LANDING_LAST_UPDATED}</Content>
            </div>
          </Flex>
        </FlexItem>
      </Flex>
    </Bullseye>
  )
}
