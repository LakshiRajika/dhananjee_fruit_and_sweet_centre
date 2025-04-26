import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, List, Button, message, Space, Tag, Descriptions, Spin } from 'antd';
import { CheckCircleOutlined, ShoppingOutlined, CompassOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { sendPaymentSuccessEmail } from '../api/emailService';

const { Title, Text } = Typography;

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // First check localStorage for pending order
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
            message.success('Payment success email sent!');
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
          
          // Send email notification
          try {
            console.log('Preparing to send email with user:', currentUser);
            const emailData = {
              ...location.state.orderDetails,
              userEmail: currentUser?.email
            };
            console.log('Sending email with data:', emailData);
            await sendPaymentSuccessEmail(emailData);
            message.success('Payment success email sent!');
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
            
            // Send email notification
            try {
              console.log('Preparing to send email with user:', currentUser);
              const emailData = {
                ...orderData,
                userEmail: currentUser?.email
              };
              console.log('Sending email with data:', emailData);
              await sendPaymentSuccessEmail(emailData);
              message.success('Payment success email sent!');
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
          <Title level={2}>Payment Successful!</Title>
          <Text type="secondary">Thank you for your purchase</Text>
        </div>

        <Descriptions title="Order Details" bordered column={2}>
          <Descriptions.Item label="Order ID">{orderDetails.orderId}</Descriptions.Item>
          <Descriptions.Item label="Date">{new Date().toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(orderDetails.status)}>
              {orderDetails.status?.toUpperCase() || 'PROCESSING'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Payment Method">
            {orderDetails.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
          </Descriptions.Item>
          <Descriptions.Item label="Total Amount" span={2}>
            Rs {orderDetails.totalAmount?.toFixed(2)}
          </Descriptions.Item>
        </Descriptions>

        <Card title="Order Items" style={{ marginTop: '20px' }}>
          <List
            dataSource={orderDetails.items}
            renderItem={item => (
              <List.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div>
                    <Text strong>{item.name}</Text>
                    <br />
                    <Text type="secondary">Quantity: {item.quantity}</Text>
                  </div>
                  <div>
                    <Text>Rs {(item.price * item.quantity).toFixed(2)}</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div style={{ textAlign: 'right', marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
            <Text strong>Total: Rs {orderDetails.totalAmount?.toFixed(2)}</Text>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Space size="middle">
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
              onClick={() => navigate('/orders')}
            >
              View All Orders
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CompassOutlined />}
              onClick={handleTrackOrder}
              style={{ backgroundColor: '#1890ff' }}
            >
              Track Order
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}