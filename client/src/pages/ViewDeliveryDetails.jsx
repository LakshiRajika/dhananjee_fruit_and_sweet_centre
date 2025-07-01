import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assests/ViewDeliveryDetails.css";

const ViewDeliveryDetails = () => {
  const navigate = useNavigate();
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode
  const [formData, setFormData] = useState({}); // New state for form data
  const [successMessage, setSuccessMessage] = useState(null); // Success message

  // Fetch the most recent delivery on page load
  useEffect(() => {
    const fetchLatestDelivery = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/delivery");
        if (response.ok) {
          const deliveries = await response.json();
          if (deliveries.length > 0) {
            const latestDelivery = deliveries.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            setDeliveryDetails(latestDelivery);
            setFormData(latestDelivery); // Set initial form data
          } else {
            setError("No deliveries found.");
          }
        } else {
          setError("Failed to fetch delivery details.");
        }
      } catch (err) {
        setError("Error fetching data!");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestDelivery();
  }, []);

  const handleEdit = () => {
    setIsEditing(true); // Enable edit mode
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Disable edit mode
    setFormData(deliveryDetails); // Reset form data to original details
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/delivery/${deliveryDetails._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setDeliveryDetails(result.data); // Update the displayed delivery details
        setSuccessMessage("Delivery details updated successfully!");
        setIsEditing(false);
      } else {
        setError(result.message || "Failed to update delivery details.");
      }
    } catch (error) {
      console.error("Error updating delivery details:", error);
      setError("Error updating delivery details. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/delivery/${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccessMessage("Delivery deleted successfully!");
        navigate("/deliveries");
      } else {
        setError(result.message || "Failed to delete delivery.");
      }
    } catch (error) {
      console.error("Error deleting delivery:", error);
      setError("Error deleting delivery. Please try again.");
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="view-delivery-container">
      <div className="delivery-header">
        <h2>Delivery Details</h2>
      </div>

      {successMessage && <p className="success-message">{successMessage}</p>} {/* Success message */}

      {isEditing ? (
        <div className="edit-delivery-form">
          <div className="delivery-item">
            <label>Order ID:</label>
            <input
              type="text"
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="delivery-item">
            <label>Customer Name:</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
            />
          </div>
          <div className="delivery-item">
            <label>Phone Number:</label>
            <input
              type="text"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
            />
          </div>
          <div className="delivery-item">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="delivery-item">
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="delivery-item">
            <label>Delivery Type:</label>
            <select
              name="deliveryType"
              value={formData.deliveryType}
              onChange={handleChange}
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Online Payment">Online Payment</option>
            </select>
          </div>
          <div className="delivery-item">
            <label>Amount:</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
          <div className="delivery-item">
            <label>Delivery Charge:</label>
            <input
              type="number"
              name="deliveryCharge"
              value={formData.deliveryCharge}
              onChange={handleChange}
            />
          </div>
          <div className="delivery-item">
            <label>Delivery Service:</label>
            <select
              name="deliveryService"
              value={formData.deliveryService}
              onChange={handleChange}
            >
              <option value="Uber">Uber</option>
              <option value="PickMe">PickMe</option>
            </select>
          </div>
          <div className="action-buttons">
            <button onClick={handleSave} className="save-button">Save Changes</button>
            <button onClick={handleCancelEdit} className="cancel-button">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="delivery-summary">
          <div className="delivery-item">
            <strong>Order ID:</strong> {deliveryDetails.orderId}
          </div>
          <div className="delivery-item">
            <strong>Customer Name:</strong> {deliveryDetails.customerName}
          </div>
          <div className="delivery-item">
            <strong>Phone Number:</strong> {deliveryDetails.phoneNo}
          </div>
          <div className="delivery-item">
            <strong>Email:</strong> {deliveryDetails.email}
          </div>
          <div className="delivery-item">
            <strong>Address:</strong> {deliveryDetails.address}
          </div>
          <div className="delivery-item">
            <strong>Delivery Type:</strong> {deliveryDetails.deliveryType}
          </div>
          <div className="delivery-item">
            <strong>Amount:</strong> Rs. {deliveryDetails.amount}
          </div>
          <div className="delivery-item">
            <strong>Delivery Charge:</strong> Rs. {deliveryDetails.deliveryCharge}
          </div>
          <div className="delivery-item">
            <strong>Total Amount:</strong> Rs. {deliveryDetails.totalAmount}
          </div>
          <div className="delivery-item">
            <strong>Delivery Service:</strong> {deliveryDetails.deliveryService}
          </div>
          <div className="delivery-item">
            <strong>Status:</strong> {deliveryDetails.status}
          </div>

          <div className="action-buttons">
            <button onClick={handleEdit} className="edit-button">
              Edit Delivery
            </button>
            <button onClick={() => handleDelete(deliveryDetails._id)} className="delete-button">
              Delete Delivery
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDeliveryDetails;