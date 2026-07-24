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
  BelongsToMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Ticket from "./Ticket";
import TicketTag from "./TicketTag";
import Company from "./Company";

@Table
class Tag extends Model<Tag> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique("tag_name_company")
  @Column
  name: string;

  @AllowNull(false)
  @Column
  color: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(() => Ticket, () => TicketTag)
  tickets: Array<Ticket & { TicketTag: TicketTag }>;

  @ForeignKey(() => Company)
  @Unique("tag_name_company")
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default Tag;
