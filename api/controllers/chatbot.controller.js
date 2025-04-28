import { errorHandler } from '../utils/error.js';
import dialogflow from '@google-cloud/dialogflow';

// Initialize Dialogflow client
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Get project ID from environment variable
const projectId = process.env.DIALOGFLOW_PROJECT_ID;

// Function to detect intent using Dialogflow
export const detectIntent = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return next(errorHandler(400, 'Message is required'));
    }

    // Create a unique session ID for this conversation
    const sessionId = req.cookies.sessionId || Date.now().toString();
    
    // Set the session path
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    
    // The text query request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
        },
        languageCode: 'en-US',
      },
    };

    // Detect intent
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    
    // Set session ID in cookie for future requests
    res.cookie('sessionId', sessionId, { 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    
    // Return the response
    res.status(200).json({
      reply: result.fulfillmentText,
      intent: result.intent.displayName,
      confidence: result.intentDetectionConfidence,
    });
  } catch (error) {
    console.error('Error detecting intent:', error);
    next(errorHandler(500, 'Error processing chatbot message'));
  }
};

// Fallback function for when Dialogflow is not configured
export const fallbackResponse = async (req, res) => {
  const { message } = req.body;
  
  // Simple keyword-based responses for common questions
  const responses = {
    'order': 'You can change your order by contacting our customer service at DhananjeeFruit&SweetCenterSupport@.com or by calling us at +94 77 645 945.',
    'deliver': 'Yes, we deliver on weekends! Our delivery hours are 9 AM to 6 PM on Saturdays and Sundays.',
    'refund': 'Our refund policy allows returns within 30 days of purchase. Items must be unused and in original packaging.',
    'shipping': 'Standard shipping takes 3-5 business days. Express shipping is available for next-day delivery.',
    'payment': 'We accept all major credit cards, Debit cards, and cash on Delivery.',
    'track': 'You can track your order by logging into your account and visiting the "My Orders" section.',
    'cancel': 'You can cancel your order within 1 hour of placing it by contacting our customer service.',
    'contact': 'You can contact our customer service at DhananjeeFruit&SweetCenterSupport@.com or by calling us at +94 77 645 945.'
  };
  
  // Check if the message contains any of the keywords
  let reply = "I'm sorry, I don't understand your question. Please try rephrasing or contact our customer service for assistance.";
  
  for (const [keyword, response] of Object.entries(responses)) {
    if (message.toLowerCase().includes(keyword)) {
      reply = response;
      break;
    }
  }
  
  res.status(200).json({ reply });
};