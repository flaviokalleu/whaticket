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
  Unique
} from "sequelize-typescript";
import User from "./User";
import InternalChatGroup from "./InternalChatGroup";

@Table
class InternalChatGroupMember extends Model<InternalChatGroupMember> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => InternalChatGroup)
  @AllowNull(false)
  @Unique("internal_chat_group_member_unique")
  @Column
  groupId: number;

  @BelongsTo(() => InternalChatGroup)
  group: InternalChatGroup;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Unique("internal_chat_group_member_unique")
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default InternalChatGroupMember;
