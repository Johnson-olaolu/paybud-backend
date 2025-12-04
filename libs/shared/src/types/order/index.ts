import { File } from '../file';

export interface Order {
  id: string;

  title: string;

  description: string;

  clientId: string;

  vendorId: string;

  chat: OrderChat;

  invitations: OrderInvitation[];

  invoices: OrderInvoice[];

  // snapshots: OrderSnapshot[];

  items: OrderItem[];

  status: string;

  startDate: Date;

  endDate: Date;

  amount: number;

  feesToBePaidBy: 'client' | 'vendor';

  createdBy: 'client' | 'vendor';

  metadata: any;

  createdAt: Date;

  updatedAt: Date;
}

export interface OrderChat {
  id: string;
  order: Order;
  // vendorProfile: User;
  // clientProfile: ClientUser;
  // messages: OrderChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderInvitation {
  id: string;

  type: 'VENDOR' | 'CLIENT';

  medium: 'EMAIL' | 'SMS';

  vendorId: string;

  vendorNumber: string;

  vendorEmail: string;

  clientId: string;

  clientNumber: string;

  clientEmail: string;

  status: InvitationStatusEnum;

  respondedAt: Date;

  expiresAt: Date;

  createdAt: Date;

  updatedAt: Date;
}

export interface OrderInvoice {
  id: string;

  order: Order;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export interface OrderItem {
  id: string;

  order: Order;

  title: string;

  description: string;

  status: string;

  importanceLevel: string;

  fileIds: string[];

  files: File[];

  parent: OrderItem;

  children: OrderItem[];

  createdAt: Date;

  updatedAt: Date;
}

export enum InvitationStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export enum OrderStatusEnum {
  DRAFT = 'DRAFT',
  INVITATION_SENT = 'INVITATION_SENT',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  CLIENT_APPROVED = 'CLIENT_APPROVED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum OrderItemImportanceLevelEnum {
  ADDON = 'ADDON',
  NECESSITY = 'NECESSITY',
  ABSOLUTE_NECESSITY = 'ABSOLUTE_NECESSITY',
}

export enum OrderItemStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
