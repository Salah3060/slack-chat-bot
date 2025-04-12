import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appCreate } from './app.create';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Add any global pipes here if needed
  // For example, you can use validation pipes
  appCreate(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
