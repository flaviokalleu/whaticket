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
import LeadPipeline from "./LeadPipeline";
import User from "./User";
import LeadInteraction from "./LeadInteraction";
import LeadTask from "./LeadTask";

@Table
class Lead extends Model<Lead> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => LeadPipeline)
  @AllowNull(false)
  @Column
  leadPipelineId: number;

  @BelongsTo(() => LeadPipeline)
  leadPipeline: LeadPipeline;

  @AllowNull(false)
  @Column
  name: string;

  @Column(DataType.STRING)
  phone: string;

  @Column(DataType.STRING)
  email: string;

  @Column(DataType.STRING)
  source: string;

  @Default("new")
  @Column
  status: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => LeadInteraction)
  interactions: LeadInteraction[];

  @HasMany(() => LeadTask)
  tasks: LeadTask[];
}

export default Lead;
