import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 *
 * @param app - The app instance to be created
 * @description This function is responsible for creating the app instance.
 * It can be used to set up middleware, routes, and other configurations for the app.
 */
export function appCreate(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors();
}
