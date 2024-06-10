const accountSid = process.env.accountSid;
const authToken = 'process.env.authToken ';
const client = require('twilio')(accountSid, authToken);
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