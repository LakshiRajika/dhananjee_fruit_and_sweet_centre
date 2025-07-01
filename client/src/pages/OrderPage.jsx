import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Card, Typography, Button, message, Space, Tag, Descriptions, Spin, Popconfirm, Modal, DatePicker } from 'antd';
import { EyeOutlined, DownloadOutlined, FilePdfOutlined, ShoppingCartOutlined, DeleteOutlined, RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import RefundRequest from '../components/RefundRequest';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function OrderPage() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    if (userId) {
      const fetchOrders = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/order/user/${userId}`);
          console.log('Orders response:', response.data);
          if (response.data.success) {
            setOrders(response.data.data);
            setFilteredOrders(response.data.data);
          } else {
            message.error(response.data.message || 'Failed to fetch orders');
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          message.error('Failed to fetch orders');
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [userId]);

  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      const [start, end] = dateRange;
      setFilteredOrders(
        orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= start.startOf('day').toDate() && orderDate <= end.endOf('day').toDate();
        })
      );
    } else {
      setFilteredOrders(orders);
    }
  }, [dateRange, orders]);

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleTrackOrderClick = (orderId) => {
    navigate(`/trackOrder/${orderId}`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'processing';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDelete = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:3000/api/order/${orderId}`);
      if (response.data.success) {
        message.success('Order deleted successfully');
        // Update the orders list by filtering out the deleted order
        setOrders(orders.filter(order => order.orderId !== orderId));
      } else {
        message.error(response.data.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      message.error('Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:3000/api/order/user/${userId}/all`);
      if (response.data.success) {
        message.success(response.data.message);
        setOrders([]); // Clear all orders from the state
      } else {
        message.error(response.data.message || 'Failed to delete all orders');
      }
    } catch (error) {
      console.error('Error deleting all orders:', error);
      message.error('Failed to delete all orders');
    } finally {
      setLoading(false);
    }
  };

  const showRefundModal = (order) => {
    setSelectedOrder(order);
    setIsRefundModalVisible(true);
  };

  const handleRefundModalClose = () => {
    setIsRefundModalVisible(false);
    setSelectedOrder(null);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status.toLowerCase() === 'pending' ? 'gold' : 'green'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'total',
      render: (amount) => `Rs ${amount.toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => downloadOrderPDF(record)}
          >
            Download PDF
          </Button>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleTrackOrderClick(record.orderId)}
          >
            Track Order
          </Button>
          <Button
            type="primary"
            icon={<RollbackOutlined />}
            onClick={() => showRefundModal(record)}
            disabled={record.status === 'cancelled' || record.status === 'refunded'}
          >
            Request Refund
          </Button>
          <Popconfirm
            title="Delete Order"
            description="Are you sure you want to delete this order?"
            onConfirm={() => handleDelete(record.orderId)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const itemColumns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <ShoppingCartOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `Rs ${Number(price).toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      render: (_, record) => `Rs ${(record.price * record.quantity).toFixed(2)}`,
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <Card>
        <Descriptions title="Order Details" bordered column={2}>
          <Descriptions.Item label="Order ID">{record.orderId}</Descriptions.Item>
          <Descriptions.Item label="Date">{new Date(record.createdAt).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(record.status)}>{record.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Payment Status">
            <Tag color={getPaymentStatusColor(record.paymentStatus)}>{record.paymentStatus.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Payment Method">{record.paymentMethod || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Total Amount">Rs {calculateOrderTotal(record.items)}</Descriptions.Item>
        </Descriptions>

        <Title level={5} style={{ marginTop: 20, marginBottom: 16 }}>Order Items</Title>
        <Table
          dataSource={record.items}
          columns={itemColumns}
          pagination={false}
          rowKey={(item) => `${record.orderId}-${item.name}`}
          summary={(pageData) => {
            const total = pageData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>Total</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>Rs {total.toFixed(2)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    );
  };

  const downloadOrderPDF = (order) => {
    if (!order || !order.items) {
      message.error('Invalid order data');
      return;
    }

    try {
    const doc = new jsPDF();
      let currentY = 20;

    doc.setFontSize(16);
      doc.text('Order Details', 20, currentY);
      currentY += 15;

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

      const itemsTableHead = [['Item', 'Quantity', 'Price', 'Total']];
      const itemsTableBody = order.items.map(item => [
        item.name,
        item.quantity,
        `Rs ${Number(item.price).toFixed(2)}`,
        `Rs ${(Number(item.price) * Number(item.quantity)).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: currentY,
        head: itemsTableHead,
        body: itemsTableBody,
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

      doc.setFontSize(16);
      doc.text('My Orders Report', 20, currentY);
      currentY += 15;

      const summaryInfo = [
        ['Customer:', currentUser?.email || 'N/A'],
        ['Total Orders:', orders.length.toString()],
        ['Generated On:', new Date().toLocaleString()],
        ['Total Amount:', `Rs ${orders.reduce((sum, order) => 
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

      const ordersTableHead = [['Order ID', 'Status', 'Payment', 'Amount', 'Date']];
      const ordersTableBody = orders.map(order => [
        order.orderId.substring(0, 15),
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
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      orders.forEach((order, index) => {
        doc.addPage();
        currentY = 20;

        doc.setFontSize(14);
        doc.text(`Order #${index + 1} Details`, 20, currentY);
        currentY += 15;

        const orderInfo = [
          ['Order ID:', order.orderId],
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

        doc.setFontSize(11);
        doc.text(`Order Total: Rs ${calculateOrderTotal(order.items)}`, 20, currentY);
      });

      doc.save('My_Orders_Report.pdf');
      message.success('All orders PDF downloaded successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      message.error('Error details: ' + error.message);
    }
  };

  const downloadFilteredOrdersPDF = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      message.error('No filtered orders to generate PDF');
      return;
    }

    try {
      const doc = new jsPDF();
      let currentY = 20;

      doc.setFontSize(16);
      doc.text('Filtered Orders Report', 20, currentY);
      currentY += 15;

      const summaryInfo = [
        ['Customer:', currentUser?.email || 'N/A'],
        ['Total Filtered Orders:', filteredOrders.length.toString()],
        ['Generated On:', new Date().toLocaleString()],
        ['Total Amount:', `Rs ${filteredOrders.reduce((sum, order) => 
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

      const ordersTableHead = [['Order ID', 'Status', 'Payment', 'Amount', 'Date']];
      const ordersTableBody = filteredOrders.map(order => [
        order.orderId.substring(0, 15),
        order.status.toUpperCase(),
        order.paymentStatus?.toUpperCase() || '',
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
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      filteredOrders.forEach((order, index) => {
        doc.addPage();
        currentY = 20;

        doc.setFontSize(14);
        doc.text(`Order #${index + 1} Details`, 20, currentY);
        currentY += 15;

        const orderInfo = [
          ['Order ID:', order.orderId],
          ['Date:', new Date(order.createdAt).toLocaleString()],
          ['Status:', order.status.toUpperCase()],
          ['Payment:', order.paymentStatus?.toUpperCase() || '']
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

        doc.setFontSize(11);
        doc.text(`Order Total: Rs ${calculateOrderTotal(order.items)}`, 20, currentY);
      });

      doc.save('Filtered_Orders_Report.pdf');
      message.success('Filtered orders PDF downloaded successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      message.error('Error details: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          ← Back to Home
        </Button>
        <Title level={4} style={{ margin: 0 }}>My Orders</Title>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          style={{ marginLeft: 16 }}
          allowClear
        />
        {orders.length > 0 && (
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadAllOrdersPDF}
            >
              Download All Orders
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadFilteredOrdersPDF}
              disabled={!filteredOrders.length}
            >
              Download Filtered Orders
            </Button>
            <Popconfirm
              title="Delete All Orders"
              description="Are you sure you want to delete all your orders? This action cannot be undone."
              onConfirm={handleDeleteAll}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
              >
                Delete All Orders
              </Button>
            </Popconfirm>
          </Space>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <p>Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={4}>No Orders Found</Title>
          <p>You haven't placed any orders yet.</p>
          <Button type="primary" onClick={() => navigate('/products')}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <Table
          dataSource={filteredOrders}
          columns={columns}
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          rowKey="orderId"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
          }}
        />
      )}

      <Modal
        title="Request Refund"
        open={isRefundModalVisible}
        onCancel={handleRefundModalClose}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <RefundRequest 
            orderId={selectedOrder.orderId} 
            amount={selectedOrder.totalAmount} 
          />
        )}
      </Modal>
    </div>
  );
}