const Razorpay = require('razorpay');
const razorPayInstance = require('../util/razorPay');
const sequelize = require('../util/database');
const { Sequelize, DataTypes } = require('sequelize');
const Orders = require('../models/orders');
const User = require('../models/user');

exports.createOrder = async (req, res, next) => {
  let transaction;
  
  try {
    // new transaction
    transaction = await sequelize.transaction();

    const options = {
      amount: 1 * 100, 
      currency: 'INR',
    };

    
    razorPayInstance.orders.create(options, async (err, order) => {
      if (err) {
        console.log(err);
        await transaction.rollback();
        return res.status(500).json({ message: 'Something went wrong' });
      }

     
      order.razorPayId = process.env.RAZOR_ID;
      await transaction.commit();
      return res.status(200).json(order);
    });
  } catch (error) {
    console.error(error);
    
    
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    res.status(500).json({ message: 'Server Error' });
  }
};

exports.addOrder = async (req, res, next) => {
  let transaction;

  try {
    // Start a new transaction
    transaction = await sequelize.transaction();

    const orderDetails = {
      amount: req.body.amount,
      payment_Id: req.body.response.razorpay_payment_id,
      order_Id: req.body.response.razorpay_order_id,
      signature: req.body.response.razorpay_signature,
      UserId: req.body.userId,
    };

    
    const order = await Orders.create(orderDetails, { transaction });

   
    const isExistingUser = await User.findByPk(req.body.userId);

    if (isExistingUser) {
   
      await isExistingUser.update({ isPremiumUser: true }, { transaction });
      await transaction.commit(); 
      return res.status(200).json({ message: 'User upgraded to premium.' });
    } else {
      await transaction.rollback(); 
      return res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error(error);

    
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    res.status(500).json({ message: 'Server Error' });
  }
};
