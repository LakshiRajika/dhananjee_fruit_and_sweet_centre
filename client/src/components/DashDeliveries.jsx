import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Table, Badge, Button, Spinner } from 'flowbite-react';
import { HiOutlineTruck, HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';

export default function DashDeliveries() {
  const { currentUser } = useSelector((state) => state.user);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        console.log('Fetching deliveries for user:', currentUser._id);
        const response = await fetch(`http://localhost:3000/api/delivery/user/${currentUser._id}`);
        const data = await response.json();
        
        console.log('Delivery response:', data);
        
        if (data.success) {
          setDeliveries(data.data);
        } else {
          setError(data.message || 'Failed to fetch deliveries');
        }
      } catch (error) {
        console.error('Error fetching deliveries:', error);
        setError('Failed to fetch deliveries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchDeliveries();
    }
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'picked up':
        return 'info';
      case 'out for delivery':
        return 'purple';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'failure';
      default:
        return 'default';
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
        <h1 className="text-2xl font-bold text-gray-800">My Deliveries</h1>
        <Badge color="info" size="lg">
          Total: {deliveries.length}
        </Badge>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <HiOutlineTruck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Deliveries</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't made any delivery requests yet.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {deliveries.map((delivery) => (
            <Card key={delivery._id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color={getStatusColor(delivery.status)}>
                      {delivery.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <HiOutlineLocationMarker className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">{delivery.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlinePhone className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">{delivery.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineMail className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">{delivery.email}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Delivery Service:</span>
                        <p className="font-medium">{delivery.deliveryService}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Payment Type:</span>
                        <p className="font-medium capitalize">{delivery.deliveryType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">District:</span>
                        <p className="font-medium">{delivery.district}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center items-end gap-2">
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Total Amount:</span>
                    <p className="text-lg font-bold text-emerald-600">
                      Rs {delivery.totalAmount?.toLocaleString() || '0'}
                    </p>
                  </div>
                  {delivery.estimatedTime && (
                    <Badge color="info">
                      Est. Time: {delivery.estimatedTime}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 