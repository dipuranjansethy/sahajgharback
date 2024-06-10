const mongoose = require('mongoose');

// Businesses Schemas
const businessSchema = new mongoose.Schema({
  businessName: { type: String, },
  pincode: { type: String, },
  blockBuildingName: { type: String, },
  area: { type: String, },
  landmark: { type: String },
  city: { type: String, },
  state: { type: String, },
  merchantName: { type: String, },
  phoneNumber: { type: String,required:true },
  whatsapp: { type: String },
  isVerified: { type: Boolean, default:false },
  isBasicInfo: { type: Boolean, default:false },
  isBusinessInfo: { type: Boolean, default:false },
  isGovLicenses: { type: Boolean, default:false },
  isUploadedDocs:{type: Boolean, default:false },
  isOpen24hrs: { type: Boolean },
  email: { type: String, },
  category: { type: String, },
  images: [{ type: String }], // Assuming image paths or URLs are stored as strings
  description: { type: String },
  businessDays: { type: String }, 

  services: [{
    type:String
  }],
  shopImages: [
    {
      image: { type: String },
      description: { type: String },
    },
   ],
   
   
   description: { type: String },
  services: [{
    type:String
  }],



  isDeatilsFull : {type : Boolean, default : false},
    gstHolderName: { type: String },
    adhar: { type: String },
    pan: { type: String },
    gstPapers: { type: String },
    bankAccountNo: { type: String },
    ifsc: { type: String },
    upi: { type: String },
    weekdays: { type: String },
    openingHour: { type: String },
    closingHour: { type: String },
    coordinates: { type: String },
    gstNumber : { type: String },
    subcategory: { type: String, },
    category: { type: String, },
    serviceName:[{type: String}],
    landlineNumber: { type: String },
    anotherMobileNumber:{ type: String },
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
  fcmToken:{
    type:String,

  },
  date: { type: Date, default: Date.now }, // Added date property

});
businessSchema.index({ location: '2dsphere' });


//  Models for Business and Business Service
const Business = mongoose.model('Business', businessSchema);

module.exports = { Business };