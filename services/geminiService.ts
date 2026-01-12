
import { GoogleGenAI, Type } from "@google/genai";
import { Business, SearchResult, GroundingChunk } from "../types";

/**
 * Searches for businesses in Malaysia using Gemini with Google Search grounding.
 * Uses gemini-3-flash-preview for real-time search capabilities.
 */
export const findBusinesses = async (industry: string, location: string): Promise<SearchResult> => {
  // Initialize the GoogleGenAI client with the API key from process.env.
  // We create a new instance inside the function to ensure it uses the latest key from the context.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    - Provide the full structured data for ALL found businesses in a valid JSON array inside a \`\`\`json code block.
    - Each JSON object must have fields: "name", "industry", "phone", "address", "email", "website".
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

    // Use the .text property directly (not as a method) to access the generated text content.
    const text = response.text || "No data found.";
    
    // Explicitly cast to any[] and then to our local GroundingChunk[] to avoid type definition conflicts 
    // between the SDK's internal types and our local interface.
    const rawChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[]) || [];
    const businesses = extractBusinessesFromText(text);

    return {
      text,
      businesses,
      sources: rawChunks as GroundingChunk[],
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Helper to extract JSON data from the model's text response.
 */
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
