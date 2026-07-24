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
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import BoardTask from "./BoardTask";
import Company from "./Company";

@Table
class BoardTaskChecklistItem extends Model<BoardTaskChecklistItem> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => BoardTask)
  @AllowNull(false)
  @Column
  taskId: number;

  @BelongsTo(() => BoardTask)
  task: BoardTask;

  @AllowNull(false)
  @Column
  title: string;

  @Default(false)
  @Column
  isCompleted: boolean;

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

export default BoardTaskChecklistItem;
