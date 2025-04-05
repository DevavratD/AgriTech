import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createChatSession,
  type ChatSession,
  getAgriRecommendations
} from '../../services/chatbotService';

interface ChatbotContextType {
  session: ChatSession;
  setSession: React.Dispatch<React.SetStateAction<ChatSession>>;
  language: string;
  setLanguage: (code: string) => void;
  getRecommendation: (topic: string) => Promise<string>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

interface ChatbotProviderProps {
  children: React.ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  // Try to get the language from localStorage, default to 'en'
  const savedLanguage = localStorage.getItem('krishiMitra-language') || 'en';
  const [session, setSession] = useState<ChatSession>(createChatSession(savedLanguage));
  
  // Update the session when language changes
  const setLanguage = (code: string) => {
    localStorage.setItem('krishiMitra-language', code);
    setSession(prev => ({
      ...prev,
      language: code
    }));
  };
  
  // Get a recommendation on a specific topic
  const getRecommendation = async (topic: string): Promise<string> => {
    try {
      // First check local knowledge base for common agricultural queries
      const localResponse = await getAgriRecommendations(topic, session.language);
      return localResponse;
    } catch (error) {
      console.error('Error getting recommendation:', error);
      
      // Return a helpful error message in the appropriate language
      const errorMessages: Record<string, string> = {
        en: "I'm sorry, I couldn't process your request due to a technical issue. Please try asking about soil health, crop recommendations, or market prices which I can help with locally.",
        hi: "मुझे खेद है, तकनीकी समस्या के कारण मैं आपके अनुरोध को संसाधित नहीं कर सका। कृपया मिट्टी के स्वास्थ्य, फसल अनुशंसाओं, या बाजार मूल्यों के बारे में पूछें जिनमें मैं स्थानीय रूप से मदद कर सकता हूं।",
        mr: "मला माफ करा, तांत्रिक समस्येमुळे मी तुमच्या विनंतीवर प्रक्रिया करू शकलो नाही. कृपया मातीच्या आरोग्याबद्दल, पीक शिफारसींबद्दल किंवा बाजार किंमतींबद्दल विचारा ज्यात मी स्थानिक स्तरावर मदत करू शकतो."
      };
      
      return errorMessages[session.language] || errorMessages.en;
    }
  };
  
  // Save chat session to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('krishiMitra-chat-session', JSON.stringify(session));
    } catch (error) {
      console.error('Error saving chat session to localStorage:', error);
    }
  }, [session]);
  
  // Load chat session from localStorage on initial render
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('krishiMitra-chat-session');
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        // Convert string timestamps back to Date objects
        parsedSession.messages = parsedSession.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setSession(parsedSession);
      }
    } catch (error) {
      console.error('Error loading chat session from localStorage:', error);
    }
  }, []);
  
  const value = {
    session,
    setSession,
    language: session.language,
    setLanguage,
    getRecommendation
  };
  
  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotProvider;
