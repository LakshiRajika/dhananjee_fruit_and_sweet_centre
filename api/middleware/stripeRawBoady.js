export const stripeRawBodyMiddleware = (req, res, next) => {
    let data = '';
  
    // Need raw body for Stripe signature verification
    req.on('data', chunk => {
      data += chunk;
    });
  
    req.on('end', () => {
      req.rawBody = data;
  
      // Try parsing the body as JSON for the route handler if Content-Type is application/json
      if (req.headers['content-type'] === 'application/json') {
        try {
          req.body = JSON.parse(data);
        } catch (e) {
          console.error('Error parsing JSON:', e);
          return res.status(400).send('Invalid JSON');
        }
      }
  
      next();
    });
  
    req.on('error', (err) => {
      console.error('Error in stripeRawBodyMiddleware:', err);
      return res.status(500).send('Internal Server Error');
    });
  };
  