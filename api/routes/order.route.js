import express from 'express';
import { 
  getCompletedOrders,
  createOrder,
  getUserOrders,
  generateOrderPDF,
  generateAllOrdersPDF,
  getAllOrders,
  generateAdminAllOrdersPDF,
  deleteOrder,
  deleteAllOrders,
  getOrderById
} from '../controllers/order.controller.js';

const router = express.Router();

// User routes
router.get('/completed-orders/:userId', getCompletedOrders);
router.get('/user/:userId', getUserOrders);
router.post('/create', createOrder);
router.get('/pdf/:orderId', generateOrderPDF);
router.get('/all-pdf/:userId', generateAllOrdersPDF);
router.delete('/:orderId', deleteOrder);
router.delete('/user/:userId/all', deleteAllOrders);
router.get('/track/:orderId', getOrderById);

// Admin routes
router.get('/all', getAllOrders);
router.get('/admin/all-pdf', generateAdminAllOrdersPDF);

export default router;