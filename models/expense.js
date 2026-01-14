const mongoose= require('mongoose');
const Schema = mongoose.Schema;
const expenseSchema = new Schema({

 amount: {
      type: Number,        // INTEGER → Number
      required: true,
      min: 0,
      default: 0
    },

    desc: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      enum: ['Food', 'Rent', 'Travel', 'Bills']
    }
  },
  {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);