// Language utilities for the KrishiMitra application

import { supportedLanguages } from '../services/chatbotService';

/**
 * Detects the most likely language from a text input
 * This is a simple implementation that checks for character patterns
 * For production, consider using a more robust library
 */
export const detectLanguage = (text: string): string => {
  // Default to English
  if (!text || text.trim().length === 0) return 'en';
  
  const normalizedText = text.toLowerCase();
  
  // Check for Devanagari script (Hindi)
  if (/[\u0900-\u097F]/.test(normalizedText)) {
    return 'hi';
  }
  
  // Check for Bengali script
  if (/[\u0980-\u09FF]/.test(normalizedText)) {
    return 'bn';
  }
  
  // Check for Telugu script
  if (/[\u0C00-\u0C7F]/.test(normalizedText)) {
    return 'te';
  }
  
  // Check for Tamil script
  if (/[\u0B80-\u0BFF]/.test(normalizedText)) {
    return 'ta';
  }
  
  // Check for Kannada script
  if (/[\u0C80-\u0CFF]/.test(normalizedText)) {
    return 'kn';
  }
  
  // Check for Gujarati script
  if (/[\u0A80-\u0AFF]/.test(normalizedText)) {
    return 'gu';
  }
  
  // Check for Punjabi (Gurmukhi) script
  if (/[\u0A00-\u0A7F]/.test(normalizedText)) {
    return 'pa';
  }
  
  // Check for Marathi (uses Devanagari script but with specific words)
  // This is a simplification - in reality Marathi detection would need more context
  if (/[\u0900-\u097F]/.test(normalizedText) && 
      (normalizedText.includes('आहे') || 
       normalizedText.includes('माझा') || 
       normalizedText.includes('तुमचा'))) {
    return 'mr';
  }
  
  // Default to English for Latin script
  return 'en';
};

/**
 * Gets the language name from a language code
 */
export const getLanguageName = (code: string): string => {
  const language = supportedLanguages.find(lang => lang.code === code);
  return language ? language.name : 'English';
};

/**
 * Gets common agricultural terms in different languages
 */
export const getAgriTerms = (languageCode: string = 'en'): Record<string, string> => {
  const terms: Record<string, Record<string, string>> = {
    crop: {
      en: 'crop',
      hi: 'फसल',
      mr: 'पीक',
      bn: 'ফসল',
      te: 'పంట',
      ta: 'பயிர்',
      kn: 'ಬೆಳೆ',
      gu: 'પાક',
      pa: 'ਫਸਲ'
    },
    soil: {
      en: 'soil',
      hi: 'मिट्टी',
      mr: 'माती',
      bn: 'মাটি',
      te: 'నేల',
      ta: 'மண்',
      kn: 'ಮಣ್ಣು',
      gu: 'માટી',
      pa: 'ਮਿੱਟੀ'
    },
    water: {
      en: 'water',
      hi: 'पानी',
      mr: 'पाणी',
      bn: 'জল',
      te: 'నీరు',
      ta: 'நீர்',
      kn: 'ನೀರು',
      gu: 'પાણી',
      pa: 'ਪਾਣੀ'
    },
    fertilizer: {
      en: 'fertilizer',
      hi: 'उर्वरक',
      mr: 'खत',
      bn: 'সার',
      te: 'ఎరువు',
      ta: 'உரம்',
      kn: 'ಗೊಬ್ಬರ',
      gu: 'ખાતર',
      pa: 'ਖਾਦ'
    },
    weather: {
      en: 'weather',
      hi: 'मौसम',
      mr: 'हवामान',
      bn: 'আবহাওয়া',
      te: 'వాతావరణం',
      ta: 'வானிலை',
      kn: 'ಹವಾಮಾನ',
      gu: 'હવામાન',
      pa: 'ਮੌਸਮ'
    }
  };
  
  const result: Record<string, string> = {};
  
  Object.keys(terms).forEach(term => {
    result[term] = terms[term][languageCode as keyof typeof terms[typeof term]] || terms[term].en;
  });
  
  return result;
};

/**
 * Gets quick question suggestions based on language
 */
export const getQuickQuestions = (languageCode: string = 'en'): string[] => {
  const questions: Record<string, string[]> = {
    en: [
      "How to improve soil health?",
      "Best practices for water conservation?",
      "How to deal with common crop diseases?",
      "Recommended fertilizers for my crops?",
      "Weather-resistant farming techniques?"
    ],
    hi: [
      "मिट्टी के स्वास्थ्य को कैसे सुधारें?",
      "पानी संरक्षण के लिए सर्वोत्तम प्रथाएं?",
      "सामान्य फसल रोगों से कैसे निपटें?",
      "मेरी फसलों के लिए अनुशंसित उर्वरक?",
      "मौसम प्रतिरोधी खेती तकनीक?"
    ],
    mr: [
      "मातीचे आरोग्य कसे सुधारावे?",
      "पाणी संवर्धनासाठी सर्वोत्तम पद्धती?",
      "सामान्य पीक रोगांशी कसे सामना करावे?",
      "माझ्या पिकांसाठी शिफारस केलेली खते?",
      "हवामान-प्रतिरोधक शेती तंत्रे?"
    ]
  };
  
  return questions[languageCode as keyof typeof questions] || questions.en;
};

export default {
  detectLanguage,
  getLanguageName,
  getAgriTerms,
  getQuickQuestions
};
