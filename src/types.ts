export interface AudioRecord {
  id: string;
  text: string;
  audioBase64: string;
  createdAt: number;
  settings: {
    voice: string;
    accent: string;
    style: string;
    speed: string;
    pitch: number;
  };
}

export const VOICES = [
  { id: "mujer_1", name: "Mujer 1 (Joven)", baseVoice: "Kore", desc: "voz de mujer joven" },
  { id: "mujer_2", name: "Mujer 2 (Adulta)", baseVoice: "Zephyr", desc: "voz de mujer adulta" },
  { id: "mujer_3", name: "Mujer 3 (Grave)", baseVoice: "Kore", desc: "voz de mujer con tono grave" },
  { id: "mujer_4", name: "Mujer 4 (Aguda)", baseVoice: "Zephyr", desc: "voz de mujer con tono agudo" },
  { id: "mujer_5", name: "Mujer 5 (Madura)", baseVoice: "Kore", desc: "voz de mujer mayor" },
  { id: "hombre_1", name: "Hombre 1 (Joven)", baseVoice: "Puck", desc: "voz de hombre joven" },
  { id: "hombre_2", name: "Hombre 2 (Adulto)", baseVoice: "Charon", desc: "voz de hombre adulto" },
  { id: "hombre_3", name: "Hombre 3 (Grave)", baseVoice: "Fenrir", desc: "voz de hombre con tono muy grave" },
  { id: "hombre_4", name: "Hombre 4 (Agudo)", baseVoice: "Puck", desc: "voz de hombre con tono agudo" },
  { id: "hombre_5", name: "Hombre 5 (Maduro)", baseVoice: "Charon", desc: "voz de hombre mayor" },
];

export const ACCENTS = ["España", "México", "Argentina"];

export const STYLES = ["Natural", "Alegre", "Triste", "Susurrar", "Storyteller"];

export const SPEEDS = ["Muy lenta", "Lenta", "Normal", "Rápida", "Muy rápida"];

export const TAGS = [
  { tag: "[pausa]", desc: "Pausa de 2s" },
  { tag: "[risa]", desc: "Risa breve" },
  { tag: "[grito]", desc: "Grito/Enérgico" },
  { tag: "[llanto]", desc: "Llanto breve" },
  { tag: "[suspiro]", desc: "Suspiro" },
  { tag: "[tos]", desc: "Tos" }
];
