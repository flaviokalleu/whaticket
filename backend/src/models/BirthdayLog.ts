import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Contact from "./Contact";

@Table
class BirthdayLog extends Model<BirthdayLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  sentAt: Date;

  @AllowNull(false)
  @Unique("birthday_log_contact_year")
  @Column
  year: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @AllowNull(false)
  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @AllowNull(false)
  @Unique("birthday_log_contact_year")
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;
}

export default BirthdayLog;
