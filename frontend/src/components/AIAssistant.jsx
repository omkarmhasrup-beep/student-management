import { useState, useRef, useEffect } from 'react';
import { chatAssistant } from '../services/api';
import '../styles/ai-assistant.css';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI assistant. How can I help you manage your students today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatAssistant({ query: userMessage });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.reply || 'I am not sure how to answer that.'
      }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`ai-assistant-container ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button 
          className="ai-toggle-btn shadow-lg" 
          onClick={toggleAssistant}
          aria-label="Open AI Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M12 11h.01"></path>
            <path d="M8 11h.01"></path>
            <path d="M16 11h.01"></path>
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="ai-chat-window shadow-xl">
          <div className="ai-chat-header">
            <div className="ai-header-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkle-icon">
                <path d="M12 3v19"></path>
                <path d="M5 10h14"></path>
              </svg>
              <h3>AI Assistant</h3>
            </div>
            <button className="ai-close-btn" onClick={toggleAssistant}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="ai-chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message-wrapper ${msg.role}`}>
                <div className={`ai-message ${msg.isError ? 'error' : ''}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message-wrapper assistant">
                <div className="ai-message typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="ai-chat-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="ai-send-btn"
              disabled={!input.trim() || isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
