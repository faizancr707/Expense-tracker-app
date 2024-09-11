const sequelize = require('../util/database');
const {DataTypes} = require('sequelize');
const queryInterface = sequelize.getQueryInterface();

const ResetPassword = sequelize.define( 'ResetPassword', {
    id: {
        type:DataTypes.STRING,
        primaryKey:true,
        allowNull:false,
    },
    isActive: {
        type:DataTypes.BOOLEAN,
        defaultValue:false,
        allowNull:false
    },
    email: {
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
            isEmail:true
        }
    },
});

module.exports = ResetPassword;