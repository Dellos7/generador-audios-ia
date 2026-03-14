import { GoogleGenAI, Modality } from "@google/genai";

export async function generateSpeech(
  apiKey: string,
  text: string,
  voiceName: string,
  voiceDescription: string,
  accent: string,
  style: string,
  speed: string,
  pitch: number
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Por favor, lee el siguiente texto siguiendo estrictamente estas indicaciones de voz:
- Acento: ${accent}
- Estilo: ${style}
- Velocidad: ${speed}
- Tono: ${pitch}/100 (0 es muy grave, 100 es muy agudo)
- Tipo de voz: ${voiceDescription}

Instrucciones para etiquetas (si aparecen en el texto):
[pausa] = haz una pausa de unos 2 segundos
[risa] = ríete de forma natural
[grito] = habla de forma enérgica, exclamativa y en voz alta
[llanto] = simula un breve llanto
[suspiro] = haz un sonido de suspiro
[tos] = tose brevemente

Texto a leer:
"""
${text}
"""`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No se pudo generar el audio");
  }

  return base64Audio;
}
