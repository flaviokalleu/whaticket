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
import User from "./User";
import Company from "./Company";

@Table
class PushSubscription extends Model<PushSubscription> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @AllowNull(false)
  @Column(DataType.TEXT)
  endpoint: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  p256dh: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  auth: string;

  @CreatedAt
  createdAt: Date;
}

export default PushSubscription;
