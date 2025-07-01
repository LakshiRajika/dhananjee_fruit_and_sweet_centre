import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message } from 'antd';
import { useSelector } from 'react-redux';

const priorityLabels = {
  1: 'High',
  2: 'Medium',
  3: 'Low',
};

const priorityColors = {
  1: '#ff4d4f', 
  2: '#fa8c16',
  3: '#52c41a', 
};

const categoryColors = {
  'Fruit': '#FFFBF0', 
  'Sweet': '#FFEBF0', 
  'Other': '#F0F8FF', 
};

const WishlistPage = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`/api/wishlist/${userId}`);
      const data = await res.json();
      if (res.ok) {
        setWishlist(data.data);
      } else {
        message.error(data.message);
      }
    } catch (err) {
      console.error(err);
      message.error("Error fetching wishlist.");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const res = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        message.success("Removed from wishlist");
        setWishlist((prev) => prev.filter((item) => item.itemId !== itemId));
      } else {
        message.error(data.message);
      }
    } catch (err) {
      console.error(err);
      message.error("Error deleting item.");
    }
  };

  useEffect(() => {
    if (userId) fetchWishlist();
  }, [userId]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (value) => `Rs ${value}`,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      render: (priority) => (
        <Tag color={priorityColors[priority]}>
          {priorityLabels[priority]}
        </Tag>
      ),
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Button danger onClick={() => handleRemove(record.itemId)}>Remove</Button>
      ),
    },
  ];

  const getRowClassName = (record) => {
    const backgroundColor = categoryColors[record.category] || '#FFFFFF';
    return {
      backgroundColor,
    };
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Wishlist</h2>
      <Table
        rowKey="itemId"
          dataSource={wishlist}
        columns={columns}
        pagination={false}
        bordered
        rowClassName={getRowClassName}
        components={{
          header: {
            cell: (props) => (
              <th {...props} style={{ backgroundColor: '#800080', color: '#fff' }} />
            ),
          },
        }}
      />
    </div>
  );
};

export default WishlistPage;
