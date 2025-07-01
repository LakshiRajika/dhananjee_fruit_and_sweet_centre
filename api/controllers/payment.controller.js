import { v4 as uuidv4 } from 'uuid';
import CartItem from "../models/CartItemSchema.js";
import Order from "../models/order.model.js"; 
import Stripe from 'stripe';
import { query } from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const stripe = new Stripe("sk_test_51R1EIIDWYegqaTAkSR8SSLTlROdixGUzqEpC8eeMTe3ce8ALYEqNqOxkzgGEhI0kEqqy4XL9VU9hy8BRkSbMSII300aF88jnvy");

const generateOrderPDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const pdfPath = path.join('uploads', 'orders', `${order.orderId}.pdf`);
      
      // Ensure the directory exists
      const dir = path.dirname(pdfPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      doc.fontSize(20).text('Order Details', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).text(`Order ID: ${order.orderId}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      doc.fontSize(14).text('Items:');
      order.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name}`);
        doc.text(`   Quantity: ${item.quantity}`);
        doc.text(`   Price: $${item.price}`);
        doc.moveDown();
      });

      doc.fontSize(14).text(`Total Amount: $${order.totalAmount}`);
      doc.text(`Payment Method: ${order.paymentMethod}`);
      doc.text(`Status: ${order.status}`);

      doc.end();
      stream.on('finish', () => resolve(pdfPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const addToCart = async (req, res) => {
  const { userId, itemName, price, image, createdBy, updatedBy, description, category, quantity = 1 } = req.body;
  const itemId = uuidv4(); 

  try {
    const newCartItem = new CartItem({
      userId,
      itemId,
      name: itemName,
      price,
      image,
      createdBy,
      updatedBy,
      description,
      category,
      quantity,
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
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "No items found in the cart for this user." });
    }
    res.status(200).json({ message: "Cart items retrieved successfully", data: cartItems });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Error fetching cart items", error: error.message });
  }
};


export const createCheckoutSession = async (req, res) => {
  try {
    const { items, totalAmount, userDeliveryDetailsId, orderId, paymentMethod } = req.body;

    console.log("Received checkout request:", {
      items,
      totalAmount,
      userDeliveryDetailsId,
      orderId,
      paymentMethod
    });

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "No items in cart"
      });
    }

    if (!userDeliveryDetailsId) {
      return res.status(400).json({
        success: false,
        message: "Delivery details are required"
      });
    }

    const userId = items[0].userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in cart items"
      });
    }

    const order = new Order({
      orderId,
      userId,
      items,
      totalAmount,
      userDeliveryDetailsId,
      paymentMethod,
      paymentStatus: paymentMethod === 'stripe' ? 'pending' : 'completed',
      status: 'pending'
    });

    await order.save();
    console.log("Order created successfully:", order._id);

    if (paymentMethod === 'stripe') {
      try {
        const lineItems = items.map(item => {
          const unitAmount = Math.round(Number(item.price) * 100);
          
          let imageUrl = '';
          if (item.image) {
            if (item.image.startsWith('/')) {
              imageUrl = `http://localhost:3000${item.image}`;
            } else if (!item.image.startsWith('http')) {
              imageUrl = `http://localhost:3000/${item.image}`;
            } else {
              imageUrl = item.image;
            }
          }
          
          return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
                images: imageUrl ? [imageUrl] : [],
              },
              unit_amount: unitAmount,
            },
            quantity: item.quantity || 1,
          };
        });

        console.log("Creating Stripe session with line items:", lineItems);

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:5173/payment-success',
          cancel_url: 'http://localhost:5173/cart',
      metadata: {
            orderId: order._id.toString(),
            userId: userId
          }
        });

        console.log("Stripe session created successfully:", session.id);

        return res.status(200).json({
          success: true,
          message: "Checkout session created successfully",
          url: session.url,
          orderId: order._id
        });
      } catch (stripeError) {
        console.error("Stripe error details:", {
          message: stripeError.message,
          type: stripeError.type,
          code: stripeError.code,
          param: stripeError.param
        });
        
        return res.status(500).json({
          success: false,
          message: "Error creating Stripe session",
          error: stripeError.message
        });
      }
    } else if (paymentMethod === 'cash') {
      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        orderId: order._id
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }
  } catch (error) {
    console.error("Error in createCheckoutSession:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating checkout session",
      error: error.message
    });
  }
};


// Handle Stripe webhook
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    const userId = session.metadata.userId;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        console.error('Order not found:', orderId);
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.status = 'completed';
      order.paymentStatus = 'paid';
      await order.save();

      const orderDetails = {
        orderId: order.orderId,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      };

      // Delete cart items only after successfully getting order details
      await CartItem.deleteMany({ userId: userId });

      console.log('Order completed successfully:', orderDetails);
      return res.status(200).json({ 
        success: true, 
        message: 'Order completed successfully',
        order: orderDetails
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error processing webhook',
        error: error.message 
      });
    }
  }

  res.json({ received: true });
};

export const uploadBankSlip = async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    const slipImage = req.file;

    if (!orderId || !userId || !slipImage) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId, userId, or slipImage"
      });
    }

    // Find the order
    const order = await Order.findOne({ orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update the order with bank slip details
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId, userId },
      {
        $set: {
          bankSlipImage: slipImage.path,
          paymentStatus: 'pending_verification',
          status: 'processing'
        }
      },
      { new: true }
    );

    // Generate PDF order details
    const pdfPath = await generateOrderPDF(updatedOrder);

    return res.status(200).json({
      success: true,
      message: "Bank slip uploaded successfully",
      data: {
        order: updatedOrder,
        pdfUrl: `/uploads/orders/${orderId}.pdf`
      }
    });
  } catch (error) {
    console.error("Error uploading bank slip:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading bank slip",
      error: error.message
    });
  }
};

export const getOrderDetailsBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    // Find the order using the orderId from session metadata
    const order = await Order.findOne({ orderId: session.metadata.orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod
      }
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message
    });
  }
};