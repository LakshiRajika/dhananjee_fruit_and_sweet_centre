import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Select, Button, message, Card } from "antd";
import "antd/dist/reset.css";


const { Option } = Select;

const DeliveryDetail = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);

    const deliveryData = {
      ...values,
      deliveryCharge: Number(values.deliveryCharge),
      amount: Number(values.amount),
      totalAmount: Number(values.amount) + Number(values.deliveryCharge),
    };

    console.log("Sending data:", deliveryData);

    try {
      const response = await fetch("http://localhost:3000/api/delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deliveryData),
      });

      const result = await response.json();
      if (response.ok) {
        message.success("Delivery created successfully!");
        form.resetFields();
      } else {
        message.error(result.message || "Failed to create delivery.");
      }
    } catch (error) {
      console.error("Error in submitting form:", error);
      message.error("Error connecting to server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-container">
      <Card title="Delivery Details" className="form-container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ deliveryType: "Cash on Delivery", deliveryService: "Uber", deliveryCharge: 100 }}
        >
          <Form.Item label="Order ID" name="orderId" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item label="Customer Name" name="customerName" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item label="Phone Number" name="phoneNo" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}> <Input /> </Form.Item>
          <Form.Item label="Address" name="address" rules={[{ required: true }]}> <Input.TextArea rows={3} /> </Form.Item>
          <Form.Item label="Delivery Type" name="deliveryType"> <Select> <Option value="Cash on Delivery">Cash on Delivery</Option> <Option value="Online Payment">Online Payment</Option> </Select> </Form.Item>
          <Form.Item label="Delivery Service" name="deliveryService"> <Select> <Option value="Uber">Uber</Option> <Option value="PickMe">PickMe</Option> </Select> </Form.Item>
          <Form.Item label="Amount" name="amount" rules={[{ required: true, type: "number" }]}> <Input type="number" /> </Form.Item>
          <Form.Item label="Delivery Charge" name="deliveryCharge"> <Input type="number" disabled /> </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Confirm</Button>
        </Form>
      </Card>
      <Card title="Order Summary" className="order-summary">
        <Form form={form} layout="vertical">
          <Form.Item shouldUpdate={(prev, curr) => prev.amount !== curr.amount || prev.deliveryCharge !== curr.deliveryCharge}>
            {({ getFieldValue }) => (
              <>
                <p><strong>Amount:</strong> Rs. {getFieldValue("amount") || 0}</p>
                <p><strong>Delivery Charges:</strong> Rs. {getFieldValue("deliveryCharge") || 0}</p>
                <h3><strong>Total Amount:</strong> Rs. { (getFieldValue("amount") || 0) + (getFieldValue("deliveryCharge") || 0) }</h3>
              </>
            )}
          </Form.Item>
        </Form>
      </Card>
      <div className="side-button-container">
        <Link to="/ViewDeliveryDetails">
          <Button type="default" block>Go to View Details</Button>
        </Link>
      </div>
    </div>
  );
};

export default DeliveryDetail;