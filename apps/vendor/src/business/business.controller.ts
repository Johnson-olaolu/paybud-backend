import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { GetBusinessByEmailOrPhoneDTO } from './dto/get-business.dto';

@Controller()
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @MessagePattern('createBusiness')
  create(@Payload() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(createBusinessDto);
  }

  @MessagePattern('findAllBusiness')
  findAll() {
    return this.businessService.findAll();
  }

  @MessagePattern('findBusinessByEmailOrPhone')
  findByEmailOrPhone(@Payload() dto: GetBusinessByEmailOrPhoneDTO) {
    return this.businessService.findByEmailOrPhone(dto);
  }

  @MessagePattern('findOneBusiness')
  findOne(@Payload() id: string) {
    return this.businessService.findOne(id);
  }

  @MessagePattern('updateBusiness')
  update(
    @Payload() data: { id: string; updateBusinessDto: UpdateBusinessDto },
  ) {
    return this.businessService.update(data.id, data.updateBusinessDto);
  }

  @MessagePattern('removeBusiness')
  remove(@Payload() id: string) {
    return this.businessService.remove(id);
  }

  @MessagePattern('fetchBanks')
  fetchBanks() {
    return this.businessService.fetchBanks();
  }
}
