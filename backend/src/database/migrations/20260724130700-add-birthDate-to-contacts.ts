import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table = (await queryInterface.describeTable("Contacts")) as Record<
      string,
      unknown
    >;

    if (!table.birthDate) {
      await queryInterface.addColumn("Contacts", "birthDate", {
        type: DataTypes.DATEONLY,
        allowNull: true
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const table = (await queryInterface.describeTable("Contacts")) as Record<
      string,
      unknown
    >;

    if (table.birthDate) {
      await queryInterface.removeColumn("Contacts", "birthDate");
    }
  }
};
