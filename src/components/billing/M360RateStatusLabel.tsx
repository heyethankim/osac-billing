import { Icon, Tooltip } from '@patternfly/react-core'
import { WarningTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/warning-triangle-icon'
import {
  getCatalogItemM360AccountDetailPath,
  getCatalogItemM360Pricing,
  getCatalogItemM360PricingTooltip,
  type CatalogItemM360Pricing,
  type CatalogItemPricingInput,
} from '../../billing/m360'
import { M360BillingAccountLink } from './M360BillingAccountLink'

type M360RateStatusLabelProps = {
  item: CatalogItemPricingInput
  pricing?: CatalogItemM360Pricing
  /** When true, configured items render nothing — the rate amount is shown separately. */
  hideWhenConfigured?: boolean
  /** Detail pages only — list views show status without an M360 navigation link. */
  showM360AccountLink?: boolean
}

export function M360RateStatusLabel({
  item,
  pricing,
  hideWhenConfigured = true,
  showM360AccountLink = false,
}: M360RateStatusLabelProps) {
  const resolved = pricing ?? getCatalogItemM360Pricing(item)
  const m360AccountPath = showM360AccountLink
    ? getCatalogItemM360AccountDetailPath(item, resolved)
    : null

  if (hideWhenConfigured && resolved.status === 'configured') {
    return null
  }

  if (resolved.status === 'configured') {
    return (
      <Tooltip content={getCatalogItemM360PricingTooltip(resolved)} position="top">
        <span className="billing-m360-rate-status">{resolved.label}</span>
      </Tooltip>
    )
  }

  return (
    <Tooltip content={getCatalogItemM360PricingTooltip(resolved)} position="top">
      <span className="billing-m360-rate-status" role="status">
        <Icon size="sm" status="warning" aria-hidden>
          <WarningTriangleIcon />
        </Icon>
        <span>{resolved.label}</span>
        {m360AccountPath ? (
          <>
            <span className="billing-m360-rate-status__separator" aria-hidden> · </span>
            <M360BillingAccountLink to={m360AccountPath} />
          </>
        ) : null}
      </span>
    </Tooltip>
  )
}
