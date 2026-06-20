import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

export const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function generateAIResponse(prompt: string): Promise<string> {
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  return response.text ?? '';
}

export async function generateJSONResponse<T>(prompt: string): Promise<T> {
  const fullPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation. Just the JSON object.`;

  const raw = await generateAIResponse(fullPrompt);

  // Strip any markdown code fences if present
  const cleaned = raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();

  return JSON.parse(cleaned) as T;
}
