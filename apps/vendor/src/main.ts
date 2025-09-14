import { NestFactory } from '@nestjs/core';
import { VendorModule } from './vendor.module';
import { RabbitmqService } from '@app/rabbitmq';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { RpcExceptionWrapper } from '@app/shared/utils/exeption-wrapper';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app =
    await NestFactory.create<INestApplication<VendorModule>>(VendorModule);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(app.get(ConfigService).get<number>('PORT')!);
  // Configure HTTP server

  const rabbitmqService = app.get<RabbitmqService>(RabbitmqService);
  const microservice = await NestFactory.createMicroservice(VendorModule, {
    ...rabbitmqService.getOptions(RABBITMQ_QUEUES.VENDOR, true),
  });
  microservice.useGlobalPipes(new ValidationPipe());
  microservice.useGlobalFilters(new RpcExceptionWrapper());
  await microservice.listen();
}
bootstrap();
