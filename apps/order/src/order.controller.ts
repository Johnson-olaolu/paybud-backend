import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ClientCreateOrderDto,
  VendorCreateOrderDto,
} from './dto/create-order.dto';
import { InvitationStatusEnum } from './utils/constants';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('vendorCreateOrder')
  vendorCreatesOrder(@Payload() payload: VendorCreateOrderDto) {
    return this.orderService.vendorCreatesOrder(payload);
  }

  @MessagePattern('clientCreateOrder')
  clientCreatesOrder(@Payload() payload: ClientCreateOrderDto) {
    return this.orderService.clientCreatesOrder(payload);
  }

  @MessagePattern('getClientInvitations')
  getClientInvitations(
    @Payload() payload: { clientId: string; status: InvitationStatusEnum },
  ) {
    return this.orderService.getClientInvitations(
      payload.clientId,
      payload.status,
    );
  }

  @MessagePattern('getVendorInvitations')
  getVendorInvitations(
    @Payload() payload: { vendorId: string; status: InvitationStatusEnum },
  ) {
    return this.orderService.getVendorInvitations(
      payload.vendorId,
      payload.status,
    );
  }

  @MessagePattern('clientAcceptInvitation')
  clientAcceptInvitation(
    @Payload() data: { invitationId: string; clientId: string },
  ) {
    return this.orderService.clientAcceptInvitation(
      data.invitationId,
      data.clientId,
    );
  }

  @MessagePattern('vendorAcceptInvitation')
  vendorAcceptInvitation(
    @Payload() data: { invitationId: string; vendorId: string },
  ) {
    return this.orderService.vendorAcceptInvitation(
      data.invitationId,
      data.vendorId,
    );
  }

  @MessagePattern('getOrderById')
  getOrderById(@Payload() id: string) {
    return this.orderService.findOne(id);
  }

  @MessagePattern('getAllOrders')
  getAllOrders() {
    return this.orderService.findAll();
  }

  @MessagePattern('vendorUpdateOrder')
  vendorUpdateOrder(
    @Payload() payload: { id: string; updateOrderDto: UpdateOrderDto },
  ) {
    return this.orderService.vendorUpdateOrder(
      payload.id,
      payload.updateOrderDto,
    );
  }

  @MessagePattern('clientUpdateOrder')
  clientUpdateOrder(
    @Payload() payload: { id: string; updateOrderDto: UpdateOrderDto },
  ) {
    return this.orderService.clientUpdateOrder(
      payload.id,
      payload.updateOrderDto,
    );
  }

  @MessagePattern('deleteOrder')
  deleteOrder(@Payload() id: string) {
    return this.orderService.deleteOrder(id);
  }

  @MessagePattern('cancelOrder')
  cancelOrder(@Payload() id: string) {
    return this.orderService.cancelOrder(id);
  }
}
