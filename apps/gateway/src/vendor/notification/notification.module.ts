import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/env.config';
import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.get('JWT_SECRET_KEY')!,
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService],
})
export class NotificationModule {}
