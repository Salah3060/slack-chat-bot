import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * @class SlackIntegration
 * @description Entity representing a Slack workspace integration with OAuth credentials
 */
@Entity('')
@Index(['slackTeamId', 'slackUserId', 'slackAppId'], { unique: true }) // Composite PK & index
export class SlackIntegration {
  @PrimaryColumn({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  slackTeamId: string; // Part of composite PK - Slack workspace ID

  @PrimaryColumn({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  slackUserId: string; // Part of composite PK - User who authorized the app

  @PrimaryColumn({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  slackAppId: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  accessToken: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  scope: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  mudeerUserId: string;

  @CreateDateColumn()
  installedAt: Date;
}
