import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { BusinessModule } from './business/business.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  controllers: [VendorController],
  providers: [VendorService],
  imports: [
    AuthModule,
    RoleModule,
    UserModule,
    BusinessModule,
    NotificationModule,
  ],
})
export class VendorModule {}
