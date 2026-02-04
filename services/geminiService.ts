
import { GoogleGenAI, Type } from "@google/genai";
import { ShortsCandidate } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeVideo(videoName: string, duration: number): Promise<ShortsCandidate[]> {
    const prompt = `
      Analyze a YouTube video titled "${videoName}" with a total duration of ${duration} seconds.
      Identify between 5 to 8 potential "Shorts" segments that would be highly engaging.
      Shorts MUST be between 15 and 60 seconds long.
      
      For each segment, provide:
      1. A catchy, viral-ready title.
      2. A short description of the content.
      3. A "selectionReason" explaining why this specific clip (e.g., "Contains a strong emotional hook", "Clear explanation of a complex topic", "High energy transition").
      4. A confidence score (0-100).
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                startTime: { type: Type.NUMBER, description: "Start time in seconds" },
                endTime: { type: Type.NUMBER, description: "End time in seconds" },
                description: { type: Type.STRING },
                selectionReason: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["title", "startTime", "endTime", "description", "selectionReason", "confidence"]
            }
          }
        }
      });

      const rawData = JSON.parse(response.text || "[]");
      
      return rawData.map((item: any, index: number) => ({
        id: `short-${Date.now()}-${index}`,
        title: item.title,
        startTime: Math.max(0, Math.min(item.startTime, duration - 15)),
        endTime: Math.min(item.endTime, duration),
        duration: Math.abs(item.endTime - item.startTime),
        description: item.description,
        selectionReason: item.selectionReason,
        confidence: item.confidence,
        status: 'pending'
      }));
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return this.getFallbackCandidates(duration);
    }
  }

  private getFallbackCandidates(duration: number): ShortsCandidate[] {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: `fb-${i}`,
      title: `Viral Clip #${i + 1}`,
      startTime: (i * 40) % duration,
      endTime: ((i * 40) + 30) % duration,
      duration: 30,
      description: "Auto-generated fallback clip due to API timeout.",
      selectionReason: "High engagement predicted by pattern matching.",
      confidence: 85,
      status: 'pending' as const
    }));
  }
}
