import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Table, Select, Button, Input, Space, message, Popconfirm, Image, Layout, Card, Typography, Modal, Form, Descriptions,Row,Col } from "antd";
import { SearchOutlined, FilePdfOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import styles from '../Style.module.css'
import { toast } from "react-toastify";

const ProductList = () => {
  const { Content } = Layout;
  const { Option } = Select;
  const { Title } = Typography;
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm(); 

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/inventory")
      .then((res) => setInventory(res.data))
      .catch(() => toast.error("Failed to load inventory."));
  }, []);

  const onDeleteClick = (id) => {
    axios
      .delete(`http://localhost:3000/api/inventory/${id}`)
      .then(() => {
        setInventory((prev) => prev.filter((item) => item._id !== id));
        toast.success("Product deleted successfully!");
      })
      .catch(() => toast.error("Error deleting product."));
  };

  const showDetailsModal = (product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Product List", 14, 15);

    const tableRows = inventory.map((item) => [
      item._id,
      item.name,
      item.description,
      item.category,
      `Rs.${item.price}`,
      `${item.quantity}`,
    ]);

    autoTable(doc, {
      head: [["Product ID", "Name", "Description", "Category", "Price", "Quantity"]],
      body: tableRows,
      startY: 20,
    });

    doc.save("inventory.pdf");
  };

  const showEditModal = (product) => {
    setSelectedProduct(product);
    form.setFieldsValue(product); 
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const updatedValues = await form.validateFields();
      await axios.put(`http://localhost:3000/api/inventory/${selectedProduct._id}`, updatedValues);
      
      setInventory((prev) => prev.map((item) => (item._id === selectedProduct._id ? { ...item, ...updatedValues } : item)));

      toast.success("Product updated successfully!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to update product.");
    }
  };

  const columns = [
    {
      title: "Product ID",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => image ? <Image width={50} src={`http://localhost:3000${image}`} /> : "No Image",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `Rs.${price}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showDetailsModal(record)}></Button>
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}></Button>
          <Popconfirm title="Are you sure to delete?" onConfirm={() => onDeleteClick(record._id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card style={{ width: '100%', padding: 20, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: 10, background: "white" }}>
          <Title level={2} style={{ textAlign: "left", marginBottom: 24 }}>Product List</Title>
          <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <Input
              placeholder="Search Products..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
            />
            <Button icon={<FilePdfOutlined />} onClick={generatePDF}>
              Download PDF
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={inventory.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))}
            rowKey="_id"
          />
        </Card>
      </Content>

      {/* Edit Product Modal */}
      <Modal 
        title="Edit Product"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="update" type="primary" onClick={handleUpdate}>
            Update
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Product Name" rules={[{ required: true, message: "Please enter the product name" }]}>
            <Input  className={styles["ant-input"]}/>
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter the description" }]}>
            <Input  className={styles["ant-input"]}/>
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: "Please enter the category" }]}>
            <Select placeholder="Select a category">
              <Option value="fruit">Fruits</Option>
              <Option value="sweet">Sweets</Option>
            </Select>
            <Form.Item name="price" label="Price" rules={[{ required: true, message: "Please enter the price" }]}>
            <Input type="number"   className={styles["ant-input"]}/>
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: "Please enter the quantity" }]}>
            <Input type="number"  className={styles["ant-input"]} />
          </Form.Item>
          
          </Form.Item>
        </Form>
      </Modal>

      <Modal 
  title="Product Details"
  open={isDetailsModalOpen}
  onCancel={() => setIsDetailsModalOpen(false)}
  footer={null}
  width={1000}

>
  {selectedProduct && (
    <Row gutter={16} align="middle">
      {/* Left Side - Image */}
      <Col span={10} style={{ textAlign: "center" }}>
        {selectedProduct.image ? (
          <Image width={400} height={350}src={`http://localhost:3000${selectedProduct.image}`} />
        ) : (
          <p>No Image</p>
        )}
      </Col>

      {/* Right Side - Details */}
      <Col span={14}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Name">{selectedProduct.name}</Descriptions.Item>
          <Descriptions.Item label="Description">{selectedProduct.description}</Descriptions.Item>
          <Descriptions.Item label="Category">{selectedProduct.category}</Descriptions.Item>
          <Descriptions.Item label="Price">{`Rs.${selectedProduct.price}`}</Descriptions.Item>
          <Descriptions.Item label="Quantity">{selectedProduct.quantity}</Descriptions.Item>
        </Descriptions>
      </Col>
    </Row>
  )}
</Modal>
    </Layout>
  );
};

export default ProductList;
