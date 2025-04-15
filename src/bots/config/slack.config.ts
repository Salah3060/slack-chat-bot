import { registerAs } from '@nestjs/config';

export default registerAs('slack', () => ({
  botToken: process.env.SLACK_BOT_TOKEN,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  channel: process.env.SLACK_CHANNEL,
  clientId: process.env.SLACK_CLIENT_ID,
}));
