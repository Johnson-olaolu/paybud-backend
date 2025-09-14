import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  PaystackCreateCustomerResponse,
  PaystackCreateVBAAccountResponse,
  PaystackCustomerIdentificationFailedPayload,
  PaystackCustomerIdentificationSuccessPayload,
  PaystackGetCustomerResponse,
} from './types';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaystackService {
  constructor(
    private httpService: HttpService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createCustomer(data: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    metadata?: Record<string, any>;
  }) {
    const url = '/customer';
    const { email, firstName, lastName, phoneNumber, metadata } = data;
    const body = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phoneNumber,
      metadata,
    };
    const response = await lastValueFrom(
      this.httpService.post<PaystackCreateCustomerResponse>(url, body),
    );
    return response.data;
  }

  async getCustomer(customerCode: string) {
    const url = `/customer/${customerCode}`;
    const response = await lastValueFrom(
      this.httpService.get<PaystackGetCustomerResponse>(url),
    );
    return response.data;
  }

  async validateCostumer(
    customerCode: string,
    data: {
      account_number: string;
      bvn: string;
      bankCode: string;
      firstName: string;
      lastName: string;
      middleName?: string;
      country?: string;
      type?: string;
    },
  ) {
    const url = `/customer/${customerCode}/identification`;
    const {
      account_number,
      bvn,
      bankCode,
      firstName,
      lastName,
      middleName = '',
      country = 'NG',
      type = 'bank_account',
    } = data;

    const body = {
      account_number,
      bvn,
      bank_code: bankCode,
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      country,
      type,
    };

    // const body = {
    //   country: 'NG',
    //   type: 'bank_account',
    //   account_number: '0111111111',
    //   bvn: '222222222221',
    //   bank_code: '007',
    //   first_name: 'Uchenna',
    //   last_name: 'Okoro',
    // };
    const response = await lastValueFrom(
      this.httpService.post<{
        status: boolean;
        message: string;
      }>(url, body),
    );
    return response.data;
  }

  async createRecipient(data: {
    name: string;
    accountNumber: string;
    bankCode: string;
    currency?: string;
    metadata?: Record<string, any>;
    type?: 'nuban' | 'mobile_money' | 'ghipss' | 'basa';
  }) {
    const url = '/transferrecipient';
    const {
      name,
      accountNumber,
      bankCode,
      currency = 'NGN',
      metadata = {},
      type = 'nuban',
    } = data;
    const body = {
      type,
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency,
      metadata,
    };
    const response = await lastValueFrom(
      this.httpService.post<PaystackCreateCustomerResponse>(url, body),
    );
    return response.data;
  }

  handleCustomerIdentificationFailed(
    payload: PaystackCustomerIdentificationFailedPayload,
  ) {
    this.eventEmitter.emit('business_validation.failed', {
      customerCode: payload.customer_code,
      reason: payload.reason,
    });
  }

  handleCustomerIdentificationSuccess(
    payload: PaystackCustomerIdentificationSuccessPayload,
  ) {
    this.eventEmitter.emit('business_validation.succeeded', {
      customerCode: payload.customer_code,
    });
  }

  async createVBAAccount(data: { customerId: string; preferredBank?: string }) {
    const url = '/dedicated_account';
    const { customerId, preferredBank = 'titan-paystack' } = data;
    const body = {
      customer: customerId,
      preferred_bank: preferredBank,
    };
    const response = await lastValueFrom(
      this.httpService.post<PaystackCreateVBAAccountResponse>(url, body),
    );
    return response.data;
  }
}
