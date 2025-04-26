import express from 'express';
import {
  saveDeliveryDetails,
  getDeliveryDetails,
  deleteDeliveryDetails,
  getDeliveryDetailById
} from '../controllers/delivery.controller.js';

const router = express.Router();

// More specific routes first
router.get('/detail/:id', getDeliveryDetailById);
router.delete('/:id', deleteDeliveryDetails);
router.get('/user/:userId', getDeliveryDetails);
router.post('/saveDeliveryDetails', saveDeliveryDetails);

export default router;