import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, List, Button, message, Space, Tag, Descriptions, Spin, Table, Modal } from 'antd';
import { CheckCircleOutlined, ShoppingOutlined, CompassOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { sendPaymentSuccessEmail } from '../api/emailService';

const { Title, Text } = Typography;

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const pendingOrder = localStorage.getItem('pendingOrder');
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder);
          setOrderDetails(orderData);
          localStorage.removeItem('pendingOrder'); // Clear the stored order
          setLoading(false);
          
          // Send email notification
          try {
            console.log('Preparing to send email with user:', currentUser);
            const emailData = {
              ...orderData,
              userEmail: currentUser?.email
            };
            console.log('Sending email with data:', emailData);
            await sendPaymentSuccessEmail(emailData);
            setEmailModalVisible(true);
          } catch (error) {
            console.error('Error in PaymentSuccess while sending email:', error);
            message.error('Failed to send payment success email');
          }
          
          return;
        }

        // If we have order details in location state, use them
        if (location.state?.orderDetails) {
          setOrderDetails(location.state.orderDetails);
          setLoading(false);
          
          try {
            console.log('Preparing to send email with user:', currentUser);
            const emailData = {
              ...location.state.orderDetails,
              userEmail: currentUser?.email
            };
            console.log('Sending email with data:', emailData);
            await sendPaymentSuccessEmail(emailData);
            setEmailModalVisible(true);
          } catch (error) {
            console.error('Error in PaymentSuccess while sending email:', error);
            message.error('Failed to send payment success email');
          }
          
          return;
        }

        // Otherwise, try to fetch from session ID
        const sessionId = new URLSearchParams(window.location.search).get('session_id');
        if (sessionId) {
          const response = await axios.get(`http://localhost:3000/api/payment/order-details/${sessionId}`);
          if (response.data.success) {
            const orderData = response.data.data;
            setOrderDetails(orderData);
            
            try {
              console.log('Preparing to send email with user:', currentUser);
              const emailData = {
                ...orderData,
                userEmail: currentUser?.email
              };
              console.log('Sending email with data:', emailData);
              await sendPaymentSuccessEmail(emailData);
              setEmailModalVisible(true);
            } catch (error) {
              console.error('Error in PaymentSuccess while sending email:', error);
              message.error('Failed to send payment success email');
            }
          } else {
            message.error('Failed to fetch order details');
          }
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        message.error('Error fetching order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location.state]);

  const handleTrackOrder = () => {
    if (orderDetails?.orderId) {
      navigate(`/trackOrder/${orderDetails.orderId}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'processing';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Title level={3}>Loading order details...</Title>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>No order details found</Title>
        <Button type="primary" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Card style={{ 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={2} style={{ marginBottom: '8px' }}>Payment Successful!</Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>Thank you for your purchase</Text>
        </div>

        <Card title="Order Summary" style={{ marginBottom: '24px' }}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Order ID" span={2}>
              <Text strong>{orderDetails.orderId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              <Text strong>{new Date().toLocaleString()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(orderDetails.status)} style={{ padding: '4px 8px', borderRadius: '4px' }}>
                {orderDetails.status?.toUpperCase() || 'PROCESSING'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              <Text strong>{orderDetails.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount" span={2}>
              <Text strong type="success" style={{ fontSize: '18px' }}>
                Rs {orderDetails.totalAmount?.toFixed(2)}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Order Items" style={{ marginBottom: '24px' }}>
          <Table
            dataSource={orderDetails.items}
            pagination={false}
            rowKey="name"
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
                render: (_, item) => (
                  <Text strong type="success">
                    Rs {(item.price * item.quantity).toFixed(2)}
                  </Text>
                ),
                align: 'right'
              }
            ]}
          />
          <div style={{ 
            textAlign: 'right', 
            marginTop: '20px', 
            borderTop: '1px solid #f0f0f0', 
            paddingTop: '20px' 
          }}>
            <Text strong style={{ fontSize: '18px' }}>
              Total: Rs {orderDetails.totalAmount?.toFixed(2)}
            </Text>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Space size="large">
            <Button 
              type="primary" 
              size="large" 
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
            <Button 
              type="default" 
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/orders')}
            >
              View All Orders
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CompassOutlined />}
              onClick={handleTrackOrder}
            >
              Track Order
            </Button>
          </Space>
        </div>
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MailOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
            <span>Payment Confirmation Email</span>
          </div>
        }
        open={emailModalVisible}
        onOk={() => setEmailModalVisible(false)}
        onCancel={() => setEmailModalVisible(false)}
        okText="Got it!"
        cancelText="Close"
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            A payment confirmation email has been sent to your registered email address:
          </p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
            {currentUser?.email}
          </p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
            Please check your inbox (and spam folder) for the order details and payment confirmation.
          </p>
        </div>
      </Modal>
    </div>
  );
}