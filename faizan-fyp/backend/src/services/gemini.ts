import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/config/env';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (!env.geminiApiKey) return null;
  if (!client) client = new GoogleGenerativeAI(env.geminiApiKey);
  return client;
}

export async function generateJson<T>(params: {
  system: string;
  user: string;
}): Promise<T | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const model = c.getGenerativeModel({
      model: env.geminiModel,
      systemInstruction: params.system,
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
    });
    const res = await model.generateContent(params.user);
    const text = res.response.text();
    return JSON.parse(text) as T;
  } catch (e) {
    console.warn('[gemini] failed, falling back to null', e);
    return null;
  }
}
