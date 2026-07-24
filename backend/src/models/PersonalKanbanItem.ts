import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import PersonalKanbanLane from "./PersonalKanbanLane";
import Company from "./Company";

@Table
class PersonalKanbanItem extends Model<PersonalKanbanItem> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => PersonalKanbanLane)
  @AllowNull(false)
  @Column
  laneId: number;

  @BelongsTo(() => PersonalKanbanLane)
  lane: PersonalKanbanLane;

  @AllowNull(false)
  @Column
  title: string;

  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column
  position: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default PersonalKanbanItem;
