const sequelize = require('../util/database');
const {DataTypes} = require('sequelize');
const queryInterface = sequelize.getQueryInterface();

const User = sequelize.define('User', {
    id: {
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        validate: {
            isEmail:true
        },
        primaryKey:true
    },
    firstName: {
        type:DataTypes. STRING,
        allowNull:false
    },
    lastName: {
        type:DataTypes.STRING,
        allowNull:false
    },
    email: {
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
            isEmail:true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull:false
    },
    isPremiumUser: {
        type:DataTypes.BOOLEAN,
        defaultValue:false,
        allowNull:false
    },
    totalExpense: {
        type: DataTypes.DECIMAL(10, 2), // Adjust the data type as needed
        allowNull: false, // or true based on your requirement
        defaultValue: 0.00, // Optional: set a default value
      }
});

module.exports = User;