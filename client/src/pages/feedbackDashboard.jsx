import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import '../assests/feedbackDashboard.css';

const FeedbackDashboard = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [replyModal, setReplyModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [stats, setStats] = useState({ total: 0, today: 0, positive: 0, negative: 0 });

    useEffect(() => {
        axios.get('http://localhost:3000/api/feedback')
            .then(response => {
                setFeedbacks(response.data.feedbacks);
                calculateStats(response.data.feedbacks);
            })
            .catch(error => console.error("Error fetching feedbacks:", error));
    }, []);

    const calculateStats = (feedbacks) => {
        const today = new Date().toISOString().split('T')[0];
        const total = feedbacks.length;
        const todayCount = feedbacks.filter(fb => fb.createdAt.split('T')[0] === today).length;
        const positive = feedbacks.filter(fb => fb.category === 'Positive').length;
        const negative = feedbacks.filter(fb => fb.category === 'Negative').length;
        setStats({ total, today: todayCount, positive, negative });
    };

    const categoryData = [
        { name: "Positive", value: stats.positive },
        { name: "Negative", value: stats.negative },
        { name: "Neutral", value: stats.total - (stats.positive + stats.negative) }
    ];

    const feedbackTimeData = feedbacks.reduce((acc, feedback) => {
        const date = feedback.createdAt.split('T')[0];
        const existingEntry = acc.find(entry => entry.date === date);
        if (existingEntry) {
            existingEntry.count += 1;
        } else {
            acc.push({ date, count: 1 });
        }
        return acc;
    }, []);

    const handleApprove = (id) => {
        axios.put(`http://localhost:3000/api/feedback/${id}`, { status: "Approved" })
            .then(() => {
                setFeedbacks(prev => prev.map(fb => fb._id === id ? { ...fb, status: "Approved" } : fb));
            });
    };

    const handleReject = (id) => {
        axios.put(`http://localhost:3000/api/feedback/${id}`, { status: "Rejected" })
            .then(() => {
                setFeedbacks(prev => prev.map(fb => fb._id === id ? { ...fb, status: "Rejected" } : fb));
            });
    };

    const handleReply = (id) => {
        setSelectedFeedback(id);
        setReplyModal(true);
    };

    const sendReply = () => {
        axios.put(`http://localhost:3000/api/feedback/${selectedFeedback}`, { adminResponse: replyText })
            .then(() => {
                setFeedbacks(prev => prev.map(fb => fb._id === selectedFeedback ? { ...fb, adminResponse: replyText } : fb));
                setReplyModal(false);
                setReplyText('');
            });
    };

    const handleDelete = (id) => {
        axios.delete(`http://localhost:3000/api/feedback/${id}`)
            .then(() => {
                setFeedbacks(prev => prev.filter(fb => fb._id !== id));
            })
            .catch(error => console.error("Error deleting feedback:", error));
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Feedback Dashboard</h1>
            <div className="stats-container">
                <div className="stat-box total">Total Feedbacks: {stats.total}</div>
                <div className="stat-box today">Today's Feedbacks: {stats.today}</div>
                <div className="stat-box positive">Positive Feedbacks: {stats.positive}</div>
                <div className="stat-box negative">Negative Feedbacks: {stats.negative}</div>
            </div>

            <div className="charts-container">
                <div className="chart-container">
                    <h3>Feedback Categories</h3>
                    <BarChart width={400} height={300} data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                </div>

                <div className="chart-container">
                    <h3>Feedback Over Time</h3>
                    <LineChart width={500} height={300} data={feedbackTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="linear" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </div>
            </div>

            <div className="feedback-table">
                <table>
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Order ID</th>
                            <th>Rating</th>
                            <th>Review</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbacks.map(feedback => (
                            <tr key={feedback._id}>
                                <td>{feedback.anonymous ? "Anonymous" : feedback.customerName}</td>
                                <td>{feedback.orderId}</td>
                                <td>{feedback.rating}</td>
                                <td>{feedback.review}</td>
                                <td>{feedback.status || "Pending"}</td>
                                <td className="actions">
                                    <button className="approve" onClick={() => handleApprove(feedback._id)}>Approve</button>
                                    <button className="reject" onClick={() => handleReject(feedback._id)}>Reject</button>
                                    <button className="reply" onClick={() => handleReply(feedback._id)}>Reply</button>
                                    <button className="delete" onClick={() => handleDelete(feedback._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {replyModal && (
                <div className="reply-modal">
                    <h3>Reply to Feedback</h3>
                    <textarea className="reply-textarea" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply here..."></textarea>
                    <div className="modal-actions">
                        <button className="send-reply" onClick={sendReply}>Send</button>
                        <button className="cancel-reply" onClick={() => setReplyModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackDashboard;
