import { errorHandler } from '../utils/error.js';
import dialogflow from '@google-cloud/dialogflow';

const sessionClient = new dialogflow.SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const projectId = process.env.DIALOGFLOW_PROJECT_ID;

export const detectIntent = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return next(errorHandler(400, 'Message is required'));
    }

    const sessionId = req.cookies.sessionId || Date.now().toString();
    
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
        },
        languageCode: 'en-US',
      },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    
    res.cookie('sessionId', sessionId, { 
      maxAge: 30 * 24 * 60 * 60 * 1000, 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    
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

export const fallbackResponse = async (req, res) => {
  const { message } = req.body;
  
  const responses = {
    'order': 'You can change your order by contacting our customer service at DhananjeeFruit&SweetCenterSupport@.com or by calling us at +94 77 645 945.',
    'deliver': ' we deliver on both weekdays and weekends! On weekdays (Monday to Friday), we deliver 24 hours. On weekends (Saturday and Sunday), our delivery hours are 9 AM to 6 PM.',
    'refund': 'Our refund policy allows returns within 30 days of purchase. Items must be unused and in original packaging.',
    'shipping': 'Standard shipping takes 3-5 business days. Express shipping is available for next-day delivery.',
    'payment': 'We accept all major credit cards, Debit cards, and cash on Delivery.',
    'track': 'You can track your order by logging into your account and visiting the "My Orders" section.',
    'cancel': 'You can cancel your order within 1 hour of placing it by contacting our customer service.',
    'contact': 'You can contact our customer service at DhananjeeFruit&SweetCenterSupport@.com or by calling us at +94 77 645 945.'
  };
  
  let reply = "I'm sorry, I don't understand your question. Please try rephrasing or contacting our customer service at DhananjeeFruit&SweetCenterSupport@.com or by calling us at +94 77 645 945.";
  
  for (const [keyword, response] of Object.entries(responses)) {
    if (message.toLowerCase().includes(keyword)) {
      reply = response;
      break;
    }
  }
  
  res.status(200).json({ reply });
};