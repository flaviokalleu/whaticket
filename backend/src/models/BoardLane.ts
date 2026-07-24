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
import Board from "./Board";
import Company from "./Company";
import BoardTask from "./BoardTask";

@Table
class BoardLane extends Model<BoardLane> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Board)
  @AllowNull(false)
  @Column
  boardId: number;

  @BelongsTo(() => Board)
  board: Board;

  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Column
  position: number;

  @Column(DataType.STRING)
  color: string;

  @HasMany(() => BoardTask)
  tasks: BoardTask[];

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

export default BoardLane;
