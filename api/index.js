import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';

import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import cartRoutes from './routes/cart.route.js';
import paymentRoutes from './routes/payment.route.js';
import orderRoutes from './routes/order.route.js';
import feedbackRoutes from './routes/feedback.route.js';
import deliveryRoutes from './routes/delivery.routes.js';
import emailRoutes from './routes/email.routes.js';
import admin from './config/firebase.js';
import { stripeRawBodyMiddleware } from './middleware/stripeRawBoady.js';
import inventoryRoutes from './routes/inventory.route.js';
import wishlistRoutes from './routes/wishlist.route.js';
import chatbotRoutes from './routes/chatbot.route.js';
import refundRouter from './routes/refund.route.js';

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.log(error));

const app = express();

// ✅ CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Stripe-Signature'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

// ✅ Middleware Order Matters!
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ Add error handling for CORS
app.use((err, req, res, next) => {
  if (err.name === 'CorsError') {
    console.error('CORS Error:', err);
    res.status(403).json({
      success: false,
      message: 'CORS Error: Not allowed by CORS policy'
    });
  } else {
    next(err);
  }
});

// ✅ Serve Static Files
// Use import.meta.url to get the directory and join paths accordingly
const __dirname = path.dirname(new URL(import.meta.url).pathname); // Get current directory
app.use('/uploads', express.static('uploads'));
app.use('/uploads/orders', express.static(path.join(__dirname, 'uploads', 'orders')));

// ✅ Stripe Webhook Middleware
app.use('/api/payment/webhook', stripeRawBodyMiddleware);

// ✅ Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/refund', refundRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  });
});


// ✅ Start Server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});