import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("InternalChatGroupMembers", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "InternalChatGroups", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex(
      "InternalChatGroupMembers",
      ["groupId", "userId"],
      {
        unique: true,
        name: "internal_chat_group_member_unique"
      }
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex(
      "InternalChatGroupMembers",
      "internal_chat_group_member_unique"
    );
    await queryInterface.dropTable("InternalChatGroupMembers");
  }
};
