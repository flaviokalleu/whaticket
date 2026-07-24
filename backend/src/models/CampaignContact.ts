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
  Unique,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Campaign from "./Campaign";
import Contact from "./Contact";
import Company from "./Company";

@Table
class CampaignContact extends Model<CampaignContact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default("pending")
  @Column(DataType.ENUM("pending", "sent", "failed"))
  status: string;

  @Column(DataType.DATE)
  sentAt: Date | null;

  @Column(DataType.TEXT)
  errorMessage: string | null;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Campaign)
  @AllowNull(false)
  @Unique("campaign_contact_unique")
  @Column
  campaignId: number;

  @BelongsTo(() => Campaign)
  campaign: Campaign;

  @ForeignKey(() => Contact)
  @AllowNull(false)
  @Unique("campaign_contact_unique")
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default CampaignContact;
