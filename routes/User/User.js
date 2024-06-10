const express = require('express');
const { User } = require('../../models/UserSchema/UserSchema');
const sms = require('../utils/sms');
const router = express.Router();
const sendToken=require('../utils/sendToken')
const crypto = require('crypto');

// Create a new user
router.post('/createUser', async (req, res) => {
  try {
    const { userName , mobile,sentOtp,otp } = req.body;

    // Check if the mobile number already exists
    const existingUser = await User.findOne({ Mobile: mobile });
    if (existingUser) {
      return res.json({ message: 'Already registered, Try to login' ,success : false});
    }
    if(sentOtp!=otp){
      return res.json({ message: 'otp is incorrect' ,success : false});
    }
    // Create a new user
    const newUser = new User({
      userName: userName,
      Mobile: mobile,
    });

    // Save the user to the database
    await newUser.save();
    sendToken(res, newUser, "Registered Successfully", 201);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server Error, Try later!', success: false });
  }
});

router.post('/sendotpreg',async(req,res)=>{
  try{
    const {mobile,userName}=req.body;
    const user = await User.findOne({ Mobile: mobile });
    if(user){
      res.status(200).json({
        success: false,
        message: `user already exist go to login page`,
      });
    }
    const otp = crypto.randomInt(1000, 10000).toString();
    
    await sms(mobile,otp);
    // await user.save();
    res.status(200).json({
      success: true,
      message: `otp has been sent`,
      sentOtp:otp,
    });
  }catch(e){
    console.log(e)
  }
})
router.get('/logout',async (req, res) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "log out successfully",
    });
});

router.post('/sendotp',async(req,res)=>{
  try{
    const {mobile}=req.body;
    const user = await User.findOne({ Mobile: mobile });
    if(!user){
      return res.json({ message: 'user not found please register' ,success : false});
    }
    const otp = await user.getOtp();
    await user.save();
    await sms(mobile,otp);
    // await user.save();
    res.status(200).json({
      success: true,
      message: `otp has been sent`,
    });
  }catch(e){
    console.log(e)
  }
})

router.post('/verifyOtp', async (req, res, next) => {
  try {
    // const otpVerified=false;
    const { strOtp , mobile  } = req.body;
    const user = await User.findOne({ Mobile: mobile }).select("+otp");

    if (!user) {
      return res.status(404).json({ otpVerified: false, message: "User not found" });
    }

    const isMatch = await user.compareOtp(strOtp);
    if (!isMatch) {
      return res.status(400).json({ otpVerified: false, message: "Invalid OTP" });
    }
    const otpVerified=true;
    user.otpExpire = null; // or set it to any other value that signifies expiry
    user.otp = null; // or set it to any other value that signifies expiry
    await user.save(); // Save the updated user object
    sendToken(res, user, "login successfull", 200);
  } catch (error) {
    next(error);
  }
});


// Check if mobile number exists
router.post('/checkMobile', async (req, res) => {
  try {
    const { mobile } = req.body;

    // Check if the mobile number exists
    const existingUser = await User.findOne({ Mobile: mobile });
    if (existingUser) {
      return res.status(200).json({ exists: true, user: existingUser });
    }

    res.status(200).json({ exists: false });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Save location by mobile
router.post('/saveLocation', async (req, res) => {
  try {
    const { mobile, latitude, longitude } = req.body;

    // Find user by mobile
    const user = await User.findOne({ Mobile: mobile });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's location
    user.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    // Save the updated user
    await user.save();

    res.json({ message: 'Location saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Direct route for getting all users using GET
router.get('/getAllUsers', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Direct route for getting a user by ID using GET
router.get('/getUser/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Direct route for updating a user by ID using GET
router.get('/updateUser/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.query, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Direct route for deleting a user by ID using GET
router.get('/deleteUser/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.get('/getmob/:mobile', async (req, res) => {
  const { mobile } = req.params;

  try {
    // Find the user by mobile number
    const user = await User.findOne({ Mobile: mobile });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
