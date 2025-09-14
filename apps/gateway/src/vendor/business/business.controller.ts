import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Sse,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Vendor Business')
@Controller('vendor/business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  async create(@Body() createBusinessDto: CreateBusinessDto) {
    const data = await this.businessService.create(createBusinessDto);
    return {
      success: true,
      message: 'Business Created Successfully',
      data,
    };
  }

  @Sse('register-business/:ownerId')
  registerBusiness(@Param('ownerId') ownerId: string) {
    return this.businessService.subscribeToBusinessVerification(ownerId);
  }

  @Get()
  async findAll() {
    const data = await this.businessService.findAll();
    return {
      success: true,
      message: 'Businesses Retrieved Successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.businessService.findOne(id);
    return {
      success: true,
      message: 'Business Retrieved Successfully',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ) {
    const data = await this.businessService.update(id, updateBusinessDto);
    return {
      success: true,
      message: 'Business Updated Successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.businessService.remove(id);
    return {
      success: true,
      message: 'Business Removed Successfully',
    };
  }
}
