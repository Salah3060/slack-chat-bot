import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { BotsController } from './bots.controller';
import { BotsProvider } from './providers/bots.provider';
import { SlackProvider } from './providers/slack.provider';
import { SlackIntegration } from './entities/slack-integration.entity';
import { SlackIntegrationProvider } from './providers/slack-integration.provider';
import slackConfig from './config/slack.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([SlackIntegration]), // Register the entity with TypeORM
    ConfigModule.forFeature(slackConfig),
    HttpModule,
  ],
  controllers: [BotsController],
  providers: [
    {
      provide: BotsProvider,
      useClass: SlackProvider,
    },
    SlackIntegrationProvider,
  ],
  exports: [SlackIntegrationProvider, BotsProvider], // Export services for use in other modules
})
export class BotsModule {}
