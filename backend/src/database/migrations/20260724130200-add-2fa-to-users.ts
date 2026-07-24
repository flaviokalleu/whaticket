import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Users", "twoFactorSecret", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Users", "twoFactorEnabled", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "twoFactorSecret"),
      queryInterface.removeColumn("Users", "twoFactorEnabled")
    ]);
  }
};
