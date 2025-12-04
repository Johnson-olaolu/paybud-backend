/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { VendorCreateOrderDto } from './dto/create-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/shared/types/vendor';
import { BusinessGuard } from '../guards/business.guard';
import type { InvitationStatusEnum } from '@app/shared/types/order';
import { UpdateOrderDto } from './dto/update-order.dto';
import { VendorQueryOrderDto } from './dto/query-order.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), BusinessGuard)
@ApiTags('Vendor Order')
@Controller('vendor/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getVendorOrders(
    @Query() query: VendorQueryOrderDto,
    @Req() request: Request,
  ) {
    const user = (request as any).user as User;
    const data = await this.orderService.queryOrders(user, query);
    return {
      message: 'Vendor orders fetched successfully',
      success: true,
      data,
    };
  }

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

  @Get('invitation')
  async getVendorOrderInvitations(
    @Req() request: Request,
    @Query('status') status: InvitationStatusEnum,
  ) {
    const user = (request as any).user as User;
    const data = await this.orderService.getVendorOrderInvitations(
      user,
      status,
    );
    return {
      message: 'Vendor orders fetched successfully',
      success: true,
      data,
    };
  }

  @Post(':id/accept-invitation')
  async acceptInvitation(@Param('id') id: string, @Req() request: Request) {
    const user = (request as any).user as User;
    const data = await this.orderService.acceptInvitation(id, user);
    return {
      message: 'Invitation accepted successfully',
      success: true,
      data,
    };
  }

  @Patch(':id')
  async vendorUpdateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const data = await this.orderService.vendorUpdateOrder(id, updateOrderDto);
    return {
      message: 'Order updated successfully',
      success: true,
      data,
    };
  }
}
