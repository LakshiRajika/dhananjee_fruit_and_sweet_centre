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
  Modal,
  message
} from 'antd';
import { 
  DownOutlined, 
  RightOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';

const { Panel } = Collapse;

export default function DeliveryDetailsList({    
  deliveryDetails,    
  selectedDeliveryId,    
  onSelectDelivery,
  onUpdateDeliveryDetails // New prop for updating delivery details list after edit/delete
}) {   
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [editingDetail, setEditingDetail] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState(null);

  const toggleDetailsExpansion = (detailId) => {
    setExpandedDetails(prevExpanded =>
      prevExpanded === detailId ? null : detailId
    );
  };

  const handleDeleteDeliveryDetails = async () => {

    console.log
    try {
      const response = await fetch(`/api/delivery/deleteDeliveryDetails/${detailToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
  
      if (response.ok) {
        message.success('Delivery details deleted successfully');
  
        // Close the modal and reset state immediately
        setIsDeleteModalVisible(false);
        setDetailToDelete(null);
  
        // Then update the parent component's list
        onUpdateDeliveryDetails(detailToDelete);
      } else {
        message.error(data.message || 'Failed to delete delivery details');
      }
    } catch (error) {
      console.error('Error deleting delivery details:', error);
      message.error('An error occurred while deleting delivery details');
    } finally {
      // Ensure modal is closed even if an error occurs
      setIsDeleteModalVisible(false);
      setDetailToDelete(null);
    }
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
         
      {deliveryDetails.map((detail) => (
        <Card
          key={detail._id}
          style={{
            marginBottom: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Row align="middle" justify="space-between">
            <Col span={16}>
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
            <Col span={8} style={{ textAlign: 'right' }}>
              {/* Edit Icon */}
              <Tooltip title="Edit Delivery Details">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditDeliveryDetails(detail);
                  }}
                  style={{ marginRight: 8 }}
                />
              </Tooltip>

              {/* Delete Icon */}
              <Tooltip title="Delete Delivery Details">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteModalVisible(true);
                    setDetailToDelete(detail._id);
                  }}
                />
              </Tooltip>

              {/* Expand/Collapse Details Icon */}
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
          <Modal
            title="Delete Delivery Details"
            visible={isDeleteModalVisible}
            onOk={handleDeleteDeliveryDetails}
            onCancel={() => {
              setIsDeleteModalVisible(false);
              setDetailToDelete(null);
            }}
          >
            <p>Are you sure you want to delete these delivery details?</p>
            <p>This action cannot be undone.</p>
          </Modal>
        </Card>
      ))}

      {/* Global Delete Confirmation Modal */}
      <Modal
        title="Delete Delivery Details"
        visible={isDeleteModalVisible}
        onOk={handleDeleteDeliveryDetails}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setDetailToDelete(null);
        }}
      >
        <p>Are you sure you want to delete these delivery details?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
}