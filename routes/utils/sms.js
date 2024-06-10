// const accountSid = process.env.ACCOUNTSID;
// const authToken = process.env.AUTHTOKEN;
require('dotenv').config();
const client = require('twilio')(process.env.ACCOUNTSID, process.env.AUTHTOKEN);
const sms=(phoneNumber, otp)=>{
  phoneNumber="+91"+phoneNumber;
    const messageBody = `Your OTP for verification is ${otp}. Please use this code to complete your process.`;
    return client.messages.create({
      body: messageBody,
      from: '+16365564117', // Replace with your Twilio number
      to: phoneNumber
    });
  }

  module.exports=sms