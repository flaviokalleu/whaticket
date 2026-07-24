import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  ForeignKey,
  BelongsTo,
  BelongsToMany
} from "sequelize-typescript";
import Company from "./Company";
import Department from "./Department";
import User from "./User";
import TeamUser from "./TeamUser";

@Table
class Team extends Model<Team> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique("team_name_company")
  @Column
  name: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Company)
  @Unique("team_name_company")
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Department)
  @Column
  departmentId: number;

  @BelongsTo(() => Department)
  department: Department;

  @BelongsToMany(() => User, () => TeamUser)
  users: Array<User & { TeamUser: TeamUser }>;
}

export default Team;
