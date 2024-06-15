const express = require("express");
const { Product } = require("../../models/MerchantSchema/ProductsSchema");
const { Business } = require("../../models/MerchantSchema/MerchantSchema");
const router = express.Router();
const admin = require("firebase-admin");

const serviceAccount = require("../serviceAccountKey.json");
const NotificationMerchant = require("../../models/Notifications/NotificationMerchant");
const { User } = require("../../models/UserSchema/UserSchema");

// Create a new product
router.post("/products", async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});
// Route to get all products by phone number
router.get("/products/:phoneNumber", async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber.replace(/\D/g, "");

    // Find the business with the given phone number
    const business = await Business.findOne({ phoneNumber });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Find all products associated with the business
    const products = await Product.find({ business: business._id });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to get all products by  business id
router.get("/business-products/:id", async (req, res) => {
  try {
    // Find the business with the given phone number
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Find all products associated with the business
    const products = await Product.find({ business: business._id });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Get all products - admin
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.get('/searchproducts', async (req, res) => {
//   try {
//     const keyword = req.query.keyword;

//     if (!keyword) {
//       return res.status(400).json({ error: 'Please provide a keyword for searching.' });
//     }

//     const result = await Product.find({
//       $or: [
//         { category: { $in: [keyword] } },
//         { subcategory: { $in: [keyword] } },
//       ],
//     }).populate('business');
//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// router.get('/searchproducts', async (req, res) => {
//   try {
//     const keyword = req.query.keyword;
//     // const userId = req.query.userId;
//     if (!keyword) {
//       return res.status(400).json({ error: 'Please provide a keyword for searching.' });
//     }

//     const result = await Product.find({
//       $or: [
//         { ProductName: { $regex: keyword, $options: 'i' } },
//         { category: { $in: [keyword] } },
//         { subcategory: { $in: [keyword] } },
//       ],
//     }).populate('business');

//     result.forEach(async (product) => {
//       const business = product.business;
//       const fcmToken = business ? business.fcmToken : null;
//       const productName = product.ProductName;

//       if (fcmToken && productName) {
//         const payload = {
//           notification: {
//             title: '⚡ New Customer Found!',
//             body: `Checked the product: ${productName}`,

//           },
//         };

//         try {
//           const notificationRes = await admin.messaging().sendToDevice(fcmToken, payload);

//           console.log('Notification sent:', notificationRes.results);
//         } catch (error) {
//           console.error('Error sending notification:', error);
//         }
//       } else {
//         console.warn('Skipping sending message due to null values:', { fcmToken, productName });
//       }
//     });

//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

router.get("/searchproducts/:userId", async (req, res) => {
  try {
    console.log(req.params);
    const keyword = req.query.keyword;
    const userId = req.params.userId;
    console.log("userId",userId);
    if (!keyword) {
      return res
        .status(400)
        .json({ error: "Please provide a keyword for searching." });
    }
    // console.log(user.Mobile)
    const products = await Product.find({
      $or: [
        { ProductName: { $regex: keyword, $options: "i" } },
        { category: { $in: [keyword] } },
        { subcategory: { $in: [keyword] } },
      ],
    }).populate("business");

    res.json(products);

    // Process notifications asynchronously
    products.forEach(async (product) => {
      const business = product.business;
      const fcmToken = business ? business.fcmToken : null;
      const productName = product.ProductName;

      if (fcmToken && productName) {
        const payload = {
          notification: {
            title: "⚡ New Customer Found!",
            body: `Checked the product: ${productName} `,
          },
          data: {
            screen: "notificationscreen", // Specify the screen to navigate to
          },
        };

        const notificationData = new NotificationMerchant({
          userId:userId,
          query: keyword,
          merchantId: business._id,
        });

        try {
          await admin.messaging().sendToDevice(fcmToken, payload);
          // await NotificationMerchant.create(notificationData);
          await notificationData.save();
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      } else {
        console.warn("Skipping sending message due to null values:", {
          fcmToken,
          productName,
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get a specific product by ID
router.get("/productsbyid/:id", async (req, res) => {
  try {
    const foundProduct = await Product.findById(req.params.id).populate(
      "business"
    );
    if (foundProduct) {
      res.status(200).json(foundProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a product by ID
router.patch("/products/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );
    if (updatedProduct) {
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a product by ID
router.delete("/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (deletedProduct) {
      res
        .status(200)
        .json({ message: "Product deleted successfully", success: true });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
