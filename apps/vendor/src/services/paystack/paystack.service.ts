import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PaystackCreateCustomerResponse } from './types';

@Injectable()
export class PaystackService {
  constructor(private httpService: HttpService) {}

  async createCustomer(
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string,
  ) {
    const url = '/customer';
    const body = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phoneNumber,
    };
    const response = await lastValueFrom(
      this.httpService.post<PaystackCreateCustomerResponse>(url, body),
    );
    return response.data;
  }

  async createRecipient(
    name: string,
    accountNumber: string,
    bankCode: string,
    currency = 'NGN',
    metadata?: Record<string, any>,
    type: 'nuban' | 'mobile_money' | 'ghipss' | 'basa' = 'nuban',
  ) {
    const url = '/transferrecipient';
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
}
