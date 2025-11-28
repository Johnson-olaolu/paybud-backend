/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { VendorCreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/shared/types/vendor';
import { BusinessGuard } from '../guards/business.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), BusinessGuard)
@ApiTags('Vendor Order')
@Controller('vendor/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Body() createOrderDto: VendorCreateOrderDto,
    @Req() request: Request,
  ) {
    const user = (request as any).user as User;
    const data = await this.orderService.create(createOrderDto, user);
    return {
      message: 'Order created successfully',
      success: true,
      data,
    };
  }
}
