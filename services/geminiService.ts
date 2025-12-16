import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { WeatherData, MandiPrice, DashboardInsight } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// System instruction for the Karnataka-focused assistant
const ASSISTANT_INSTRUCTION = `
You are 'KisanSathi', an expert agricultural advisor for farmers in Karnataka, India. 
Your goal is to help Karnataka farmers (Raitha) increase income and reduce risk.
Answers must be practical and relevant to Karnataka's geography (Malnad, Bayaluseeme, Coastal).
Use Rupee symbol (₹). Mention local units like 'Gunta', 'Acre', 'Quintal'.
Focus on Karnataka crops like Ragi, Paddy, Arecanut, Sugarcane, Coffee, Cotton, Maize, Tomato, Onion.
Know about Karnataka Government schemes like Raitha Siri, Krishi Bhagya, Bele Parihara, Yeshasvini, etc.
Output in the requested language (Hindi, Kannada, or English).
When speaking Kannada, use respectful and natural farmer-friendly language.
`;

export const getGeminiResponse = async (
  prompt: string, 
  language: string,
  imagePart?: { inlineData: { data: string; mimeType: string } }
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    let langInstruction = "Answer in simple English.";
    if (language === 'hi') {
      langInstruction = "Answer in Hindi.";
    } else if (language === 'kn') {
      langInstruction = "Answer in Kannada (Kannada script). Use natural Karnataka farmer dialect.";
    }

    const contents = [];
    if (imagePart) {
      contents.push(imagePart);
      contents.push({ text: `${langInstruction} Analyze this crop image (likely from Karnataka). Identify disease/pest. Suggest remedies available in Karnataka.` });
    } else {
      contents.push({ text: `${langInstruction} ${prompt}` });
    }

    const config: any = {
      systemInstruction: ASSISTANT_INSTRUCTION,
      temperature: 0.4, 
      maxOutputTokens: 500,
    };

    if (!imagePart) {
      config.tools = [{ googleSearch: {} }];
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: { parts: contents as any },
      config: config
    });

    return response.text || "Sorry, I could not understand. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to KisanSathi server.";
  }
};

