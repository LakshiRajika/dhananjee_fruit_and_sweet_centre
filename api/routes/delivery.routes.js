import express from 'express';
import {
  saveDeliveryDetails,
  getDeliveryDetails,
  deleteDeliveryDetails,
  getAllDeliveries,
  updateDeliveryDetails
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

export default router;