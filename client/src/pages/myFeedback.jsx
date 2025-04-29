import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // ✅ import
import '../assests/myFeedback.css';

const MyFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user); // ✅ get user

  useEffect(() => {
    if (currentUser?.email) { // ✅ only fetch if email is ready
      axios.get(`http://localhost:3000/api/feedback/user/${currentUser.email}`)
        .then(res => setFeedbacks(res.data.feedbacks))
        .catch(err => console.error(err));
    }
  }, [currentUser]); // ✅ run when user changes

  const canEditOrDelete = (createdAt) => {
    const feedbackTime = new Date(createdAt);
    const now = new Date();
    const diffMinutes = (now - feedbackTime) / (1000 * 60);
    return diffMinutes <= 10;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await axios.delete(`http://localhost:3000/api/feedback/${id}`);
        setFeedbacks(prev => prev.filter(f => f._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <main className="main-content">
      <div className="my-feedbacks-page">
        <div className="my-feedbacks-container">
          <h2 className="page-title">My Feedbacks</h2>

          {feedbacks.length === 0 ? (
            <p className="no-feedback">You haven't submitted any feedback yet.</p>
          ) : (
            feedbacks.map(feedback => (
              <div key={feedback._id} className="feedback-card">

                {feedback.image && (
                  <div className="feedback-image">
                    <img src={`http://localhost:3000/uploads/${feedback.image}`} alt="Feedback" />
                  </div>
                )}

                <p className="feedback-text">{feedback.review}</p>

                <span className={`feedback-badge ${feedback.category.toLowerCase()}`}>
                  {feedback.category}
                </span>

                <p className="feedback-status">
                  Status: <strong>{feedback.status}</strong>
                </p>

                <p className="created-at">
                  Submitted on: {new Date(feedback.createdAt).toLocaleString()}
                </p>

                {feedback.adminResponse && (
                  <p className="admin-reply">
                    <strong>Admin Reply:</strong> {feedback.adminResponse}
                  </p>
                )}

                <div className="actions">
                  <button
                    className={`edit-btn ${!canEditOrDelete(feedback.createdAt) ? 'disabled' : ''}`}
                    onClick={() => navigate(`/edit-feedback/${feedback._id}`)}
                    disabled={!canEditOrDelete(feedback.createdAt)}
                    title={!canEditOrDelete(feedback.createdAt) ? "Editing time expired" : "Edit Feedback"}
                  >
                    Edit
                  </button>

                  <button
                    className={`delete-btn ${!canEditOrDelete(feedback.createdAt) ? 'disabled' : ''}`}
                    onClick={() => handleDelete(feedback._id)}
                    disabled={!canEditOrDelete(feedback.createdAt)}
                    title={!canEditOrDelete(feedback.createdAt) ? "Deleting time expired" : "Delete Feedback"}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default MyFeedbacks;
