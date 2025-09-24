interface IDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppNotification extends IDocument {
  userId: string;
  message: string;
  action: string;
  type: 'warning' | 'error' | 'info' | 'success';
  isRead: boolean;
  popup: boolean;
  data?: any;
}
