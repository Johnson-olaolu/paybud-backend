interface IDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role extends IDocument {
  name: string;
  description: string;
}
