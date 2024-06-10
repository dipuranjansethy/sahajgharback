const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const { Chat } = require('./models/ChatSchema/ChatSchems');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


const MerchantRouter = require('./routes/MerchantRoutes/Merchants');
const AdminRouter = require('./routes/AdminRoutes/Admin');
const ProductsRouter = require('./routes/MerchantRoutes/Products');
const ServiceRouter = require('./routes/MerchantRoutes/Services');
const userRouter = require('./routes/User/User')
const aTcRouter = require('./routes/MerchantRoutes/AddCart')
const notificationRouter = require('./routes/utils/Notifications')
require('./data/db')
const chatRouter = require('./routes/Chats/Chat')
const bannerRouter = require('./routes/AdminRoutes/Banner')


app.use(cors());
app.use((req, res, next) => {
  const allowedOrigins = ['https://codesaarthi.com', 'http://10.0.2.2:8081'];
  // const allowedOrigins = ['*'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

const PORT = process.env.PORT || 4000;

// Initialize Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');

// Handle private chat messages
// Handle private chat messages
socket.on('private-chat', async (payload) => {
  const { sender, receiver, message ,username,userimage} = payload;

  // Validate if both sender and receiver are provided
  if (!sender || !receiver || !message) {
    console.error('Invalid private chat message format:', payload);
    return;
  }

  // Check if a chat room for these two users already exists
  const chatRoom = await Chat.findOne({
    $or: [
      { 'messages.user': sender, 'messages.business': receiver },
      { 'messages.user': receiver, 'messages.business': sender },
    ],
  });

  // If a chat room exists, add the new message
  if (chatRoom) {
    chatRoom.messages.push({
      user: sender,
      business: receiver,
      message,
      username ,
        userimage,
      timestamp: new Date(),
    });
    await chatRoom.save();
  } else {
    // If a chat room doesn't exist, create a new one
    const newChatRoom = new Chat({
      messages: [{
        user: sender,
        business: receiver,
        message,
        username,
        userimage,
        timestamp: new Date(),
      }],
    });

    await newChatRoom.save();
  }

  // Fetch and emit the updated messages for the sender and receiver
  const updatedMessagesSender = await Chat.find({
    $or: [
      { 'messages.user': sender, 'messages.business': receiver },
      { 'messages.user': receiver, 'messages.business': sender },
    ],
  });

  // Emit the private-chat event to both sender and receiver
  io.emit('private-chat', updatedMessagesSender);
});

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


app.use('/merchant', MerchantRouter);
app.use('/admin', AdminRouter);
app.use('/products', ProductsRouter);
app.use('/services', ServiceRouter);
app.use('/user', userRouter);
app.use('/chat', chatRouter);
app.use('/cart', aTcRouter);
app.use('/notification', notificationRouter);
app.use('/banner', bannerRouter);

server.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
});