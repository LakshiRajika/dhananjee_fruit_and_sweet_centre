import React, { useState, useEffect } from 'react';
import { Card, Table, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const { Title } = Typography;

export default function OrderPrediction() {
  const [historicalData, setHistoricalData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/order/all');
      if (response.data.success) {
        const orders = response.data.data;
        processOrderData(orders);
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processOrderData = (orders) => {
    // Group orders by date and calculate daily totals
    const dailyData = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          totalOrders: 0,
          totalRevenue: 0,
        };
      }
      acc[date].totalOrders++;
      acc[date].totalRevenue += order.totalAmount || 0;
      return acc;
    }, {});

    // Convert to array and sort by date
    const processedData = Object.values(dailyData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    setHistoricalData(processedData);
    generatePredictions(processedData);
  };

  const generatePredictions = (data) => {
    // Simple moving average prediction
    const windowSize = 7; // 7-day moving average
    const predictions = [];
    
    for (let i = windowSize; i < data.length; i++) {
      const window = data.slice(i - windowSize, i);
      const avgOrders = window.reduce((sum, day) => sum + day.totalOrders, 0) / windowSize;
      const avgRevenue = window.reduce((sum, day) => sum + day.totalRevenue, 0) / windowSize;
      
      predictions.push({
        date: data[i].date,
        predictedOrders: Math.round(avgOrders),
        predictedRevenue: Math.round(avgRevenue),
        actualOrders: data[i].totalOrders,
        actualRevenue: data[i].totalRevenue,
      });
    }

    setPredictions(predictions);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Predicted Orders',
      dataIndex: 'predictedOrders',
      key: 'predictedOrders',
    },
    {
      title: 'Actual Orders',
      dataIndex: 'actualOrders',
      key: 'actualOrders',
    },
    {
      title: 'Predicted Revenue',
      dataIndex: 'predictedRevenue',
      key: 'predictedRevenue',
      render: (value) => `Rs ${value.toLocaleString()}`,
    },
    {
      title: 'Actual Revenue',
      dataIndex: 'actualRevenue',
      key: 'actualRevenue',
      render: (value) => `Rs ${value.toLocaleString()}`,
    },
  ];

  return (
    <div className="p-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Order Predictions</Title>
        </div>

        <div className="mb-8">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="predictedOrders"
                stroke="#8884d8"
                name="Predicted Orders"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="actualOrders"
                stroke="#82ca9d"
                name="Actual Orders"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="predictedRevenue"
                stroke="#ffc658"
                name="Predicted Revenue"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="actualRevenue"
                stroke="#ff7300"
                name="Actual Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Table
          columns={columns}
          dataSource={predictions}
          loading={loading}
          rowKey="date"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}