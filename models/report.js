const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reportSchema = new Schema({
    fileName: {
      type: String,
      required: true,
      trim: true
    },

    url: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', reportSchema);
