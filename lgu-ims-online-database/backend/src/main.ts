import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function enableBigIntJsonSerialization() {
  const bigintPrototype = BigInt.prototype as unknown as { toJSON?: () => string };
  bigintPrototype.toJSON ??= function toJSON(this: bigint) {
    return this.toString();
  };
}

async function bootstrap() {
  enableBigIntJsonSerialization();

  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN')?.split(',') ?? true,
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(config.get<number>('PORT') ?? 3000);
}

bootstrap();
