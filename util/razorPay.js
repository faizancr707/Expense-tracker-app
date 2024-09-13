
const Razorpay = require('razorpay');

const razorPayInstance = new Razorpay({
  key_id: process.env.RAZOR_ID,
  key_secret: process.env.RAZOR_KEY,
});

module.exports = razorPayInstance;