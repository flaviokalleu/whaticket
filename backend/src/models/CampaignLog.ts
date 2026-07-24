import {
  Table,
  Column,
  CreatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Campaign from "./Campaign";
import Company from "./Company";

@Table({ updatedAt: false })
class CampaignLog extends Model<CampaignLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  event: string;

  @Column(DataType.TEXT)
  message: string | null;

  @CreatedAt
  createdAt: Date;

  @ForeignKey(() => Campaign)
  @AllowNull(false)
  @Column
  campaignId: number;

  @BelongsTo(() => Campaign)
  campaign: Campaign;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default CampaignLog;
