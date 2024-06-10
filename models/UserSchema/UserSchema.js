const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt=require('jsonwebtoken');

// User Schema
const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  Mobile: { type: String, required: true },
  
  imagesWithDescriptions: [
    {
      image: { type: String },
      description: { type: String },
    },
   ],
       
  
   location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },

    
  },

  date: { type: Date, default: Date.now },
  otp :String,
  otpExpire:String,
});

UserSchema.methods.getOtp = function () {
  const otp = crypto.randomInt(1000, 10000).toString();
  this.otp = otp;
  
  this.otpExpire = Date.now() + 15 * 60 * 1000;
  
  return otp;
};
UserSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};
UserSchema.methods.compareOtp = function (otp) {
  return otp == this.otp;
};
// Model for User
const User = mongoose.model('User', UserSchema);

module.exports = { User };
