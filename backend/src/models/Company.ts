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
  HasMany
} from "sequelize-typescript";
import User from "./User";
import Contact from "./Contact";
import Ticket from "./Ticket";
import Whatsapp from "./Whatsapp";
import Queue from "./Queue";
import Tag from "./Tag";
import QuickAnswer from "./QuickAnswer";
import Setting from "./Setting";

@Table
class Company extends Model<Company> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Default("active")
  @Column(DataType.ENUM("active", "blocked", "suspended"))
  status: "active" | "blocked" | "suspended";

  @Column
  dueDate: Date;

  @Default(false)
  @Column
  isMaintenanceMode: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => User)
  users: User[];

  @HasMany(() => Contact)
  contacts: Contact[];

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => Whatsapp)
  whatsapps: Whatsapp[];

  @HasMany(() => Queue)
  queues: Queue[];

  @HasMany(() => Tag)
  tags: Tag[];

  @HasMany(() => QuickAnswer)
  quickAnswers: QuickAnswer[];

  @HasMany(() => Setting)
  settings: Setting[];
}

export default Company;
