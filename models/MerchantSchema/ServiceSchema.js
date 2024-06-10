const mongoose = require('mongoose');

// Services Schema
const ServicesSchema = new mongoose.Schema({
  ServicesName: { type: String, required: true },
  category: [{ type: String }],
  subcategory:[ { type: String }],
  ServicesDesciption:{ type: String },

  imagesWithDescriptions: [
    {
      image: { type: String },
      description: { type: String },
    },
   ],
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' }, // Reference to Business model

  date: { type: Date, default: Date.now },
});

// Model for Services
const Service = mongoose.model('Service', ServicesSchema);

module.exports = { Service };
