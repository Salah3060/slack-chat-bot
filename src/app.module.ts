import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotsModule } from './bots/bots.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import environmentValidationSchema from './config/environment.validation';
import slackConfig from './bots/config/slack.config';
import databaseConfig from './config/database.config';
import { SlackIntegration } from './bots/entities/slack-integration.entity';
import { Logger } from '@nestjs/common';
import { MiddlewareConsumer } from '@nestjs/common';
import { RawBodyMiddleware } from './bots/middlewares/raw-body-middleware.middleware';

@Module({
  imports: [
    // Config setup
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development.local',
      validationSchema: environmentValidationSchema,
      load: [slackConfig, databaseConfig],
    }),

    // PostgreSQL connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          entities: [SlackIntegration], // Register your entities here
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    // Feature modules
    BotsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RawBodyMiddleware).forRoutes('/bots/callback'); // Apply to specific routes that need raw body
  }
}
