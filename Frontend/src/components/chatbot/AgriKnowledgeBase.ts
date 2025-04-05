// Agricultural knowledge base for common queries
// This provides fallback responses when the API is unavailable

interface KnowledgeEntry {
  keywords: string[];
  response: {
    en: string;
    hi: string;
    mr: string;
  };
}

const agriKnowledgeBase: KnowledgeEntry[] = [
  {
    keywords: ['soil', 'health', 'मिट्टी', 'स्वास्थ्य', 'माती', 'आरोग्य'],
    response: {
      en: "To improve soil health: 1) Test your soil to understand its composition, 2) Add organic matter like compost or manure, 3) Practice crop rotation, 4) Use cover crops to prevent erosion, 5) Minimize tillage to preserve soil structure.",
      hi: "मिट्टी के स्वास्थ्य को सुधारने के लिए: 1) अपनी मिट्टी का परीक्षण करें, 2) खाद या गोबर जैसे जैविक पदार्थ जोड़ें, 3) फसल चक्र का अभ्यास करें, 4) मिट्टी के कटाव को रोकने के लिए कवर फसलों का उपयोग करें, 5) मिट्टी की संरचना को संरक्षित करने के लिए जुताई को कम करें।",
      mr: "मातीच्या आरोग्यात सुधारणा करण्यासाठी: 1) तुमच्या मातीची चाचणी करा, 2) कंपोस्ट किंवा शेणखत सारखे सेंद्रिय पदार्थ वाढवा, 3) पीक फेरपालट करा, 4) मातीची धूप रोखण्यासाठी कव्हर पिके वापरा, 5) मातीची संरचना टिकवण्यासाठी नांगरणी कमी करा."
    }
  },
  {
    keywords: ['fertilizer', 'NPK', 'उर्वरक', 'खत'],
    response: {
      en: "For balanced fertilizer use: 1) Understand NPK ratios (Nitrogen, Phosphorus, Potassium), 2) Apply based on soil test results, 3) Use organic fertilizers when possible, 4) Apply at the right time in the growing cycle, 5) Avoid over-application which can damage soil and water.",
      hi: "संतुलित उर्वरक उपयोग के लिए: 1) NPK अनुपात (नाइट्रोजन, फॉस्फोरस, पोटेशियम) को समझें, 2) मिट्टी परीक्षण परिणामों के आधार पर लागू करें, 3) जब संभव हो जैविक उर्वरकों का उपयोग करें, 4) विकास चक्र में सही समय पर लागू करें, 5) अत्यधिक उपयोग से बचें जो मिट्टी और पानी को नुकसान पहुंचा सकता है।",
      mr: "संतुलित खतांचा वापर करण्यासाठी: 1) NPK गुणोत्तर (नायट्रोजन, फॉस्फरस, पोटॅशियम) समजून घ्या, 2) माती चाचणी निकालांच्या आधारे वापरा, 3) शक्य असेल तेव्हा सेंद्रिय खते वापरा, 4) वाढीच्या चक्रात योग्य वेळी वापरा, 5) अति वापर टाळा जो माती आणि पाण्याचे नुकसान करू शकतो."
    }
  },
  {
    keywords: ['pest', 'disease', 'कीट', 'रोग', 'कीड', 'रोग'],
    response: {
      en: "For pest and disease management: 1) Practice regular crop monitoring, 2) Use resistant varieties when available, 3) Maintain field hygiene by removing diseased plants, 4) Use biological controls when possible, 5) Apply chemical controls only when necessary and follow label instructions.",
      hi: "कीट और रोग प्रबंधन के लिए: 1) नियमित फसल निगरानी का अभ्यास करें, 2) जब उपलब्ध हो तो प्रतिरोधी किस्मों का उपयोग करें, 3) रोगग्रस्त पौधों को हटाकर खेत की स्वच्छता बनाए रखें, 4) जब संभव हो जैविक नियंत्रण का उपयोग करें, 5) केवल आवश्यक होने पर ही रासायनिक नियंत्रण लागू करें और लेबल निर्देशों का पालन करें।",
      mr: "कीड आणि रोग व्यवस्थापनासाठी: 1) नियमित पीक निरीक्षण करा, 2) उपलब्ध असल्यास प्रतिकारक वाण वापरा, 3) रोगग्रस्त रोपे काढून शेताची स्वच्छता राखा, 4) शक्य असेल तेव्हा जैविक नियंत्रण वापरा, 5) फक्त आवश्यक असेल तेव्हाच रासायनिक नियंत्रण वापरा आणि लेबल निर्देशांचे पालन करा."
    }
  },
  {
    keywords: ['water', 'irrigation', 'पानी', 'सिंचाई', 'पाणी', 'सिंचन'],
    response: {
      en: "For efficient water management: 1) Use drip irrigation where possible, 2) Schedule irrigation based on crop needs and weather conditions, 3) Mulch around plants to reduce evaporation, 4) Harvest rainwater when possible, 5) Monitor soil moisture to avoid over or under watering.",
      hi: "कुशल जल प्रबंधन के लिए: 1) जहां संभव हो ड्रिप सिंचाई का उपयोग करें, 2) फसल की जरूरतों और मौसम की स्थिति के आधार पर सिंचाई का कार्यक्रम बनाएं, 3) वाष्पीकरण को कम करने के लिए पौधों के चारों ओर मल्च करें, 4) जब संभव हो वर्षा जल का संग्रह करें, 5) अधिक या कम पानी देने से बचने के लिए मिट्टी की नमी की निगरानी करें।",
      mr: "कार्यक्षम पाणी व्यवस्थापनासाठी: 1) शक्य असेल तिथे ठिबक सिंचन वापरा, 2) पिकाच्या गरजा आणि हवामान परिस्थितीनुसार सिंचनाचे नियोजन करा, 3) बाष्पीभवन कमी करण्यासाठी झाडांभोवती आच्छादन करा, 4) शक्य असेल तेव्हा पावसाचे पाणी साठवा, 5) जास्त किंवा कमी पाणी देणे टाळण्यासाठी मातीतील ओलावा तपासा."
    }
  },
  {
    keywords: ['crop', 'rotation', 'फसल', 'चक्र', 'पीक', 'फेरपालट'],
    response: {
      en: "Benefits of crop rotation: 1) Reduces pest and disease pressure, 2) Improves soil structure and fertility, 3) Helps manage weeds, 4) Reduces dependency on synthetic fertilizers, 5) Increases biodiversity in your farm ecosystem.",
      hi: "फसल चक्र के लाभ: 1) कीट और रोग के दबाव को कम करता है, 2) मिट्टी की संरचना और उर्वरता में सुधार करता है, 3) खरपतवार प्रबंधन में मदद करता है, 4) सिंथेटिक उर्वरकों पर निर्भरता कम करता है, 5) आपके खेत के पारिस्थितिकी तंत्र में जैव विविधता बढ़ाता है।",
      mr: "पीक फेरपालटीचे फायदे: 1) कीड आणि रोगांचा दबाव कमी करते, 2) मातीची संरचना आणि सुपीकता सुधारते, 3) तणांचे व्यवस्थापन करण्यास मदत करते, 4) कृत्रिम खतांवरील अवलंबित्व कमी करते, 5) तुमच्या शेती परिसंस्थेत जैवविविधता वाढवते."
    }
  },
  {
    keywords: ['market', 'price', 'बाजार', 'मूल्य', 'बाजारपेठ', 'किंमत'],
    response: {
      en: "For better market prices: 1) Stay informed about current market trends, 2) Consider direct marketing to consumers, 3) Form or join a farmer producer organization, 4) Improve post-harvest handling to maintain quality, 5) Consider value-addition to your products.",
      hi: "बेहतर बाजार मूल्य के लिए: 1) वर्तमान बाजार रुझानों के बारे में जानकारी रखें, 2) उपभोक्ताओं को सीधे विपणन पर विचार करें, 3) किसान उत्पादक संगठन बनाएं या उसमें शामिल हों, 4) गुणवत्ता बनाए रखने के लिए कटाई के बाद की हैंडलिंग में सुधार करें, 5) अपने उत्पादों के मूल्य-वर्धन पर विचार करें।",
      mr: "चांगल्या बाजारभावासाठी: 1) सध्याच्या बाजारातील कल माहिती ठेवा, 2) ग्राहकांना थेट विपणन करण्याचा विचार करा, 3) शेतकरी उत्पादक संघटना तयार करा किंवा त्यात सामील व्हा, 4) गुणवत्ता राखण्यासाठी काढणीनंतरची हाताळणी सुधारा, 5) तुमच्या उत्पादनांना मूल्यवर्धन करण्याचा विचार करा."
    }
  },
  {
    keywords: ['organic', 'farming', 'जैविक', 'खेती', 'सेंद्रिय', 'शेती'],
    response: {
      en: "For organic farming: 1) Build soil health with compost and green manures, 2) Use biological pest control methods, 3) Implement crop rotation and intercropping, 4) Use organic seeds and planting materials, 5) Maintain buffer zones between organic and conventional fields.",
      hi: "जैविक खेती के लिए: 1) कंपोस्ट और हरी खाद के साथ मिट्टी के स्वास्थ्य का निर्माण करें, 2) जैविक कीट नियंत्रण विधियों का उपयोग करें, 3) फसल चक्र और अंतर-फसल को लागू करें, 4) जैविक बीज और रोपण सामग्री का उपयोग करें, 5) जैविक और पारंपरिक खेतों के बीच बफर क्षेत्र बनाए रखें।",
      mr: "सेंद्रिय शेतीसाठी: 1) कंपोस्ट आणि हिरवळीच्या खतांनी मातीचे आरोग्य वाढवा, 2) जैविक कीड नियंत्रण पद्धती वापरा, 3) पीक फेरपालट आणि आंतरपीक पद्धती राबवा, 4) सेंद्रिय बियाणे आणि लागवड सामग्री वापरा, 5) सेंद्रिय आणि पारंपारिक शेतांमध्ये बफर झोन ठेवा."
    }
  },
  {
    keywords: ['weather', 'climate', 'मौसम', 'जलवायु', 'हवामान', 'वातावरण'],
    response: {
      en: "For weather-resilient farming: 1) Diversify crops to spread risk, 2) Use drought or flood-resistant varieties, 3) Implement water conservation practices, 4) Create windbreaks to protect crops, 5) Use weather forecasts to plan farming activities.",
      hi: "मौसम-लचीली खेती के लिए: 1) जोखिम को फैलाने के लिए फसलों में विविधता लाएं, 2) सूखा या बाढ़ प्रतिरोधी किस्मों का उपयोग करें, 3) जल संरक्षण प्रथाओं को लागू करें, 4) फसलों की रक्षा के लिए विंडब्रेक बनाएं, 5) खेती गतिविधियों की योजना बनाने के लिए मौसम पूर्वानुमान का उपयोग करें।",
      mr: "हवामान-अनुकूल शेतीसाठी: 1) धोका कमी करण्यासाठी विविध पिके घ्या, 2) दुष्काळ किंवा पूर-प्रतिरोधक वाण वापरा, 3) पाणी संवर्धन पद्धती राबवा, 4) पिकांचे संरक्षण करण्यासाठी वारा अडथळे तयार करा, 5) शेती कामांचे नियोजन करण्यासाठी हवामान अंदाज वापरा."
    }
  },
  {
    keywords: ['seed', 'variety', 'बीज', 'किस्म', 'बियाणे', 'वाण'],
    response: {
      en: "For selecting the right seeds: 1) Choose varieties suited to your local climate, 2) Consider disease and pest resistance, 3) Use certified seeds when possible, 4) Select based on market demand, 5) Save seeds from your best performing plants for future seasons.",
      hi: "सही बीज चुनने के लिए: 1) अपने स्थानीय जलवायु के अनुकूल किस्मों का चयन करें, 2) रोग और कीट प्रतिरोधकता पर विचार करें, 3) जब संभव हो प्रमाणित बीजों का उपयोग करें, 4) बाजार की मांग के आधार पर चयन करें, 5) भविष्य के मौसम के लिए अपने सबसे अच्छा प्रदर्शन करने वाले पौधों से बीज बचाएं।",
      mr: "योग्य बियाणे निवडण्यासाठी: 1) तुमच्या स्थानिक हवामानाला अनुकूल वाण निवडा, 2) रोग आणि कीड प्रतिकारकता विचारात घ्या, 3) शक्य असेल तेव्हा प्रमाणित बियाणे वापरा, 4) बाजारातील मागणीनुसार निवड करा, 5) भविष्यातील हंगामासाठी तुमच्या सर्वोत्तम कामगिरी करणाऱ्या झाडांपासून बियाणे जतन करा."
    }
  }
];

