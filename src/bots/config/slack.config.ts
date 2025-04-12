import { registerAs } from '@nestjs/config';

export default registerAs('slack', () => ({
  botToken: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  channel: process.env.SLACK_CHANNEL,
}));
