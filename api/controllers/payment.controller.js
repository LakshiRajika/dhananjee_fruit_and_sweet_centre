import { v4 as uuidv4 } from 'uuid'; // Import uuid package
import CartItem from "../models/CartItemSchema.js";
import Stripe from 'stripe';
const stripe = Stripe("sk_test_51R1EIIDWYegqaTAkSR8SSLTlROdixGUzqEpC8eeMTe3ce8ALYEqNqOxkzgGEhI0kEqqy4XL9VU9hy8BRkSbMSII300aF88jnvy"); // Store secret key in env vars

// Add item to the cart
export const addToCart = async (req, res) => {
  const { userId, itemName, price, image, createdBy, updatedBy, description, category, quantity = 1 } = req.body;
  const itemId = uuidv4(); // Generate a unique identifier for the cart item
  try {
    // Create a new cart item instance
    const newCartItem = new CartItem({
      userId, // Associate cart item with user
      itemId, // Assign unique item ID
      name: itemName, // Item name
      price,
      image,
      createdBy,
      updatedBy,
      description,
      category,
      quantity,
    });
    // Save the item in the database
    await newCartItem.save();
    // Respond with success message
    return res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: newCartItem
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    // Return error response
    return res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message 
    });
  }
};

// Get all cart items
export const getCartItems = async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Fetch cart items for the given user ID
    const cartItems = await CartItem.find({ userId });
    
    if (!cartItems || cartItems.length === 0) {
      console.log("No cart items found for userId:", userId);
      return res.status(404).json({ message: "No items found in the cart for this user." });
    }
    
    console.log("Cart items found:", cartItems);
    
    res.status(200).json({ message: "Cart items retrieved successfully", data: cartItems });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error fetching cart items", error: error.message });
  }
};

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { cartItems } = req.body;
    // Validate cart items array
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Invalid cart items" });
    }
    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      if (item.price) {
        return total + item.price;
      } else {
        throw new Error("Item does not have a price");
      }
    }, 0);
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Stripe requires amount in cents
      currency: 'lkr', // Define the currency
    });
    // Send client secret for frontend confirmation
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Error creating payment intent", error: error.message });
  }
};

// Confirm Payment and Create Order
export const confirmPayment = async (req, res) => {
  const { paymentToken, userId, cartItems } = req.body;
  try {
    // Compute total order amount
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    // Confirm the payment with Stripe
    const paymentIntent = await stripe.paymentIntents.confirm(paymentToken, {
      amount: totalAmount * 100, // Convert to cents
    });
    if (paymentIntent.status === 'succeeded') {
      // Generate unique order ID
      const orderId = uuidv4();
      
      // Create a new order entry
      const newOrder = new Order({
        orderId,
        userId,
        items: cartItems.map(item => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        paymentToken: paymentIntent.id,
        totalAmount,
        status: 'completed',
        createdAt: new Date(),
      });
      // Save order in the database
      await newOrder.save();
      // Clear user's cart after successful order placement
      await CartItem.deleteMany({ userId });
      return res.status(200).json({
        success: true,
        message: 'Payment successful, order placed successfully',
        order: newOrder,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.',
      });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    return res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message,
    });
  }
};