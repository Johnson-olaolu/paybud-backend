import { NestFactory } from '@nestjs/core';
import { VendorModule } from './vendor.module';
import { RabbitmqService } from '@app/rabbitmq';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { RpcExceptionWrapper } from '@app/shared/utils/exeption-wrapper';

async function bootstrap() {
  const app =
    await NestFactory.create<INestApplication<VendorModule>>(VendorModule);
  const rabbitmqService = app.get<RabbitmqService>(RabbitmqService);
  const microservice = await NestFactory.createMicroservice(VendorModule, {
    ...rabbitmqService.getOptions(RABBITMQ_QUEUES.VENDOR, true),
  });
  microservice.useGlobalPipes(new ValidationPipe());
  microservice.useGlobalFilters(new RpcExceptionWrapper());
  await microservice.listen();
}
bootstrap();
