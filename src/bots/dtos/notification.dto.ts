import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class NotificationDto {
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @IsString({ message: 'Message must be a string' })
  @MaxLength(1000, { message: 'Message cannot exceed 1000 characters' })
  notification: string;
}
