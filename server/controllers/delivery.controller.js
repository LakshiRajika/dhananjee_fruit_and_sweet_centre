import DeliveryDetails from '../models/DeliveryDetailsSchema.js';

// Save delivery details
export const saveDeliveryDetails = async (req, res) => {
  try {
    const deliveryDetails = new DeliveryDetails(req.body);
    await deliveryDetails.save();
    
    res.status(201).json({
      success: true,
      message: "Delivery details saved successfully",
      data: deliveryDetails
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

// Get delivery details for a user
export const getDeliveryDetails = async (req, res) => {
  try {
    const deliveryDetails = await DeliveryDetails.find({ userId: req.params.userId });
    
    if (!deliveryDetails || deliveryDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No delivery details found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Delivery details retrieved successfully",
      data: deliveryDetails
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
  try {
    const result = await DeliveryDetails.findByIdAndDelete(req.params.id);
    
    if (!result) {
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

// Get a single delivery detail by ID
export const getDeliveryDetailById = async (req, res) => {
  try {
    const deliveryDetail = await DeliveryDetails.findById(req.params.id);
    
    if (!deliveryDetail) {
      return res.status(404).json({
        success: false,
        message: "Delivery detail not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Delivery detail retrieved successfully",
      data: deliveryDetail
    });
  } catch (error) {
    console.error("Error fetching delivery detail:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery detail",
      error: error.message
    });
  }
};