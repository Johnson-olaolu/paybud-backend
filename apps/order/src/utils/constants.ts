export enum MessageTypeEnum {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  BID = 'BID',
  SYSTEM = 'SYSTEM',
}

export enum OrderStatusEnum {
  DRAFT = 'DRAFT',
  ACCEPTED = 'ACCEPTED',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum OrderItemStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum InvitationStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export enum InvoiceStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum OrderInviteMediumEnum {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

export const ORDER_JOB_NAMES = {
  ORDER_INVITATIONS: 'ORDER_INVITATIONS',
  PROCESS_ORDER_STATUS_CHANGE: 'PROCESS_ORDER_STATUS_CHANGE',
};

export class BidDetails {
  amount: number;
  currency: string;
}
