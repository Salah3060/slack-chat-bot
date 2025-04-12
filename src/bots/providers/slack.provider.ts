import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BotsProvider } from './bots.provider';
import { ConfigService } from '@nestjs/config';
import { App } from '@slack/bolt';
import { KnownBlock } from '@slack/types';

/**
 * @class SlackProvider
 * @description Concrete implementation of BotsProvider for Slack integration.
 * Follows Liskov Substitution Principle by properly implementing the abstract class contract.
 * Demonstrates Single Responsibility Principle by focusing solely on Slack communication.
 */
@Injectable()
export class SlackProvider implements BotsProvider {
  private app: App;
  private channel: string;
  private readonly logger = new Logger(SlackProvider.name);

  /**
   * @constructor
   * @description Initializes the Slack provider with configuration from environment
   * @param {ConfigService} configService - NestJS config service for retrieving environment variables
   */

  constructor(private configService: ConfigService) {
    // Get configuration values from the config service
    const token = this.configService.get<string>('slack.botToken');
    const signingSecret = this.configService.get<string>('slack.signingSecret');
    this.channel = this.configService.get<string>('slack.channel') || '';

    try {
      // Initialize the Slack Bolt app
      this.app = new App({
        token,
        signingSecret,
        socketMode: false, // Set to true if you want to use Socket Mode with an app token
      });
    } catch (error) {
      this.logger.error('Failed to initialize Slack app:', error);
      throw new Error(`Slack app initialization failed: ${error.message}`);
    }
  }

  /**
   * @description Implements the abstract method to send notifications to Slack
   * @param {string} notification - The message content to be sent to Slack
   */
  public async sendNotificationToBot(notification: string): Promise<void> {
    if (!notification) {
      this.logger.warn('Empty notification received, skipping send');
      return;
    }

    if (!this.channel) {
      throw new Error('Slack channel not configured');
    }

    const blocks = this.formatNotification(notification) || [];

    try {
      // Send message to Slack using the Bolt client
      const result = await this.app.client.chat.postMessage({
        channel: this.channel,
        blocks,
        text: notification, // Fallback plain text for notifications
        mrkdwn: true,
      });

      if (!result.ok) {
        throw new Error(
          `Slack API responded with error: ${result.error || 'Unknown error'}`,
        );
      }

      this.logger.debug(`Message sent to channel ${this.channel}`);
    } catch (error) {
      this.logger.error('Failed to send message to Slack:', error);
      throw error;
    }
  }

  /**
   * @description Formats a plain text notification into Slack block format
   * @param {string} notification - The notification text to format
   */
  private formatNotification(notification: string): Array<KnownBlock> {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${notification}`,
        },
      },
    ];
  }
}
