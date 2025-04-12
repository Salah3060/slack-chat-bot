import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BotsProvider {
  abstract sendNotificationToBot(notification: string): Promise<void>;
}
