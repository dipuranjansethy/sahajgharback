const mongoose = require('mongoose');

// Banneres Schemas
const BannerSchema = new mongoose.Schema({
  homeBanner :[{type:String}],
  adsBanner:[{type:String}],
  date: { type: Date, default: Date.now },

});
//  Models for Banner and Banner Service
const Banner = mongoose.model('Banner', BannerSchema);

module.exports = { Banner };
