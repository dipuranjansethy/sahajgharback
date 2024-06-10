const accountSid = 'AC19f1135e740fd32befa83ec12fe3fd4a';
const authToken = '1d0fa5775f322381d92fe876b42296fb';
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