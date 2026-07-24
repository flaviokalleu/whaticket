import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Ticket from "./Ticket";
import TicketReopenReason from "./TicketReopenReason";
import User from "./User";

@Table
class TicketReopenLog extends Model<TicketReopenLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Ticket)
  @AllowNull(false)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => TicketReopenReason)
  @AllowNull(false)
  @Column
  reopenReasonId: number;

  @BelongsTo(() => TicketReopenReason)
  reopenReason: TicketReopenReason;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TicketReopenLog;
