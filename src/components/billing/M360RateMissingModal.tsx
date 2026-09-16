import {
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core'
import {
  getM360RateCardConfigureUrl,
  markCatalogItemM360RateConfigured,
} from '../../billing/m360'
import type { ProviderCatalogDraft } from '../../providerSetup/storage'

type M360RateMissingModalProps = {
  item: ProviderCatalogDraft | null
  isOpen: boolean
  onClose: () => void
  onRatesRefreshed?: () => void
}

export function M360RateMissingModal({
  item,
  isOpen,
  onClose,
  onRatesRefreshed,
}: M360RateMissingModalProps) {
  if (!item) {
    return null
  }

  const handleOpenM360 = () => {
    window.open(getM360RateCardConfigureUrl(item.catalogItemId), '_blank', 'noopener,noreferrer')
  }

  const handleRefreshRates = () => {
    markCatalogItemM360RateConfigured(item.catalogItemId)
    onRatesRefreshed?.()
    onClose()
  }

  return (
    <Modal variant="small" isOpen={isOpen} onClose={onClose} aria-labelledby="m360-rate-missing-title">
      <ModalHeader title="Rate card required" titleIconVariant="warning" labelId="m360-rate-missing-title" />
      <ModalBody>
        <Content component="p">
          <strong>{item.displayName}</strong> cannot be published to tenants until a matching rate
          card exists in M360.
        </Content>
        <Content component="p">
          Configure the rate in M360, then refresh pricing in OSAC to unlock publish and tenant
          provisioning.
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={handleRefreshRates}>
          Refresh rates
        </Button>
        <Button variant="primary" onClick={handleOpenM360}>
          Configure rate card in M360
        </Button>
      </ModalFooter>
    </Modal>
  )
}
