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

    // // Validate required fields
    // if (!orderId || !customerName || !mobileNumber || !email || !deliveryAddress || !postalCode || !deliveryType || !deliveryService || !district || !amount || !deliveryCharge) {
    //   return res.status(400).json({ message: "All fields are required!" });
   // }

    const newDelivery = new Delivery({
      customerName,
      userId,
      deliveryAddress,
      deliveryService,
      deliveryType,
      district,
      email,
      mobileNumber,
      postalCode
     
    });

    await newDelivery.save();
    res.status(201).json({ message: "Delivery created successfully!", data: newDelivery });

  } catch (error) {
    res.status(500).json({ message: "Error creating delivery!", error: error.message });
  }
};

// READ - Get all deliveries
export const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching deliveries!", error: error.message });
  }
};

// READ - Get a single delivery by ID
export const getDeliveryDetailsByUserId = async (req, res) => {

  const { userId } = req.params; 
  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required!" });
    }


    // Fetch all deliveries for the user
    const deliveries = await Delivery.find({ userId });

    if (!deliveries.length) {
      return res.status(200).json([]); // Returning an empty array
    }

    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery details!", error: error.message });
  }
};


// UPDATE - Modify an existing delivery
export const updateDelivery = async (req, res) => {
  try {
    const updatedDelivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!updatedDelivery) return res.status(404).json({ message: "Delivery not found!" });

    res.status(200).json({ message: "Delivery updated successfully!", data: updatedDelivery });
  } catch (error) {
    res.status(500).json({ message: "Error updating delivery!", error: error.message });
  }
};

// DELETE - Remove a delivery record
export const deleteDelivery = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid delivery ID format!" });
    }

    const deletedDelivery = await Delivery.findByIdAndDelete(id);
    if (!deletedDelivery) {
      return res.status(404).json({ message: "Delivery not found!" });
    }

    res.status(200).json({ message: "Delivery deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting delivery!", error: error.message });
  }
};

// Get all cancelled deliveries
export const getCancelledDeliveries = async (req, res) => {
  try {
    const cancelledDeliveries = await Delivery.find({ status: "Cancelled" });
    res.status(200).json(cancelledDeliveries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cancelled deliveries!", error: error.message });
  }
};
