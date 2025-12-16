import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

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

// New function to generate specific market advice based on structured data
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