import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Material, WordAnalysis, GrammarAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

export const generateMaterials = async (category: string, difficulty: string): Promise<Material[]> => {
  const prompt = `Generate 3 short English learning materials (approx 150-200 words for demo purposes, but assume they represent a 15 min clip) for category: ${category} and difficulty: ${difficulty}. 
  Content should be interesting, grammatically standard, and suitable for learning.
  
  Return ONLY valid JSON array with objects containing: id (unique string), title, category, difficulty, duration (e.g. "15:00"), content (full text), source (e.g. "Simulated BBC").`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              duration: { type: Type.STRING },
              content: { type: Type.STRING },
              source: { type: Type.STRING },
            },
            required: ["id", "title", "category", "difficulty", "duration", "content"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Material[];
  } catch (error) {
    console.error("Error generating materials:", error);
    return [];
  }
};

export const explainWordInChinese = async (word: string, contextSentence: string): Promise<WordAnalysis | null> => {
  const prompt = `Explain the English word "${word}" in Chinese, based on this context: "${contextSentence}". Return JSON.`;
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            definition: { type: Type.STRING, description: "Chinese definition" },
            partOfSpeech: { type: Type.STRING },
            example: { type: Type.STRING, description: "A simple example sentence" }
          },
          required: ["word", "definition", "partOfSpeech"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as WordAnalysis;
  } catch (error) {
    console.error("Error explaining word:", error);
    return null;
  }
};

export const analyzeGrammarInChinese = async (sentence: string): Promise<GrammarAnalysis | null> => {
  const prompt = `Analyze the grammar structure of this English sentence for a learner. Explain in Chinese. Keep it concise (under 100 words). Sentence: "${sentence}"`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentence: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "Grammar analysis in Chinese" }
          },
          required: ["sentence", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as GrammarAnalysis;
  } catch (error) {
    console.error("Error analyzing grammar:", error);
    return null;
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};