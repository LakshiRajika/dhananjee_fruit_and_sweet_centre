import express from 'express';

import{
    createDelivery,
    getAllDeliveries,
    getDeliveryDetailsByUserId, 
    updateDelivery,
    deleteDelivery,
    getCancelledDeliveries
}from "../controllers/delivery.controller.js";

const router = express.Router();
// Routes
router.post("/saveDeliveryDetails", createDelivery);        // Create a delivery
router.get("/", getAllDeliveries);       // Get all deliveries
router.get("/getDeliveryDetailsByUser/:userId", getDeliveryDetailsByUserId);     // Get delivery by ID
router.put("/:id", updateDelivery);      // Update delivery
router.delete("/deleteDeliveryDetails/:id", deleteDelivery);   // Delete delivery
router.get("/cancelled", getCancelledDeliveries);


//module.exports = router;
export default router;
