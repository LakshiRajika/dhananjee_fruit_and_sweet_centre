import React, { useState, useEffect } from 'react';
import { Card, Button, message, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useSelector } from 'react-redux';

const SERVER_URL = "http://localhost:3000";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (currentUser?._id) {
      fetchWishlistItems();
    }
  }, [currentUser]);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const userId = currentUser?._id;
      console.log('Fetching wishlist for userId:', userId);
      
      const response = await axios.get(`${SERVER_URL}/api/wishlist/${userId}`);
      console.log('Full wishlist response:', response.data);
      
      if (response.data.success) {
        const items = response.data.data || [];
        console.log('Setting wishlist items:', items.length);
        console.log('Wishlist items:', items);
        setWishlistItems(items);
      } else {
        message.error(response.data.message || 'Failed to fetch wishlist items');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      message.error('Failed to fetch wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (item) => {
    try {
      const userId = currentUser?._id;
      console.log('Removing item from wishlist:', { userId, itemId: item.productId });
      
      const response = await axios.delete(`${SERVER_URL}/api/wishlist/${userId}/${item.productId}`);
      console.log('Remove response:', response.data);
      
      if (response.data.success) {
        message.success('Item removed from wishlist');
        // Refresh the wishlist after removal
        fetchWishlistItems();
      } else {
        message.error(response.data.message || 'Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      message.error('Failed to remove item from wishlist');
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Empty description="Please login to view your wishlist" />
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist ({wishlistItems.length} items)</h1>
      {wishlistItems.length === 0 ? (
        <Empty description="Your wishlist is empty" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card
              key={item._id}
              className="dark:bg-gray-800 dark:text-white"
              cover={
                <img
                  alt={item.name}
                  src={item.image}
                  className="h-48 w-full object-cover"
                />
              }
              actions={[
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveFromWishlist(item)}
                >
                  Remove
                </Button>,
              ]}
            >
              <Card.Meta
                title={item.name}
                description={
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                    <p className="text-lg font-semibold mt-2">
                      Rs. {item.price}
                    </p>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}