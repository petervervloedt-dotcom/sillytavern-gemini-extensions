
import { GoogleGenAI, Type } from "@google/genai";
import { Message, LoreEntry } from "../types";

const getModel = (task: 'vision' | 'lore' | 'brainstorm' | 'chat') => {
  const keyMap = {
    vision: 'visionModel',
    lore: 'loreModel',
    brainstorm: 'brainstormModel',
    chat: 'chatModel'
  };
  const defaultModels = {
    vision: 'gemini-3-flash-preview',
    lore: 'gemini-3-flash-preview',
    brainstorm: 'gemini-3-pro-preview',
    chat: 'gemini-3-flash-preview'
  };
  return localStorage.getItem(keyMap[task]) || defaultModels[task];
};

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

/**
 * Generates a lore entry for SillyTavern.
 */
export async function generateLoreEntry(prompt: string): Promise<LoreEntry> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: getModel('lore'),
    contents: `Generate a SillyTavern compatible Lorebook entry for: ${prompt}. 
    Return a JSON object with keys: "name" (string), "keys" (array of trigger keywords), and "content" (the actual lore description).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          keys: { type: Type.ARRAY, items: { type: Type.STRING } },
          content: { type: Type.STRING }
        },
        required: ["name", "keys", "content"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as LoreEntry;
  } catch (e) {
    throw new Error("Failed to parse lore generation");
  }
}

/**
 * Analyzes roleplay images (characters or settings) specifically for the main app view.
 */
export async function analyzeRoleplayImage(
  base64Image: string, 
  mimeType: string, 
  mode: 'character' | 'setting'
): Promise<string> {
  const ai = getGeminiClient();
  const prompt = mode === 'character' 
    ? "Analyze this character art. Provide a detailed SillyTavern-style character description including physical traits, clothing, and suggested personality based on the visual cues."
    : "Analyze this setting image. Provide a vivid, sensory-rich scene description for a roleplaying game context.";

  const response = await ai.models.generateContent({
    model: getModel('vision'),
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt }
      ]
    }
  });
  return response.text || "No analysis available.";
}

/**
 * Generic image analysis for the Extension Drawer.
 */
export async function analyzeImage(
  base64Image: string, 
  mimeType: string, 
  prompt: string
): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: getModel('vision'),
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt }
      ]
    }
  });
  return response.text || "No analysis available.";
}

/**
 * Suggests plot hooks based on chat history.
 */
export async function suggestPlotHooks(history: string): Promise<string[]> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: getModel('brainstorm'),
    contents: `Based on this roleplay history, suggest 3 distinct and exciting plot hooks or next actions: \n\n${history}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
}

/**
 * Sends a message in a chat context.
 */
export async function sendChatMessage(messages: Message[], systemInstruction: string): Promise<string> {
  const ai = getGeminiClient();
  
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const response = await ai.models.generateContent({
    model: getModel('chat'),
    contents,
    config: {
      systemInstruction,
    }
  });

  return response.text || "";
}
