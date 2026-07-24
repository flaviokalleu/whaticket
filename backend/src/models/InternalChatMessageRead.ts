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
import InternalChatGroup from "./InternalChatGroup";

@Table
class InternalChatMessageRead extends Model<InternalChatMessageRead> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  userId: number;

  @BelongsTo(() => User, "userId")
  user: User;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  otherUserId: number | null;

  @BelongsTo(() => User, "otherUserId")
  otherUser: User;

  @ForeignKey(() => InternalChatGroup)
  @Column(DataType.INTEGER)
  groupId: number | null;

  @BelongsTo(() => InternalChatGroup)
  group: InternalChatGroup;

  @AllowNull(false)
  @Column
  lastReadAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default InternalChatMessageRead;
