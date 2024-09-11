const sequelize = require('../util/database');
const {DataTypes} = require('sequelize');
const queryInterface = sequelize.getQueryInterface();

const Orders = sequelize.define( 'Orders', {
    amount: {
        type:DataTypes.INTEGER,
        allowNull:false
    },
    payment_Id: {
        type: DataTypes.STRING,
        allowNull:false
    }, 
    order_Id: {
        type: DataTypes.STRING,
        allowNull:false
    },
    signature: {
        type: DataTypes.STRING,
        allowNull:false
    }
});

module.exports = Orders;