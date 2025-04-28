import express from 'express';
import { 
  createRefund,
  getAllRefunds,
  getUserRefunds,
  getRefundById,
  getRefundByOrderId,
  updateRefundStatus,
  deleteRefund
} from '../controllers/refund.controller.js';

const router = express.Router();

// User routes
router.post('/create', createRefund);
router.get('/user/:userId', getUserRefunds);
router.get('/order/:orderId', getRefundByOrderId);

// Admin routes
router.get('/all', getAllRefunds);

// Generic routes (must come after specific routes)
router.get('/:refundId', getRefundById);
router.put('/:refundId/status', updateRefundStatus);
router.delete('/:refundId', deleteRefund);

export default router;