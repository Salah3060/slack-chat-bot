import { Injectable } from '@nestjs/common';
import { BotsProvider } from './bots.provider';
import { ConfigService } from '@nestjs/config';
import { App } from '@slack/bolt';
import { KnownBlock } from '@slack/types';

@Injectable()
export class SlackProvider implements BotsProvider {
  private app: App;
  private channel: string;

  constructor(private configService: ConfigService) {
    // Get configuration values from the config service
    const token = this.configService.get<string>('slack.botToken');
    const signingSecret = this.configService.get<string>('slack.signingSecret');
    this.channel = this.configService.get<string>('slack.channel') || ''; // Changed from channelId

    // Initialize the Slack Bolt app
    this.app = new App({
      token,
      signingSecret,
      socketMode: false, // Set to true if you want to use Socket Mode with an app token
    });
  }

  public async sendNotificationToBot(notification: string): Promise<void> {
    const blocks = this.formatNotification(notification) || [];

    try {
      // Send message to Slack using the Bolt client
      await this.app.client.chat.postMessage({
        channel: this.channel,
        blocks,
        text: notification,
        mrkdwn: true,
      });
    } catch (error) {
      console.error('Failed to send message to Slack:', error);
      throw error;
    }
  }
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
