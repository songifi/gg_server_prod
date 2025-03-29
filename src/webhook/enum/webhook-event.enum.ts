export enum WebhookEvent {
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_CONFIRMED = 'transaction.confirmed',
  TRANSACTION_FAILED = 'transaction.failed',
  WALLET_CONNECTED = 'wallet.connected',
  WALLET_VERIFIED = 'wallet.verified',
  FEE_UPDATED = 'fee.updated'
}
