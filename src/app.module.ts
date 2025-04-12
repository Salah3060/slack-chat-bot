import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotsModule } from './bots/bots.module';
import { ConfigModule } from '@nestjs/config';
import environmentValidationSchema from './config/environment.validation';
import slackConfig from './bots/config/slack.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development.local',
      validationSchema: environmentValidationSchema,
      load: [slackConfig],
    }),
    BotsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
