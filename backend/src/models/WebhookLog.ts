import {
  Table,
  Column,
  CreatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Webhook from "./Webhook";

@Table
class WebhookLog extends Model<WebhookLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Webhook)
  @AllowNull(false)
  @Column
  webhookId: number;

  @BelongsTo(() => Webhook)
  webhook: Webhook;

  @AllowNull(false)
  @Column
  event: string;

  @Column
  statusCode: number;

  @AllowNull(false)
  @Column
  success: boolean;

  @Column(DataType.JSONB)
  payload: object;

  @Column(DataType.TEXT)
  responseBody: string;

  @CreatedAt
  createdAt: Date;
}

export default WebhookLog;
