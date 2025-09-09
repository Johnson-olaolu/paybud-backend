import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

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

  @MessagePattern('findOneBusiness')
  findOne(@Payload() id: number) {
    return this.businessService.findOne(id);
  }

  @MessagePattern('updateBusiness')
  update(@Payload() updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.update(updateBusinessDto.id, updateBusinessDto);
  }

  @MessagePattern('removeBusiness')
  remove(@Payload() id: number) {
    return this.businessService.remove(id);
  }
}
