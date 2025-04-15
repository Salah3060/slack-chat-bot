// filepath: d:\slack-bot-nest\slack-chat-bot\src\bots\providers\bots.provider.ts
import { Injectable } from '@nestjs/common';
import { SendNotificationDto } from '../dtos/send-notification.dto';

/**
 * @abstract
 * @class BotsProvider
 * @description Abstract provider that defines the contract for bot notification services.
 */
@Injectable()
export abstract class BotsProvider {
  /**
   * @abstract
   * @description Sends notification message to the bot service
   * @param {string} notification - The notification message content to be sent
   */
  abstract sendNotification(
    sendNotificationDto: SendNotificationDto,
  ): Promise<void>;
  abstract requestOAuthToken(code: string): Promise<string>;
}
