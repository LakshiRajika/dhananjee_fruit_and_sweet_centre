import React from 'react';
import SUCCESSIMAGE from '../assests/cancel.gif';  
import { Link } from 'react-router-dom';

const Cancel = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 m-10 bg-slate-200 rounded-lg max-w-md mx-auto">
      <img
        className="w-40 h-40 object-cover mix-blend-multiply"  
        src={SUCCESSIMAGE}  
        alt="Payment Cancel"
      />
      <p className="mt-4 text-xl font-bold text-red-600">Payment Cancel!</p>
      <Link
        to="/cart"
        className="mt-6 px-4 py-2 border-2 border-red-600 text-red-600 font-semibold rounded hover:bg-red-600 hover:text-white transition duration-300"
      >
        Go To Cart
      </Link>
    </div>
  );
};

export default Cancel;
