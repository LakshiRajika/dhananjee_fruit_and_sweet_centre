import React, { useState } from 'react';
import { Card, Button, Modal } from 'antd';
import RefundRequest from './RefundRequest';

export default function OrderDetails({ order }) {
  const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);

  const showRefundModal = () => {
    setIsRefundModalVisible(true);
  };

  const handleRefundModalClose = () => {
    setIsRefundModalVisible(false);
  };

  return (
    <div>
      <Card title={`Order #${order.orderId}`}>
        {/* Existing order details */}
        <div className="mt-4">
          <Button 
            type="primary" 
            onClick={showRefundModal}
            disabled={order.status === 'cancelled' || order.status === 'refunded'}
          >
            Request Refund
          </Button>
        </div>
      </Card>

      <Modal
        title="Request Refund"
        open={isRefundModalVisible}
        onCancel={handleRefundModalClose}
        footer={null}
        width={600}
      >
        <RefundRequest 
          orderId={order.orderId} 
          amount={order.totalAmount} 
        />
      </Modal>
    </div>
  );
}