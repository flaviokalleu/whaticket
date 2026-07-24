import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Queues", "slaMinutes", {
        type: DataTypes.INTEGER,
        allowNull: true
      }),
      queryInterface.addColumn("Queues", "slaResolutionMinutes", {
        type: DataTypes.INTEGER,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Queues", "slaMinutes"),
      queryInterface.removeColumn("Queues", "slaResolutionMinutes")
    ]);
  }
};
