import apiClient from './apiService';
import { findKnowledgeEntry, getCropSpecificInfo } from '../components/chatbot/AgriKnowledgeBase';

// Define supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' }
];

// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  language: string;
}

// Get context for different languages - agricultural focus
const getContextForLanguage = (languageCode: string): string => {
  const contexts: Record<string, string> = {
    en: `You are KrishiMitra, an AI assistant specializing in agriculture for Indian farmers. 
    Your goal is to provide practical farming advice, crop recommendations, and soil health insights.
    Keep your responses concise, practical, and tailored to Indian agricultural conditions.
    If you don't know something, admit it rather than making up information.
    Focus on sustainable farming practices when possible.`,
    
    hi: `आप कृषिमित्र हैं, भारतीय किसानों के लिए कृषि में विशेषज्ञता वाले एक AI सहायक हैं।
    आपका लक्ष्य व्यावहारिक खेती सलाह, फसल अनुशंसाएँ और मिट्टी के स्वास्थ्य के बारे में जानकारी प्रदान करना है।
    अपने जवाबों को संक्षिप्त, व्यावहारिक और भारतीय कृषि परिस्थितियों के अनुरूप रखें।
    अगर आपको कुछ नहीं पता है, तो जानकारी बनाने के बजाय इसे स्वीकार करें।
    जब संभव हो तो टिकाऊ खेती प्रथाओं पर ध्यान दें।`,
    
    mr: `तुम्ही कृषिमित्र आहात, भारतीय शेतकऱ्यांसाठी शेतीमध्ये विशेषज्ञता असलेले एक AI सहाय्यक.
    तुमचे उद्दिष्ट व्यावहारिक शेती सल्ला, पीक शिफारसी आणि मातीच्या आरोग्याबद्दल अंतर्दृष्टी प्रदान करणे आहे.
    तुमची उत्तरे संक्षिप्त, व्यावहारिक आणि भारतीय शेती परिस्थितींनुसार ठेवा.
    तुम्हाला काही माहित नसेल तर माहिती तयार करण्याऐवजी ते मान्य करा.
    शक्य असेल तेव्हा शाश्वत शेती पद्धतींवर लक्ष केंद्रित करा.`
  };
  
  return contexts[languageCode] || contexts.en;
};

// Get context for different languages - general assistant focus
const getGeneralContextForLanguage = (languageCode: string): string => {
  const contexts: Record<string, string> = {
    en: `You are KrishiMitra AI, a versatile assistant that can help with both agricultural and general questions.
    While you specialize in agriculture, you can also provide helpful information on a wide range of topics.
    Be informative, accurate, and concise in your responses.
    If you don't know something, admit it rather than making up information.
    For non-agricultural questions, provide helpful responses while mentioning your agricultural expertise.`,
    
    hi: `आप कृषिमित्र AI हैं, एक बहुमुखी सहायक जो कृषि और सामान्य प्रश्नों दोनों में मदद कर सकते हैं।
    हालांकि आप कृषि में विशेषज्ञ हैं, आप विषयों की एक विस्तृत श्रृंखला पर भी उपयोगी जानकारी प्रदान कर सकते हैं।
    अपने उत्तरों में जानकारीपूर्ण, सटीक और संक्षिप्त रहें।
    अगर आपको कुछ नहीं पता है, तो जानकारी बनाने के बजाय इसे स्वीकार करें।
    गैर-कृषि प्रश्नों के लिए, अपनी कृषि विशेषज्ञता का उल्लेख करते हुए उपयोगी उत्तर प्रदान करें।`,
    
    mr: `तुम्ही कृषिमित्र AI आहात, एक बहुआयामी सहाय्यक जो शेती आणि सामान्य प्रश्न दोन्हींमध्ये मदत करू शकतो.
    तुम्ही शेतीमध्ये विशेषज्ञ असताना, तुम्ही विषयांच्या विस्तृत श्रेणीवर देखील उपयुक्त माहिती प्रदान करू शकता.
    तुमच्या प्रतिसादांमध्ये माहितीपूर्ण, अचूक आणि संक्षिप्त रहा.
    तुम्हाला काही माहित नसेल तर माहिती तयार करण्याऐवजी ते मान्य करा.
    अशेती प्रश्नांसाठी, तुमच्या शेती विशेषज्ञतेचा उल्लेख करून उपयुक्त प्रतिसाद द्या.`
  };
  
  return contexts[languageCode] || contexts.en;
};

