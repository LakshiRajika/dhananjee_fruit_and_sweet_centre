import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../assests/UpdateProductDetails";

function UpdateProductDetails() {
  const [inventory, setInventory] = useState({
    product_ID: "",
    name: "",
    description: "",
    price: "",
    quantity: "", // <-- Add quantity to state
  });

  const [message, setMessage] = useState(""); // State to store message
  const [messageType, setMessageType] = useState("");
    
  const { id } = useParams();
  const navigate = useNavigate();
    
  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/inventory/${id}`)
      .then((res) => {
        setInventory({
          product_ID: res.data.product_ID,
          name: res.data.name,
          description: res.data.description,
          price: res.data.price,
          quantity: res.data.quantity, // <-- Set quantity from API response
        });
      })
      .catch((err) => {
        console.log("Error from Update Product", err);
      });
  }, [id]);

  const onChange = (e) => {
    console.log(e.target.value);
    const { name, value } = e.target;

  if (name === "name" && !/^[a-zA-Z\s]*$/.test(value)) {
    setMessage("Name must contain only letters.");
    setMessageType("error");
    return;
  }

  if (name === "price" && value < 0) {
    setMessage("Price must be a positive number.");
    setMessageType("error");
    return;
  }

  if (name === "quantity" && value < 0) {
    setMessage("Quantity cannot be negative.");
    setMessageType("error");
    return;
  }


    setInventory({ ...inventory, [name] :value});
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (!inventory.name || !inventory.description || !inventory.price || !inventory.quantity) {
      setMessage("All fields are required.");
      setMessageType("error");
      return;
    }
  
    if (isNaN(inventory.price) || inventory.price <= 0) {
      setMessage("Price must be a positive number.");
      setMessageType("error");
      return;
    }
  
    if (isNaN(inventory.quantity) || inventory.quantity < 0) {
      setMessage("Quantity cannot be negative.");
      setMessageType("error");
      return;
    }
  
    console.log("Form submitted");

    const data = {
      product_ID: inventory.product_ID,
      name: inventory.name,
      description: inventory.description,
      price: inventory.price,
      quantity: inventory.quantity, // <-- Add quantity to the data
    };

    axios
      .put(`http://localhost:3000/api/inventory/${id}`, data)
      .then((res) => {
        setMessage("Product updated successfully!"); // Set success message
        setMessageType("success");
        setTimeout(() => {
          navigate(`/showdetails/${id}`);
        }, 500);
      })
      .catch((err) => {
        setMessage("Error updating product."); // Set error message
        setMessageType("error");
        setTimeout(() => {
          setMessage(""); // Clear message after 3 seconds
        }, 3000);
        console.log("Error in Update", err);
      });
  };

  console.log("Message:", message);
  console.log("MessageType:", messageType);

  return (
    <div className="UpdateProduct">
      <div className="container">
        <div className="row">
          <div className="col-md-8 m-auto">
            <br />
            <Link to="/" className="btn btn-outline-warning float-left">
              Show Product List
            </Link>
          </div>
        </div>

        {/* Display message */}
        {message && (
          <div
            className={`message ${
              messageType === "success" ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        <div className="col-md-8 m-auto">
          <form noValidate onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="title">Product ID</label>
              <input
                type="text"
                placeholder="Product ID"
                name="product_ID"
                className="form-control"
                value={inventory.product_ID}
               readOnly
              />
            </div>

            <br />

            <div className="form-group">
              <label htmlFor="title">Name</label>
              <input
                type="text"
                placeholder="Product Name"
                name="name"
                className="form-control"
                value={inventory.name}
                onChange={onChange}
              />
            </div>

            <br />

            <div className="form-group">
              <label htmlFor="title">Description</label>
              <input
                type="text"
                placeholder="Product Description"
                name="description"
                className="form-control"
                value={inventory.description}
                onChange={onChange}
              />
            </div>

            <br />

            <div className="form-group">
              <label htmlFor="title">Price</label>
              <input
                type="text"
                placeholder="Price"
                name="price"
                className="form-control"
                value={inventory.price}
                onChange={onChange}
              />
            </div>

            <br />

            {/* Add Quantity Field */}
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                placeholder="Quantity"
                name="quantity"
                className="form-control"
                value={inventory.quantity}
                onChange={onChange}
              />
            </div>

            <br />

            <button type="submit" className="btn btn-outline-info btn-lg btn-block">
              Update Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateProductDetails;
