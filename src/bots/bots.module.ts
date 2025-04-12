import { Module } from '@nestjs/common';
import { BotsController } from './bots.controller';
import { BotsProvider } from './providers/bots.provider';
import { SlackProvider } from './providers/slack.provider';
import { ConfigModule } from '@nestjs/config';
import slackConfig from './config/slack.config';

/**
 * ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
 */
@Module({
  controllers: [BotsController],
  providers: [
    {
      provide: BotsProvider,
      useClass: SlackProvider,
    },
  ],
  imports: [ConfigModule.forFeature(slackConfig)],
})
export class BotsModule {}
