import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const sendPaymentSuccessEmail = async (orderDetails) => {
  try {
    console.log('Sending email with details:', {
      to: orderDetails.userEmail || 'sashinigeshani1@gmail.com',
      orderDetails: orderDetails
    });

    const response = await axios.post(`${API_URL}/email/send-payment-success`, {
      to: orderDetails.userEmail || 'sashinigeshani1@gmail.com',
      orderDetails: orderDetails
    });

    console.log('Email API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.response?.data || error.message);
    throw error;
  }
};