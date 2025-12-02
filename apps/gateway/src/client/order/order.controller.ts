/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ClientCreateOrderDto } from './dto/create-order.dto';
import type { ClientUser } from '@app/shared/types/client';
import type { InvitationStatusEnum } from '@app/shared/types/order';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth()
@UseGuards(AuthGuard('client-jwt'))
@ApiTags('Client Order')
@Controller('client/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Body() createOrderDto: ClientCreateOrderDto,
    @Req() request: Request,
  ) {
    const user = (request as any).user as ClientUser;
    const data = await this.orderService.create(createOrderDto, user);
    return {
      message: 'Order created successfully',
      success: true,
      data,
    };
  }

  @Get('invitation')
  async getVendorOrders(
    @Req() request: Request,
    @Query('status') status: InvitationStatusEnum,
  ) {
    const user = (request as any).user as ClientUser;
    const data = await this.orderService.getVendorOrders(user, status);
    return {
      message: 'Vendor orders fetched successfully',
      success: true,
      data,
    };
  }

  @Post('invitation/:id/accept-invitation')
  async acceptInvitation(@Param('id') id: string, @Req() request: Request) {
    const user = (request as any).user as ClientUser;
    const data = await this.orderService.acceptInvitation(id, user);
    return {
      message: 'Invitation accepted successfully',
      success: true,
      data,
    };
  }
}
