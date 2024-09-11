const sequelize = require('../util/database');
const {DataTypes} = require('sequelize');
const queryInterface = sequelize.getQueryInterface();

const Expense = sequelize.define('expenses', {
    amount: {
        type: DataTypes.INTEGER,
        defaultValue:0,
        allowNull:false
    }, 
    desc: {
        type: DataTypes.STRING,  
        allowNull:false
    },
    category: {
        type: DataTypes.ENUM('Food', 'Rent', 'Travel', 'Bills'),
        allowNull: false
    }
});

module.exports = Expense;