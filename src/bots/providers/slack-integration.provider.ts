import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlackIntegration } from '../entities/slack-integration.entity';
import { CreateSlackIntegrationDto } from '../dtos/create-slack-integration.dto';

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
  async findBySlackUserId(
    slackUserId: string,
  ): Promise<SlackIntegration | null> {
    return this.slackIntegrationRepository.findOne({
      where: {
        slackUserId,
      },
    });
  }

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
}