export const getDashboardInsights = async (
  lat: number, 
  lon: number, 
  crop: string, 
  district: string,
  lang: string
): Promise<DashboardInsight> => {
  try {
    const langName = lang === 'hi' ? 'Hindi' : (lang === 'kn' ? 'Kannada' : 'English');
    
    const prompt = `
      Act as a senior agri-economist for a Karnataka farmer.
      Context: District: ${district}, Location Lat:${lat}/Lon:${lon}. Main Crop: ${crop}. Date: Today.
      
      Task: Search for:
      1. Real-time weather forecast for ${district}, Karnataka.
      2. Current mandi price trends for ${crop} in Karnataka (focus on APMC markets in ${district} or nearby like Bengaluru/Hubballi/Shivamogga).
      3. Any urgent pest alerts or logistics issues in Karnataka.

      Synthesize this into a structured decision.
      Output strictly in this PIPE-SEPARATED format (no markdown):
      DECISION|COLOR|REASON|YESTERDAY_PRICE|TODAY_PRICE|TOMORROW_LOW|TOMORROW_HIGH|TREND|CONFIDENCE|WEATHER_IMPACT|NEWS
      
      Values allowed:
      - DECISION: "SELL NOW", "HOLD", "HARVEST", "PROTECT"
      - COLOR: "green", "red", "yellow", "blue"
      - REASON: 1 short sentence in ${langName}.
      - YESTERDAY_PRICE: number (e.g. 2100)
      - TODAY_PRICE: number (e.g. 2150)
      - TOMORROW_LOW: number
      - TOMORROW_HIGH: number
      - TREND: "rising", "falling", "stable"
      - CONFIDENCE: "low", "medium", "high"
      - WEATHER_IMPACT: 1 short sentence in ${langName}.
      - NEWS: 1 very short headline in ${langName}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 200,
        temperature: 0.2,
      }
    });

    const text = response.text || "";
    const parts = text.trim().split('|');

    if (parts.length >= 11) {
      return {
        decision: parts[0] as any,
        decisionColor: parts[1] as any,
        mainReason: parts[2],
        priceOutlook: {
          yesterday: parseInt(parts[3]) || 0,
          today: parseInt(parts[4]) || 0,
          tomorrowLow: parseInt(parts[5]) || 0,
          tomorrowHigh: parseInt(parts[6]) || 0,
          trend: parts[7] as any,
          confidence: parts[8] as any,
        },
        weatherImpact: parts[9],
        newsHeadline: parts[10]
      };
    }
    throw new Error("Parsing failed");
  } catch (error) {
    console.error("Dashboard Insight Error", error);
    return {
      decision: 'HOLD',
      decisionColor: 'yellow',
      mainReason: lang === 'kn' ? 'ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ, ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ.' : 'Data unavailable, holding recommended.',
      priceOutlook: { yesterday: 0, today: 0, tomorrowLow: 0, tomorrowHigh: 0, trend: 'stable', confidence: 'low' },
      weatherImpact: lang === 'kn' ? 'ಹವಾಮಾನ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.' : 'Weather update unavailable.',
      newsHeadline: ''
    };
  }
};

export const getLocalWeather = async (lat: number, lon: number, lang: string): Promise<WeatherData | null> => {
  try {
    const langName = lang === 'hi' ? 'Hindi' : (lang === 'kn' ? 'Kannada' : 'English');
    const prompt = `
      Find current weather for latitude ${lat}, longitude ${lon} (Karnataka).
      Return data in pipe-separated format:
      TEMP|CONDITION|HUMIDITY|WIND_SPEED|ADVISORY_TEXT
      
      Rules:
      - Condition and Advisory in ${langName}.
      - Advisory should be practical for Karnataka crops.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 100,
      }
    });

    const text = response.text || "";
    const parts = text.trim().split('|');
    
    if (parts.length >= 5) {
      return {
        temp: parseInt(parts[0]) || 30,
        condition: parts[1].trim(),
        humidity: parseInt(parts[2]) || 50,
        windSpeed: parseInt(parts[3]) || 10,
        advisory: parts[4].trim()
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getRealMandiPrices = async (location: string, lang: string): Promise<MandiPrice[]> => {
  try {
    const searchLoc = location.includes('Locating') ? 'Karnataka' : location;
    
    const prompt = `
      Find current mandi prices for key crops in ${searchLoc}, Karnataka.
      Prioritize: Arecanut, Ragi, Paddy, Cotton, Tomato, Onion.
      Return 4 items strictly in pipe-separated format:
      CROP|VARIETY|MARKET|PRICE|CHANGE_PERCENT|TREND
      
      Example: Arecanut|Rashi|Shivamogga|45000|2|up
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 300,
      }
    });

    const lines = (response.text || "").split('\n');
    const prices: MandiPrice[] = [];

    lines.forEach((line, index) => {
      const parts = line.split('|');
      if (parts.length >= 6) {
        prices.push({
          id: index.toString(),
          crop: parts[0].trim(),
          variety: parts[1].trim(),
          market: parts[2].trim(),
          price: parseInt(parts[3]) || 0,
          change: parseFloat(parts[4]) || 0,
          trend: (parts[5].trim().toLowerCase() as 'up'|'down'|'stable') || 'stable',
          date: new Date().toLocaleDateString(),
          arrivalVolume: 'medium'
        });
      }
    });

    return prices;
  } catch (error) {
    console.error("Price fetch failed", error);
    return [];
  }
};

export const getSchemeRecommendations = async (profile: string, lang: string): Promise<string> => {
  try {
    const langName = lang === 'hi' ? 'Hindi' : (lang === 'kn' ? 'Kannada' : 'English');
    const prompt = `
      User Profile: ${profile}, State: Karnataka.
      Recommend 3 government schemes (Karnataka State or Central) eligible for this farmer.
      Prioritize Karnataka schemes like Raitha Siri, Krishi Bhagya, Yashasvini, etc.
      Output in ${langName}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 400,
      }
    });

    return response.text || "No schemes found.";
  } catch (error) {
    return "Error finding schemes.";
  }
};

export const getMandiNews = async (lang: string): Promise<string> => {
  try {
    const langName = lang === 'hi' ? 'Hindi' : (lang === 'kn' ? 'Kannada' : 'English');
    const prompt = `
      Search latest agriculture news in Karnataka.
      Focus on MSP, rainfall in Malnad/North Karnataka, or APMC updates.
      Output in ${langName}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 300,
      }
    });

    return response.text || "No news available.";
  } catch (error) {
    return "News unavailable currently.";
  }
};

export const getMarketAdvisory = async (
  crop: string, 
  price: number, 
  trend: string, 
  weatherCtx: string, 
  lang: string
): Promise<string> => {
  try {
    const langName = lang === 'hi' ? 'Hindi' : (lang === 'kn' ? 'Kannada' : 'English');
    const prompt = `
      Advisor for Karnataka Farmer.
      Crop: ${crop}, Price: ₹${price}, Trend: ${trend}, Weather: ${weatherCtx}.
      Give advice in ${langName}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: { maxOutputTokens: 150 }
    });

    return response.text || "Advice unavailable.";
  } catch (error) {
    return "Advice unavailable.";
  }
};