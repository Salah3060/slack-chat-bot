import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BotsProvider } from './bots.provider';
import { ConfigService } from '@nestjs/config';
import { App } from '@slack/bolt';
import { KnownBlock } from '@slack/types';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { URLSearchParams } from 'url';
import { SendNotificationDto } from '../dtos/send-notification.dto';
import { not } from 'joi';

/**
 * @class SlackProvider
 * @description Concrete implementation of BotsProvider for Slack integration.
 */
@Injectable()
export class SlackProvider implements BotsProvider {
  private app: App;
  private readonly logger = new Logger(SlackProvider.name);

  /**
   * @constructor
   * @description Initializes the Slack provider with configuration from environment
   * @param {ConfigService} configService - NestJS config service for retrieving environment variables
   */

  constructor(
    /**
     * @description Injected ConfigService for accessing environment variables.
     * @type {ConfigService}
     */
    private readonly configService: ConfigService,

    /**
     * @description Injected HttpService for making HTTP requests.
     * @type {HttpService}
     */
    private readonly httpService: HttpService,
  ) {}

  /**
   * @description Implements the abstract method to send notifications to Slack
   * @param {string} notification - The message content to be sent to Slack
   */
  public async sendNotification(
    sendNotificationDto: SendNotificationDto,
  ): Promise<void> {
    const body = {
      channel: sendNotificationDto.channel,
      text: sendNotificationDto.notification,
      blocks: {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: sendNotificationDto.notification,
        },
      },
    };
    try {
      // Make API request to Slack
      const response = await lastValueFrom(
        this.httpService.post('https://slack.com/api/chat.postMessage', body, {
          headers: {
            Authorization: `Bearer ${sendNotificationDto.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      // Verify the response
      const { data } = response;
      if (!data.ok) {
        this.logger.error(`Slack API error: ${data.error}`);
        throw new Error(`Failed to send Slack message: ${data.error}`);
      }

      console.log(data);
      return data;
    } catch (error) {
      this.logger.error(
        `Error sending Slack notification: ${error.message}`,
        error.stack,
      );
      throw new Error(`Slack notification failed: ${error.message}`);
    }
  }

  /**
   * @description Handles the OAuth token request from Slack
   * @param {string} code - The authorization code received from Slack
   */
  public async requestOAuthToken(code: string): Promise<string> {
    try {
      if (!code) {
        throw new Error('No authorization code received from Slack');
      }

      // Get credentials from configuration
      const clientId = this.configService.get<string>('slack.clientId') || '';
      const clientSecret =
        this.configService.get<string>('slack.clientSecret') || '';
      const redirectUri =
        'https://511e-197-39-255-144.ngrok-free.app/bots/callback';

      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      });

      // Exchange code for access token
      const response = await lastValueFrom(
        this.httpService.post(
          'https://slack.com/api/oauth.v2.access',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );
      if (!response.data.ok) {
        this.logger.error(`Slack OAuth error: ${response.data.error}`);
        throw new Error(`Failed to get OAuth token: ${response.data.error}`);
      }
      return response.data;
    } catch (error) {
      this.logger.error('Failed to request OAuth token from Slack:', error);
      throw error;
    }
  }
}
