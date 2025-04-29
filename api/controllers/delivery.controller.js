import mongoose from 'mongoose';
import Delivery from "../models/delivery.Model.js";

// CREATE - Insert a new delivery record
export const createDelivery = async (req, res) => {
  try {
    const {
      customerName,
      mobileNumber,
      email,
      deliveryAddress,
      postalCode,
      deliveryType,
      deliveryService,
      district,
      userId
    } = req.body;

    const newDelivery = new Delivery({
      customerName,
      userId,
      mobileNumber,
      email,
      deliveryAddress,
      postalCode,
      deliveryType,
      deliveryService,
      district
    });

    await newDelivery.save();
    res.status(201).json({
      success: true,
      message: "Delivery details saved successfully",
      data: newDelivery
    });

  } catch (error) {
    console.error("Error saving delivery details:", error);
    res.status(500).json({
      success: false,
      message: "Error saving delivery details",
      error: error.message
    });
  }
};

// READ - Get all deliveries
export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.status(200).json({
      success: true,
      message: "Deliveries retrieved successfully",
      data: deliveries
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching deliveries",
      error: error.message
    });
  }
};

// READ - Get deliveries by user ID
export const getDeliveryDetailsByUserId = async (req, res) => {
  const { userId } = req.params; 
  try {
    console.log('Fetching delivery details for user:', userId);
    
    if (!userId) {
      console.log('No userId provided');
      return res.status(400).json({
        success: false,
        message: "User ID is required!"
      });
    }

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    console.log('Converted userId to ObjectId:', userObjectId);

    const deliveries = await Delivery.find({ userId: userObjectId })
      .sort({ createdAt: -1 }); // Sort by most recent first

    console.log('Found deliveries:', deliveries);

    if (!deliveries || deliveries.length === 0) {
      console.log('No deliveries found for user:', userId);
      return res.status(200).json({
        success: true,
        message: "No delivery details found for this user",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery details retrieved successfully",
      data: deliveries
    });
  } catch (error) {
    console.error("Error fetching delivery details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery details",
      error: error.message
    });
  }
};

// UPDATE - Modify an existing delivery
export const updateDelivery = async (req, res) => {
  try {
    const updatedDelivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedDelivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found!"
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery updated successfully",
      data: updatedDelivery
    });
  } catch (error) {
    console.error("Error updating delivery:", error);
    res.status(500).json({
      success: false,
      message: "Error updating delivery",
      error: error.message
    });
  }
};

// DELETE - Remove a delivery record
export const deleteDelivery = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery ID format!"
      });
    }

    const deletedDelivery = await Delivery.findByIdAndDelete(id);
    if (!deletedDelivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found!"
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting delivery",
      error: error.message
    });
  }
};

// Get all cancelled deliveries
export const getCancelledDeliveries = async (req, res) => {
  try {
    const cancelledDeliveries = await Delivery.find({ status: "Cancelled" });
    res.status(200).json({
      success: true,
      message: "Cancelled deliveries retrieved successfully",
      data: cancelledDeliveries
    });
  } catch (error) {
    console.error("Error fetching cancelled deliveries:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cancelled deliveries",
      error: error.message
    });
  }
};

// Save delivery details
export const saveDeliveryDetails = async (req, res) => {
  try {
    const {
      customerName,
      mobileNumber,
      email,
      deliveryAddress,
      postalCode,
      deliveryType,
      deliveryService,
      district,
      userId
    } = req.body;

    console.log('Saving delivery details:', req.body);

    // Validate required fields
    if (!customerName || !mobileNumber || !email || !deliveryAddress || !postalCode || !deliveryType || !deliveryService || !district || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const newDelivery = new Delivery({
      customerName,
      userId: userObjectId,
      mobileNumber,
      email,
      deliveryAddress,
      postalCode,
      deliveryType,
      deliveryService,
      district
    });

    await newDelivery.save();
    console.log('Delivery details saved:', newDelivery);

    res.status(201).json({
      success: true,
      message: "Delivery details saved successfully",
      data: newDelivery
    });

  } catch (error) {
    console.error("Error saving delivery details:", error);
    res.status(500).json({
      success: false,
      message: "Error saving delivery details",
      error: error.message
    });
  }
};

// Get delivery details
export const getDeliveryDetails = async (req, res) => {
  const { userId } = req.params; 
  try {
    if (!userId) {
      console.log('No userId provided');
      return res.status(400).json({
        success: false,
        message: "User ID is required!"
      });
    }

    console.log('Fetching delivery details for user:', userId);

    const deliveries = await Delivery.find({ userId });
    console.log('Found deliveries:', JSON.stringify(deliveries, null, 2));

    if (!deliveries || deliveries.length === 0) {
      console.log('No deliveries found for user:', userId);
      return res.status(200).json({
        success: true,
        message: "No delivery details found for this user",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery details retrieved successfully",
      data: deliveries
    });
  } catch (error) {
    console.error("Error fetching delivery details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery details",
      error: error.message
    });
  }
};

// Delete delivery details
export const deleteDeliveryDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDelivery = await Delivery.findByIdAndDelete(id);
    if (!deletedDelivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery details not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Delivery details deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting delivery details:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting delivery details",
      error: error.message
    });
  }
};

export const updateDeliveryDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDelivery = await Delivery.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedDelivery) {
      return res.status(404).json({ success: false, message: 'Delivery details not found' });
    }

    res.status(200).json({ success: true, data: updatedDelivery });
  } catch (error) {
    console.error('Error updating delivery details:', error);
    res.status(500).json({ success: false, message: 'Failed to update delivery details' });
  }
};

// Add this new function with your existing controller functions
export const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery ID format!"
      });
    }

    const delivery = await Delivery.findById(id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery details retrieved successfully",
      data: delivery
    });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery",
      error: error.message
    });
  }
};