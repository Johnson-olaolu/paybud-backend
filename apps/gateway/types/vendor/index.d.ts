interface IDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role extends IDocument {
  name: string;
  description: string;
}
export interface User extends IDocument {
  email: string;
  password?: string;
  fullName?: string;
  isEmailVerified: boolean;
  roleName: string;
  businessId: string;
  profile?: Profile;
  role?: Role;
}

export interface Business extends IDocument {
  name: string;
  profile?: BusinessProfile;
  users?: User[];
}

export interface BusinessProfile extends IDocument {
  businessId: string;
  logo?: string;
  description?: string;
  address?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
}

export interface Profile extends IDocument {
  profilePicture?: string;
  userId: string;
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
