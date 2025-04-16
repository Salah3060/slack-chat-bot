import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSlackIntegrationDto {
  @IsNotEmpty()
  @IsString()
  slackTeamId: string;

  @IsNotEmpty()
  @IsString()
  slackUserId: string;

  @IsNotEmpty()
  @IsString()
  slackAppId: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  mudeerUserId?: string;
}
