import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux"; // ✅ import useSelector
import "../assests/feedbackForm.css"; // Make sure your folder is correctly spelled "assets"!

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

  const { currentUser } = useSelector((state) => state.user); // ✅ get currentUser from Redux
  const [reviews, setReviews] = useState([]);

  // ✅ Automatically fill email if user is logged in
  useEffect(() => {
    if (currentUser?.email) {
      setFormData((prev) => ({
        ...prev,
        email: currentUser.email,
      }));
    }
  }, [currentUser]);

  // Fetch existing reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/feedback");
        setReviews(response.data.feedbacks);
      } catch (error) {
        console.error("Failed to fetch feedbacks", error);
      }
    };
    fetchReviews();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleRating = (selectedRating) => {
    setFormData({ ...formData, rating: selectedRating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const orderIdPattern = /^[A-Za-z0-9]+$/;
    const namePattern = /^[A-Za-z ]{3,}$/;
    if (!orderIdPattern.test(formData.orderId)) {
      return alert("Order ID must contain only letters and numbers.");
    }
    if (!namePattern.test(formData.customerName)) {
      return alert("Customer Name should only contain letters and be at least 3 characters.");
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return alert("Please enter a valid email address.");
    }
    if (formData.review.length < 20) {
      return alert("Review must be at least 20 characters long.");
    }
    if (formData.image) {
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(formData.image.type)) {
        return alert("Only JPG and PNG images are allowed.");
      }
    }
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      return alert("Please select a rating between 1 and 5.");
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    try {
      await axios.post("http://localhost:3000/api/feedback", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Feedback submitted successfully!");
      setFormData({
        orderId: "",
        customerName: "",
        email: currentUser?.email || "", // ✅ refill email after submitting
        rating: 1,
        review: "",
        image: null,
        recommended: "Yes",
        response: false,
        anonymous: false,
      });
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message
          ? `Failed to submit feedback: ${error.response.data.message}`
          : "Failed to submit feedback."
      );
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-form-container">
        <h2 className="form-title">Let us know your thoughts!</h2>
        <form onSubmit={handleSubmit} className="feedback-form">
          <label>Order ID:</label>
          <input type="text" name="orderId" value={formData.orderId} onChange={handleChange} required />

          <label>Customer Name:</label>
          <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            // disabled // ✅ Uncomment this if you want email to be non-editable
          />

          <label>Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= formData.rating ? "star selected" : "star"}
                onClick={() => handleRating(star)}
              >
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

          <div className="checkbox-group">
            <label>
              <input type="checkbox" name="response" checked={formData.response} onChange={handleChange} /> Need Admin Response
            </label>
            <label>
              <input type="checkbox" name="anonymous" checked={formData.anonymous} onChange={handleChange} /> Anonymous Feedback
            </label>
          </div>

          <button type="submit" className="submit-btn">Submit Feedback</button>
        </form>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h3>Recent Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <strong>{review.anonymous ? "Anonymous" : review.customerName}</strong>
                  <span className="review-rating">Rating: {review.rating} / 5</span>
                </div>
                <p className="review-text">{review.review}</p>
                {review.image && (
                  <img
                    src={`http://localhost:3000/uploads/${review.image}`}
                    alt="Review"
                    className="review-image"
                  />
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
