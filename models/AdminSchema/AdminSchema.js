const mongoose = require('mongoose');

// Admines Schemas
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password:{ type: String, required: true },
  merchantRead:{
    type : Boolean,
    
  },
  merchantEdit:{
    type : Boolean,
    
  },
  SuperAdmin:{
    type : Boolean,
    
  },
  userRead:{
      type : Boolean,
   
  },

  date: { type: Date, default: Date.now }, // Added date property

});
//  Models for Admin and Admin Service
const Admin = mongoose.model('Admin', AdminSchema);

module.exports = { Admin };
