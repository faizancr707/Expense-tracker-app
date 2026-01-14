const Razorpay = require('razorpay');
const razorPayInstance = require('../util/razorPay');

const Order = require('../models/orders');
const User = require('../models/user');

exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: 100, // ₹1 = 100 paise
      currency: 'INR'
    };

    const order = await razorPayInstance.orders.create(options);

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZOR_ID
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create order' });
  }
};
exports.addOrder = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body.response;

    const order = await Order.create({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      status: 'SUCCESS',
      userId: req.user.userId
    });

    await User.findByIdAndUpdate(
      req.user.userId,
      { isPremiumUser: true }
    );

    res.status(200).json({
      message: 'User upgraded to premium',
      order
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};
