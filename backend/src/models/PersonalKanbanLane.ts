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
import PersonalKanbanItem from "./PersonalKanbanItem";

@Table
class PersonalKanbanLane extends Model<PersonalKanbanLane> {
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

  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Column
  position: number;

  @HasMany(() => PersonalKanbanItem)
  items: PersonalKanbanItem[];

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

export default PersonalKanbanLane;
