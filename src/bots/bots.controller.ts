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
  Headers,
  UseGuards,
} from '@nestjs/common';
import { BotsProvider } from './providers/bots.provider';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { CreateSlackIntegrationDto } from './dtos/create-slack-integration.dto';
import { SlackIntegrationProvider } from './providers/slack-integration.provider';
import { GenerateTokensProvider } from './providers/generate-token.provider';
import { createHmac } from 'crypto';
import { SlackSignatureGuard } from './guards/slack-signature.guard';
import { SlackAuthorizationGuard } from './guards/slack-trigger.guard';

/**
 * @class BotsController
 * @description Controller responsible for handling bot-related HTTP requests.
 */
@Controller('bots')
export class BotsController {
  private readonly logger = new Logger(BotsController.name);

  constructor(
    private readonly botProvider: BotsProvider,

    private readonly configService: ConfigService,

    private readonly httpService: HttpService,

    private readonly slackIntegrationProvider: SlackIntegrationProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
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
   * @description Handles the OAuth callback from Slack when the user authorizes the app.
   */
  @Get('/callback')
  // paused because of working in local environment
  // @UseGuards(SlackSignatureGuard)
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      const oauthToken = (await this.botProvider.requestOAuthToken(
        code,
      )) as any;
      console.log(oauthToken);
      // if the request is authorized from mudeer then it will have the mudeer user id
      const mudeerUserId =
        state.split('_')[0] === 'anon' ? undefined : state.split('_')[1];

      // 5. Use destructuring with proper defaults
      const {
        access_token: accessToken,
        scope,
        app_id: appId = '',
        authed_user: { id: authedUserId = '' } = {},
        team: { id: teamId = '' } = {},
      } = oauthToken;

      // 6. Use a DTO class with validation
      const createDto: CreateSlackIntegrationDto = {
        accessToken,
        scope,
        slackUserId: authedUserId,
        slackTeamId: teamId,
        slackAppId: appId,
        mudeerUserId,
      };
      console.log(createDto);

      // 7. Delegate to a service
      await this.slackIntegrationProvider.findAndUpdateOrCreate(createDto);

      console.log('user created successfully');
      // Redirect to success page
      res.redirect(`https://app.slack.com/client/${teamId}`);
      // return true;
    } catch (error) {
      this.logger.error(`OAuth exchange failed: ${error.message}`, error.stack);
      return res.redirect('/bots/error?message=Authentication+failed');
    }
  }

  @Get('/slack/oauth')
  redirectToSlack(@Res() res: Response) {
    const clientId = this.configService.get<string>('slack.clientId');
    const redirectUri =
      'https://38de-197-39-255-144.ngrok-free.app/bots/callback';
    const scope = 'chat:write,commands,users:read';

    // it will be mudeer user id incase of logged in from mudeer
    const state = `anon_${Math.random().toString(36).substring(2)}_${Date.now()}`;

    // TODO: Store state in session/database for validation in callback

    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;

    this.logger.log('Redirecting to Slack authorization page');
    res.redirect(authUrl);
  }

  @Post('/slack/commands/new-task')
  // @UseGuards(SlackSignatureGuard)
  @UseGuards(SlackAuthorizationGuard)
  @HttpCode(HttpStatus.OK)
  async triggerOpenTaskModel(@Body() body: any) {
    const { trigger_id, user_id } = body;
    await this.botProvider.openTaskModal(trigger_id, user_id);
    return 'Thanks for using our service';
  }

  @Post('/slack/interactions/new-task')
  // @UseGuards(SlackSignatureGuard)
  @HttpCode(HttpStatus.OK)
  handleInteractions(@Body() body: any) {
    const payload = JSON.parse(body.payload);

    if (payload.type === 'view_submission') {
      // Process the submission
      console.log('View submission received:', payload);

      // Example: return success (closes the modal)
      return {
        response_action: 'clear',
      };
    }

    return {};
  }

  @Post('/slack/commands/link-with-mudeer')
  @UseGuards(SlackAuthorizationGuard)
  // @UseGuards(SlackSignatureGuard)
  @HttpCode(HttpStatus.OK)
  redirectToMudeerWithSlackIdToken(@Body() body: any) {
    // the logic here is to redirect the user to mudeer with slack id token as a param
    return 'Will redirect to mudeer with slack id token , comming soon';
  }
}