// Create a new chat session
export const createChatSession = (languageCode: string = 'en'): ChatSession => {
  return {
    id: generateId(),
    messages: [],
    language: languageCode
  };
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Send a message to the Gemini API and get a response
export const sendMessage = async (
  session: ChatSession,
  message: string
): Promise<ChatSession> => {
  try {
    // Add user message to session
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage]
    };
    
    // Check for greetings first
    const greetingResponse = checkForGreeting(message, session.language);
    if (greetingResponse) {
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: greetingResponse,
        timestamp: new Date()
      };
      
      return {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage]
      };
    }
    
    // Check for local knowledge base answers
    const localKnowledgeAnswer = findKnowledgeEntry(message, session.language);
    const cropSpecificInfo = getCropSpecificInfo(message, session.language);
    
    // If we have a local answer, use it instead of calling the API
    if (localKnowledgeAnswer || cropSpecificInfo) {
      const answer = localKnowledgeAnswer || cropSpecificInfo;
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: answer as string,
        timestamp: new Date()
      };
      
      return {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage]
      };
    }
    
    // Determine if the query is agricultural or general
    const isAgriQuery = isAgricultureRelated(message);

    // Get language-specific context based on query type
    const context = isAgriQuery 
      ? getContextForLanguage(session.language)
      : getGeneralContextForLanguage(session.language);

    // Prepare conversation history for context
    const conversationHistory = updatedSession.messages
      .slice(-10) // Only use last 10 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    // Get Gemini API key
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found');
    }
    
    // Helper function to add assistant message to session
    const addAssistantMessageToSession = (currentSession: ChatSession, content: string): ChatSession => {
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: content,
        timestamp: new Date()
      };
      
      return {
        ...currentSession,
        messages: [...currentSession.messages, assistantMessage]
      };
    };
    
    // Prepare a robust fallback response in case API fails
    const getFallbackResponse = () => {
      // Check if we can generate a contextual response based on the message
      if (message.toLowerCase().includes('weather') || message.toLowerCase().includes('forecast')) {
        return getWeatherFallbackMessage(session.language);
      } else if (message.toLowerCase().includes('soil') || message.toLowerCase().includes('मिट्टी') || message.toLowerCase().includes('माती')) {
        return getSoilFallbackMessage(session.language);
      } else if (message.toLowerCase().includes('crop') || message.toLowerCase().includes('फसल') || message.toLowerCase().includes('पीक')) {
        return getCropFallbackMessage(session.language);
      } else {
        return getErrorMessage(session.language);
      }
    };

    // Try calling Gemini API with error handling
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${context}\n\nConversation history:\n${conversationHistory}\n\nUser's latest message: ${message}\n\nPlease respond in ${getSupportedLanguageName(session.language)}.`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024
            }
          })
        }
      );
      
      // Check if response is ok
      if (!response.ok) {
        console.error(`API response not OK: ${response.status} ${response.statusText}`);
        return addAssistantMessageToSession(updatedSession, getFallbackResponse());
      }
      
      const data = await response.json();
      
      // Extract the assistant's response
      let assistantResponse = '';
      
      // Check if data has the expected structure
      if (data && data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        assistantResponse = data.candidates[0].content.parts[0].text;
      } else {
        console.warn('Unexpected API response structure:', JSON.stringify(data));
        assistantResponse = getFallbackResponse();
      }
      
      return addAssistantMessageToSession(updatedSession, assistantResponse);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return addAssistantMessageToSession(updatedSession, getFallbackResponse());
    }
    
    // This code is unreachable now since we're returning from the try/catch block
    // but we'll keep it as a fallback just in case
    return addAssistantMessageToSession(updatedSession, getErrorMessage(session.language));
  } catch (error) {
    console.error('Error sending message to Gemini API:', error);
    
    // Add error message
    const errorMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: getErrorMessage(session.language),
      timestamp: new Date()
    };
    
    return {
      ...session,
      messages: [...session.messages, errorMessage]
    };
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

// Get weather fallback message based on language
const getWeatherFallbackMessage = (languageCode: string): string => {
  const messages: Record<string, string> = {
    en: "I can provide general weather information for farming. For accurate forecasts, please check a weather service. In general, monitor rainfall patterns, temperature changes, and seasonal variations to plan your farming activities accordingly.",
    hi: "मैं खेती के लिए सामान्य मौसम जानकारी प्रदान कर सकता हूं। सटीक पूर्वानुमान के लिए, कृपया मौसम सेवा की जांच करें। सामान्य तौर पर, अपनी खेती गतिविधियों की योजना बनाने के लिए वर्षा पैटर्न, तापमान परिवर्तन और मौसमी बदलाव पर नजर रखें।",
    mr: "मी शेतीसाठी सामान्य हवामान माहिती प्रदान करू शकतो. अचूक अंदाजासाठी, कृपया हवामान सेवा तपासा. सामान्यतः, तुमच्या शेती क्रियाकलापांचे नियोजन करण्यासाठी पावसाचे पॅटर्न, तापमानातील बदल आणि हंगामी बदलांवर लक्ष ठेवा."
  };
  
  return messages[languageCode] || messages.en;
};

