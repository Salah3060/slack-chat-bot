import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Query,
  Res,
  Logger,
  Inject,
} from '@nestjs/common';
import { BotsProvider } from './providers/bots.provider';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { CreateSlackIntegrationDto } from './dtos/create-slack-integration.dto';
import { SlackIntegrationProvider } from './providers/slack-integration.provider';

/**
 * @class BotsController
 * @description Controller responsible for handling bot-related HTTP requests.
 */
@Controller('bots')
export class BotsController {
  private readonly logger = new Logger(BotsController.name);

  constructor(
    /**
     * @description Injected BotsProvider that handles all bot communication logic.
     * This follows Dependency Inversion Principle by depending on abstraction.
     * @type {BotsProvider}
     */
    private readonly botProvider: BotsProvider,

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

    private readonly slackIntegrationProvider: SlackIntegrationProvider,
  ) {}

  /**
   * @description Endpoint that handles incoming Slack notifications
   */
  @Post('/slack')
  @HttpCode(HttpStatus.OK)
  public async sentNotification(
    @Body() sendNotificationDto: SendNotificationDto,
  ): Promise<void> {
    await this.botProvider.sendNotification(sendNotificationDto);
  }

  /**
   * @description Handles the OAuth callback from Slack
   * @param {string} code - Authorization code from Slack
   * @param {string} state - State parameter for CSRF protection
   * @param {Response} res - Express response object
   */
  @Get('/callback')
  async requestOAuthToken(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      const oauthToken = (await this.botProvider.requestOAuthToken(
        code,
      )) as any;
      console.log(`OAuth token received`);
      console.log(typeof oauthToken);
      console.log(oauthToken);

      // 5. Use destructuring with proper defaults
      const {
        access_token: accessToken,
        scope,
        app_id: appId = '',
        bot_user_id: botUserId = '',
        authed_user: { id: authedUserId = '' } = {},
        team: { id: teamId = '', name: teamName = '' } = {},
        token_type: tokenType = 'bot',
        is_enterprise_install: isEnterpriseInstall = false,
      } = oauthToken;

      // 6. Use a DTO class with validation
      const createDto: CreateSlackIntegrationDto = {
        accessToken,
        scope,
        slackUserId: authedUserId,
        slackTeamId: teamId,
        slackAppId: appId,
        mudeerUserId: '',
      };

      // 7. Delegate to a service
      await this.slackIntegrationProvider.create(createDto);

      console.log('user created successfully');
      // Redirect to success page
      res.redirect('/bots/success');
      // return true;
    } catch (error) {
      this.logger.error(`OAuth exchange failed: ${error.message}`, error.stack);
      return res.redirect('/bots/error?message=Authentication+failed');
    }
  }

  @Get('/success')
  successPage(@Res() res: Response) {
    return res.status(200).send('Successfully connected to Slack!');
  }

  @Get('/slack/oauth')
  redirectToSlack(@Res() res: Response) {
    const clientId = this.configService.get<string>('slack.clientId');
    const redirectUri =
      'https://9cd3-197-39-255-144.ngrok-free.app/bots/callback';
    const scope = 'chat:write,commands,users:read';

    // Generate random state for CSRF protection
    const state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    console.log(state);

    // TODO: Store state in session/database for validation in callback

    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;

    this.logger.log('Redirecting to Slack authorization page');
    res.redirect(authUrl);
  }
}
