import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SlackIntegrationProvider } from '../providers/slack-integration.provider';

@Injectable()
export class SlackAuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(SlackAuthorizationGuard.name);

  constructor(
    private readonly slackIntegrationProvider: SlackIntegrationProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    // Extract Slack identifiers from the request body
    const { user_id, team_id, api_app_id } = body;

    if (!user_id || !team_id) {
      this.logger.warn('Missing required Slack identifiers in request');
      throw new UnauthorizedException('Invalid Slack request format');
    }

    // Find the Slack integration for this user
    try {
      const slackIntegration =
        await this.slackIntegrationProvider.findBySlackUserId(
          user_id,
          team_id,
          api_app_id,
        );

      // Check if integration exists and is linked to Mudeer
      if (!slackIntegration) {
        this.logger.warn(
          `No Slack integration found for user ${user_id} in team ${team_id}`,
        );
        throw new UnauthorizedException('Please install our Slack app first');
      }

      if (!slackIntegration.mudeerUserId) {
        this.logger.warn(
          `Slack user ${user_id} not linked to a Mudeer account`,
        );
        throw new UnauthorizedException(
          'Please link your Slack account with Mudeer first',
        );
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Error validating Slack integration');
    }
  }
}
