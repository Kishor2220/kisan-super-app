import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { WeatherData, MandiPrice } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// System instruction for the general assistant
const ASSISTANT_INSTRUCTION = `
You are 'KisanSathi', an expert agricultural advisor for Indian farmers. 
Your goal is to help small and marginal farmers increase income and reduce risk.
Answers must be practical, concise, and culturally relevant to India.
Use Rupee symbol (₹). Mention local units like 'Bigha' or 'Acre' where relevant.
If asked about prices, clarify these are estimates or recent trends found online.
If asked about schemes, focus on PM-KISAN, KCC, Fasal Bima Yojana, etc.
Always be encouraging and respectful.
Output in the requested language (Hindi or English).
`;

export const getGeminiResponse = async (
  prompt: string, 
  language: string,
  imagePart?: { inlineData: { data: string; mimeType: string } }
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    const langInstruction = language === 'hi' 
      ? "Answer in Hindi (Devanagari script). Keep it simple for a rural audience." 
      : "Answer in simple English.";

    const contents = [];
    if (imagePart) {
      contents.push(imagePart);
      contents.push({ text: `${langInstruction} Analyze this crop image. Identify disease/pest if any. Suggest low-cost Indian remedies (chemical and organic).` });
    } else {
      contents.push({ text: `${langInstruction} ${prompt}` });
    }

    const config: any = {
      systemInstruction: ASSISTANT_INSTRUCTION,
      temperature: 0.4, 
      maxOutputTokens: 500,
    };

    // Add search tool for text-only queries to provide up-to-date info
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
    return "Error connecting to KisanSathi server. Please check your internet.";
  }
};

export const getMarketAdvisory = async (
  crop: string,
  currentPrice: number,
  predictedTrend: string,
  weatherCondition: string,
  language: string
): Promise<string> => {
  try {
    const prompt = `
    Context: Indian Farmer Market Decision.
    Crop: ${crop}
    Current Price: ₹${currentPrice}
    Tomorrow's Trend: ${predictedTrend}
    Weather: ${weatherCondition}
    
    Task: Give 1 sentence of actionable advice. Should he sell now or wait? 
    Example: "Since rain is coming and prices are dropping, harvest and sell today."
    ${language === 'hi' ? "Output in Hindi." : "Output in English."}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: { temperature: 0.3, maxOutputTokens: 100 }
    });

    return response.text || "Market is volatile. Please check locally.";
  } catch (e) {
    return "Advisory unavailable offline.";
  }
};

export const getMandiNews = async (language: string): Promise<string> => {
  try {
    const prompt = language === 'hi' 
      ? "Find the latest agricultural market news for onion, tomato, and cotton in Maharashtra, India. Summarize 3 key headlines in Hindi."
      : "Find the latest agricultural market news for onion, tomato, and cotton in Maharashtra, India. Summarize 3 key headlines.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 300,
      }
    });

    return response.text || "News unavailable.";
  } catch (error) {
    console.error("News Fetch Error", error);
    return "Could not fetch live news.";
  }
};

export const getLocalWeather = async (lat: number, lon: number, lang: string): Promise<WeatherData | null> => {
  try {
    const prompt = `
      Find current weather for latitude ${lat}, longitude ${lon}.
      Return the data in this specific pipe-separated format:
      TEMP|CONDITION|HUMIDITY|WIND_SPEED|ADVISORY_TEXT
      
      Example:
      32|Sunny|45|12|Wear a hat
      
      Rules:
      - Temp in Celsius (just number)
      - Humidity in % (just number)
      - Wind speed in km/h (just number)
      - Condition in ${lang === 'hi' ? 'Hindi' : 'English'}
      - Advisory in ${lang === 'hi' ? 'Hindi' : 'English'} (Max 10 words, practical farming advice like 'Good for spraying' or 'Delay irrigation')
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
    const cleanText = text.trim();
    const parts = cleanText.split('|');
    
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
    console.error("Weather fetch failed", error);
    return null;
  }
};

// Fetches real-time prices using Search Grounding and parses into MandiPrice objects
export const getRealMandiPrices = async (location: string, lang: string): Promise<MandiPrice[]> => {
  try {
    // If location is generic, default to a major agri state for better results
    const searchLoc = location.includes('Locating') ? 'Maharashtra' : location;
    
    const prompt = `
      Find current mandi prices for Onion, Cotton, Soybean, and Tomato in ${searchLoc}, India.
      Return 4 items strictly in this pipe-separated format:
      CROP|VARIETY|MARKET|PRICE|CHANGE_PERCENT|TREND
      
      Rules:
      - Price in ₹ per Quintal (number only)
      - Change percent (number only, e.g. 5 or -2). If unknown, guess based on trend.
      - Trend must be 'up', 'down', or 'stable'
      - Variety example: 'Red', 'Hybrid', 'Local'
      - Example line: Onion|Red|Lasalgaon|2400|5|up
      - Do not add markdown formatting.
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
          arrivalVolume: 'medium' // Defaulting as this is hard to scrape consistently in one go
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
    const prompt = `
      User Profile: ${profile}
      Based on this Indian farmer's profile, recommend 3 specific government schemes they are eligible for.
      For each scheme, provide: 
      1. Scheme Name
      2. One line benefit (e.g., "₹6000/year")
      3. One line how to apply.
      
      Output in ${lang === 'hi' ? 'Hindi' : 'English'}. Keep it simple and encouraging.
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