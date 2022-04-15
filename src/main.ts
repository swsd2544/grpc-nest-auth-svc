import { HttpExceptionFilter } from './auth/filter/http-exception.filter';
import { protobufPackage } from './auth/auth.pb';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:50051',
      package: protobufPackage,
      protoPath: join('node_modules/grpc-nest-proto/proto/auth.proto'),
    },
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen();
}
bootstrap();
