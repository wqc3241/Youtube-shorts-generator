
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
      Identify 4 potential "Shorts" segments that would be highly engaging.
      Shorts should be between 15 and 60 seconds long.
      Return a list of candidates with catchy titles and brief descriptions of why they are viral material.
      Focus on hooks, key moments, or high-energy transitions.
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
                confidence: { type: Type.NUMBER, description: "Confidence score 0-100" }
              },
              required: ["title", "startTime", "endTime", "description", "confidence"]
            }
          }
        }
      });

      const rawData = JSON.parse(response.text || "[]");
      
      return rawData.map((item: any, index: number) => ({
        id: `short-${Date.now()}-${index}`,
        title: item.title,
        startTime: Math.min(item.startTime, duration - 15),
        endTime: Math.min(item.endTime, duration),
        duration: Math.abs(item.endTime - item.startTime),
        description: item.description,
        confidence: item.confidence,
        status: 'pending'
      }));
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      // Fallback dummy data if API fails
      return this.getFallbackCandidates(duration);
    }
  }

  private getFallbackCandidates(duration: number): ShortsCandidate[] {
    return [
      {
        id: 'fb-1',
        title: "The Ultimate Hook",
        startTime: 10,
        endTime: 40,
        duration: 30,
        description: "High energy intro that immediately grabs attention.",
        confidence: 95,
        status: 'pending'
      },
      {
        id: 'fb-2',
        title: "Key Takeaway",
        startTime: duration * 0.4,
        endTime: duration * 0.4 + 25,
        duration: 25,
        description: "The most informative part of the video summarized.",
        confidence: 88,
        status: 'pending'
      }
    ];
  }
}
