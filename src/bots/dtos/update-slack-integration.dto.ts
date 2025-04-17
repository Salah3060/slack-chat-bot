import { IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateSlackIntegrationDto } from './create-slack-integration.dto';

/**
 * @class UpdateSlackIntegrationDto
 * @description DTO for updating Slack integrations
 * @extends PartialType<CreateSlackIntegrationDto>
 */
export class UpdateSlackIntegrationDto extends PartialType(
  CreateSlackIntegrationDto,
) {
  // Override fields that should be handled differently for updates
}
