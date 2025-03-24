import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDb is connected");
  })
  .catch((error) => {
    console.log(error);
  });

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',  // replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // allow credentials (cookies)
}));

// Middleware to set Cross-Origin-Opener-Policy header
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});
app.use(express.json());
app.use(cookieParser());

app.listen(3000, () => {
  console.log("Server is running on port 3000!!!");
});

// Routes for user and authentication
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes); 

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});