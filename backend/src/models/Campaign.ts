import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";
import User from "./User";
import Company from "./Company";
import CampaignContact from "./CampaignContact";
import CampaignLog from "./CampaignLog";

@Table
class Campaign extends Model<Campaign> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

  @Column(DataType.STRING)
  mediaUrl: string | null;

  @Default("draft")
  @Column(DataType.ENUM("draft", "scheduled", "running", "paused", "completed", "cancelled"))
  status: string;

  @Column(DataType.DATE)
  scheduledFor: Date | null;

  @AllowNull(false)
  @Default(20)
  @Column
  intervalSeconds: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Whatsapp)
  @AllowNull(false)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  createdBy: number;

  @BelongsTo(() => User)
  creator: User;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => CampaignContact)
  campaignContacts: CampaignContact[];

  @HasMany(() => CampaignLog)
  campaignLogs: CampaignLog[];
}

export default Campaign;
