import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, message } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

export default function RefundManagement() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      console.log("Fetching refunds...");
      const response = await axios.get('http://localhost:3000/api/refund/all');
      console.log("Refunds response:", response.data);
      if (response.data.success) {
        setRefunds(response.data.data);
      } else {
        message.error('Failed to fetch refunds: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
      message.error('Failed to fetch refunds: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (refundId, status) => {
    try {
      console.log(`Updating refund ${refundId} status to ${status}`);
      const response = await axios.put(`http://localhost:3000/api/refund/${refundId}/status`, {
        status,
        processedBy: 'admin' // You can replace this with actual admin ID
      });

      if (response.data.success) {
        message.success(`Refund ${status} successfully`);
        fetchRefunds();
      } else {
        message.error('Failed to update refund status: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating refund status:', error);
      message.error('Failed to update refund status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (refundId) => {
    try {
      console.log(`Deleting refund ${refundId}`);
      const response = await axios.delete(`http://localhost:3000/api/refund/${refundId}`);
      if (response.data.success) {
        message.success('Refund deleted successfully');
        fetchRefunds();
      } else {
        message.error('Failed to delete refund: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error deleting refund:', error);
      message.error('Failed to delete refund: ' + (error.response?.data?.message || error.message));
    }
  };

  const showRefundDetails = (refund) => {
    setSelectedRefund(refund);
    setIsModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'gold';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'processed':
        return 'blue';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Refund ID',
      dataIndex: 'refundId',
      key: 'refundId',
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `Rs ${amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created At',
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
            icon={<EyeOutlined />}
            onClick={() => showRefundDetails(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusUpdate(record.refundId, 'approved')}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleStatusUpdate(record.refundId, 'rejected')}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusUpdate(record.refundId, 'processed')}
            >
              Process
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.refundId)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card title="Refund Management">
        <Table
          columns={columns}
          dataSource={refunds}
          loading={loading}
          rowKey="refundId"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="Refund Details"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedRefund && (
            <div>
              <p><strong>Refund ID:</strong> {selectedRefund.refundId}</p>
              <p><strong>Order ID:</strong> {selectedRefund.orderId}</p>
              <p><strong>User ID:</strong> {selectedRefund.userId}</p>
              <p><strong>Amount:</strong> Rs {selectedRefund.amount.toLocaleString()}</p>
              <p><strong>Reason:</strong> {selectedRefund.reason}</p>
              <p><strong>Status:</strong> {selectedRefund.status.toUpperCase()}</p>
              <p><strong>Created At:</strong> {new Date(selectedRefund.createdAt).toLocaleString()}</p>
              {selectedRefund.processedAt && (
                <p><strong>Processed At:</strong> {new Date(selectedRefund.processedAt).toLocaleString()}</p>
              )}
              {selectedRefund.processedBy && (
                <p><strong>Processed By:</strong> {selectedRefund.processedBy}</p>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
}