// Get soil fallback message based on language
const getSoilFallbackMessage = (languageCode: string): string => {
  const messages: Record<string, string> = {
    en: "Healthy soil is crucial for good crop yields. Regular soil testing is recommended to check nutrient levels (N, P, K), pH, and organic matter content. Based on test results, you can apply appropriate fertilizers and amendments to improve soil health.",
    hi: "अच्छी फसल उपज के लिए स्वस्थ मिट्टी महत्वपूर्ण है। पोषक तत्वों (N, P, K), pH, और जैविक पदार्थ सामग्री की जांच के लिए नियमित मिट्टी परीक्षण की सिफारिश की जाती है। परीक्षण परिणामों के आधार पर, आप मिट्टी के स्वास्थ्य को सुधारने के लिए उपयुक्त उर्वरक और संशोधन लागू कर सकते हैं।",
    mr: "चांगल्या पीक उत्पादनासाठी निरोगी माती महत्त्वाची आहे. पोषक पातळी (N, P, K), pH आणि सेंद्रिय पदार्थांची सामग्री तपासण्यासाठी नियमित माती चाचणीची शिफारस केली जाते. चाचणीच्या निकालांच्या आधारे, तुम्ही मातीचे आरोग्य सुधारण्यासाठी योग्य खते आणि दुरुस्ती लावू शकता."
  };
  
  return messages[languageCode] || messages.en;
};

// Get crop fallback message based on language
const getCropFallbackMessage = (languageCode: string): string => {
  const messages: Record<string, string> = {
    en: "For successful crop cultivation, consider factors like soil type, climate, water availability, and market demand. Proper seed selection, timely planting, regular monitoring for pests and diseases, and appropriate fertilization are key practices for good yields.",
    hi: "सफल फसल खेती के लिए, मिट्टी के प्रकार, जलवायु, पानी की उपलब्धता और बाजार मांग जैसे कारकों पर विचार करें। उचित बीज चयन, समय पर रोपण, कीटों और बीमारियों के लिए नियमित निगरानी, और उपयुक्त उर्वरकता अच्छी उपज के लिए प्रमुख प्रथाएं हैं।",
    mr: "यशस्वी पीक लागवडीसाठी, मातीचा प्रकार, हवामान, पाण्याची उपलब्धता आणि बाजारपेठेची मागणी यासारख्या घटकांचा विचार करा. योग्य बियाणे निवड, वेळेवर लागवड, कीटक आणि रोगांसाठी नियमित देखरेख आणि योग्य खतांचा वापर हे चांगल्या उत्पादनासाठी महत्त्वाचे आहेत."
  };
  
  return messages[languageCode] || messages.en;
};

// Get language name from code
const getSupportedLanguageName = (code: string): string => {
  const language = supportedLanguages.find(lang => lang.code === code);
  return language ? language.name : 'English';
};

// Check if a message is a greeting and return an appropriate response
const checkForGreeting = (message: string, languageCode: string): string | null => {
  const normalizedMessage = message.toLowerCase().trim();
  
  // Common greetings in different languages
  const greetings: Record<string, string[]> = {
    en: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy', 'what\'s up'],
    hi: ['नमस्ते', 'नमस्कार', 'हैलो', 'हाय', 'सुप्रभात', 'शुभ दोपहर', 'शुभ संध्या', 'प्रणाम'],
    mr: ['नमस्कार', 'नमस्ते', 'हॅलो', 'सुप्रभात', 'शुभ दुपार', 'शुभ संध्याकाळ']
  };
  
  // Check if the message is a greeting in any language
  const isGreeting = Object.values(greetings).flat().some(greeting => 
    normalizedMessage === greeting || normalizedMessage.startsWith(greeting + ' ')
  );
  
  if (isGreeting) {
    // Return appropriate greeting response based on language
    const greetingResponses: Record<string, string> = {
      en: "Hello! I'm KrishiMitra, your agricultural assistant. How can I help you today with farming, crop recommendations, or any other questions?",
      hi: "नमस्ते! मैं कृषिमित्र हूं, आपका कृषि सहायक। आज मैं खेती, फसल अनुशंसाओं, या किसी अन्य प्रश्न के साथ आपकी कैसे मदद कर सकता हूं?",
      mr: "नमस्कार! मी कृषिमित्र आहे, तुमचा कृषी सहाय्यक. आज मी शेती, पीक शिफारसी, किंवा इतर कोणत्याही प्रश्नांसह तुमची कशी मदत करू शकतो?"
    };
    
    return greetingResponses[languageCode] || greetingResponses.en;
  }
  
  return null;
};

