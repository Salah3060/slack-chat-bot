import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { BotsProvider } from './providers/bots.provider';
import { NotificationDto } from './dtos/notification.dto';

/**
 * @class BotsController
 * @description Controller responsible for handling bot-related HTTP requests.
 */
@Controller('bots')
export class BotsController {
  constructor(
    /**
     * @description Injected BotsProvider that handles all bot communication logic.
     * This follows Dependency Inversion Principle by depending on abstraction.
     * @type {BotsProvider}
     */
    private readonly botProvider: BotsProvider,
  ) {}

  /**
   * @description Endpoint that handles incoming Slack notifications
   * @param {NotificationDto} notificationDto - The validated notification data transfer object
   */

  @Post('/slack')
  @HttpCode(HttpStatus.OK)
  public async sentNotificationToBot(
    @Body() notificationDto: NotificationDto,
  ): Promise<void> {
    await this.botProvider.sendNotificationToBot(notificationDto.notification);
  }
}
