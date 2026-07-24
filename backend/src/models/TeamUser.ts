import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Unique,
  ForeignKey
} from "sequelize-typescript";
import Team from "./Team";
import User from "./User";

@Table
class TeamUser extends Model<TeamUser> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Team)
  @Unique("team_user_unique")
  @Column
  teamId: number;

  @ForeignKey(() => User)
  @Unique("team_user_unique")
  @Column
  userId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TeamUser;
