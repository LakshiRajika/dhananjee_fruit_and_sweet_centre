import { v4 as uuidv4 } from 'uuid';
import Order from "../models/order.model.js"; 
import PDFDocument from 'pdfkit';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      userId,
      userDeliveryDetailsId,
      customerEmail,
      items,
      paymentStatus,
      paymentMethod,
      totalAmount,
      status
    } = req.body;

    // Validate required fields
    if (!userId || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const newOrder = new Order({
      orderId: orderId || uuidv4(),
      userId,
      userDeliveryDetailsId,
      customerEmail,
      items,
      paymentStatus: paymentStatus || 'pending',
      paymentMethod,
      totalAmount,
      status: status || 'pending'
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message
    });
  }
};

// Get completed orders
export const getCompletedOrders = async (req, res) => {
  const { userId } = req.params; 
  try {
    const completedOrders = await Order.find({ userId, status: 'completed' })
      .sort({ createdAt: -1 })  
      .exec();
    if (!completedOrders || completedOrders.length === 0) {
      return res.status(404).json({ message: "No completed orders found for this user." });
    }
    res.status(200).json({ message: "Completed orders retrieved successfully", data: completedOrders });
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    res.status(500).json({ message: "Error fetching completed orders", error: error.message });
  }
};

// Get all orders for a user
export const getUserOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    
    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found for this user",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user orders",
      error: error.message
    });
  }
};

