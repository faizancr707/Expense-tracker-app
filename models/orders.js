const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },

    paymentId: {
      type: String,
      required: true
    },

    orderId: {
      type: String,
      required: true
    },

    signature: {
      type: String,
      required: true
    },

    status: {
      type: String,
      default: 'SUCCESS'
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
