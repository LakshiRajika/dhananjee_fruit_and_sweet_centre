import { v4 as uuidv4 } from 'uuid'; 
import CartItem from "../models/CartItemSchema.js";

export const addToCart = async (req, res) => {
  const { userId, name, price, image, quantity = 1 } = req.body;
  const itemId = uuidv4();
  
  try {
    // Validate required fields
    if (!userId || !name || !price || !image) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if this exact item already exists in cart
    const existingItem = await CartItem.findOne({ 
      userId, 
      name, 
      price, 
      image 
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "This item is already in your cart"
      });
    }

    const newCartItem = new CartItem({
      userId, 
      itemId, 
      name, 
      price,
      image,
      quantity: 1, // Force quantity to 1
    });

    await newCartItem.save();
    return res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: newCartItem 
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message 
    });
  }
};

export const getCartItems = async (req, res) => {
  const { userId } = req.params;
  try {
    const cartItems = await CartItem.find({ userId });
    return res.status(200).json({
      success: true,
      message: cartItems.length > 0 ? "Cart items retrieved successfully" : "Cart is empty",
      data: cartItems || []
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching cart items",
      error: error.message
    });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body; 
  
  try {
    // Validate quantity is a positive number
    if (quantity < 1) {
      return res.status(400).json({ 
        success: false,
        message: 'Quantity must be at least 1' 
      });
    }

    const updatedItem = await CartItem.findOneAndUpdate(
      { itemId },
      { quantity }, 
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Item quantity updated successfully', 
      data: updatedItem 
    });
  } catch (error) {
    console.error('Error updating item quantity:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error updating item quantity', 
      error: error.message 
    });
  }
};

export const deleteCartItem = async (req, res) => {
  const { userId, itemId } = req.params; 
  try {
    const deletedItem = await CartItem.findOneAndDelete({ userId, itemId });
    if (!deletedItem) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found in cart" 
      });
    }
    return res.status(200).json({
      success: true, 
      message: "Item deleted from cart successfully",
      data: deletedItem
    });
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting item from cart",
      error: error.message 
    });
  }
};