// Generate PDF for order details
export const generateOrderPDF = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order_${orderId}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(24).text('Order Details', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const orderInfo = [
      ['Order ID:', order.orderId],
      ['Date:', new Date(order.createdAt).toLocaleString()],
      ['Status:', order.status],
      ['Payment Status:', order.paymentStatus],
      ['Payment Method:', order.paymentMethod]
    ];

    doc.fontSize(12);
    const startX = 50;
    const startY = doc.y;
    const cellPadding = 5;
    const cellWidth = 250;
    const cellHeight = 20;

    orderInfo.forEach(([label, value], index) => {
      const y = startY + (index * cellHeight);
      
      doc.rect(startX, y, cellWidth, cellHeight).stroke();
      doc.text(label, startX + cellPadding, y + cellPadding, {
        width: cellWidth - (cellPadding * 2),
        align: 'left'
      });

      doc.rect(startX + cellWidth, y, cellWidth, cellHeight).stroke();
      doc.text(value, startX + cellWidth + cellPadding, y + cellPadding, {
        width: cellWidth - (cellPadding * 2),
        align: 'left'
      });
    });

    doc.moveDown(2);

    const itemsTableHeader = ['Item Name', 'Quantity', 'Price', 'Total'];
    const itemsTableWidths = [200, 100, 100, 100];
    const itemsStartX = 50;
    const itemsStartY = doc.y;

    doc.fontSize(12).font('Helvetica-Bold');
    itemsTableHeader.forEach((header, i) => {
      doc.rect(
        itemsStartX + itemsTableWidths.slice(0, i).reduce((a, b) => a + b, 0),
        itemsStartY,
        itemsTableWidths[i],
        cellHeight
      ).stroke();
      doc.text(header, 
        itemsStartX + itemsTableWidths.slice(0, i).reduce((a, b) => a + b, 0) + cellPadding,
        itemsStartY + cellPadding,
        {
          width: itemsTableWidths[i] - (cellPadding * 2),
          align: 'left'
        }
      );
    });

    doc.font('Helvetica');
    order.items.forEach((item, index) => {
      const y = itemsStartY + ((index + 1) * cellHeight);
      const rowData = [
        item.name,
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.quantity).toFixed(2)}`
      ];

      rowData.forEach((cell, i) => {
        doc.rect(
          itemsStartX + itemsTableWidths.slice(0, i).reduce((a, b) => a + b, 0),
          y,
          itemsTableWidths[i],
          cellHeight
        ).stroke();
        doc.text(cell,
          itemsStartX + itemsTableWidths.slice(0, i).reduce((a, b) => a + b, 0) + cellPadding,
          y + cellPadding,
          {
            width: itemsTableWidths[i] - (cellPadding * 2),
            align: 'left'
          }
        );
      });
    });

    const totalY = itemsStartY + ((order.items.length + 1) * cellHeight) + 10;
    doc.fontSize(14).font('Helvetica-Bold')
      .text(`Total Amount: $${order.totalAmount.toFixed(2)}`, 
        itemsStartX + itemsTableWidths.slice(0, 3).reduce((a, b) => a + b, 0),
        totalY,
        {
          width: itemsTableWidths[3],
          align: 'right'
        }
      );

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: error.message
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
  }
};

export const generateAllOrdersPDF = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user"
      });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=all_orders_${userId}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(24).text('All Orders', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    orders.forEach((order, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // Order Information
      doc.fontSize(16).text(`Order #${index + 1}`, { align: 'center' });
      doc.moveDown();

      const orderInfo = [
        ['Order ID:', order.orderId],
        ['Date:', new Date(order.createdAt).toLocaleString()],
        ['Status:', order.status],
        ['Payment Status:', order.paymentStatus],
        ['Payment Method:', order.paymentMethod]
      ];

      // Draw order information table
      const startX = 50;
      const startY = doc.y;
      const cellPadding = 5;
      const cellWidth = 250;
      const cellHeight = 20;

      orderInfo.forEach(([label, value], i) => {
        const y = startY + (i * cellHeight);
        
        doc.rect(startX, y, cellWidth, cellHeight).stroke();
        doc.text(label, startX + cellPadding, y + cellPadding, {
          width: cellWidth - (cellPadding * 2),
          align: 'left'
        });

        doc.rect(startX + cellWidth, y, cellWidth, cellHeight).stroke();
        doc.text(value, startX + cellWidth + cellPadding, y + cellPadding, {
          width: cellWidth - (cellPadding * 2),
          align: 'left'
        });
      });

      doc.moveDown(2);

      // Items Table
      const itemsTableHeader = ['Item Name', 'Quantity', 'Price', 'Total'];
      const itemsTableWidths = [200, 100, 100, 100];
      const itemsStartX = 50;
      const itemsStartY = doc.y;

      // Draw items table header
      doc.fontSize(12).font('Helvetica-Bold');
      itemsTableHeader.forEach((header, i) => {
        doc.rect(
          itemsStartX + itemsTableWidths.slice(0, i).reduce((a, b) => a + b, 0),
          itemsStartY,
          itemsTableWidths[i],
          cellHeight
        ).stroke();
        doc.text(header, 
          itemsStartX + itemsTableWidths.slice(0, i).reduce((a, b) => a + b, 0) + cellPadding,
          itemsStartY + cellPadding,
          {
            width: itemsTableWidths[i] - (cellPadding * 2),
            align: 'left'
          }
        );
      });

      // Draw items table rows
      doc.font('Helvetica');
      order.items.forEach((item, i) => {
        const y = itemsStartY + ((i + 1) * cellHeight);
        const rowData = [
          item.name,
          item.quantity.toString(),
          `$${item.price.toFixed(2)}`,
          `$${(item.price * item.quantity).toFixed(2)}`
        ];

        rowData.forEach((cell, j) => {
          doc.rect(
            itemsStartX + itemsTableWidths.slice(0, j).reduce((a, b) => a + b, 0),
            y,
            itemsTableWidths[j],
            cellHeight
          ).stroke();
          doc.text(cell,
            itemsStartX + itemsTableWidths.slice(0, j).reduce((a, b) => a + b, 0) + cellPadding,
            y + cellPadding,
            {
              width: itemsTableWidths[j] - (cellPadding * 2),
              align: 'left'
            }
          );
        });
      });

      // Total Amount
      const totalY = itemsStartY + ((order.items.length + 1) * cellHeight) + 10;
      doc.fontSize(14).font('Helvetica-Bold')
        .text(`Total Amount: $${order.totalAmount.toFixed(2)}`, 
          itemsStartX + itemsTableWidths.slice(0, 3).reduce((a, b) => a + b, 0),
          totalY,
          {
            width: itemsTableWidths[3],
            align: 'right'
          }
        );

      doc.moveDown(2);
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: error.message
    });
  }
};

