import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { BotsProvider } from './providers/bots.provider';
import { NotificationDto } from './dtos/notification.dto';

@Controller('bots')
export class BotsController {
  constructor(
    /**
     * @description The BotsProvider is an abstract class that defines the contract for all bot providers.
     * @type {BotsProvider}
     */
    private readonly botProvider: BotsProvider,
  ) {
    // Constructor logic here
  }
  @Post('/slack')
  @HttpCode(HttpStatus.OK)
  public async sentNotificationToBot(
    @Body() notificationDto: NotificationDto,
  ): Promise<void> {
    // Handle the Slack event here
    await this.botProvider.sendNotificationToBot(notificationDto.notification);
    console.log('Received notification:', notificationDto);
    console.log('Slack event received');
  }
}
