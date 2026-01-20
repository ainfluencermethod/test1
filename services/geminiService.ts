import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ManifestoContent } from "../types";

// Fallback content in case of API failure or missing key
const FALLBACK_MANIFESTO: ManifestoContent = {
  headline: "DOSTOP OMEJEN",
  subtext: "Kapsula 001 je zaklenjena. Pridruži se čakalni listi za 24-urni zgodnji dostop. Omejeno na 500 kosov po vsem svetu. Ne zamudi.",
  tagline: "ODKLENI TREZOR"
};

export const generateHypeContent = async (): Promise<ManifestoContent> => {
  // Safe access for browser environments where process might not be defined
  const apiKey = typeof process !== 'undefined' ? process.env?.API_KEY : undefined;

  if (!apiKey) {
    console.warn("API Key missing, using fallback content.");
    return FALLBACK_MANIFESTO;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING, description: "A high-urgency, 2-4 word headline in Slovenian indicating the store is locked or exclusive." },
        subtext: { type: Type.STRING, description: "One powerful sentence in Slovenian driving FOMO (Fear Of Missing Out) to get them to sign up for early access." },
        tagline: { type: Type.STRING, description: "A short, commanding call-to-action in Slovenian to enter email." }
      },
      required: ["headline", "subtext", "tagline"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Write high-conversion hype copy for a streetwear brand 'Cultured's landing page in Slovenian language. Goal: collect emails. Vibe: Gen Z, Underground, Exclusive, 'Internet Money'. The store is locked. The copy must create intense FOMO (Fear Of Missing Out).",
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 1.1 
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ManifestoContent;
    }
    
    return FALLBACK_MANIFESTO;
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return FALLBACK_MANIFESTO;
  }
};