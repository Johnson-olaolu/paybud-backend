import { Controller } from '@nestjs/common';
import { BusinessService } from './business.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class BusinessValidationController {
  constructor(private readonly businessService: BusinessService) {}

  @MessagePattern('businessVerification')
  handleBusinessVerification(data: {
    ownerId: string;
    success: boolean;
    message: string;
  }) {
    this.businessService.handleBusinessVerification(data);
  }
}
