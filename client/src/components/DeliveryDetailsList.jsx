import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Radio, 
  Tooltip, 
  Button, 
  Collapse,
  Descriptions,
  List,
  Space
} from 'antd';
import { DownOutlined, RightOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Text } = Typography;

export default function DeliveryDetailsList({ 
  deliveryDetails, 
  selectedDeliveryId, 
  onSelectDelivery,
  onUpdateDeliveryDetails,
  onEditDelivery,
  onDeleteDelivery
}) {
  const [expandedDetails, setExpandedDetails] = useState(null);

  const toggleDetailsExpansion = (detailId) => {
    setExpandedDetails(prevExpanded => 
      prevExpanded === detailId ? null : detailId
    );
  };

  return (
    <List
      dataSource={deliveryDetails}
      renderItem={(detail) => (
        <List.Item
          actions={[
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEditDelivery(detail._id)}
            />,
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDeleteDelivery(detail._id)}
            />
          ]}
        >
          <List.Item.Meta
            title={
              <Space>
                <Button
                  type={selectedDeliveryId === detail._id ? 'primary' : 'default'}
                  onClick={() => onSelectDelivery(detail._id)}
                >
                  Select
                </Button>
                <Text strong>{detail.customerName}</Text>
              </Space>
            }
            description={
              <Space direction="vertical">
                <Text>{detail.deliveryAddress}</Text>
                <Text>{detail.mobileNumber}</Text>
                <Text>{detail.email}</Text>
                <Text>{detail.district}</Text>
                <Text>Postal Code: {detail.postalCode}</Text>
                <Text>Delivery Type: {detail.deliveryType === "0" ? "Online Payment" : "Cash On Delivery"}</Text>
                <Text>Service: {detail.deliveryService}</Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
}