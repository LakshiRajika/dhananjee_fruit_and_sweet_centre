import { v4 as uuidv4 } from 'uuid';
import Refund from "../models/refund.model.js";
import Order from "../models/order.model.js";

// Create a new refund request
export const createRefund = async (req, res) => {
  try {
    const { orderId, userId, amount, reason } = req.body;

    console.log("Received refund request:", { orderId, userId, amount, reason });

    // Validate required fields
    if (!orderId || !userId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        received: { orderId, userId, amount, reason }
      });
    }

    // Check if order exists
    const order = await Order.findOne({ orderId: orderId });
    console.log("Found order:", order);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        orderId: orderId
      });
    }

    // Check if refund already exists for this order
    const existingRefund = await Refund.findOne({ orderId: orderId });
    if (existingRefund) {
      return res.status(400).json({
        success: false,
        message: "Refund request already exists for this order",
        existingRefund: {
          refundId: existingRefund.refundId,
          status: existingRefund.status,
          createdAt: existingRefund.createdAt,
          amount: existingRefund.amount,
          reason: existingRefund.reason
        }
      });
    }

    // Create new refund
    const newRefund = new Refund({
      refundId: uuidv4(),
      orderId,
      userId,
      amount,
      reason,
      status: 'pending'
    });

    await newRefund.save();

    res.status(201).json({
      success: true,
      message: "Refund request created successfully",
      data: newRefund
    });
  } catch (error) {
    console.error("Error creating refund:", error);
    res.status(500).json({
      success: false,
      message: "Error creating refund request",
      error: error.message
    });
  }
};

// Get all refunds (admin)
export const getAllRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Refunds retrieved successfully",
      data: refunds
    });
  } catch (error) {
    console.error("Error fetching refunds:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching refunds",
      error: error.message
    });
  }
};

// Get refunds for a specific user
export const getUserRefunds = async (req, res) => {
  const { userId } = req.params;
  try {
    const refunds = await Refund.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "User refunds retrieved successfully",
      data: refunds
    });
  } catch (error) {
    console.error("Error fetching user refunds:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user refunds",
      error: error.message
    });
  }
};

// Get a specific refund by ID
export const getRefundById = async (req, res) => {
  const { refundId } = req.params;
  try {
    const refund = await Refund.findOne({ refundId });
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Refund retrieved successfully",
      data: refund
    });
  } catch (error) {
    console.error("Error fetching refund:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching refund",
      error: error.message
    });
  }
};

// Get a refund by order ID
export const getRefundByOrderId = async (req, res) => {
  const { orderId } = req.params;
  try {
    const refund = await Refund.findOne({ orderId });
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found for this order"
      });
    }
    res.status(200).json({
      success: true,
      message: "Refund retrieved successfully",
      data: refund
    });
  } catch (error) {
    console.error("Error fetching refund by order ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching refund",
      error: error.message
    });
  }
};

// Update refund status (admin)
export const updateRefundStatus = async (req, res) => {
  const { refundId } = req.params;
  const { status, processedBy } = req.body;

  try {
    const refund = await Refund.findOne({ refundId });
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found"
      });
    }

    refund.status = status;
    refund.processedBy = processedBy;
    refund.processedAt = new Date();

    await refund.save();

    res.status(200).json({
      success: true,
      message: "Refund status updated successfully",
      data: refund
    });
  } catch (error) {
    console.error("Error updating refund status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating refund status",
      error: error.message
    });
  }
};

// Delete a refund (admin)
export const deleteRefund = async (req, res) => {
  const { refundId } = req.params;
  try {
    const refund = await Refund.findOneAndDelete({ refundId });
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Refund deleted successfully",
      data: refund
    });
  } catch (error) {
    console.error("Error deleting refund:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting refund",
      error: error.message
    });
  }
};