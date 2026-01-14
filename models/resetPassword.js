const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const resetPasswordSchema = new Schema(
  {
    id: {
      type: String,      // same as your STRING primaryKey
      required: true
    },

    isActive: {
      type: Boolean,
      default: true      // usually reset links start active
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ResetPassword', resetPasswordSchema);
