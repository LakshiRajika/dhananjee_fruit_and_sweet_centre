import React, { useState, useEffect } from "react";
import "../assests/DeliveryCancel.css";

const CancelledDeliveries = () => {
  const [cancelledDeliveries, setCancelledDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCancelledDeliveries = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/delivery?status=Cancelled");
        if (!response.ok) {
          throw new Error("Failed to fetch cancelled deliveries.");
        }
        const data = await response.json();
        const filteredData = data.filter(delivery => delivery.status === "Cancelled");
        setCancelledDeliveries(filteredData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCancelledDeliveries();
  }, []);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="cancelled-deliveries-container">
      <h1>Cancelled Deliveries</h1>
      <table className="delivery-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Address</th>
            <th>Delivery Type</th>
            <th>Amount</th>
            <th>Delivery Charge</th>
            <th>Delivery Service</th>
          </tr>
        </thead>
        <tbody>
          {cancelledDeliveries.length > 0 ? (
            cancelledDeliveries.map((delivery) => (
              <tr key={delivery._id}>
                <td>{delivery.orderId}</td>
                <td>{delivery.customerName}</td>
                <td>{delivery.phoneNo}</td>
                <td>{delivery.email}</td>
                <td>{delivery.address}</td>
                <td>{delivery.deliveryType}</td>
                <td>{delivery.amount}</td>
                <td>{delivery.deliveryCharge}</td>
                <td>{delivery.deliveryService}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="no-data">No cancelled deliveries found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CancelledDeliveries;
