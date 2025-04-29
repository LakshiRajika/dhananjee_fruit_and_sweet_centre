import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Steps, Card, Typography, Spin, Descriptions, Tag, Table, message } from 'antd';
import { CheckCircleOutlined, LoadingOutlined, ShoppingOutlined, DollarOutlined, TruckOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Fetch order details
        const orderResponse = await axios.get(`http://localhost:3000/api/order/track/${orderId}`);
        if (orderResponse.data.success) {
          setOrderDetails(orderResponse.data.data);
          
          // Fetch delivery details
          const deliveryResponse = await axios.get(
            `http://localhost:3000/api/delivery/${orderResponse.data.data.userDeliveryDetailsId}`
          );
          if (deliveryResponse.data.success) {
            setDeliveryDetails(deliveryResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        message.error('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getOrderStatus = () => {
    if (!orderDetails || !deliveryDetails) return [];

    const statuses = [
      {
        title: 'Order Placed',
        description: new Date(orderDetails.createdAt).toLocaleString(),
        icon: <ShoppingOutlined />,
        status: 'finish'
      },
      {
        title: 'Payment',
        description: `${orderDetails.paymentStatus.toUpperCase()} (${orderDetails.paymentMethod})`,
        icon: <DollarOutlined />,
        status: orderDetails.paymentStatus === 'paid' ? 'finish' : 'process'
      },
      {
        title: 'Processing',
        description: orderDetails.status === 'processing' ? 'Order is being prepared' : '',
        icon: <LoadingOutlined />,
        status: ['processing', 'completed'].includes(orderDetails.status) ? 'finish' : 'wait'
      },
      {
        title: 'Out for Delivery',
        description: deliveryDetails.status === 'Out for Delivery' ? `Via ${deliveryDetails.deliveryService}` : '',
        icon: <TruckOutlined />,
        status: ['Out for Delivery', 'Delivered'].includes(deliveryDetails.status) ? 'finish' : 'wait'
      },
      {
        title: 'Delivered',
        description: deliveryDetails.completedAt !== 'Pending' ? deliveryDetails.completedAt : '',
        icon: <CheckOutlined />,
        status: deliveryDetails.status === 'Delivered' ? 'finish' : 'wait'
      }
    ];

    return statuses;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'success';
      case 'processing':
      case 'out for delivery':
        return 'processing';
      case 'pending':
      case 'picked up':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const itemColumns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `Rs. ${price.toFixed(2)}`,
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => `Rs. ${(record.price * record.quantity).toFixed(2)}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <Title level={2}>Order Tracking</Title>
        <Text type="secondary">Order #{orderId}</Text>

        {orderDetails && deliveryDetails && (
          <>
            {/* Order Status Timeline */}
            <Card style={{ marginTop: 24 }}>
              <Steps
                direction="horizontal"
                current={getOrderStatus().filter(status => status.status === 'finish').length - 1}
                items={getOrderStatus()}
              />
            </Card>

            {/* Order Details */}
            <Card style={{ marginTop: 24 }} title="Order Details">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Order Date">
                  {new Date(orderDetails.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Order Status">
                  <Tag color={getStatusColor(orderDetails.status)}>
                    {orderDetails.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {orderDetails.paymentMethod.toUpperCase()}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Tag color={getStatusColor(orderDetails.paymentStatus)}>
                    {orderDetails.paymentStatus.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount" span={2}>
                  <Text strong>Rs. {orderDetails.totalAmount.toFixed(2)}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Delivery Details */}
            <Card style={{ marginTop: 24 }} title="Delivery Details">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Customer Name">
                  {deliveryDetails.customerName}
                </Descriptions.Item>
                <Descriptions.Item label="Mobile Number">
                  {deliveryDetails.mobileNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {deliveryDetails.email}
                </Descriptions.Item>
                <Descriptions.Item label="Delivery Status">
                  <Tag color={getStatusColor(deliveryDetails.status)}>
                    {deliveryDetails.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Delivery Service">
                  {deliveryDetails.deliveryService}
                </Descriptions.Item>
                <Descriptions.Item label="Estimated Time">
                  {deliveryDetails.estimatedTime || 'Not available'}
                </Descriptions.Item>
                <Descriptions.Item label="Delivery Address" span={2}>
                  {deliveryDetails.deliveryAddress}
                  <br />
                  {deliveryDetails.district}, {deliveryDetails.postalCode}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Order Items */}
            <Card style={{ marginTop: 24 }} title="Order Items">
              <Table
                columns={itemColumns}
                dataSource={orderDetails.items}
                pagination={false}
                rowKey={(record) => record.name}
                summary={(pageData) => {
                  const total = pageData.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Text strong>Total</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong>Rs. {total.toFixed(2)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </Card>
          </>
        )}
      </Card>
    </div>
  );
};

export default TrackOrderPage;