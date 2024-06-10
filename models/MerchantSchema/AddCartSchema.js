const mongoose = require('mongoose');

// AddToCart Schema
const addToCartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String, // You may want to store the URL or file path
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const AddToCart = mongoose.model('AddToCart', addToCartSchema);

module.exports = {
  AddToCart
};
