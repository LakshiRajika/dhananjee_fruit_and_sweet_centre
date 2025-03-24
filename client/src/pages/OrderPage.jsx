import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'; // Import useSelector to get the userId
import { Table, Card, Typography, Button, InputNumber } from 'antd'; // Import Ant Design components

const { Title } = Typography;

export default function OrderPage() {
  const currentUser = useSelector((state) => state.user.currentUser); // Get currentUser from Redux state
  const userId = currentUser?._id; // Extract the userId from the logged-in user
  const [cartItems, setCartItems] = useState([]); // State to hold the list of cart items
  const [quantities, setQuantities] = useState({}); // State to hold the quantities of items
  const [total, setTotal] = useState(0); // State to hold the total amount

  // Fetch cart items from backend when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      const fetchCartItems = async () => {
        try {
          const response = await fetch(`/api/cart/items/${userId}`); // Fetch the user's cart items from the backend
          const data = await response.json();
          if (response.ok) {
            setCartItems(data.data); // Update the cart items state with the fetched data
            const initialQuantities = {};
            data.data.forEach(item => {
              initialQuantities[item.itemId] = item.quantity;
            });
            setQuantities(initialQuantities); // Set initial quantities
            calculateTotal(data.data, initialQuantities); // Calculate initial total
          } else {
            console.error('Error fetching cart items:', data.message);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      fetchCartItems(); // Call the fetch function
    }
  }, [userId]); // Depend on userId to refetch cart items if the user changes

  // Handle quantity change
  const handleQuantityChange = (itemId, quantity) => {
    setQuantities(prevQuantities => {
      const newQuantities = {
        ...prevQuantities,
        [itemId]: quantity,
      };
      return newQuantities;
    });
  };

  // Handle item update
  const handleUpdate = async (itemId) => {
    const quantity = quantities[itemId];
    try {
      const response = await fetch(`/api/cart/item/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      // Update the cart items state with the new quantity
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.itemId === itemId ? { ...item, quantity } : item
        )
      );
      calculateTotal(cartItems, quantities); // Recalculate total after update
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  };

  // Calculate total price
  const calculateTotal = (items, quantities) => {
    const totalAmount = items.reduce((total, item) => {
      const quantity = quantities[item.itemId] || item.quantity;
      return total + item.price * quantity;
    }, 0).toFixed(2);
    setTotal(totalAmount);
  };

  // Define columns for the table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text, record) => `$${(record.price * (quantities[record.itemId] || record.quantity)).toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => (
        <InputNumber
          min={1}
          value={quantities[record.itemId] || record.quantity}
          onChange={(value) => handleQuantityChange(record.itemId, value)}
        />
      ),
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (text) => <img src={text} alt="Product" width="100" />,
    },
    {
      title: 'Update',
      key: 'update',
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => handleUpdate(record.itemId)}
        >
          Update
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card title={`My Order History`}>
        <Table dataSource={cartItems} columns={columns} rowKey="itemId" />
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <Title level={4}>Total: ${total}</Title>
        </div>
      </Card>
    </div>
  );
}

