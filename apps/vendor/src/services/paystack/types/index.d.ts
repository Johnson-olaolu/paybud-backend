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

export interface PaystackGetCustomerResponse {
  status: boolean;
  message: string;
  data: {
    transactions: any[];
    subscriptions: any[];
    authorizations: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: null;
    }[];
    first_name: null | string;
    last_name: null | string;
    email: string;
    phone: null | string;
    metadata: Record<string, any>;
    domain: string;
    customer_code: string;
    risk_action: string;
    id: number;
    integration: number;
    createdAt: string;
    updatedAt: string;
    created_at: string;
    updated_at: string;
    total_transactions: number;
    total_transaction_value: any[];
    dedicated_account: any;
    identified: boolean;
    identifications: any;
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

export interface PaystackCustomerIdentificationFailedPayload {
  customer_id: string;
  customer_code: string;
  email: string;
  identification: {
    country: string;
    type: string;
    bvn: string;
    account_number: string;
    bank_code: string;
  };
  reason: string;
}

export interface PaystackCustomerIdentificationSuccessPayload {
  customer_id: string;
  customer_code: string;
  email: string;
  identification: {
    country: string;
    type: string;
    bvn: string;
    account_number: string;
    bank_code: string;
  };
}

export interface PaystackCreateVBAAccountResponse {
  status: boolean;
  message: string;
  data: {
    bank: {
      name: string;
      id: number;
      slug: string;
    };
    account_name: string;
    account_number: string;
    assigned: boolean;
    currency: string;
    metadata: null | Record<string, any>;
    active: boolean;
    id: string;
    created_at: string;
    updated_at: string;
    assignment: {
      integration: number;
      assignee_id: number;
      assignee_type: string;
      expired: boolean;
      account_type: string;
      assigned_at: string;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      risk_action: string;
    };
  };
}

export interface PaystackBank {
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaystackFetchBanksResponse {
  status: boolean;
  message: string;
  data: PaystackBank[];
  meta: {
    next: string | null;
    previous: string | null;
    perPage: number;
  };
}
