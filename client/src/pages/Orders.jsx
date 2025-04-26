import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Typography, Button, Tag, Space, message, Table, Popconfirm } from 'antd';
import { 
  ArrowLeftOutlined, 
  ShoppingOutlined, 
  DownloadOutlined, 
  CompassOutlined,
  DeleteOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { generateOrderPDF } from '../utils/pdfService';

const { Title, Text } = Typography;

export default function Orders() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?._id) {
      fetchOrders();
    }
  }, [currentUser?._id]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/order/user/${currentUser._id}`);
      if (response.data.success) {
        setOrders(response.data.data);
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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button 
          onClick={() => navigate('/')}
          icon={<ArrowLeftOutlined />}
        >
          Back to Home
        </Button>
        <Title level={4} style={{ margin: 0 }}>My Orders</Title>
        {orders.length > 0 && (
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => window.open(`http://localhost:3000/api/order/all-pdf/${currentUser._id}`, '_blank')}
            >
              Download All Orders
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
          <Card loading={true} />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <ShoppingOutlined style={{ fontSize: '48px', color: '#ccc' }} />
            <Title level={4}>No orders found</Title>
            <Button type="primary" onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </div>
        </Card>
      ) : (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="orderId"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
          }}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                columns={[
                  { title: 'Item', dataIndex: 'name', key: 'name' },
                  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                  { 
                    title: 'Price', 
                    dataIndex: 'price', 
                    key: 'price',
                    render: (price) => `Rs ${price.toFixed(2)}`
                  },
                  {
                    title: 'Subtotal',
                    key: 'subtotal',
                    render: (_, item) => `Rs ${(item.price * item.quantity).toFixed(2)}`
                  }
                ]}
                dataSource={record.items}
                pagination={false}
                rowKey="name"
              />
            ),
          }}
        />
      )}
    </div>
  );
}