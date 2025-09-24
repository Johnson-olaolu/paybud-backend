export interface File {
  id: string;
  label: string;
  ownerType: 'vendor' | 'client' | 'app' | 'other';
  fileName: string;
  mimeType: string;
  url: string;
  folder: string;
  isPublic: boolean;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}
