import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService, ConfigType } from '@nestjs/config';

@Injectable()
export class GenerateTokensProvider {
  constructor(
    /**
     * Inject jwtService
     */
    private readonly jwtService: JwtService,

    /**
     * Inject jwtConfiguration
     */
    private readonly configService: ConfigService,
  ) {}

  public async generateToken(slackUserId: string): Promise<string> {
    // Create a token with Slack-specific information
    const token = await this.jwtService.signAsync(
      {
        sub: slackUserId,
        type: 'slack_integration_temporary_token',
        provider: 'slack',
        issuedAt: new Date().toISOString(),
      },
      {
        secret: this.configService.get('slack.jwtSecret'),
        expiresIn: this.configService.get('slack.jwtTtl') || '5m',
      },
    );

    return token;
  }
}
