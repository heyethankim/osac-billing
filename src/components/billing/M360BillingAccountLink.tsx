import type { ReactNode } from 'react'
import { ExternalLinkButton } from '../shared/ExternalLinkButton'

type M360BillingAccountLinkProps = {
  to: string
  children?: ReactNode
  className?: string
}

export function M360BillingAccountLink({
  to,
  children = 'View in M360',
  className,
}: M360BillingAccountLinkProps) {
  return (
    <ExternalLinkButton href={to} className={className} iconPosition="end">
      {children}
    </ExternalLinkButton>
  )
}
