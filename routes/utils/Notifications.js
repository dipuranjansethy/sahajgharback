const express = require('express');
const router = express.Router();
const NotificationMerchant = require('../../models/Notifications/NotificationMerchant'); // Adjust the path as needed
const { User } = require('../../models/UserSchema/UserSchema');
const { Business } = require('../../models/MerchantSchema/MerchantSchema');
const admin = require('firebase-admin');

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // other configuration options if needed
});
// API to create a new notification
router.post('/notifications', async (req, res) => {
  try {
    const { userId, userName, query, userImage, merchantId, mobile} = req.body;

    // Validate input if needed

    const newNotification = await NotificationMerchant.create({
      userId,
      userName,
      query,
      merchantId,
    });

    // Sending notification to merchant mobile
    // const merchantInfo = await Business.findById(merchantId);
    // const fcmToken = merchantInfo.fcmToken;

    // const message = {
    //   notification: {
    //     title: title,
    //     body: body,
    //   },
    //   data: {
    //     merchantNotification: "true", // Firebase expects strings in data
    //   },
    //   token: fcmToken,
    // };

    // admin.messaging().send(message)
    //   .then((response) => {
    //     console.log("Successfully sent with response:", response);
    //     res.status(201).json({ newNotification, message: 'Successfully sent with response', success: true });
    //   })
    //   .catch((error) => {
    //     console.error("Error sending message:", error);
    //     res.status(500).json({ error: 'Failed to send notification to merchant', success: false });
    //   });


    res.send("Success")
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET notifications by merchant ID
router.get('/notifications/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const notifications = await NotificationMerchant.find({ merchantId });
    // const costumer=await User.find({notifications.userId});
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to get all notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await NotificationMerchant.find().populate('userId merchantId');

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to send notifications using FCM tokens
router.post('/send-notification-user',async(req,res)=>{
   
     const { mobile, title , body} = req.body; 
     const merchantInfo = await Business.findOne({phoneNumber:mobile});
     const fcmToken = merchantInfo.fcmToken;
     
    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        merchantNotification : "true", // Firebase expects strings in data
      },
      token: fcmToken,
    };
  
    admin.messaging().send(message)
      .then((response) => {
       res.send({message: 'Successfully sent with response', success:true});
      })
      .catch((error) => {
      res.send(error);
      });
  })

module.exports = router;
