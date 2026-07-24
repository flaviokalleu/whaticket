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
  HasMany
} from "sequelize-typescript";
import User from "./User";
import Company from "./Company";
import InternalChatGroupMember from "./InternalChatGroupMember";
import InternalChatMessage from "./InternalChatMessage";

@Table
class InternalChatGroup extends Model<InternalChatGroup> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

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

  @HasMany(() => InternalChatGroupMember)
  members: InternalChatGroupMember[];

  @HasMany(() => InternalChatMessage)
  messages: InternalChatMessage[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default InternalChatGroup;
