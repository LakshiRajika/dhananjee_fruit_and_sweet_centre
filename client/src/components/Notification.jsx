// src/components/Notification.jsx
import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Optional: Import a custom CSS for better styling
import "../assests/Notification.css";

// Create a Notification component
const Notification = ({ type, message }) => {
  const showToast = () => {
    switch (type) {
      case "success":
        toast.success(message, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "toast-success",
        });
        break;
      case "error":
        toast.error(message, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "toast-error",
        });
        break;
      case "info":
        toast.info(message, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "toast-info",
        });
        break;
      default:
        toast(message, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "toast-default",
        });
        break;
    }
  };

  return (
    <div>
      <button onClick={showToast} className="btn-show-toast">
        Show {type} Toast
      </button>
    </div>
  );
};

export default Notification;
