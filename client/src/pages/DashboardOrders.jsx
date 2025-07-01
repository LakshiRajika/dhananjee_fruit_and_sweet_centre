import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, Button } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { Title } = Typography;

export default function DashboardOrders() {
  const [orders, setOrders] = useState([]);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await fetch('/api/order/all-orders');
        const data = await response.json();
        if (response.ok) {
          setOrders(data.data);
        } else {
          console.error('Error:', data.message);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    if (currentUser?.isAdmin) fetchAllOrders();
  }, [currentUser]);

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const downloadOrderPDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Order Details - ${order.orderId}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`User ID: ${order.userId}`, 14, 28);
    doc.text(`Total Price: Rs ${calculateOrderTotal(order.items)}`, 14, 36);

    const tableData = order.items.map((item) => [
      item.name,
      `Rs ${item.price.toFixed(2)}`,
      item.quantity,
      `Rs ${(item.price * item.quantity).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Item Name', 'Unit Price', 'Quantity', 'Total Price']],
      body: tableData,
    });

    doc.save(`Order_${order.orderId}.pdf`);
  };

  const columns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
    { title: 'User ID', dataIndex: 'userId', key: 'userId' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Total Price',
      key: 'total',
      render: (text, record) => `Rs ${calculateOrderTotal(record.items)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button
          icon={<DownloadOutlined />}
          onClick={() => downloadOrderPDF(record)}
        >
          PDF
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card title={`All Orders - ${orders.length} total`}>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="orderId"
          expandable={{
            expandedRowRender: (record) => (
              <Table
                dataSource={record.items}
                columns={[
                  {
                    title: 'Item Name',
                    dataIndex: 'name',
                    key: 'name'
                  },
                  {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `Rs ${price.toFixed(2)}`
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity'
                  }
                ]}
                pagination={false}
                rowKey="_id"
              />
            )
          }}
        />
      </Card>
    </div>
  );
} 