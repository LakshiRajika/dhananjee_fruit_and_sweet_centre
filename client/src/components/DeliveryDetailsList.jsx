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
  Descriptions
} from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

export default function DeliveryDetailsList({ 
  deliveryDetails, 
  selectedDeliveryId, 
  onSelectDelivery 
}) {
  const [expandedDetails, setExpandedDetails] = useState(null);

  const toggleDetailsExpansion = (detailId) => {
    setExpandedDetails(prevExpanded => 
      prevExpanded === detailId ? null : detailId
    );
  };

  return (
    <div>
      {deliveryDetails.map((detail) => (
        <Card 
          key={detail._id} 
          style={{ 
            marginBottom: 16, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}
        >
          <Row align="middle" justify="space-between">
            <Col span={20}>
              <Radio 
                value={detail._id} 
                checked={selectedDeliveryId === detail._id}
                onChange={() => onSelectDelivery(detail._id)}
                style={{ width: '100%' }}
              >
                <div>
                  <Typography.Text strong style={{ fontSize: '16px' }}>
                    {detail.customerName}
                  </Typography.Text>
                  <div style={{ color: 'rgba(0,0,0,0.65)', marginTop: 4 }}>
                    {detail.deliveryAddress}
                  </div>
                  <div style={{ color: 'rgba(0,0,0,0.45)', marginTop: 4 }}>
                    {detail.mobileNumber}
                  </div>
                </div>
              </Radio>
            </Col>
            <Col span={4} style={{ textAlign: 'right' }}>
              <Tooltip title={expandedDetails === detail._id ? "Hide Details" : "View More Details"}>
                <Button 
                  type="text" 
                  icon={expandedDetails === detail._id ? <RightOutlined /> : <DownOutlined />} 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent radio selection
                    toggleDetailsExpansion(detail._id);
                  }}
                />
              </Tooltip>
            </Col>
          </Row>
          
          {expandedDetails === detail._id && (
            <Collapse 
              activeKey={expandedDetails === detail._id ? 'details' : null}
              ghost
            >
              <Panel key="details" header={null}>
                <Descriptions column={1} bordered style={{ marginTop: 16 }}>
                  <Descriptions.Item label="Email">
                    {detail.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Postal Code">
                    {detail.postalCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="District">
                    {detail.district}
                  </Descriptions.Item>
                  <Descriptions.Item label="Delivery Type">
                    {detail.deliveryType === "0" ? "Online Payment" : "Cash On Delivery"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Delivery Service">
                    {detail.deliveryService}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {detail.status}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At">
                    {new Date(detail.createdAt).toLocaleString()}
                  </Descriptions.Item>
                </Descriptions>
              </Panel>
            </Collapse>
          )}
        </Card>
      ))}
    </div>
  );
}
