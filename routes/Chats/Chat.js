const express = require('express');
const router = express.Router();
const { Chat } = require('../../models/ChatSchema/ChatSchems'); // Update the path accordingly

// API endpoint to get unique chats for a user
router.get('/uniqueChats/:userId', async (req, res) => {
  try {
    
    const userId = req.params.userId;

    // Call the static method to get unique chats for the user
    const uniqueChats = await Chat.getUniqueUsers(userId);

    res.status(200).json({ success: true, data: uniqueChats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// API endpoint to find number of chats happening with different users by business ObjectId
router.get('/api/chats/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

  
    const chats = await Chat.find({
      'messages.business': businessId
    });

    const usersCountMap = new Map();

    // Counting the number of chats happening with different users
    chats.forEach(chat => {
      chat.messages.forEach(message => {
        const userId = message.user.toString(); // Assuming user field is ObjectId
        if (usersCountMap.has(userId)) {
          usersCountMap.set(userId, usersCountMap.get(userId) + 1);
        } else {
          usersCountMap.set(userId, 1);
        }
      });
    });

    // Transforming map into array of objects for response
    const usersCount = Array.from(usersCountMap, ([userId, count]) => ({ userId, count }));

    res.json(usersCount);
  } catch (error) {
    console.error('Error retrieving chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
