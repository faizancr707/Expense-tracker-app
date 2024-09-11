const sequelize = require('../util/database');
const {DataTypes} = require('sequelize');
const queryInterface = sequelize.getQueryInterface();

const Report = sequelize.define( 'reports', {
    fileName: {
        type: DataTypes.STRING,
        allowNull:false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }
} );

module.exports = Report;