import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { text: "Hello! I'm your shopping assistant. How can I help you today?", isBot: true }
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chatbot/message', {
        message: inputMessage
      });

      if (response.data && response.data.reply) {
        setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "I'm sorry, I couldn't process your request. Please try again later.", 
          isBot: true 
        }]);
      }
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.", 
        isBot: true 
      }]);
      toast.error('Failed to get response from chatbot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chatbot Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
          aria-label="Open chatbot"
        >
          <FaRobot size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 md:w-96 h-96 flex flex-col">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <FaRobot className="mr-2" />
              <span className="font-semibold">Shopping Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
              aria-label="Close chatbot"
            >
              <FaTimes />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  message.isBot ? 'text-left' : 'text-right'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-3">
                <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t p-3">
            <div className="flex">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 text-white rounded-r-lg px-4 py-2 hover:bg-blue-700 disabled:bg-blue-300"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;