export const generateAdminAllOrdersPDF = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found"
      });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=admin_all_orders.pdf`);
    
    doc.pipe(res);

    doc.fontSize(24).text('All Orders Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;

    const summary = [
      ['Total Orders:', totalOrders.toString()],
      ['Total Revenue:', `$${totalRevenue.toFixed(2)}`],
      ['Pending Orders:', pendingOrders.toString()],
      ['Completed Orders:', completedOrders.toString()]
    ];

    const startX = 50;
    const startY = doc.y;
    const cellPadding = 5;
    const cellWidth = 250;
    const cellHeight = 20;

    summary.forEach(([label, value], i) => {
      const y = startY + (i * cellHeight);
      
      doc.rect(startX, y, cellWidth, cellHeight).stroke();
      doc.text(label, startX + cellPadding, y + cellPadding, {
        width: cellWidth - (cellPadding * 2),
        align: 'left'
      });

      doc.rect(startX + cellWidth, y, cellWidth, cellHeight).stroke();
      doc.text(value, startX + cellWidth + cellPadding, y + cellPadding, {
        width: cellWidth - (cellPadding * 2),
        align: 'left'
      });
    });

    doc.moveDown(2);

    orders.forEach((order, index) => {
      if (index > 0) {
        doc.addPage();
      }

      doc.fontSize(16).text(`Order #${index + 1}`, { align: 'center' });
      doc.moveDown();

      const orderInfo = [
        ['Order ID:', order.orderId],
        ['Customer Email:', order.customerEmail],
        ['Date:', new Date(order.createdAt).toLocaleString()],
        ['Status:', order.status],
        ['Payment Status:', order.paymentStatus],
        ['Payment Method:', order.paymentMethod]
      ];

      orderInfo.forEach(([label, value], i) => {
        const y = startY + (i * cellHeight);
        
        doc.rect(startX, y, cellWidth, cellHeight).stroke();
        doc.text(label, startX + cellPadding, y + cellPadding, {
          width: cellWidth - (cellPadding * 2),
          align: 'left'
        });

        doc.rect(startX + cellWidth, y, cellWidth, cellHeight).stroke();
        doc.text(value, startX + cellWidth + cellPadding, y + cellPadding, {
          width: cellWidth - (cellPadding * 2),
          align: 'left'
        });
      });

      doc.moveDown(2);

      const itemsTableHeader = ['Item Name', 'Quantity', 'Price', 'Total'];
      const itemsTableWidths = [200, 100, 100, 100];
      const itemsStartX = 50;
      const itemsStartY = doc.y;

      doc.fontSize(12).font('Helvetica-Bold');
      itemsTableHeader.forEach((header, i) => {
        doc.rect(
          itemsStartX + itemsTableWidths.slice(0, i).reduce((a, b) => a + b, 0),
          itemsStartY,
          itemsTableWidths[i],
          cellHeight
        ).stroke();
        doc.text(header, 
          itemsStartX + itemsTableWidths.slice(0, i).reduce((a, b) => a + b, 0) + cellPadding,
          itemsStartY + cellPadding,
          {
            width: itemsTableWidths[i] - (cellPadding * 2),
            align: 'left'
          }
        );
      });

      doc.font('Helvetica');
      order.items.forEach((item, i) => {
        const y = itemsStartY + ((i + 1) * cellHeight);
        const rowData = [
          item.name,
          item.quantity.toString(),
          `$${item.price.toFixed(2)}`,
          `$${(item.price * item.quantity).toFixed(2)}`
        ];

        rowData.forEach((cell, j) => {
          doc.rect(
            itemsStartX + itemsTableWidths.slice(0, j).reduce((a, b) => a + b, 0),
            y,
            itemsTableWidths[j],
            cellHeight
          ).stroke();
          doc.text(cell,
            itemsStartX + itemsTableWidths.slice(0, j).reduce((a, b) => a + b, 0) + cellPadding,
            y + cellPadding,
            {
              width: itemsTableWidths[j] - (cellPadding * 2),
              align: 'left'
            }
          );
        });
      });

      const totalY = itemsStartY + ((order.items.length + 1) * cellHeight) + 10;
      doc.fontSize(14).font('Helvetica-Bold')
        .text(`Total Amount: $${order.totalAmount.toFixed(2)}`, 
          itemsStartX + itemsTableWidths.slice(0, 3).reduce((a, b) => a + b, 0),
          totalY,
          {
            width: itemsTableWidths[3],
            align: 'right'
          }
        );

      doc.moveDown(2);
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: error.message
    });
  }
};

export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOneAndDelete({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: order
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message
    });
  }
};

export const deleteAllOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await Order.deleteMany({ userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found to delete"
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} orders`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error("Error deleting all orders:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting all orders",
      error: error.message
    });
  }
}; 