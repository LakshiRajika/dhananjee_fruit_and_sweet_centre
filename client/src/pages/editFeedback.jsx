import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../assests/editFeedback.css'; // ✅ Create a new CSS file for EditFeedback page

const EditFeedback = () => {
  const { id } = useParams(); // ✅ Get feedback ID from URL
  const navigate = useNavigate();

  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ Fetch the existing feedback data
    axios.get(`http://localhost:3000/api/feedback/${id}`)
      .then(res => {
        setReview(res.data.review);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load feedback. Please try again later.');
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:3000/api/feedback/${id}`, { review });
      alert('Feedback updated successfully!');
      navigate('/my-feedbacks'); // ✅ After editing, go back to MyFeedbacks page
    } catch (err) {
      console.error(err);
      setError('Failed to update feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-feedback-container">
      <h2>Edit Your Feedback</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="edit-form">
        <textarea
          className="edit-textarea"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows="6"
          placeholder="Update your feedback here..."
          required
        ></textarea>
        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditFeedback;