// Function to find matching knowledge entry based on query
export const findKnowledgeEntry = (query: string, language: string = 'en'): string | null => {
  const lowerQuery = query.toLowerCase();
  
  for (const entry of agriKnowledgeBase) {
    // Check if any keyword is present in the query
    if (entry.keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()))) {
      // Return response in the requested language, fallback to English
      return entry.response[language as keyof typeof entry.response] || entry.response.en;
    }
  }
  
  return null; // No matching entry found
};

// Function to get recommendations for specific crops
export const getCropSpecificInfo = (cropName: string, language: string = 'en'): string | null => {
  const cropInfo: Record<string, Record<string, string>> = {
    'rice': {
      en: "Rice cultivation tips: 1) Prepare nursery beds 5-6 weeks before transplanting, 2) Maintain 2-5 cm water level during growth, 3) Apply nitrogen fertilizer in 3 splits, 4) Monitor for blast disease and stem borers, 5) Drain field 7-10 days before harvesting.",
      hi: "चावल की खेती के टिप्स: 1) रोपाई से 5-6 सप्ताह पहले नर्सरी बेड तैयार करें, 2) विकास के दौरान 2-5 सेमी पानी का स्तर बनाए रखें, 3) नाइट्रोजन उर्वरक को 3 भागों में लागू करें, 4) ब्लास्ट रोग और तना छेदक के लिए निगरानी करें, 5) कटाई से 7-10 दिन पहले खेत से पानी निकाल दें।",
      mr: "भात लागवडीचे टिप्स: 1) लावणीपूर्वी 5-6 आठवडे आधी रोपवाटिका तयार करा, 2) वाढीच्या काळात 2-5 सेमी पाण्याची पातळी राखा, 3) नत्र खते 3 टप्प्यांत द्या, 4) करपा रोग आणि खोड किडीसाठी निरीक्षण करा, 5) कापणीपूर्वी 7-10 दिवस आधी शेतातून पाणी काढून टाका."
    },
    'wheat': {
      en: "Wheat cultivation tips: 1) Sow at optimal time for your region, 2) Ensure proper seed rate of 100-125 kg/ha, 3) First irrigation is critical at crown root initiation stage, 4) Monitor for rust diseases, 5) Harvest when grain moisture is around 12-14%.",
      hi: "गेहूं की खेती के टिप्स: 1) अपने क्षेत्र के लिए इष्टतम समय पर बुवाई करें, 2) 100-125 किग्रा/हेक्टेयर के उचित बीज दर सुनिश्चित करें, 3) क्राउन रूट आरंभ अवस्था में पहली सिंचाई महत्वपूर्ण है, 4) रस्ट रोगों के लिए निगरानी करें, 5) जब अनाज की नमी लगभग 12-14% हो तब कटाई करें।",
      mr: "गहू लागवडीचे टिप्स: 1) तुमच्या प्रदेशासाठी योग्य वेळी पेरणी करा, 2) 100-125 किलो/हेक्टर योग्य बियाणे दर सुनिश्चित करा, 3) मुकुट मुळे निर्मिती टप्प्यात पहिले पाणी महत्त्वाचे आहे, 4) तांबेरा रोगांसाठी निरीक्षण करा, 5) धान्यातील ओलावा 12-14% असताना कापणी करा."
    },
    'cotton': {
      en: "Cotton cultivation tips: 1) Plant when soil temperature is above 18°C, 2) Maintain optimal plant population of 55,000-60,000/ha, 3) Apply nitrogen in 4-5 splits, 4) Monitor for bollworms and sucking pests, 5) Pick cotton when bolls are fully open but before fiber deteriorates.",
      hi: "कपास की खेती के टिप्स: 1) जब मिट्टी का तापमान 18°C से ऊपर हो तब रोपण करें, 2) 55,000-60,000/हेक्टेयर के इष्टतम पौधे आबादी बनाए रखें, 3) नाइट्रोजन को 4-5 भागों में लागू करें, 4) बॉलवर्म और चूसने वाले कीटों के लिए निगरानी करें, 5) जब बॉल्स पूरी तरह से खुल जाएं लेकिन फाइबर खराब होने से पहले कपास चुनें।",
      mr: "कापूस लागवडीचे टिप्स: 1) जमिनीचे तापमान 18°C पेक्षा जास्त असताना लागवड करा, 2) 55,000-60,000/हेक्टर इष्ट रोप संख्या राखा, 3) नत्र खते 4-5 टप्प्यांत द्या, 4) बोंड अळी आणि रस शोषक कीडींसाठी निरीक्षण करा, 5) बोंडे पूर्णपणे उघडली असताना परंतु तंतू खराब होण्यापूर्वी कापूस वेचा."
    },
    'potato': {
      en: "Potato cultivation tips: 1) Use certified seed tubers, 2) Plant at 20-25 cm spacing in rows 60-70 cm apart, 3) Earth up plants when they reach 15-20 cm height, 4) Monitor for late blight disease, 5) Harvest when leaves turn yellow and skin is set.",
      hi: "आलू की खेती के टिप्स: 1) प्रमाणित बीज कंदों का उपयोग करें, 2) 60-70 सेमी दूर पंक्तियों में 20-25 सेमी की दूरी पर रोपण करें, 3) जब पौधे 15-20 सेमी ऊंचाई तक पहुंचें तब मिट्टी चढ़ाएं, 4) लेट ब्लाइट रोग के लिए निगरानी करें, 5) जब पत्तियां पीली हो जाएं और त्वचा सेट हो जाए तब कटाई करें।",
      mr: "बटाटा लागवडीचे टिप्स: 1) प्रमाणित बियाणे कंद वापरा, 2) 60-70 सेमी अंतराच्या रांगांमध्ये 20-25 सेमी अंतरावर लागवड करा, 3) रोपे 15-20 सेमी उंची गाठल्यावर माती चढवा, 4) करपा रोगासाठी निरीक्षण करा, 5) पाने पिवळी पडल्यावर आणि साल पक्की झाल्यावर खोदणी करा."
    }
  };
  
  const normalizedCrop = cropName.toLowerCase();
  
  for (const [crop, info] of Object.entries(cropInfo)) {
    if (normalizedCrop.includes(crop)) {
      return info[language as keyof typeof info] || info.en;
    }
  }
  
  return null; // No specific info for this crop
};

export default {
  findKnowledgeEntry,
  getCropSpecificInfo
};
