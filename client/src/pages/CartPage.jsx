import React, { useEffect, useState, useRef } from "react";
import { message, Card, Modal, Collapse, Radio, Descriptions, Row, Col, Button, Form, InputNumber, Typography, Tooltip, Select, Input, List, Image, Upload, Space } from "antd";
import { DeleteOutlined, DownOutlined, HeartOutlined, MinusOutlined, PlusOutlined, RollbackOutlined, UploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import styles from '../Style.module.css';
import DeliveryDetailsList from '../components/DeliveryDetailsList';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const { Panel } = Collapse;
const { Title, Text } = Typography;
const stripePromise = loadStripe("pk_test_51R1EIIDWYegqaTAkzg9ID8J9AvbcIW7Aq28MPvbwFRqlajzS5FWLldM4XGFW4Xp5NO2sGpGZWXow3ejmHIXChlkC00Dw1heT33");

export default function CartPage() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [cartItems, setCartItems] = useState([]);
  const [deliveryDetails, setDeliveryDetails] = useState([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [isNewDeliveryDetails, setIsNewDeliveryDetails] = useState(false);
  const [form] = Form.useForm();
  const [bankSlipForm] = Form.useForm();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [isBankSlipModalVisible, setIsBankSlipModalVisible] = useState(false);
  const totalAmount = (cartItems?.reduce((total, item) => total + item.price * item.quantity, 0)) || 0;
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [error, setError] = useState(null);
  const [showBankSlipModal, setShowBankSlipModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (currentUser?.email) {
      form.setFieldsValue({ email: currentUser.email });
    }
  }, [currentUser, form]);

  const handleWishlistRedirect = () => {
    navigate("/wishlist");
  };

  const toggleDetailsExpansion = (detailId) => {
    setExpandedDetails(prevExpanded => 
      prevExpanded === detailId ? null : detailId
    );
  };

  const handleUpdateDeliveryDetails = (deletedId) => {
    setDeliveryDetails((prevDetails) =>
      prevDetails.filter((detail) => detail._id !== deletedId)
    );
  };

  useEffect(() => {
    if (currentUser?._id) {
      fetchCartItems();
      fetchDeliveryDetails();
    }
  }, [currentUser?._id]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/cart/items/${currentUser._id}`);
      if (response.data.success) {
        setCartItems(response.data.data || []);
      } else {
        message.error('Failed to fetch cart items');
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      message.error('Error fetching cart items');
    }
  };

  const fetchDeliveryDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/delivery/user/${currentUser._id}`);
      if (response.data.success) {
        setDeliveryDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching delivery details:', error);
      message.error('Failed to fetch delivery details');
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      // Validate quantity is at least 1
      if (newQuantity < 1) {
        message.error('Quantity cannot be less than 1');
        return;
      }

      const response = await axios.put(`http://localhost:3000/api/cart/item/${itemId}`, {
        quantity: newQuantity
      });

      if (response.data.success) {
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.itemId === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        message.success('Quantity updated successfully');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      message.error('Failed to update quantity');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/cart/item/${currentUser._id}/${itemId}`);

      if (response.data.success) {
        setCartItems(prevItems => prevItems.filter(item => item.itemId !== itemId));
        message.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Failed to remove item');
    }
  };

  // Add this function to check if an item can be added
  const canAddItem = (itemId) => {
    // If item already exists in cart, don't allow adding
    if (cartItems.some(item => item.itemId === itemId)) {
      message.error('This item is already in your cart');
      return false;
    }
    return true;
  };

  // Add this function to handle adding items to cart
  const handleAddToCart = async (item) => {
    if (!canAddItem(item.itemId)) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/cart/add-to-cart', {
        userId: currentUser._id,
        itemId: item.itemId,
        quantity: 1,
        name: item.name,
        price: item.price,
        image: item.image
      });

      if (response.data.success) {
        setCartItems(prevItems => [...prevItems, { ...item, quantity: 1 }]);
        message.success('Item added to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      message.error('Failed to add item to cart');
    }
  };

  const handleDeliveryDetailsSubmit = async (values) => {
    try {
      const deliveryData = {
        ...values,
        userId: currentUser._id,
        deliveryType: values.deliveryType.toLowerCase().replace(/\s+/g, '_'),
        deliveryService: values.deliveryService.toLowerCase(),
        customerName: values.customerName,
        mobileNumber: values.mobileNumber,
        email: values.email,
        deliveryAddress: values.deliveryAddress,
        postalCode: values.postalCode,
        district: values.district
      };

      const response = await axios.post('http://localhost:3000/api/delivery/saveDeliveryDetails', deliveryData);

      if (response.data.success) {
        setDeliveryDetails(prev => [...prev, response.data.data]);
        setSelectedDeliveryId(response.data.data._id);
        setIsNewDeliveryDetails(false);
        message.success('Delivery details saved successfully');
      } else {
        message.error(response.data.message || 'Failed to save delivery details');
      }
    } catch (error) {
      console.error('Error saving delivery details:', error);
      message.error('Failed to save delivery details. Please try again.');
    }
  };

  const variant = Form.useWatch("variant", form);
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  };

  const toggleDeliveryDetailsMode = () => {
    setIsNewDeliveryDetails(!isNewDeliveryDetails);
    if (!isNewDeliveryDetails) {
      form.resetFields();
    }
  };

  const handleBankSlipUpload = async (values) => {
    try {
      const formData = new FormData();
      formData.append('slipImage', values.slipImage[0].originFileObj);
      formData.append('orderId', orderId);
      formData.append('userId', currentUser._id);

      const response = await axios.post('http://localhost:3000/api/payment/upload-bank-slip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        message.success('Bank slip uploaded successfully');
        setIsBankSlipModalVisible(false);
        // Redirect to payment success page with order details and PDF URL
        navigate('/payment-success', { 
          state: { 
            orderDetails: {
              orderId: orderId,
              totalAmount: totalAmount,
              paymentMethod: 'Bank Slip',
              status: 'Processing'
            },
            pdfUrl: response.data.data.pdfUrl
          }
        });
      }
    } catch (error) {
      console.error('Error uploading bank slip:', error);
      message.error(error.response?.data?.message || 'Failed to upload bank slip');
    }
  };

  const handleDeliveryDetailsSelect = (id) => {
    setSelectedDeliveryId(id);
    setIsNewDeliveryDetails(false);
  };

  // Payment method selection
  const handlePaymentMethodChange = (value) => {
    setSelectedPaymentMethod(value);
    setError(null);
  };

  const handleCheckout = async () => {
    try {
      if (!selectedPaymentMethod) {
        message.error('Please select a payment method');
        return;
      }

      if (!selectedDeliveryId && !isNewDeliveryDetails) {
        message.error('Please add delivery details');
        return;
      }

      let deliveryId = selectedDeliveryId;

      // If we're using new delivery details, save them first
      if (isNewDeliveryDetails) {
        try {
          const formValues = form.getFieldsValue();
          const deliveryData = {
            ...formValues,
            userId: currentUser._id,
            deliveryType: formValues.deliveryType.toLowerCase().replace(/\s+/g, '_'),
            deliveryService: formValues.deliveryService.toLowerCase()
          };

          const deliveryResponse = await axios.post('http://localhost:3000/api/delivery/saveDeliveryDetails', deliveryData);
          
          if (deliveryResponse.data.success) {
            deliveryId = deliveryResponse.data.data._id;
            setDeliveryDetails(prev => [...prev, deliveryResponse.data.data]);
          } else {
            throw new Error('Failed to save delivery details');
          }
        } catch (error) {
          console.error('Error saving delivery details:', error);
          message.error('Failed to save delivery details. Please try again.');
          return;
        }
      }

      const orderDetails = {
        items: cartItems.map(item => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: totalAmount,
        userDeliveryDetailsId: deliveryId,
        orderId: `ORD-${Date.now()}`,
        paymentMethod: selectedPaymentMethod,
        userId: currentUser._id,
        customerEmail: currentUser.email
      };

      // Store order details in localStorage before proceeding
      localStorage.setItem('pendingOrder', JSON.stringify(orderDetails));

      if (selectedPaymentMethod === 'cash') {
        try {
          const orderResponse = await axios.post('http://localhost:3000/api/order/create', orderDetails);
          
          if (orderResponse.data.success) {
            await axios.delete(`http://localhost:3000/api/cart/clear/${currentUser._id}`);
            setCartItems([]);
            
            navigate('/payment-success', { 
              state: { 
                orderDetails: {
                  ...orderDetails,
                  status: 'Processing',
                  paymentMethod: 'Cash on Delivery'
                }
              }
            });
          }
        } catch (error) {
          console.error('Error creating order:', error);
          message.error('Failed to create order. Please try again.');
        }
      } else if (selectedPaymentMethod === 'stripe') {
        try {
          const response = await axios.post('http://localhost:3000/api/payment/create-checkout-session', orderDetails);
          
          if (response.data.url) {
            await axios.delete(`http://localhost:3000/api/cart/clear/${currentUser._id}`);
            setCartItems([]);
            window.location.replace(response.data.url);
          }
        } catch (error) {
          console.error('Error during checkout:', error);
          message.error('Failed to process payment. Please try again.');
        }
      } else if (selectedPaymentMethod === 'bank_slip') {
        setShowBankSlipModal(true);
        setOrderId(orderDetails.orderId);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      message.error('An error occurred during checkout. Please try again.');
    }
  };

  const handleDeleteDelivery = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/delivery/${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Remove the deleted delivery from the list
        setDeliveryDetails(prevDetails => 
          prevDetails.filter(detail => detail._id !== id)
        );
        message.success("Delivery details deleted successfully!");
      } else {
        message.error(result.message || "Failed to delete delivery details.");
      }
    } catch (error) {
      console.error("Error deleting delivery:", error);
      message.error("Error deleting delivery. Please try again.");
    }
  };

  const handleEditDelivery = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/delivery/detail/${id}`);
      
      if (response.data.success) {
        const delivery = response.data.data;
        // Set form values with the delivery details
        form.setFieldsValue({
          customerName: delivery.customerName,
          mobileNumber: delivery.mobileNumber,
          email: delivery.email,
          deliveryAddress: delivery.deliveryAddress,
          postalCode: delivery.postalCode,
          district: delivery.district,
          deliveryType: delivery.deliveryType,
          deliveryService: delivery.deliveryService
        });
        setIsNewDeliveryDetails(true);
        message.success("Delivery details loaded for editing");
      } else {
        message.error(response.data.message || "Failed to load delivery details");
      }
    } catch (error) {
      console.error("Error loading delivery details:", error);
      message.error("Error loading delivery details. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Row gutter={16} justify="center">
        <Col md={16}>
          <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={4} style={{ margin: 0 }}>Cart - {cartItems.length} items</Title>
              </Col>
              <Col>
                <Button 
                  type="primary"
                  icon={<HeartOutlined />}
                  onClick={handleWishlistRedirect}
                  style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
                >
                  View Wishlist
                </Button>
              </Col>
            </Row>
            <List
              dataSource={cartItems}
              renderItem={(item) => (
                <List.Item>
                  <Row gutter={16} align="middle" style={{ width: "100%" }}>
                    <Col span={4}>
                      <Image 
                        src={item.image.startsWith('http') ? item.image : `http://localhost:3000${item.image}`} 
                        width={100} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = '/default-placeholder.png';
                        }}
                      />
                    </Col>
                    <Col span={10}>
                      <Title level={5}>{item.name}</Title>
                      <Text>Color: {item.color}</Text><br />
                      <Text>Size: {item.size}</Text><br />
                      <Tooltip title="Remove item">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteItem(item.itemId)}
                        />
                      </Tooltip>
                    </Col>
                    <Col span={6}>
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        style={{ width: "60px" }}
                        onChange={(value) => handleQuantityChange(item.itemId, value)}
                      />
                      <Button
                        icon={<MinusOutlined />}
                        style={{ marginLeft: "5px" }}
                        onClick={() => handleQuantityChange(item.itemId, Math.max(item.quantity - 1, 1))}
                      />
                      <Button
                        icon={<PlusOutlined />}
                        style={{ marginLeft: "5px" }}
                        onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)}
                      />
                    </Col>
                    <Col span={4}>
                      <Text strong>${(item.price * item.quantity).toFixed(2)}</Text>
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </Card>
  
          <Card style={{ marginTop: 16, position: "relative" }}>
            <div ref={formRef}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title style={{ fontSize: 20, margin: 0 }} level={5}>
                    Delivery Details
                  </Title>
                </Col>
                {deliveryDetails && deliveryDetails.length > 0 && (
                  <Col>
                    {!isNewDeliveryDetails ? (
                      <Button
                        type="primary"
                        style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                        onClick={() => {
                          setIsNewDeliveryDetails(true);
                          setSelectedDeliveryId(null);
                        }}
                        icon={<PlusOutlined />}
                      >
                        Add New Delivery Details
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
                        onClick={toggleDeliveryDetailsMode}
                        icon={<RollbackOutlined />}
                      >
                        Use Existing Details
                      </Button>
                    )}
                  </Col>
                )}
              </Row>
  
              {deliveryDetails && deliveryDetails.length > 0 && !isNewDeliveryDetails && (
                <div>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <Text strong>Select Delivery Option</Text>
                      <DeliveryDetailsList
                        deliveryDetails={deliveryDetails}
                        selectedDeliveryId={selectedDeliveryId}
                        onSelectDelivery={setSelectedDeliveryId}
                        onUpdateDeliveryDetails={handleUpdateDeliveryDetails}
                        onDeleteDelivery={handleDeleteDelivery}
                        onEditDelivery={handleEditDelivery}
                      />
                    </Col>
                  </Row>
                </div>
              )}
  
              {(isNewDeliveryDetails || !deliveryDetails || deliveryDetails.length === 0) && (
                <>
                  {!deliveryDetails || deliveryDetails.length === 0 ? (
                    <Text type="warning">No saved delivery details. Please fill in the form below.</Text>
                  ) : null}
  
                  <Form
                    {...formItemLayout}
                    form={form}
                    variant={variant || "outlined"}
                    style={{ maxWidth: 1200, marginTop: 30 }}
                    initialValues={{ variant: "filled" }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Customer Name"
                          name="customerName"
                          labelCol={{ span: 7 }}
                          wrapperCol={{ span: 16 }}
                          rules={[{ required: true, message: "Please enter customer name!" }]}
                        >
                          <Input className={styles["ant-input"]} />
                        </Form.Item>
                        <Form.Item
                          label="Mobile Number"
                          name="mobileNumber"
                          labelCol={{ span: 7 }}
                          wrapperCol={{ span: 16 }}
                          rules={[{ required: true, message: "Please enter mobile number!" }]}
                        >
                          <Input className={styles["ant-input"]} />
                        </Form.Item>
                        <Form.Item
                          label="Delivery Address"
                          name="deliveryAddress"
                          labelCol={{ span: 7 }}
                          wrapperCol={{ span: 16 }}
                          rules={[{ required: true, message: "Please enter delivery address" }]}
                        >
                          <Input.TextArea />
                        </Form.Item>
                        <Form.Item
                          label="Postal Code"
                          name="postalCode"
                          labelCol={{ span: 7 }}
                          wrapperCol={{ span: 16 }}
                          rules={[{ required: true, message: "Please enter your postal code!" }]}
                        >
                          <Input className={styles["ant-input"]} />
                        </Form.Item>
                      </Col>
  
                      <Col span={12}>
                        <Form.Item
                          label="Delivery Type"
                          name="deliveryType"
                          rules={[{ required: true, message: "Select delivery type!" }]}
                        >
                          <Select placeholder="Select Delivery Type">
                            <Select.Option value="stripe">Online Payment (Stripe)</Select.Option>
                            <Select.Option value="cash">Cash On Delivery</Select.Option>
                          </Select>
                        </Form.Item>
  
                        <Form.Item
                          label={
                            <div style={{ whiteSpace: "pre-line" }}>
                              Delivery
                              {"\n"}
                              Service
                            </div>
                          }
                          name="deliveryService"
                          rules={[{ required: true, message: "Select delivery service provider" }]}
                        >
                          <Select placeholder="Select Delivery Service Provider">
                            <Select.Option value="uber">Uber</Select.Option>
                            <Select.Option value="pickme">Pick Me</Select.Option>
                            <Select.Option value="darazd">Daraz Delivery</Select.Option>
                            <Select.Option value="fardar">Fardar</Select.Option>
                            <Select.Option value="koombiyo">Koombiyo</Select.Option>
                            <Select.Option value="Pompt">Pompt</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label="Email"
                          name="email"
                          rules={[{ required: true, message: "Please enter your email!" }]}
                        >
                          <Input className={styles["ant-input"]} />
                        </Form.Item>
                        <Form.Item
                          label="District"
                          name="district"
                          rules={[{ required: true, message: "Please input your district" }]}
                        >
                          <Input className={styles["ant-input"]} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row justify="end" style={{ marginTop: 16 }}>
                      <Button 
                        type="primary"
                        onClick={() => {
                          setIsNewDeliveryDetails(true);
                          form.validateFields()
                            .then(() => {
                              message.success("Delivery details saved!");
                            })
                            .catch(() => {
                              message.error("Please fill in all required fields!");
                            });
                        }}
                      >
                        Save Delivery Details
                      </Button>
                    </Row>
                  </Form>
                </>
              )}
            </div>
          </Card>
        </Col>
  
        <Col md={8}>
          <Card title="Order Summary">
            <List>
              <List.Item>
                <Text>Products</Text>
                <Text>${totalAmount.toFixed(2)}</Text>
              </List.Item>
              <List.Item>
                <Text>Shipping</Text>
                <Text>Gratis</Text>
              </List.Item>
              <List.Item>
                <Text strong>Total (incl. VAT)</Text>
                <Text strong>${totalAmount.toFixed(2)}</Text>
              </List.Item>
            </List>
  
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              style={{ marginTop: 16 }}
              initialValue="cash"
              rules={[{ required: true, message: 'Please select a payment method!' }]}
            >
              <Form
                name="payment-form"
                initialValues={{ paymentMethod: selectedPaymentMethod }}
              >
                <Form.Item name="paymentMethod">
                  <Select 
                    value={selectedPaymentMethod}
                    onChange={(value) => {
                      setSelectedPaymentMethod(value);
                    }}
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="cash">Cash on Delivery</Select.Option>
                    <Select.Option value="stripe">Credit/Debit Card</Select.Option>
                  </Select>
                </Form.Item>
              </Form>
            </Form.Item>
  
            <Button
              type="primary"
              block
              style={{ marginTop: 16 }}
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || !selectedPaymentMethod || (!selectedDeliveryId && !isNewDeliveryDetails)}
            >
              {selectedPaymentMethod === 'cash' ? 'Place Order' : 'Proceed to Payment'}
            </Button>
          </Card>
        </Col>
      </Row>
    </div>

  
  );
} 