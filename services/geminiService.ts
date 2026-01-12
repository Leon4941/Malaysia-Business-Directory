
import { GoogleGenAI } from "@google/genai";
import { Business, SearchResult, GroundingChunk } from "../types";

/**
 * Searches for businesses in Malaysia using Gemini with Google Search grounding.
 */
export const findBusinesses = async (industry: string, location: string): Promise<SearchResult> => {
  // 按照规则，自动使用 process.env.API_KEY
  const apiKey = process.env.API_KEY || "";
  
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  
  const queryStr = [
    industry ? `industry: ${industry}` : '',
    location ? `location: ${location}` : ''
  ].filter(Boolean).join(" and ");

  const prompt = `
    Find a list of real and currently operating businesses in Malaysia for the following criteria: ${queryStr}.
    I am specifically looking for details on businesses located on this street or in this area.
    
    For each business, provide:
    1. Legal Name
    2. Industry Type
    3. Contact Phone (Must be in Malaysia format, e.g., +60...)
    4. Exact Mailing Address in Malaysia
    5. Website URL if available
    6. Business Email if available
    
    Format the results as a JSON array inside a code block:
    \`\`\`json
    [
      { 
        "name": "Full Business Name", 
        "industry": "Category", 
        "phone": "+60...", 
        "address": "Full Address", 
        "email": "email@example.com", 
        "website": "https://..." 
      }
    ]
    \`\`\`
    Also provide a brief 2-3 sentence overview of the business landscape in this area at the start of your response.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const businesses = extractBusinessesFromText(text);

    return {
      text,
      businesses,
      sources: rawChunks as GroundingChunk[],
    };
  } catch (error: any) {
    // 如果没有 API Key 或 Key 无效，抛出更具引导性的错误
    if (!apiKey || error.message?.includes("401") || error.message?.includes("403")) {
      throw new Error("API configuration missing or invalid. Please ensure the API_KEY is set in your deployment environment and you have triggered a new deploy.");
    }
    throw error;
  }
};

function extractBusinessesFromText(text: string): Business[] {
  const jsonMatch = text.match(/```json\s+([\s\S]*?)\s+```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Could not parse business JSON", e);
    }
  }
  return [];
}
