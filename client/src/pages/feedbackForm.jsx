import React, { useState, useEffect } from "react";
import axios from "axios";
import "../assests/feedbackForm.css";


const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    orderId: "",
    customerName: "",
    email: "",
    rating: 1,
    review: "",
    image: null,
    recommended: "Yes",
    response: false,
    anonymous: false,
  });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Fetch all feedbacks from the backend and display them
    const fetchReviews = async () => {
      const response = await axios.get("http://localhost:3000/api/feedback");
      setReviews(response.data.feedbacks);
    };
    fetchReviews();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleRating = (selectedRating) => {
    setFormData({ ...formData, rating: selectedRating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Order ID validation
  const orderIdPattern = /^[A-Za-z0-9]+$/;
  if (!orderIdPattern.test(formData.orderId)) {
    alert("Order ID must contain only letters and numbers.");
    return;
  }

  // Customer Name validation
  const namePattern = /^[A-Za-z ]{3,}$/;
  if (!namePattern.test(formData.customerName)) {
    alert("Customer Name should only contain letters and be at least 3 characters.");
    return;
  }

  // Email validation
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Review length validation
  if (formData.review.length < 20) {
    alert("Review must be at least 20 characters long.");
    return;
  }

  // Image type validation
  if (formData.image) {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(formData.image.type)) {
      alert("Only JPG and PNG images are allowed.");
      return;
    }
  }

  // Rating validation
  if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
    alert("Please select a rating between 1 and 5.");
    return;
  }

    const form = new FormData();
    form.append("orderId", formData.orderId);
    form.append("customerName", formData.customerName);
    form.append("email", formData.email);
    form.append("rating", Number(formData.rating));
    form.append("review", formData.review);
    form.append("image", formData.image);
    form.append("recommended", formData.recommended);
    form.append("response", formData.response);
    form.append("anonymous", formData.anonymous);

    try {
      const response = await axios.post("http://localhost:3000/api/feedback", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Feedback submitted successfully!");
      setFormData({ ...formData, review: "", image: null }); // Clear form
    } catch (error) {
      alert("Failed to submit feedback.");
    }
  };

  return (
    <div className="feedback-container">
      <h2>Submit Your Feedback</h2>
      <form onSubmit={handleSubmit}>
        <label>Order ID:</label>
        <input type="text" name="orderId" value={formData.orderId} onChange={handleChange} required />

        <label>Customer Name:</label>
        <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required />

        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />

        <label>Rating:</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={star <= formData.rating ? "star selected" : "star"} onClick={() => handleRating(star)}>
              ★
            </span>
          ))}
        </div>

        <label>Review:</label>
        <textarea name="review" value={formData.review} onChange={handleChange} required />

        <label>Image (optional):</label>
        <input type="file" name="image" onChange={handleImageChange} />

        <label>Recommended:</label>
        <select name="recommended" value={formData.recommended} onChange={handleChange}>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        <label>Need Admin Response:</label>
        <input type="checkbox" name="response" checked={formData.response} onChange={handleChange} />

        <label>Anonymous Feedback:</label>
        <input type="checkbox" name="anonymous" checked={formData.anonymous} onChange={handleChange} />

        <button type="submit">Submit Feedback</button>
      </form>

      {/* Display reviews */}
      <div className="reviews">
        <h3>Customer Reviews</h3>
        {reviews
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Most recent reviews first
          .map((review) => (
            <div key={review._id} className="review-item">
              <div>
                {review.anonymous ? (
                  <strong>Anonymous</strong>
                ) : (
                  <strong>{review.customerName}</strong>
                )}
                <p>Rating: {review.rating} / 5</p>
                <p>{review.review}</p>
                {review.image && <img src={`http://localhost:3000/uploads/${review.image}`} alt="Review" className="review-image" />}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FeedbackForm;
