const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    type: { type: DataTypes.ENUM('Equipment', 'Leave'), allowNull: false },
    items: { type: DataTypes.STRING, allowNull: false },
    status: { 
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), 
      allowNull: false, 
      defaultValue: 'Pending' 
    },
    employeeId: { type: DataTypes.STRING, allowNull: false }, // FK to Employee
    created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated: { type: DataTypes.DATE }
  };

  const options = {
    timestamps: false,
    defaultScope: {
      attributes: { exclude: [] }
    },
    scopes: {}
  };

  return sequelize.define('request', attributes, options);
}