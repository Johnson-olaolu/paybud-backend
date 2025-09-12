export interface PaystackCreateCustomerResponse {
  status: boolean;
  message: string;
  data: {
    email: string;
    integration: number;
    domain: string;
    customer_code: string;
    id: number;
    identified: boolean;
    identifications: null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PaystackCreateRecipientResponse {
  status: boolean;
  message: string;
  data: {
    active: boolean;
    createdAt: string;
    currency: string;
    domain: string;
    id: number;
    integration: number;
    name: string;
    recipient_code: string;
    type: string;
    updatedAt: string;
    is_deleted: boolean;
    details: {
      authorization_code: string | null;
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
    };
  };
}
