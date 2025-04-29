import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, message, Select, Space, DatePicker } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { autoTable } from 'jspdf-autotable';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const SERVER_URL = 'http://localhost:3000';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      const filtered = orders.filter(order => {
        const orderDate = dayjs(order.createdAt);
        return orderDate.isAfter(startDate) && orderDate.isBefore(endDate);
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [dateRange, orders]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URL}/api/order/all`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
        setRetryCount(0);
      } else {
        message.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      if (error.code === 'ERR_NETWORK' && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchAllOrders();
        }, 2000);
        message.warning(`Retrying to fetch orders... (${retryCount + 1}/3)`);
      } else {
        message.error('Failed to connect to the server. Please check if the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`${SERVER_URL}/api/order/${orderId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        message.success('Order status updated successfully');
        fetchAllOrders(); // Refresh orders list
      } else {
        message.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    }
  };

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const downloadOrderPDF = (order) => {
    try {
      const doc = new jsPDF();
      let currentY = 20;

      // Add title
      doc.setFontSize(16);
      doc.text('Order Details', 20, currentY);
      currentY += 15;

      // Add order information
      const orderInfo = [
        ['Order ID:', order.orderId],
        ['Date:', new Date(order.createdAt).toLocaleString()],
        ['Status:', order.status.toUpperCase()],
        ['Payment Status:', order.paymentStatus.toUpperCase()]
      ];

      autoTable(doc, {
        startY: currentY,
        body: orderInfo,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 100 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Add items table
      const itemsHead = [['Item', 'Quantity', 'Price', 'Total']];
      const itemsBody = order.items.map(item => [
        item.name,
        item.quantity,
        `Rs ${Number(item.price).toFixed(2)}`,
        `Rs ${(Number(item.price) * Number(item.quantity)).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: currentY,
        head: itemsHead,
        body: itemsBody,
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Add total at the bottom
      doc.setFontSize(12);
      doc.text(`Total Amount: Rs ${calculateOrderTotal(order.items)}`, 20, currentY);

      doc.save(`Order_${order.orderId}.pdf`);
      message.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      message.error('Error details: ' + error.message);
    }
  };

  const downloadAllOrdersPDF = () => {
    if (!orders || orders.length === 0) {
      message.error('No orders to generate PDF');
      return;
    }

    try {
      const doc = new jsPDF();
      let currentY = 20;

      // Add title
      doc.setFontSize(20);
      doc.text('All Orders Report', 20, currentY);
      currentY += 15;

      // Add date and summary
      const summaryInfo = [
        ['Generated on:', new Date().toLocaleString()],
        ['Total Orders:', orders.length.toString()],
        ['Total Revenue:', `Rs ${orders.reduce((sum, order) => 
          sum + parseFloat(calculateOrderTotal(order.items)), 0).toFixed(2)}`]
      ];

      autoTable(doc, {
        startY: currentY,
        body: summaryInfo,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 100 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Add orders summary table
      const ordersTableHead = [['Order ID', 'Customer', 'Status', 'Payment', 'Amount', 'Date']];
      const ordersTableBody = orders.map(order => [
        order.orderId,
        order.customerEmail,
        order.status.toUpperCase(),
        order.paymentStatus.toUpperCase(),
        `Rs ${calculateOrderTotal(order.items)}`,
        new Date(order.createdAt).toLocaleDateString()
      ]);

      autoTable(doc, {
        startY: currentY,
        head: ordersTableHead,
        body: ordersTableBody,
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 45 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Add detailed order information
      orders.forEach((order, index) => {
        doc.addPage();
        currentY = 20;

        // Order header
        doc.setFontSize(14);
        doc.text(`Order #${index + 1} Details`, 20, currentY);
        currentY += 15;

        // Order information
        const orderInfo = [
          ['Order ID:', order.orderId],
          ['Customer:', order.customerEmail],
          ['Date:', new Date(order.createdAt).toLocaleString()],
          ['Status:', order.status.toUpperCase()],
          ['Payment:', order.paymentStatus.toUpperCase()]
        ];

        autoTable(doc, {
          startY: currentY,
          body: orderInfo,
          theme: 'plain',
          styles: { fontSize: 10 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { cellWidth: 100 }
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          }
        });

        // Items table
        const itemsHead = [['Item', 'Qty', 'Price', 'Total']];
        const itemsBody = order.items.map(item => [
          item.name,
          item.quantity,
          `Rs ${Number(item.price).toFixed(2)}`,
          `Rs ${(Number(item.price) * Number(item.quantity)).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: currentY,
          head: itemsHead,
          body: itemsBody,
          headStyles: { fillColor: [52, 152, 219] },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 20 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 }
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          }
        });

        // Order total
        doc.setFontSize(11);
        doc.text(`Order Total: Rs ${calculateOrderTotal(order.items)}`, 20, currentY);
      });

      doc.save('All_Orders_Report.pdf');
      message.success('All orders PDF downloaded successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      message.error('Error details: ' + error.message);
    }
  };

  const generateInvoice = (order) => {
    try {
      const doc = new jsPDF();
      let currentY = 20;

      // Add company header
      doc.setFontSize(24);
      doc.setTextColor(41, 128, 185);
      doc.text('Dhananjee Fruit & Sweet Centre', 20, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Invoice', 20, currentY);
      currentY += 15;

      // Add invoice details
      const invoiceInfo = [
        ['Invoice Number:', `INV-${order.orderId.substring(0, 8)}`],
        ['Invoice Date:', new Date().toLocaleDateString()],
        ['Order Date:', new Date(order.createdAt).toLocaleDateString()],
        ['Order ID:', order.orderId]
      ];

      autoTable(doc, {
        startY: currentY,
        body: invoiceInfo,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 100 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Add customer details
      currentY += 5;
      doc.setFontSize(12);
      doc.text('Bill To:', 20, currentY);
      currentY += 10;

      const customerInfo = [
        ['Name:', order.customerName || 'Customer'],
        ['Email:', order.customerEmail || 'N/A'],
        ['Phone:', order.customerPhone || 'N/A'],
        ['Address:', order.shippingAddress || 'N/A']
      ];

      autoTable(doc, {
        startY: currentY,
        body: customerInfo,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 30 },
          1: { cellWidth: 110 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Add items table
      currentY += 5;
      const itemsHead = [['Item', 'Quantity', 'Unit Price', 'Total']];
      const itemsBody = order.items.map(item => [
        item.name,
        item.quantity,
        `Rs ${Number(item.price).toFixed(2)}`,
        `Rs ${(Number(item.price) * Number(item.quantity)).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: currentY,
        head: itemsHead,
        body: itemsBody,
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Add totals
      currentY += 5;
      const totalAmount = calculateOrderTotal(order.items);
      const totals = [
        ['Subtotal:', `Rs ${totalAmount}`],
        ['Delivery Fee:', 'Rs 0.00'],
        ['Tax:', 'Rs 0.00'],
        ['Total Amount:', `Rs ${totalAmount}`]
      ];

      autoTable(doc, {
        startY: currentY,
        body: totals,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 30, halign: 'right' }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      // Add payment details
      currentY += 10;
      doc.setFontSize(12);
      doc.text('Payment Details:', 20, currentY);
      currentY += 10;

      const paymentInfo = [
        ['Payment Method:', order.paymentMethod?.toUpperCase() || 'N/A'],
        ['Payment Status:', order.paymentStatus?.toUpperCase() || 'N/A'],
        ['Payment Date:', new Date(order.createdAt).toLocaleDateString()]
      ];

      autoTable(doc, {
        startY: currentY,
        body: paymentInfo,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 100 }
        }
      });

      // Add footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business!', 20, pageHeight - 20);
      doc.text('For any queries, please contact: +94 77 123 4567', 20, pageHeight - 15);

      doc.save(`Invoice_${order.orderId}.pdf`);
      message.success('Invoice generated successfully');
    } catch (error) {
      console.error('Invoice Generation Error:', error);
      message.error('Error generating invoice: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'processing':
        return 'blue';
      case 'shipped':
        return 'cyan';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Customer',
      dataIndex: 'customerEmail',
      key: 'customerEmail',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          defaultValue={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.orderId, value)}
        >
          <Option value="pending">Pending</Option>
          <Option value="processing">Processing</Option>
          <Option value="shipped">Shipped</Option>
          <Option value="delivered">Delivered</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      ),
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Total Amount',
      key: 'totalAmount',
      render: (_, record) => `Rs ${calculateOrderTotal(record.items)}`,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => downloadOrderPDF(record)}
          >
            PDF
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => generateInvoice(record)}
          >
            Invoice
          </Button>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const itemColumns = [
      { title: 'Item', dataIndex: 'name', key: 'name' },
      { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
      { 
        title: 'Price', 
        dataIndex: 'price', 
        key: 'price',
        render: (price) => `Rs ${price}`
      },
      {
        title: 'Total',
        key: 'total',
        render: (_, record) => `Rs ${(record.price * record.quantity).toFixed(2)}`
      },
    ];

    return (
      <Table
        columns={itemColumns}
        dataSource={record.items}
        pagination={false}
        rowKey="name"
      />
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card 
        title={
          <Space>
            <span>All Orders</span>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={downloadAllOrdersPDF}
            >
              Download All Orders
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: '20px' }}>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 300 }}
              placeholder={['Start Date', 'End Date']}
            />
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={() => {
                setDateRange(null);
                setFilteredOrders(orders);
              }}
            >
              Clear Filter
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="orderId"
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.items?.length > 0,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}