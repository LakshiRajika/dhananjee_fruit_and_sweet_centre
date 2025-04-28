import React, { useEffect, useState } from "react";
import { Card, Col, Row, Button, Tabs, Spin, Modal, message } from "antd";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { HeartOutlined, HeartFilled, ShoppingCartOutlined, CheckCircleOutlined, ShoppingOutlined } from '@ant-design/icons';
import axios from "axios";

const { TabPane } = Tabs;

const SERVER_URL = "http://localhost:3000";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const [wishlistItems, setWishlistItems] = useState([]);

  // Add states for modals
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalIcon, setModalIcon] = useState(null);
  // New state for already in cart modal
  const [alreadyInCartModalVisible, setAlreadyInCartModalVisible] = useState(false);
  const [alreadyInCartMessage, setAlreadyInCartMessage] = useState('');

  // Function to show success modal
  const showSuccessModal = (message, icon) => {
    setModalMessage(message);
    setModalIcon(icon);
    if (icon === 'cart') {
      setCartModalVisible(true);
    } else {
      setWishlistModalVisible(true);
    }
    // Auto close after 2 seconds
    setTimeout(() => {
      setCartModalVisible(false);
      setWishlistModalVisible(false);
    }, 2000);
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/inventory`);
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

  // Fetch wishlist items when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchWishlistItems();
    }
  }, [userId]);

  const fetchWishlistItems = async () => {
    try {
      console.log('Fetching wishlist for userId:', userId);
      const response = await axios.get(`${SERVER_URL}/api/wishlist/${userId}`);
      console.log('Wishlist fetch response:', response.data);
      
      if (response.data.success) {
        setWishlistItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const addToCart = async (product) => {
    if (!userId) {
      Modal.warning({
        title: 'Login Required',
        content: 'Please log in to add items to the cart',
        centered: true
      });
      return;
    }

    // Validate required fields
    if (!product.name || !product.price || !product.image) {
      Modal.error({
        title: 'Invalid Product',
        content: 'Product information is incomplete',
        centered: true
      });
      return;
    }

    const cartItem = {
      userId: userId.toString(),
      name: product.name.toString(),
      price: parseFloat(product.price), // Ensure price is a float
      image: product.image.toString(),
      quantity: 1
    };

    console.log('Attempting to add to cart:', {
      url: `${SERVER_URL}/api/cart/add-to-cart`,
      requestData: JSON.stringify(cartItem, null, 2),
      userId: userId,
      product: product
    });

    try {
      const response = await axios.post(`${SERVER_URL}/api/cart/add-to-cart`, cartItem, {
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      console.log('Server response:', response.data);

      if (response.data.success) {
        showSuccessModal(
          `${product.name} has been added to your cart successfully!`,
          'cart'
        );
      }
    } catch (error) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          ...error.config,
          data: JSON.parse(error.config.data)
        }
      });

      // Add more detailed debugging
      console.log('Error response data:', error.response?.data);
      console.log('Error message:', error.response?.data?.message);
      console.log('Is message match?', error.response?.data?.message === "This item is already in your cart");
      console.log('Does message include "already in your cart"?', 
        error.response?.data?.message?.includes("already in your cart"));

      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes("already in your cart")) {
          setAlreadyInCartMessage(`${product.name} is already in your cart!`);
          setAlreadyInCartModalVisible(true);
        } else {
          console.log('Showing generic error modal for 400 status');
          Modal.error({
            title: 'Error',
            content: error.response?.data?.message || "An error occurred while adding to cart",
            centered: true
          });
        }
      } else {
        console.log('Showing generic error modal for non-400 status');
        Modal.error({
          title: 'Error',
          content: "An unexpected error occurred. Please try again.",
          centered: true
        });
      }
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      if (!userId) {
        Modal.warning({
          title: 'Login Required',
          content: 'Please log in to add items to wishlist',
          centered: true
        });
        return;
      }

      // Check if item is already in wishlist
      const isAlreadyInWishlist = isInWishlist(product.product_ID);
      console.log('Is already in wishlist:', isAlreadyInWishlist);
      
      if (isAlreadyInWishlist) {
        // If already in wishlist, remove it
        try {
          console.log('Removing from wishlist:', { userId, productId: product.product_ID });
          const response = await axios.delete(`${SERVER_URL}/api/wishlist/${userId}/${product.product_ID}`);
          console.log('Remove response:', response.data);
          
          if (response.data.success) {
            message.success('Item removed from wishlist');
            // Update local wishlist state
            setWishlistItems(prevItems => prevItems.filter(item => item.productId !== product.product_ID));
          }
        } catch (error) {
          console.error('Error removing from wishlist:', error);
          message.error('Failed to remove item from wishlist');
        }
        return;
      }

      // If not in wishlist, add it
      const wishlistItem = {
        userId: userId,
        productId: product.product_ID,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        category: product.category
      };

      console.log('Adding to wishlist:', wishlistItem);

      const response = await axios.post(`${SERVER_URL}/api/wishlist/add`, wishlistItem, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        showSuccessModal(
          `${product.name} has been added to your wishlist successfully!`,
          'wishlist'
        );
        setWishlistItems(prevItems => [...prevItems, response.data.data]);
      } else {
        Modal.error({
          title: 'Failed to Add',
          content: response.data.message || 'Failed to add to wishlist',
          centered: true
        });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Display the specific error message from the server if available
      const errorMessage = error.response?.data?.message || 'Failed to add to wishlist. Please try again.';
      Modal.error({
        title: 'Error',
        content: errorMessage,
        centered: true
      });
    }
  };

  const isInWishlist = (productId) => {
    console.log('Checking if product is in wishlist:', productId);
    console.log('Current wishlist items:', wishlistItems);
    return wishlistItems.some(item => item.productId === productId);
  };

  return (
    <div style={{ padding: "30px" }}>
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Tabs
            type="card"
            defaultActiveKey="Fruits"
            tabBarStyle={{ fontSize: 28, fontWeight: "bold" }}
            items={[
              {
                key: "Fruits",
                label: "Fruits",
                children: <ProductGrid products={products.filter((p) => p.category === "fruit")} addToCart={addToCart} addToWishlist={handleAddToWishlist} isInWishlist={isInWishlist} />
              },
              {
                key: "Sweets",
                label: "Sweets",
                children: <ProductGrid products={products.filter((p) => p.category === "sweet")} addToCart={addToCart} addToWishlist={handleAddToWishlist} isInWishlist={isInWishlist} />
              }
            ]}
          />

          {/* Success Modal for Cart */}
          <Modal
            open={cartModalVisible}
            footer={null}
            closable={false}
            centered
            styles={{
              mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
              body: { 
                padding: '30px',
                textAlign: 'center'
              }
            }}
          >
            <div style={{ fontSize: '60px', color: '#52c41a', marginBottom: '20px' }}>
              <ShoppingCartOutlined />
            </div>
            <h3 style={{ color: '#52c41a', marginBottom: '10px' }}>Added to Cart!</h3>
            <p>{modalMessage}</p>
          </Modal>

          {/* Custom Modal for Already in Cart */}
          <Modal
            open={alreadyInCartModalVisible}
            footer={null}
            closable={false}
            centered
            onCancel={() => setAlreadyInCartModalVisible(false)}
            styles={{
              mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
              body: { 
                padding: '30px',
                textAlign: 'center'
              }
            }}
          >
            <div style={{ fontSize: '60px', color: '#52c41a', marginBottom: '20px' }}>
              <ShoppingCartOutlined />
            </div>
            <h3 style={{ color: '#52c41a', marginBottom: '10px' }}>Already in Cart!</h3>
            <p>{alreadyInCartMessage}</p>
            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                style={{ marginRight: 12 }}
                onClick={() => {
                  setAlreadyInCartModalVisible(false);
                  window.location.href = '/cart';
                }}
              >
                Go to Cart
              </Button>
              <Button
                onClick={() => setAlreadyInCartModalVisible(false)}
              >
                Continue Shopping
              </Button>
            </div>
          </Modal>

          {/* Success Modal for Wishlist */}
          <Modal
            open={wishlistModalVisible}
            footer={null}
            closable={false}
            centered
            styles={{
              mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
              body: { 
                padding: '30px',
                textAlign: 'center'
              }
            }}
          >
            <div style={{ fontSize: '60px', color: '#ff4d4f', marginBottom: '20px' }}>
              <HeartFilled />
            </div>
            <h3 style={{ color: '#ff4d4f', marginBottom: '10px' }}>Added to Wishlist!</h3>
            <p>{modalMessage}</p>
          </Modal>
        </>
      )}
    </div>
  );
};

// Separate component for displaying products in a grid
const ProductGrid = ({ products, addToCart, addToWishlist, isInWishlist }) => (
  <Row gutter={[16, 16]}>
    {products.length > 0 ? (
      products.map((product, index) => {
        const inWishlist = isInWishlist(product.product_ID);
        console.log(`Product ${product.name} (${product.product_ID}) in wishlist:`, inWishlist);
        
        return (
          <Col span={8} key={index}>
            <Card
              hoverable
              cover={
                <img 
                  alt={product.name} 
                  src={`${SERVER_URL}${product.image}`}
                  style={{ width: "100%", height: "200px", objectFit: "cover" }} 
                  onError={(e) => { e.target.src = "/default-placeholder.png"; }}
                />
              }
              actions={[
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: 10 }}>
                  <span style={{ color: "green", fontWeight: "bold", fontSize: "20px" }}>Rs {product.price}</span>
                  <Button
                    type="text"
                    icon={inWishlist ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
                    onClick={() => addToWishlist(product)}
                  >
                    {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                  </Button>
                  <Button
                    type="text"
                    icon={<AiOutlineShoppingCart />}
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>,
              ]}
            >
              <Card.Meta title={product.name} description={product.description} />
            </Card>
          </Col>
        );
      })
    ) : (
      <p>No products found.</p>
    )}
  </Row>
);

export default Products;