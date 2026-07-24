import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  Unique,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import FlowExecution from "./FlowExecution";

@Table
class Flow extends Model<Flow> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Default(true)
  @Column
  isActive: boolean;

  @Default([])
  @Column(DataType.JSONB)
  nodes: unknown[];

  @Default([])
  @Column(DataType.JSONB)
  edges: unknown[];

  @Unique
  @Column(DataType.STRING)
  webhookToken: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => FlowExecution)
  executions: FlowExecution[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Flow;
