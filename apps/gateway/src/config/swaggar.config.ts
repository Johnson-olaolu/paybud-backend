import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import metadata from '../metadata';

export const configureSwagger = async (app: INestApplication, path: string) => {
  const config = new DocumentBuilder()
    .setTitle('Paybud Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, config);
  document.tags = document.tags?.sort((a, b) => a.name.localeCompare(b.name));
  SwaggerModule.setup(path, app, document);
};
