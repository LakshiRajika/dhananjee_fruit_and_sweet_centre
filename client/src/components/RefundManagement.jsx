import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, message } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

const { Option } = Select;

export default function RefundManagement() {
  const [refunds, setRefunds] = useState([]);
  const [filteredRefunds, setFilteredRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRefunds();
  }, []);

  useEffect(() => {
    filterRefunds();
  }, [statusFilter, refunds]);

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

  const filterRefunds = () => {
    if (statusFilter === 'all') {
      setFilteredRefunds(refunds);
    } else {
      setFilteredRefunds(refunds.filter(refund => refund.status.toLowerCase() === statusFilter.toLowerCase()));
    }
  };

  const handleStatusUpdate = async (refundId, status) => {
    try {
      console.log(`Updating refund ${refundId} status to ${status}`);
      const response = await axios.put(`http://localhost:3000/api/refund/${refundId}/status`, {
        status,
        processedBy: 'admin' 
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

  const handleDownload = () => {
    try {
      const data = filteredRefunds.map(refund => ({
        'Refund ID': refund.refundId,
        'Order ID': refund.orderId,
        'User ID': refund.userId,
        'Amount': `Rs ${refund.amount}`,
        'Status': refund.status.toUpperCase(),
        'Created At': new Date(refund.createdAt).toLocaleDateString(),
        'Processed At': refund.processedAt ? new Date(refund.processedAt).toLocaleDateString() : 'N/A',
        'Processed By': refund.processedBy || 'N/A',
        'Reason': refund.reason
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Refunds');
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const fileName = `refunds_${date}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      message.success('Refunds data downloaded successfully');
    } catch (error) {
      console.error('Error downloading refunds:', error);
      message.error('Failed to download refunds data');
    }
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
      <Card 
        title="Refund Management"
        extra={
          <Space>
            <Select
              defaultValue="all"
              style={{ width: 120 }}
              onChange={value => setStatusFilter(value)}
              placeholder="Filter by status"
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="processed">Processed</Option>
            </Select>
            <Button 
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredRefunds}
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