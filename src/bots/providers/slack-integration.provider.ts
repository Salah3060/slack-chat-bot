import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlackIntegration } from '../entities/slack-integration.entity';
import { CreateSlackIntegrationDto } from '../dtos/create-slack-integration.dto';
import { UpdateSlackIntegrationDto } from '../dtos/update-slack-integration.dto';

/**
 * @class SlackIntegrationService
 * @description Service responsible for CRUD operations on SlackIntegration entity
 */
@Injectable()
export class SlackIntegrationProvider {
  constructor(
    @InjectRepository(SlackIntegration)
    private slackIntegrationRepository: Repository<SlackIntegration>,
  ) {}

  /**
   * @description Create a new Slack integration record
   * @param {CreateSlackIntegrationDto} createDto - Data to create the integration
   */
  async create(
    createDto: CreateSlackIntegrationDto,
  ): Promise<SlackIntegration> {
    const integration = this.slackIntegrationRepository.create(createDto);
    return this.slackIntegrationRepository.save(integration);
  }

  /**
   * @description Find integration by slack user ID
   * @param {string} slackUserId - Slack user ID
   */
  /**
   * @description Find integration by Mudeer user ID
   * @param {string} mudeerUserId - Internal Mudeer user ID
   */
  async findByMudeerUserId(
    mudeerUserId: string,
  ): Promise<SlackIntegration | null> {
    return this.slackIntegrationRepository.findOne({
      where: { mudeerUserId },
    });
  }
  /**
   * @description Find an existing integration or create a new one if not found
   * @param {CreateSlackIntegrationDto} createDto - Data for the integration
   * @returns {Promise<SlackIntegration>} The found or newly created integration
   */
  async findAndUpdateOrCreate(
    createDto: CreateSlackIntegrationDto,
  ): Promise<SlackIntegration> {
    try {
      const { slackUserId, slackAppId, slackTeamId } = createDto;

      // Only search by primary key fields
      const existingIntegration = await this.slackIntegrationRepository.findOne(
        {
          where: {
            slackUserId,
            slackAppId,
            slackTeamId,
          },
        },
      );

      if (existingIntegration) {
        // Optional: Update the existing record with new values
        // Skip fields that shouldn't be updated, e.g. primary keys
        const { accessToken, scope, mudeerUserId } = createDto;

        // Update changed fields
        existingIntegration.accessToken =
          accessToken || existingIntegration.accessToken;
        existingIntegration.scope = scope || existingIntegration.scope;
        existingIntegration.mudeerUserId =
          mudeerUserId || existingIntegration.mudeerUserId;

        // Save the updated record
        return this.slackIntegrationRepository.save(existingIntegration);
      }

      // Create new if not found
      return this.create(createDto);
    } catch (error) {
      Logger.error(
        `Error in findOrCreate: ${error.message}`,
        error.stack,
        'SlackIntegrationProvider',
      );
      throw error;
    }
  }
  async findBySlackUserId(
    slackUserId: string,
    slackTeamId: string,
    slackAppId: string,
  ): Promise<SlackIntegration | null> {
    return this.slackIntegrationRepository.findOne({
      where: { slackUserId, slackTeamId, slackAppId },
    });
  }
}
