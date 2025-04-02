import React, { useState } from "react";
import { 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Button, 
  Upload, 
  Typography, 
  Card, 
  message, 
  Row, 
  Col,
  Layout
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from '../Style.module.css'
import Notification from "../components/Notification";
import { message as antMessage } from "antd";
import { toast } from "react-toastify";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Content } = Layout;

const InsertProduct = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleImageChange = ({ fileList: newFileList, file }) => {
    setFileList(newFileList);
    
    if (file.status === 'done' || file.status === 'uploading') {
      // Generate preview
      if (file.originFileObj) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file.originFileObj);
      }
    }
  };

  const validateForm = (values) => {
    if (!fileList.length || !fileList[0].originFileObj) {
      toast.error("Please upload a product image");
      return false;
    }
    return true;
  };

  const handleSubmit = async (values) => {
    if (!validateForm(values)) {
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("description", values.description);
    formData.append("price", values.price);
    formData.append("quantity", values.quantity);
    formData.append("image", fileList[0].originFileObj);

    try {
      await axios.post("http://localhost:3000/api/inventory", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Product "${values.name}" added successfully!`);
      form.resetFields();
      setFileList([]);
      setPreviewImage(null);
      
    
    } catch (err) {
        toast.error("Product not added successfully!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card style={{ width: '100%' ,padding: 20, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: 10, background: "white" }}>
          <Title level={2} style={{ textAlign: "left", marginBottom: 24 }}>
            Add New Product
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Row gutter={24}>

            <Col xs={24} lg={12}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true, message: "Please enter product name" }]}
                >
                  <Input placeholder="Enter product name" className={styles["ant-input"]} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
              <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: "Please select a category" }]}
                >
                  <Select placeholder="Select a category">
                    <Option value="fruit">Fruits</Option>
                    <Option value="sweet">Sweets</Option>
                  </Select>
                </Form.Item>
              </Col>
             
            </Row>

            <Row gutter={24}>
              
              <Col xs={24} lg={12}>
              <Form.Item
  name="price"
  label="Price"
  rules={[
    { required: true, message: "Please enter price" },
    { type: "number", min: 0.01, message: "Price must be greater than 0" }
  ]}
  normalize={value => (value ? Number(value) : 0)} // Ensures number conversion
>
  <InputNumber
    style={{ width: "100%" }}
    placeholder="0.00"
    formatter={value => `Rs ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    parser={value => value.replace(/[^\d.]/g, '')} // Ensure proper number parsing
  />
</Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[
                    { required: true, message: "Please enter quantity" },
                    { type: "number", min: 0, message: "Quantity cannot be negative" }
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} placeholder="0" min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter product description" }]}
            >
              <TextArea rows={4} placeholder="Enter product description" />
            </Form.Item>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="image"
                  label="Product Image"
                  rules={[{ required: true, message: "Please upload an image" }]}
                >
                  <Upload
                    listType="picture"
                    maxCount={1}
                    fileList={fileList}
                    onChange={handleImageChange}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Select Image</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                {previewImage && (
                  <div style={{ marginTop: 24, textAlign: "center" }}>
                    <img
                      src={previewImage}
                      alt="Product Preview"
                      style={{ maxWidth: "100%", maxHeight: 200 }}
                    />
                  </div>
                )}
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                style={{ backgroundColor: "#1890ff", height: 40 }}
              >
                {isLoading ? "Adding Product..." : "Add Product"}
              </Button>
            </Form.Item>
          </Form>
         

        </Card>
      </Content>
    </Layout>
  );
};

export default InsertProduct;