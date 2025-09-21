export enum MessageTypeEnum {
  TEXT = 'TEXT',
  BID = 'BID',
  SYSTEM = 'SYSTEM',
}

export enum OrderStatusEnum {
  DRAFT = 'DRAFT',
  NEGOTIATING = 'NEGOTIATING',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

// 'draft', 'negotiating', 'pending_confirmation', 'active', 'completed', 'cancelled', 'disputed'
