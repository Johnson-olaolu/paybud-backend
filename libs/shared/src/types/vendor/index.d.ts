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
  business?: Business;
  profile?: Profile;
  role?: Role;
}

export interface Business extends IDocument {
  name: string;
  owner?: User;
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
