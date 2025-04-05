import React, { useRef, useEffect, useState } from 'react';
import { 
  supportedLanguages,
  type Message
} from '../../services/chatbotService';
import { useChatbot } from './ChatbotProvider';
import { getQuickQuestions, detectLanguage } from '../../utils/languageUtils';
import ChatMessage from './ChatMessage';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '../ui/sheet';
import { Loader2, Send, MessageSquare, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

const Chatbot: React.FC = () => {
  // Use the chatbot context instead of local state
  const { session, setSession, language, setLanguage, getRecommendation } = useChatbot();
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Welcome message when session starts
  useEffect(() => {
    if (session.messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: getWelcomeMessage(session.language),
        timestamp: new Date()
      };
      
      setSession(prev => ({
        ...prev,
        messages: [welcomeMessage]
      }));
    }
  }, [session.language, setSession]);
  
  // Auto-detect language from user input
  useEffect(() => {
    if (autoDetectLanguage && inputValue.length > 5) {
      const detectedLang = detectLanguage(inputValue);
      if (detectedLang !== session.language) {
        setLanguage(detectedLang);
      }
    }
  }, [inputValue, autoDetectLanguage, session.language, setLanguage]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;
    
    setIsLoading(true);
    const userInput = inputValue;
    setInputValue('');
    
    try {
      // Add user message to session
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userInput,
        timestamp: new Date()
      };
      
      const updatedSessionWithUserMsg = {
        ...session,
        messages: [...session.messages, userMessage]
      };
      
      setSession(updatedSessionWithUserMsg);
      
      // Get AI response
      const aiResponse = await getRecommendation(userInput);
      
      // Add AI response to session
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: getErrorMessage(session.language),
        timestamp: new Date()
      };
      
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get error message based on language
  const getErrorMessage = (languageCode: string): string => {
    const errorMessages: Record<string, string> = {
      en: "I'm sorry, I couldn't process your request. Please try again later.",
      hi: "मुझे खेद है, मैं आपके अनुरोध को संसाधित नहीं कर सका। कृपया बाद में पुनः प्रयास करें।",
      mr: "मला माफ करा, मी तुमच्या विनंतीवर प्रक्रिया करू शकलो नाही. कृपया नंतर पुन्हा प्रयत्न करा."
    };
    
    return errorMessages[languageCode] || errorMessages.en;
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleLanguageChange = (value: string) => {
    // Update the language in the context
    setLanguage(value);
    setAutoDetectLanguage(false); // Turn off auto-detection when manually selected
  };
  
  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const getWelcomeMessage = (languageCode: string): string => {
    const welcomeMessages: Record<string, string> = {
      en: "Hello! I'm KrishiMitra AI, your agricultural assistant. How can I help you today with farming, crops, soil health, or market information?",
      hi: "नमस्ते! मैं कृषिमित्र AI हूँ, आपका कृषि सहायक। आज मैं खेती, फसलों, मिट्टी के स्वास्थ्य, या बाजार की जानकारी के बारे में आपकी कैसे मदद कर सकता हूँ?",
      mr: "नमस्कार! मी कृषिमित्र AI आहे, तुमचा कृषी सहाय्यक. शेती, पिके, मातीचे आरोग्य किंवा बाजारपेठेची माहिती याबाबत मी आज तुमची कशी मदत करू शकतो?"
    };
    
    return welcomeMessages[languageCode] || welcomeMessages.en;
  };
  
  // Get quick questions based on current language
  const getCurrentQuickQuestions = () => {
    return getQuickQuestions(session.language);
  };
  
  return (
    <>
      {/* Floating chat button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        <SheetContent 
          side="right" 
          className="w-full sm:w-[400px] p-0 flex flex-col h-[100dvh]"
        >
          <SheetHeader className="px-4 py-3 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  AI
                </Badge>
                <SheetTitle>KrishiMitra Chatbot</SheetTitle>
              </div>
              
              <Select 
                value={language} 
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {session.messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
              
              {/* Quick questions */}
              {session.messages.length <= 2 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {getCurrentQuickQuestions().map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  session.language === 'en' 
                    ? "Type your message..." 
                    : session.language === 'hi'
                    ? "अपना संदेश लिखें..."
                    : "तुमचा संदेश टाइप करा..."
                }
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={inputValue.trim() === '' || isLoading}
                size="icon"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="autoDetectLang" 
                  checked={autoDetectLanguage}
                  onChange={(e) => setAutoDetectLanguage(e.target.checked)}
                  className="h-3 w-3"
                />
                <label htmlFor="autoDetectLang" className="text-xs cursor-pointer">
                  {language === 'en' ? "Auto-detect language" : 
                   language === 'hi' ? "भाषा स्वतः पहचानें" : 
                   "भाषा स्वयं ओळखा"}
                </label>
              </div>
              <div>
                {language === 'en' 
                  ? "Powered by Gemini AI" 
                  : language === 'hi'
                  ? "Gemini AI द्वारा संचालित"
                  : "Gemini AI द्वारे संचालित"}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Chatbot;
