const mongoose = require('mongoose');
const notificationMerchantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming there is a 'User' model for userId reference
    required: true,
  },

  query: {
    type: String,
    required: true,
  },

  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business', // Reference to the Business model
    required: true,
  },
});

const NotificationMerchant = mongoose.model('NotificationMerchant', notificationMerchantSchema);

module.exports = NotificationMerchant;
