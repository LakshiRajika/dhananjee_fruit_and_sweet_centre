import React, { useState, useEffect } from "react";
import "../assests/AdminDeliveryManagement.css";

const AdminDeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/delivery");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDeliveries(result.data || []);
          } else {
            setError(result.message || "Failed to fetch deliveries.");
          }
        } else {
          setError("Failed to fetch deliveries.");
        }
      } catch (err) {
        console.error("Error fetching deliveries:", err);
        setError("Error fetching data!");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:3000/api/delivery/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedDelivery = await response.json();
        setDeliveries((prevDeliveries) =>
          prevDeliveries.map((delivery) =>
            delivery._id === id ? updatedDelivery.data : delivery
          )
        );
        alert("Status updated successfully!");
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      alert("Error updating status.");
    }
  };

  const handleCancelDelivery = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/delivery/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Cancelled" }),
      });

      if (response.ok) {
        const cancelledDelivery = await response.json();
        setDeliveries((prevDeliveries) =>
          prevDeliveries.filter((delivery) => delivery._id !== id)
        );
        alert("Delivery cancelled successfully!");
      } else {
        alert("Failed to cancel delivery.");
      }
    } catch (error) {
      alert("Error cancelling delivery.");
    }
  };

  const handleAssignDeliveryService = async (id, service) => {
    try {
      const response = await fetch(`http://localhost:3000/api/delivery/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deliveryService: service }),
      });

      if (response.ok) {
        const updatedDelivery = await response.json();
        setDeliveries((prevDeliveries) =>
          prevDeliveries.map((delivery) =>
            delivery._id === id ? updatedDelivery.data : delivery
          )
        );
        alert(`Assigned ${service} delivery service successfully!`);
      } else {
        alert("Failed to assign delivery service.");
      }
    } catch (error) {
      alert("Error assigning delivery service.");
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-delivery-container">
      <h1>Delivery DashBoard</h1>

      <table className="delivery-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Status</th>
            <th>Delivery Service</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((delivery) => (
            <tr key={delivery._id}>
              <td>{delivery.orderId}</td>
              <td>{delivery.customerName}</td>
              <td>
                <select
                  value={delivery.status}
                  onChange={(e) => handleUpdateStatus(delivery._id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td>
                <button
                  onClick={() => handleAssignDeliveryService(delivery._id, "Uber")}
                  disabled={delivery.deliveryService === "Uber"}
                >
                  Assign Uber
                </button>
                <button
                  onClick={() => handleAssignDeliveryService(delivery._id, "PickMe")}
                  disabled={delivery.deliveryService === "PickMe"}
                >
                  Assign PickMe
                </button>
              </td>
              <td>
                <button onClick={() => handleCancelDelivery(delivery._id)} className="cancel-button">
                  Cancel Delivery
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  );
};

export default AdminDeliveryManagement;
