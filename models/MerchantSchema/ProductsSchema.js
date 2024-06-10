const mongoose = require('mongoose');

// Product Schema
const ProductSchema = new mongoose.Schema({
  ProductName: { type: String, required: true },
  category: [{ type: String }],
  subcategory:[ { type: String }],
  productDesciption:{ type: String },
  imagesWithDescriptions: [
    {
      image: { type: String },
      description: { type: String },
    },
   ],
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' }, // Reference to Business model

  date: { type: Date, default: Date.now },
});

// Model for Product
const Product = mongoose.model('Product', ProductSchema);

module.exports = { Product };
