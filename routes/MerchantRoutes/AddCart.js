const express = require('express');
const { AddToCart } = require('../../models/MerchantSchema/AddCartSchema');
const router = express.Router();

// Get all items in the cart for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartItems = await AddToCart.find({ user: userId });
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add an item to the cart
router.post('/add', async (req, res) => {
  try {
    const { user, productName,productId, description, image } = req.body;
    const newItem = new AddToCart({ user, productName, description, image,productId });
    await newItem.save();
    res.status(201).json({success:true});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.get('/check/:userId/:productId', async (req, res) => {
    const { userId, productId } = req.params;
  
    try {
      // Check if the product with the given productId exists in the user's cart
      const exists = await AddToCart.exists({ user: userId, productId });
  
      res.json({ exists });
    } catch (error) {
      console.error('Error checking cart:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
// Remove an item from the cart
router.delete('/remove/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const deletedItem = await AddToCart.findByIdAndDelete(itemId);
    if (deletedItem) {
      res.json({ message: 'Item removed from cart successfully',success :true });
    } else {
      res.json({ message: 'Item not found in the cart',success :false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.delete('/delete/:userId/:productId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const productId = req.params.productId;
  
      // Find the cart item to delete
      const cartItemToDelete = await AddToCart.findOneAndDelete({
        user: userId,
        productId: productId
      });
  
      if (!cartItemToDelete) {
        return res.json({ message: 'Cart item not found' ,success:false});
      }
  
      res.json({ message: 'Removed from cart!',success:true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
// Update an item in the cart
router.put('/update/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { productName, description, image } = req.body;
    const updatedItem = await AddToCart.findByIdAndUpdate(
      itemId,
      { productName, description, image },
      { new: true }
    );
    if (updatedItem) {
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found in the cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
