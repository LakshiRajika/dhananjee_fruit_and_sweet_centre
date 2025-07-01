import express from 'express';
import { sendPaymentSuccessEmail } from '../controllers/email.controller.js';

const router = express.Router();

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { to } = req.body;
    const testOrderDetails = {
      orderId: 'TEST-123',
      totalAmount: 1000,
      items: [
        { name: 'Test Item', quantity: 1, price: 1000 }
      ]
    };

    const result = await sendPaymentSuccessEmail({
      body: { to, orderDetails: testOrderDetails }
    }, res);

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Payment success email endpoint
router.post('/send-payment-success', sendPaymentSuccessEmail);

export default router;