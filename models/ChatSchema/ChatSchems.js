// const mongoose = require('mongoose');
// const { User } = require('../UserSchema/UserSchema');
// const { Business } = require('../MerchantSchema/MerchantSchema');
// const { Schema, model, Types: { ObjectId } } = mongoose;

// // chat Schema
// const chatSchema = new Schema({
//   messages: [{
//     user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     business: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
//     message: { type: String, required: true },
//     username: { type: String, required: true },
//     userimage: { type: String },
//     timestamp: { type: Date, default: Date.now },
//   }],
// });

// // Method to get unique users and their details for a given user
// chatSchema.statics.getUniqueUsers = async function (userId) {
//   const userObjectId = new ObjectId(userId);

//   const result = await this.aggregate([
//     { $unwind: '$messages' },
//     {
//       $match: {
//         $or: [
//           { 'messages.user': userObjectId },
//           { 'messages.business': userObjectId },
//         ],
//       },
//     },
//     {
//       $group: {
//         _id: { user: '$messages.user', business: '$messages.business' },
//         username: { $first: '$messages.username' },
//         userimage: { $first: '$messages.userimage' },
//       },
//     },
//     {
//       $project: {
//         userId: {
//           $ifNull: [
//             { $ifNull: ['$_id.user', '$_id.business'] },
//             // Use a default value if both user and business are null
//             null,
//           ],
//         },
//         username: 1,
//         userimage: 1,
//         _id: 0,
//       },
//     },
//   ]);

//   return result.map(user => ({
//     userId: user.userId ? user.userId.toString() : null,
//     username: user.username,
//     userimage: user.userimage,
//   }));
// };

// // Model for chat
// const Chat = model('Chat', chatSchema);

// module.exports = { Chat };



const mongoose = require('mongoose');
const { User } = require('../UserSchema/UserSchema');
const { Business } = require('../MerchantSchema/MerchantSchema');
const { Schema, model, Types: { ObjectId } } = mongoose;

// chat Schema
const chatSchema = new Schema({
  messages: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    message: { type: String, required: true },
    userimage: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
});

// Method to get unique users and their details for a given user
chatSchema.statics.getUniqueUsers = async function (userId) {
  const userObjectId = new ObjectId(userId);

  const result = await this.aggregate([
    { $unwind: '$messages' },
    {
      $match: {
        $or: [
          { 'messages.user': userObjectId },
          { 'messages.business': userObjectId },
        ],
      },
    },
    {
      $group: {
        _id: { user: '$messages.user', business: '$messages.business' },
        userimage: { $first: '$messages.userimage' },
      },
    },
    {
      $project: {
        userId: {
          $ifNull: [
            { $ifNull: ['$_id.user', '$_id.business'] },
            // Use a default value if both user and business are null
            null,
          ],
        },
        _id: 0,
      },
    },
  ]);

  const users = await Promise.all(result.map(async (user) => {
    const userDoc = await User.findById(user.userId);
    const businessDoc = await Business.findById(user.userId);

    if (userDoc) {
      return {
        userId: user.userId.toString(),
        username: userDoc.userName, // Assuming userName field in UserSchema
        userimage: user.userimage,
      };
    } else if (businessDoc) {
      return {
        userId: user.userId.toString(),
        username: businessDoc.businessName, // Assuming businessName field in BusinessSchema
        userimage: user.userimage,
      };
    }

    return null;
  }));

  return users.filter(user => user !== null);
};

// Model for chat
const Chat = model('Chat', chatSchema);

module.exports = { Chat };
