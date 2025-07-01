import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Table, Badge, Button, Spinner } from 'flowbite-react';
import { HiOutlineShoppingCart, HiDownload } from 'react-icons/hi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function UserOrders() {
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Fetching orders for user:', currentUser._id);
        const response = await fetch(`http://localhost:3000/api/order/user/${currentUser._id}`);
        const data = await response.json();
        
        console.log('Orders response:', data);
        
        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchOrders();
    }
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'purple';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'failure';
      default:
        return 'default';
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const downloadInvoice = (order) => {
    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(128, 0, 128); // Purple color
      doc.text('Dhananjee Fruit and Sweet Centre', 105, 20, { align: 'center' });
      
      // Add invoice details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 40);
      doc.text(`Order ID: ${order.orderId || order._id}`, 20, 50);
      doc.text(`Customer: ${currentUser.username}`, 20, 60);
      doc.text(`Email: ${currentUser.email}`, 20, 70);
      
      // Add order items table
      const tableColumn = ['Item', 'Quantity', 'Price (Rs)', 'Total (Rs)'];
      const tableRows = order.items.map(item => [
        item.name,
        item.quantity,
        item.price.toLocaleString(),
        (item.price * item.quantity).toLocaleString()
      ]);
      
      // Using autoTable plugin
      autoTable(doc, {
        startY: 80,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [128, 0, 128] },
        styles: { 
          fontSize: 10,
          cellPadding: 5
        }
      });
      
      // Add total
      const finalY = doc.lastAutoTable.finalY || 150;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount: Rs ${calculateTotal(order.items).toLocaleString()}`, 20, finalY + 20);
      
      // Add footer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your purchase!', 105, finalY + 40, { align: 'center' });
      doc.text('Visit us again at Dhananjee Fruit and Sweet Centre', 105, finalY + 50, { align: 'center' });
      
      // Save the PDF
      doc.save(`Invoice-${order.orderId || order._id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button 
            color="failure" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <Badge color="info" size="lg">
          Total Orders: {orders.length}
        </Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <HiOutlineShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't placed any orders yet.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">Order Items:</h3>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span>Rs {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col justify-center items-end gap-2">
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Total Amount:</span>
                    <p className="text-lg font-bold text-emerald-600">
                      Rs {calculateTotal(order.items).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    gradientDuoTone="purpleToBlue"
                    className="flex items-center gap-2"
                    onClick={() => downloadInvoice(order)}
                  >
                    <HiDownload className="h-4 w-4" />
                    Download Invoice
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 