import { GoogleGenAI } from "@google/genai";
import { Business, SearchResult, GroundingChunk } from "../types";

/**
 * 使用 Gemini 和 Google Search Grounding 搜索马来西亚的企业信息。
 */
export const findBusinesses = async (industry: string, location: string): Promise<SearchResult> => {
  // 确保 API_KEY 存在
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY 环境变量缺失。请在 Netlify 的 Site Configuration 中添加该变量。");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  
  const queryStr = [
    industry ? `行业: ${industry}` : '',
    location ? `地点: ${location}` : ''
  ].filter(Boolean).join(" 并且 ");

  const prompt = `
    请查找马来西亚真实且正在运营的企业列表。查询条件：${queryStr}。
    我需要查找位于该街道或地区的详细公司信息。
    
    对于每家公司，请提供：
    1. 法律全称
    2. 行业类型
    3. 联系电话 (必须是马来西亚格式，例如 +60...)
    4. 完整详细地址
    5. 官方网站（如果有）
    6. 电子邮箱（如果有）
    
    请将结果格式化为代码块中的 JSON 数组：
    \`\`\`json
    [
      { 
        "name": "公司名", 
        "industry": "行业", 
        "phone": "+60...", 
        "address": "地址", 
        "email": "邮箱", 
        "website": "网址" 
      }
    ]
    \`\`\`
    并在回答开头提供一段 2-3 句的关于该地区商业环境的简要概述。
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
    console.error("Gemini API Error:", error);
    if (error.message?.includes("401") || error.message?.includes("403")) {
      throw new Error("API 密钥验证失败。请确保 Netlify 环境变量中的 API_KEY 正确无误。");
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