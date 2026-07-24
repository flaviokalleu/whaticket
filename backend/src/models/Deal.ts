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
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import Pipeline from "./Pipeline";
import PipelineStage from "./PipelineStage";
import Contact from "./Contact";
import User from "./User";
import DealNote from "./DealNote";

@Table
class Deal extends Model<Deal> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Pipeline)
  @AllowNull(false)
  @Column
  pipelineId: number;

  @BelongsTo(() => Pipeline)
  pipeline: Pipeline;

  @ForeignKey(() => PipelineStage)
  @AllowNull(false)
  @Column
  stageId: number;

  @BelongsTo(() => PipelineStage)
  stage: PipelineStage;

  @ForeignKey(() => Contact)
  @Column(DataType.INTEGER)
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @AllowNull(false)
  @Column
  title: string;

  @Column(DataType.DECIMAL(12, 2))
  value: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Default("open")
  @Column(DataType.ENUM("open", "won", "lost"))
  status: "open" | "won" | "lost";

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => DealNote)
  notes: DealNote[];
}

export default Deal;
