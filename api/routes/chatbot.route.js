import express from 'express';
import { detectIntent, fallbackResponse } from '../controllers/chatbot.controller.js';

const router = express.Router();

// Route for processing chatbot messages
router.post('/message', fallbackResponse);

// Uncomment this line when Dialogflow is properly configured
// router.post('/message', detectIntent);

export default router;