import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const GeminiService = {
  isAvailable: !!ai,

  async getHealthAdvice(symptoms: string, diagnosis: string): Promise<string> {
    if (!ai) return "AI Service not configured.";
    
    try {
      const prompt = `
        You are a helpful medical assistant for a Homeopathy doctor (BHMS). 
        The patient has the following symptoms: "${symptoms}".
        The doctor's diagnosis is: "${diagnosis}".
        
        Please provide 3 short, bulleted lifestyle or dietary recommendations for the patient to speed up recovery. 
        Keep it friendly and professional. Do not prescribe medicine.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "No advice generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Could not generate advice at this time.";
    }
  },

  async summarizeNotes(rawNotes: string): Promise<string> {
    if (!ai) return rawNotes;

    try {
      const prompt = `
        Summarize the following clinical notes into a concise, professional medical format suitable for a patient history record.
        Notes: "${rawNotes}"
      `;
       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || rawNotes;
    } catch (error) {
       return rawNotes;
    }
  }
};