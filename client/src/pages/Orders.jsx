import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Typography, Button, Tag, Space, message, Table, Popconfirm, DatePicker } from 'antd';
import { 
  ArrowLeftOutlined, 
  ShoppingOutlined, 
  DownloadOutlined, 
  CompassOutlined,
  DeleteOutlined,
  SearchOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { generateOrderPDF } from '../utils/pdfService';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function Orders() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    if (currentUser?._id) {
      fetchOrders();
    }
  }, [currentUser?._id]);

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/order/user/${currentUser._id}`);
      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      } else {
        message.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:3000/api/order/${orderId}`);
      if (response.data.success) {
        message.success('Order deleted successfully');
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
      const response = await axios.delete(`http://localhost:3000/api/order/user/${currentUser._id}/all`);
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

  const handleTrackOrder = (orderId) => {
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

  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
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
            onClick={() => generateOrderPDF(record)}
            size="middle"
          >
            Download PDF
          </Button>
          <Button
            type="primary"
            icon={<CompassOutlined />}
            onClick={() => handleTrackOrder(record.orderId)}
            size="middle"
          >
            Track Order
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
              size="middle"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const downloadFilteredOrdersPDF = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      message.error('No filtered orders to generate PDF');
      return;
    }

    try {
      const doc = new jsPDF();
      let currentY = 20;

      // Add title
      doc.setFontSize(20);
      doc.text('Filtered Orders Report', 20, currentY);
      currentY += 15;

      // Add date range and summary
      const summaryInfo = [
        ['Generated on:', new Date().toLocaleString()],
        ['Date Range:', dateRange ? `${dateRange[0].format('YYYY-MM-DD')} to ${dateRange[1].format('YYYY-MM-DD')}` : 'All Dates'],
        ['Total Orders:', filteredOrders.length.toString()],
        ['Total Revenue:', `Rs ${filteredOrders.reduce((sum, order) => 
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
      const ordersTableHead = [['Order ID', 'Status', 'Payment', 'Amount', 'Date']];
      const ordersTableBody = filteredOrders.map(order => [
        order.orderId,
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

      // Add detailed order information
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

      doc.save('Filtered_Orders_Report.pdf');
      message.success('Filtered orders PDF downloaded successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      message.error('Error details: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card 
        title={
          <Space>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/')}
            />
            <Title level={4} style={{ margin: 0 }}>My Orders</Title>
          </Space>
        }
        extra={
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
            {orders.length > 0 && (
              <Space>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => window.open(`http://localhost:3000/api/order/all-pdf/${currentUser._id}`, '_blank')}
                >
                  Download All
                </Button>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={downloadFilteredOrdersPDF}
                  disabled={!filteredOrders.length}
                >
                  Download Filtered
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
                    Delete All
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </Space>
        }
        style={{ 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Card loading={true} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '40px' }}>
            <ShoppingOutlined style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }} />
            <Title level={4} style={{ marginBottom: '16px' }}>No orders found</Title>
            <Button type="primary" size="large" onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </Card>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="orderId"
            pagination={{
              pageSize: 10,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
              showSizeChanger: true,
              showQuickJumper: true
            }}
            expandable={{
              expandedRowRender: (record) => (
                <Card style={{ margin: '16px 0' }}>
                  <Table
                    columns={[
                      { 
                        title: 'Item', 
                        dataIndex: 'name', 
                        key: 'name',
                        render: (text) => <Text strong>{text}</Text>
                      },
                      { 
                        title: 'Quantity', 
                        dataIndex: 'quantity', 
                        key: 'quantity',
                        align: 'center'
                      },
                      { 
                        title: 'Price', 
                        dataIndex: 'price', 
                        key: 'price',
                        render: (price) => <Text strong>Rs {price.toFixed(2)}</Text>,
                        align: 'right'
                      },
                      {
                        title: 'Subtotal',
                        key: 'subtotal',
                        render: (_, item) => <Text strong type="success">Rs {(item.price * item.quantity).toFixed(2)}</Text>,
                        align: 'right'
                      }
                    ]}
                    dataSource={record.items}
                    pagination={false}
                    rowKey="name"
                    style={{ margin: '0 -16px' }}
                  />
                </Card>
              ),
            }}
            style={{ 
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          />
        )}
      </Card>
    </div>
  );
}