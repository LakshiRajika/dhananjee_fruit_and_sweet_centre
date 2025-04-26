import nodemailer from 'nodemailer';

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'sashinigeshani1@gmail.com',
    pass: 'zdrp gflf zgyv kdta'
  }
});

// Verify transporter connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

export const sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { to, orderDetails } = req.body;
    
    console.log('Attempting to send email to:', to);
    console.log('Order details:', orderDetails);

    // Email content
    const mailOptions = {
      from: '"Dhananjee Fruit and Sweet Centre" <sashinigeshani1@gmail.com>',
      to: to,
      subject: 'Payment Successful - Dhananjee Fruit and Sweet Centre',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Payment Successful!</h2>
          <p>Dear Customer,</p>
          <p>Thank you for your purchase at Dhananjee Fruit and Sweet Centre.</p>
          
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Amount:</strong> Rs ${orderDetails.totalAmount?.toFixed(2)}</p>
          
          <h3>Order Items:</h3>
          <ul>
            ${orderDetails.items?.map(item => `
              <li>${item.name} - Quantity: ${item.quantity} - Rs ${(item.price * item.quantity).toFixed(2)}</li>
            `).join('')}
          </ul>
          
          <p>Your order is being processed and will be delivered to you soon.</p>
          <p>Thank you for shopping with us!</p>
          
          <p>Best regards,<br>Dhananjee Fruit and Sweet Centre</p>
        </div>
      `,
      priority: 'high'
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);

    res.status(200).json({
      success: true,
      message: 'Payment success email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Detailed error sending email:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    res.status(500).json({
      success: false,
      message: 'Failed to send payment success email',
      error: error.message
    });
  }
};