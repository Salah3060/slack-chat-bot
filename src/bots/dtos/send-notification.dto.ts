import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendNotificationDto {
  @IsNotEmpty({ message: 'notification cannot be empty' })
  @IsString({ message: 'notification must be a string' })
  @MaxLength(255, { message: 'notification cannot exceed 255 characters' })
  notification: string;
  @IsNotEmpty({ message: 'token cannot be empty' })
  @IsString({ message: 'token must be a string' })
  @MaxLength(255, { message: 'token cannot exceed 255 characters' })
  token: string;
  @IsString({ message: 'channel must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'channel cannot exceed 255 characters' })
  channel: string;
}
