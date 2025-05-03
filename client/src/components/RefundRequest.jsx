import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, InputNumber, message, Alert } from 'antd';
import axios from 'axios';
import { useSelector } from 'react-redux';

const { TextArea } = Input;

export default function RefundRequest({ orderId, amount }) {
  const [loading, setLoading] = useState(false);
  const [existingRefund, setExistingRefund] = useState(null);
  const [checkingRefund, setCheckingRefund] = useState(true);
  const { currentUser } = useSelector((state) => state.user);
  const [form] = Form.useForm();

  useEffect(() => {
    const checkExistingRefund = async () => {
      try {
        setCheckingRefund(true);
        console.log(`Checking for existing refund for order ${orderId}`);
        const response = await axios.get(`http://localhost:3000/api/refund/order/${orderId}`);
        if (response.data.success && response.data.data) {
          console.log("Found existing refund:", response.data.data);
          setExistingRefund(response.data.data);
        }
      } catch (error) {
        console.error("Error checking existing refund:", error);
        if (error.response && error.response.status === 404) {
          console.log("No refund exists for this order");
        } else {
          message.error("Error checking refund status: " + (error.response?.data?.message || error.message));
        }
      } finally {
        setCheckingRefund(false);
      }
    };

    if (orderId) {
      checkExistingRefund();
    }
  }, [orderId]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log("Submitting refund request:", {
        orderId,
        userId: currentUser._id,
        amount: values.amount || amount,
        reason: values.reason
      });
      
      const response = await axios.post('http://localhost:3000/api/refund/create', {
        orderId,
        userId: currentUser._id,
        amount: values.amount || amount,
        reason: values.reason
      });

      if (response.data.success) {
        message.success('Refund request submitted successfully');
        form.resetFields();
        setExistingRefund(response.data.data);
      }
    } catch (error) {
      console.error("Refund request error:", error.response?.data || error);
      
      if (error.response?.data?.existingRefund) {
        setExistingRefund(error.response.data.existingRefund);
        message.warning('A refund request already exists for this order');
      } else {
        message.error(error.response?.data?.message || 'Error submitting refund request');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingRefund) {
    return (
      <Card title="Checking Refund Status" className="w-full max-w-md mx-auto">
        <div className="text-center py-4">
          <p>Checking if a refund request already exists for this order...</p>
        </div>
      </Card>
    );
  }

  if (existingRefund) {
    return (
      <Card title="Refund Request Status" className="w-full max-w-md mx-auto">
        <Alert
          message={`Refund Request ${existingRefund.status.toUpperCase()}`}
          description={
            <div>
              <p>Your refund request for order #{orderId} is currently {existingRefund.status}.</p>
              <p>Amount: Rs {existingRefund.amount}</p>
              <p>Reason: {existingRefund.reason}</p>
              <p>Submitted on: {new Date(existingRefund.createdAt).toLocaleString()}</p>
              {existingRefund.processedAt && (
                <p>Processed on: {new Date(existingRefund.processedAt).toLocaleString()}</p>
              )}
            </div>
          }
          type={existingRefund.status === 'approved' ? 'success' : 
                existingRefund.status === 'rejected' ? 'error' : 'info'}
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card title="Request Refund" className="w-full max-w-md mx-auto">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ 
          orderId,
          amount: amount 
        }}
      >
        <Form.Item
          label="Order ID"
          name="orderId"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: 'Please enter the refund amount' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={amount}
            formatter={value => `Rs ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/Rs \s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          label="Reason for Refund"
          name="reason"
          rules={[{ required: true, message: 'Please provide a reason for the refund' }]}
        >
          <TextArea rows={4} placeholder="Please explain why you are requesting a refund" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Submit Refund Request
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}