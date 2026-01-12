
import { GoogleGenAI, Type } from "@google/genai";
import { Business, SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const findBusinesses = async (industry: string, location: string): Promise<SearchResult> => {
  const model = 'gemini-3-flash-preview';
  
  const queryParts = [];
  if (industry) queryParts.push(`industry: "${industry}"`);
  if (location) queryParts.push(`location: "${location}"`);
  const queryStr = queryParts.join(" and ");

  const prompt = `
    Search extensively and find a COMPREHENSIVE list of businesses in Malaysia matching these criteria: ${queryStr}.
    
    Please do not limit yourself to just 10 results. Try to find as many as possible (aim for 20-30 if available) across different business directories, maps, and official websites.
    
    For each business, please provide:
    1. Business Name
    2. Specific Industry/Category
    3. Contact Phone Number (include area code)
    4. Full Address (including Postcode and State)
    5. Official Email Address (Very Important: search specifically for their contact email)
    6. Website URL
    
    IMPORTANT: 
    - Focus strictly on businesses located in Malaysia.
    - Present an exhaustive detailed summary in text first, grouped by sub-areas if applicable.
    - Provide the full structured data for ALL found businesses in a valid JSON array at the end of your response inside a \`\`\`json code block.
    - Each JSON object must have fields: "name", "industry", "phone", "address", "email", "website".
    - If a specific field is not found, use an empty string or null.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Increasing temperature slightly can sometimes help with variety, 
        // but grounding usually works better with lower temperature for accuracy.
        temperature: 0.7,
      },
    });

    const text = response.text || "No data found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const businesses = extractBusinessesFromText(text);

    return {
      text,
      businesses,
      sources,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

function extractBusinessesFromText(text: string): Business[] {
  const jsonMatch = text.match(/```json\s+([\s\S]*?)\s+```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return Array.isArray(parsed) ? parsed : (parsed.businesses || []);
    } catch (e) {
      console.warn("Failed to parse inner JSON", e);
    }
  }
  return [];
}
