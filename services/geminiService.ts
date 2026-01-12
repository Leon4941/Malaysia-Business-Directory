
import { GoogleGenAI } from "@google/genai";
import { Business, SearchResult, GroundingChunk } from "../types";

/**
 * Safely retrieves the API key from the environment.
 */
const getApiKey = (): string => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    console.error("Environment variable process.env.API_KEY is not accessible.");
    return "";
  }
};

/**
 * Searches for businesses in Malaysia using Gemini with Google Search grounding.
 */
export const findBusinesses = async (industry: string, location: string): Promise<SearchResult> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable in your deployment settings.");
  }

  // Initialize client inside the function to ensure the latest key is used.
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  
  const queryParts = [];
  if (industry) queryParts.push(`industry: "${industry}"`);
  if (location) queryParts.push(`location: "${location}"`);
  const queryStr = queryParts.join(" and ");

  const prompt = `
    Find a list of real businesses in Malaysia matching: ${queryStr}.
    Provide details for at least 15-20 businesses if possible.
    
    For each business, include:
    1. Name
    2. Industry
    3. Phone (with local prefix)
    4. Full Address
    5. Email
    6. Website
    
    Return the data as a JSON array in a block:
    \`\`\`json
    [
      { "name": "...", "industry": "...", "phone": "...", "address": "...", "email": "...", "website": "..." }
    ]
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "No response text found.";
    const rawChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[]) || [];
    const businesses = extractBusinessesFromText(text);

    return {
      text,
      businesses,
      sources: rawChunks as GroundingChunk[],
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("The provided API Key is invalid. Please check your Google AI Studio settings.");
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
      console.warn("JSON parsing failed", e);
    }
  }
  return [];
}
