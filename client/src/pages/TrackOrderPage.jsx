import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // For extracting dynamic parameters from the URL
import { Steps, Card, Typography } from 'antd'; // Import Ant Design components
import { CheckCircleOutlined } from '@ant-design/icons'; // Import check mark icon

const { Title } = Typography;

const TrackOrderPage = () => {
  const { orderId } = useParams(); // Get orderId from URL
  const [orderStatus, setOrderStatus] = useState([]);
  
  useEffect(() => {
    // Fetch the tracking status of the order
    const fetchOrderTracking = async () => {
      // For now, we'll mock the tracking statuses
      const dummyStatuses = [
        { timestamp: '2025-03-24 10:00', status: 'Order Placed', color: 'blue' },
        { timestamp: '2025-03-24 12:00', status: 'Payment Confirmed', color: 'blue' },
        { timestamp: '2025-03-24 14:00', status: 'Shipped', color: 'orange' },
        { timestamp: '2025-03-25 09:00', status: 'In Transit', color: 'orange' },
        { timestamp: '2025-03-26 11:00', status: 'Delivered', color: 'green', isCompleted: true }
      ];
      setOrderStatus(dummyStatuses);
    };

    fetchOrderTracking(); // Call the tracking fetch function
  }, [orderId]);

  // Map over the orderStatus array to create the steps
  const steps = orderStatus.map((status, index) => ({
    title: status.status,
    description: status.timestamp,
    icon: status.isCompleted ? <CheckCircleOutlined style={{ color: 'green' }} /> : null, // Add check mark for completed status
    status: status.isCompleted ? 'finish' : 'process', // Mark as completed if isCompleted is true

  }));

  return (
    <div style={{  padding: '60px', backgroundColor: '#f5f5f5', minHeight: '50vh' }}>
      <Card title={<span style={{ fontSize: '44px',marginTop:'20px' }}>Track Your Package<br/>
      <div style={{fontSize:'20px'}}>Order # <span style={{fontSize:'18px',color:'grey'}}>{orderId}</span></div> </span>} style={{ marginBottom: 40 }} >
        <Title style={{marginBottom:60}}level={4}>Order Tracking Timeline</Title>
        <Steps
        style={{marginBottom:80}}
          current={orderStatus.length - 1} // Set the current step to the last one (the most recent)
          items={steps}
          size="larger" // You can change this if you need larger or smaller steps
        />
      </Card>
    </div>
  );
};

export default TrackOrderPage;
