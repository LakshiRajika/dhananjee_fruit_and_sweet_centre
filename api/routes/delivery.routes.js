import express from 'express';
import {
  saveDeliveryDetails,
  getDeliveryDetails,
  deleteDeliveryDetails,
  getAllDeliveries,
  updateDeliveryDetails,
  getDeliveryById
} from '../controllers/delivery.controller.js';

const router = express.Router();

// Get all deliveries
router.get('/', getAllDeliveries);

// User specific routes
router.post('/saveDeliveryDetails', saveDeliveryDetails);
router.get('/user/:userId', getDeliveryDetails);

// Delivery CRUD operations
router.put('/:id', updateDeliveryDetails);
router.delete('/:id', deleteDeliveryDetails);

// Add this new route with your existing routes
router.get('/:id', getDeliveryById);

export default router;