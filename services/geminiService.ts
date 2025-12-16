import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// System instruction for the general assistant
const ASSISTANT_INSTRUCTION = `
You are 'KisanSathi', an expert agricultural advisor for Indian farmers. 
Your goal is to help small and marginal farmers increase income and reduce risk.
Answers must be practical, concise, and culturally relevant to India.
Use Rupee symbol (₹). Mention local units like 'Bigha' or 'Acre' where relevant.
If asked about prices, clarify these are estimates.
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
    const modelId = imagePart ? 'gemini-2.5-flash' : 'gemini-2.5-flash';
    
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

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: { parts: contents as any }, // Type casting for mixed content parts
      config: {
        systemInstruction: ASSISTANT_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more factual advice
        maxOutputTokens: 500,
      }
    });

    return response.text || "Sorry, I could not understand. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to KisanSathi server. Please check your internet.";
  }
};
