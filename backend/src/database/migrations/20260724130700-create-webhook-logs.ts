import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("WebhookLogs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      webhookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Webhooks", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      event: {
        type: DataTypes.STRING,
        allowNull: false
      },
      statusCode: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      success: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      responseBody: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("WebhookLogs");
  }
};
