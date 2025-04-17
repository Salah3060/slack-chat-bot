import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class SlackSignatureGuard implements CanActivate {
  private readonly logger = new Logger(SlackSignatureGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { rawBody?: string }>();
    const signature = request.headers['x-slack-signature'] as string;
    const timestamp = request.headers['x-slack-request-timestamp'] as string;
    console.log(request.headers);
    // 1. Check if required headers are present
    if (!signature || !timestamp) {
      this.logger.warn('Missing Slack signature headers');
      return false;
    }

    // 2. Verify timestamp to prevent replay attacks
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) {
      this.logger.warn(`Slack request timestamp is too old: ${timestamp}`);
      return false;
    }

    // 3. Get raw body from request (set by middleware)
    const rawBody = request.rawBody;
    if (!rawBody) {
      this.logger.warn('Raw body not available for signature verification');
      return false;
    }

    // 4. Compute expected signature
    const signingSecret = this.configService.get<string>('slack.signingSecret');
    const baseString = `v0:${timestamp}:${rawBody}`;
    const hmac = createHmac('sha256', signingSecret || '');
    const computedSignature = `v0=${hmac.update(baseString).digest('hex')}`;

    // 5. Compare signatures
    const isValid = computedSignature === signature;
    if (!isValid) {
      this.logger.warn('Invalid Slack signature');
    }

    return isValid;
  }
}
