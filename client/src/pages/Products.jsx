import React, { useEffect, useState } from "react";
import { Card, Col, Row, Button, Tabs, Spin, message } from "antd";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
const { TabPane } = Tabs;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/inventory"); // Adjust API endpoint if needed
        const data = await res.json();

        if (res.ok) {
          setProducts(data);
        } else {
          toast.error("Failed to fetch products!");
        }
      } catch (error) {
        toast.error("Error fetching products:", error);
        toast.error("An error occurred while fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Function to handle adding an item to the cart
  const addToCart = async (product) => {
    if (!userId) {
      message.warning("Please log in to add items to the cart");
      return;
    }

    const cartItem = {
      userId,
      itemName: product.itemName,
      price: product.price,
      image: product.image,
      createdBy: product.createdBy,
      updatedBy: product.updatedBy,
      description: product.description,
      category: product.category,
    };

    try {
      const res = await fetch("/api/cart/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartItem),
      });

      const data = await res.json();

      if (res.ok) {
        message.success("Item added to cart successfully!");
      } else {
        message.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred while adding to cart.");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
 
      {loading ? (
        <Spin size="large" />
      ) : (
        <Tabs type="card"  defaultActiveKey="Fruits" tabBarStyle={{ fontSize: 28, fontWeight: "bold" }}>
          <TabPane tab="Fruits" key="Fruits">
            <ProductGrid products={products.filter((p) => p.category === "fruit")} addToCart={addToCart} />
          </TabPane>
          <TabPane tab="Sweets" key="Sweets">
            <ProductGrid products={products.filter((p) => p.category === "sweet")} addToCart={addToCart} />
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};
const SERVER_URL = "http://localhost:3000"; 
// Separate component for displaying products in a grid
const ProductGrid = ({ products, addToCart }) => (

 
  <Row gutter={[16, 16]}>
    {products.length > 0 ? (
      products.map((product, index) => (
        <Col span={8} key={index}>
          <Card
            hoverable
            cover={
              <img 
                alt={product.name} 
                src={`${SERVER_URL}${product.image}`} // Dynamically construct image URL
                style={{ width: "100%", height: "200px", objectFit: "cover" }} 
                onError={(e) => { e.target.src = "/default-placeholder.png"; }} // Fallback if image not found
              />
            }
            actions={[
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: 10 }}>
                <span style={{ color: "green", fontWeight: "bold", fontSize: "20px" }}>Rs {product.price}</span>
                <Button  icon={<AiOutlineShoppingCart />} onClick={() => addToCart(product)}>
                  Add to Cart
                </Button>
              </div>,
            ]}
          >
            <Card.Meta title={product.itemName} description={product.description} />
          </Card>
        </Col>
      ))
    ) : (
      <p>No products found.</p>
    )}
  </Row>
);

export default Products;
