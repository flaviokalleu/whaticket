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
  Unique,
  Default,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Whatsapp from "./Whatsapp";

@Table
class BirthdaySetting extends Model<BirthdaySetting> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default(false)
  @Column
  isEnabled: boolean;

  @Column(DataType.TEXT)
  messageTemplate: string;

  @Default(9)
  @Column
  sendHour: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @AllowNull(false)
  @Unique
  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;
}

export default BirthdaySetting;