// Check if a query is related to agriculture
const isAgricultureRelated = (query: string): boolean => {
  const normalizedQuery = query.toLowerCase();
  
  // List of agriculture-related keywords
  const agricultureKeywords = [
    // Crops and farming
    'crop', 'farm', 'harvest', 'plant', 'seed', 'soil', 'fertilizer', 'pesticide',
    'irrigation', 'cultivation', 'agriculture', 'field', 'yield', 'organic', 'sowing',
    
    // Specific crops
    'rice', 'wheat', 'maize', 'corn', 'cotton', 'sugarcane', 'potato', 'tomato',
    'onion', 'pulse', 'lentil', 'vegetable', 'fruit', 'millet', 'sorghum', 'barley',
    
    // Weather and seasons
    'monsoon', 'rainfall', 'drought', 'climate', 'season', 'rabi', 'kharif', 'zaid',
    
    // Pests and diseases
    'pest', 'disease', 'fungus', 'bacteria', 'virus', 'insect', 'weed', 'blight',
    'rot', 'infestation',
    
    // Equipment and technology
    'tractor', 'plow', 'plough', 'thresher', 'harvester', 'sprayer', 'drip',
    
    // Market and economics
    'mandi', 'market', 'price', 'msp', 'subsidy', 'loan', 'kisan', 'farmer',
    
    // Hindi/regional terms
    'खेती', 'किसान', 'फसल', 'बीज', 'मिट्टी', 'खाद', 'सिंचाई', 'कृषि',
    'शेती', 'शेतकरी', 'पीक', 'बियाणे', 'माती', 'खत', 'सिंचन'
  ];
  
  // Check if any agriculture keyword is present in the query
  return agricultureKeywords.some(keyword => normalizedQuery.includes(keyword));
};

// Translate text using Gemini API
export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found');
    }
    
    const targetLanguageName = getSupportedLanguageName(targetLanguage);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate the following text to ${targetLanguageName}:\n\n"${text}"\n\nOnly provide the translation, nothing else.`
                }
              ]
            }
          ]
        })
      }
    );
    
    const data = await response.json();
    
    try {
      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Error parsing translation response:', error);
      return text; // Return original text if translation fails
    }
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Return original text if translation fails
  }
};

// Get recommendations based on a specific topic - handles both agricultural and general questions
export const getAgriRecommendations = async (
  topic: string,
  languageCode: string = 'en'
): Promise<string> => {
  try {
    // First check if we have a local knowledge base answer for agricultural topics
    const localKnowledgeAnswer = findKnowledgeEntry(topic, languageCode);
    const cropSpecificInfo = getCropSpecificInfo(topic, languageCode);
    
    // If we have a local answer, use it instead of calling the API
    if (localKnowledgeAnswer || cropSpecificInfo) {
      return localKnowledgeAnswer || cropSpecificInfo as string;
    }
    
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found');
    }
    
    const targetLanguageName = getSupportedLanguageName(languageCode);
    
    // Determine if the query is agricultural or general
    const isAgricultureQuery = isAgricultureRelated(topic);
    
    // Create a fallback response based on the topic
    const getFallbackRecommendation = () => {
      if (topic.toLowerCase().includes('weather') || topic.toLowerCase().includes('forecast')) {
        return getWeatherFallbackMessage(languageCode);
      } else if (topic.toLowerCase().includes('soil') || topic.toLowerCase().includes('मिट्टी') || topic.toLowerCase().includes('माती')) {
        return getSoilFallbackMessage(languageCode);
      } else if (topic.toLowerCase().includes('crop') || topic.toLowerCase().includes('फसल') || topic.toLowerCase().includes('पीक')) {
        return getCropFallbackMessage(languageCode);
      } else {
        return getErrorMessage(languageCode);
      }
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: isAgricultureQuery ? 
                    `You are an agricultural expert specializing in farming practices in India. 
                    Provide a detailed recommendation about ${topic} for farmers. 
                    Your response should be practical, actionable, and specific to Indian agricultural conditions.
                    Please respond in ${targetLanguageName} language.` :
                    `You are KrishiMitra AI, a helpful assistant for farmers and general users.
                    Please answer the following question: ${topic}
                    Be informative, accurate, and helpful. If the question is not related to agriculture,
                    still provide a helpful response while mentioning that you specialize in agricultural topics.
                    Please respond in ${targetLanguageName} language.`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024
            }
          })
        }
      );
      
      // Check if response is ok
      if (!response.ok) {
        console.error(`API response not OK: ${response.status} ${response.statusText}`);
        return getFallbackRecommendation();
      }
      
      const data = await response.json();
      
      // Extract the recommendation with proper error handling
      if (data && data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.warn('Unexpected API response structure:', JSON.stringify(data));
        return getFallbackRecommendation();
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return getFallbackRecommendation();
    }
    
  } catch (error) {
    console.error('Error getting agricultural recommendations:', error);
    return getErrorMessage(languageCode);
  }
};
