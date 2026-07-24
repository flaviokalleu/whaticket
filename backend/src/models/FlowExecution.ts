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
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Flow from "./Flow";

export interface FlowLogEntry {
  nodeId: string;
  type: string;
  status: string;
  message: string;
  at: string;
}

@Table
class FlowExecution extends Model<FlowExecution> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Flow)
  @AllowNull(false)
  @Column
  flowId: number;

  @BelongsTo(() => Flow)
  flow: Flow;

  @Default("pending")
  @Column(DataType.ENUM("pending", "running", "completed", "failed"))
  status: "pending" | "running" | "completed" | "failed";

  @Column(DataType.JSONB)
  input: Record<string, unknown> | null;

  @Default([])
  @Column(DataType.JSONB)
  log: FlowLogEntry[];

  @Column(DataType.DATE)
  finishedAt: Date | null;

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

export default FlowExecution;
