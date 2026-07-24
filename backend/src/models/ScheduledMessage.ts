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
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Ticket from "./Ticket";
import Contact from "./Contact";
import Whatsapp from "./Whatsapp";
import User from "./User";

@Table
class ScheduledMessage extends Model<ScheduledMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Contact)
  @AllowNull(false)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Whatsapp)
  @AllowNull(false)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

  @Column
  mediaUrl: string;

  @AllowNull(false)
  @Column
  scheduledFor: Date;

  @Default("pending")
  @Column(DataType.ENUM("pending", "sent", "cancelled", "failed"))
  status: "pending" | "sent" | "cancelled" | "failed";

  @ForeignKey(() => User)
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

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ScheduledMessage;
