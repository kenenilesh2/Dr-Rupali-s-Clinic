import { GoogleGenAI } from "@google/genai";

// Access API key from process.env as per Google GenAI SDK guidelines.
// Assume process.env.API_KEY is pre-configured and available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  async getHealthAdvice(symptoms: string, diagnosis: string): Promise<string> {
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
  },

  async generateCertificateText(
    type: 'Sick' | 'Fitness', 
    patientName: string, 
    diagnosis: string, 
    daysOrDate: string,
    doctorName: string
  ): Promise<string> {
    try {
      const prompt = `
        Write the body text for a formal medical certificate.
        Type: ${type} Certificate.
        Doctor: ${doctorName} (Homeopath).
        Patient: ${patientName}.
        Diagnosis/Condition: ${diagnosis}.
        Duration/Date: ${daysOrDate}.

        Requirements:
        - Use professional, medico-legal language.
        - Do not include the header or footer (date, signature), just the body paragraphs.
        - If 'Sick', state that the patient is suffering from the condition and needs rest for the specified days from today.
        - If 'Fitness', state that the patient was suffering from the condition but is now fit to resume duties from ${daysOrDate}.
        - Keep it concise (approx 50-80 words).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "";
    } catch (error) {
      console.error("Certificate Gen Error", error);
      return "";
    }
  }
};