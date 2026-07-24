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
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import BoardLane from "./BoardLane";
import User from "./User";
import Company from "./Company";
import BoardTaskTag from "./BoardTaskTag";
import BoardTaskChecklistItem from "./BoardTaskChecklistItem";

@Table
class BoardTask extends Model<BoardTask> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => BoardLane)
  @AllowNull(false)
  @Column
  laneId: number;

  @BelongsTo(() => BoardLane)
  lane: BoardLane;

  @AllowNull(false)
  @Column
  title: string;

  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column
  position: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  assignedUserId: number | null;

  @BelongsTo(() => User)
  assignedUser: User;

  @Column(DataType.DATEONLY)
  dueDate: Date | null;

  @HasMany(() => BoardTaskTag)
  tags: BoardTaskTag[];

  @HasMany(() => BoardTaskChecklistItem)
  checklistItems: BoardTaskChecklistItem[];

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

export default BoardTask;
