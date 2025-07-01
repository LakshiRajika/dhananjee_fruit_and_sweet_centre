import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function ShowProductDetails() {

    const [inventory, setInventory] = useState([{}]);
    const { id } = useParams();

    useEffect(() => {
        axios
            .get(`http://localhost:3000/api/inventory/${id}`)
            .then((res) => {
                setInventory(res.data);
            })
            .catch(() => {
                console.log("Error from ShowInventoryDetail");
            });
    }, [id]);

    const TableItem = (
      <div>
          <table className="table table-hover table-dark">
              <tbody>
                  <tr>
                      <th scope="row">1</th>
                      <td>ID:</td>
                      <td>{inventory.product_ID}</td>
                  </tr>
                  <tr>
                      <th scope="row">2</th>
                      <td>NAME:</td>
                      <td>{inventory.name}</td>
                  </tr>
                  <tr>
                      <th scope="row">3</th>
                      <td>Caregory:</td>
                      <td>{inventory.category}</td>
                  </tr>
                  <tr>
                      <th scope="row">4</th>
                      <td>Description:</td>
                      <td>{inventory.description}</td>
                  </tr>
                  <tr>
                      <th scope="row">5</th>
                      <td>Price:</td>
                      <td>{inventory.price}</td>
                  </tr>
              </tbody>
          </table>
      </div>
  );
  

  return (
    <div className='showProductDetails'>
      <div className='col-md-10 m-auto'>
        <br/>
        <Link to={"/"} className='btn btn-outline-danger float-right'>Back to main</Link>

      </div>

      <br/>
      <div>
    
</div>

<br />

<div className="col-md-8 m-auto">
    <h1 className="display-6-bold text-center">Product Detail</h1>
    <p className="text-center">This is full detail of Product</p>
    <br />
    <br />
</div>

<div className="col-md-10 m-auto">{TableItem}</div>

<div className="col-md-6 m-auto">
    <Link
        to={`/updatedetails/${inventory._id}`}
        className="btn btn-outline-info btn-lg btn-block d-flex justify-content-center"
    >
        Edit Product
    </Link>
</div>

      
    </div>
  )
}

export default ShowProductDetails
