import Order from "../models/order.model.js";

export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }

  
};