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
  BelongsTo,
  DataType
} from "sequelize-typescript";
import User from "./User";
import Company from "./Company";
import InternalChatGroup from "./InternalChatGroup";

@Table
class InternalChatMessage extends Model<InternalChatMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => InternalChatGroup)
  @Column(DataType.INTEGER)
  groupId: number | null;

  @BelongsTo(() => InternalChatGroup)
  group: InternalChatGroup;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  fromUserId: number;

  @BelongsTo(() => User, "fromUserId")
  fromUser: User;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  toUserId: number | null;

  @BelongsTo(() => User, "toUserId")
  toUser: User;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

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

export default InternalChatMessage;
