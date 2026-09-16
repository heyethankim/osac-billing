import { Icon, Tooltip } from '@patternfly/react-core'
import { WarningTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/warning-triangle-icon'
import {
  getCatalogItemM360Pricing,
  type CatalogItemM360Pricing,
} from '../../billing/m360'
import type { ProviderCatalogDraft } from '../../providerSetup/storage'

type M360RateStatusLabelProps = {
  item: Pick<ProviderCatalogDraft, 'catalogItemId' | 'rateCard'>
  pricing?: CatalogItemM360Pricing
  /** When true, configured items render nothing — the rate amount is shown separately. */
  hideWhenConfigured?: boolean
}

export function M360RateStatusLabel({
  item,
  pricing,
  hideWhenConfigured = true,
}: M360RateStatusLabelProps) {
  const resolved = pricing ?? getCatalogItemM360Pricing(item)

  if (hideWhenConfigured && resolved.status === 'configured') {
    return null
  }

  if (resolved.status === 'configured') {
    return (
      <Tooltip
        content="A matching rate card exists in M360 for this offering."
        position="top"
      >
        <span className="billing-m360-rate-status">{resolved.label}</span>
      </Tooltip>
    )
  }

  return (
    <Tooltip
      content="No M360 rate card is mapped to this catalog item. Publish and provision are blocked."
      position="top"
    >
      <span className="billing-m360-rate-status billing-m360-rate-status--missing">
        <Icon size="sm" status="warning" aria-hidden>
          <WarningTriangleIcon />
        </Icon>
        <span>{resolved.label}</span>
      </span>
    </Tooltip>
  )
}
