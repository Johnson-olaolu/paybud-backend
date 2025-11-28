import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';

@Module({
  controllers: [ClientController],
  providers: [ClientService],
  imports: [AuthModule, UserModule, OrderModule],
})
export class ClientModule {}
