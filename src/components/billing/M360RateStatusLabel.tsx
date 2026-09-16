import { Label, Tooltip } from '@patternfly/react-core'
import {
  getCatalogItemM360Pricing,
  type CatalogItemM360Pricing,
} from '../../billing/m360'
import type { ProviderCatalogDraft } from '../../providerSetup/storage'

type M360RateStatusLabelProps = {
  item: Pick<ProviderCatalogDraft, 'catalogItemId' | 'rateCard'>
  pricing?: CatalogItemM360Pricing
}

export function M360RateStatusLabel({ item, pricing }: M360RateStatusLabelProps) {
  const resolved = pricing ?? getCatalogItemM360Pricing(item)
  const color = resolved.status === 'configured' ? 'green' : 'orange'

  return (
    <Tooltip
      content={
        resolved.status === 'configured'
          ? 'A matching rate card exists in M360 for this offering.'
          : 'No M360 rate card is mapped to this catalog item. Publish and provision are blocked.'
      }
      position="top"
    >
      <Label color={color} isCompact className="billing-m360-rate-status">
        {resolved.label}
      </Label>
    </Tooltip>
  )
}
