
/**
 * Adds a WAV header to raw PCM data.
 * Gemini TTS returns raw PCM (16-bit, 24kHz, Mono).
 */
export function addWavHeader(base64Pcm: string, sampleRate: number = 24000): string {
  // Check if it already has a RIFF header (starts with 'UklGR' in base64)
  if (base64Pcm.startsWith('UklGR')) {
    return base64Pcm;
  }

  const binaryString = atob(base64Pcm);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + len, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, len, true);

  const combined = new Uint8Array(44 + len);
  combined.set(new Uint8Array(wavHeader), 0);
  combined.set(bytes, 44);

  return uint8ArrayToBase64(combined);
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  const chunks = [];
  const chunkSize = 0xffff;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    // @ts-ignore
    chunks.push(String.fromCharCode.apply(null, uint8Array.subarray(i, i + chunkSize)));
  }
  return btoa(chunks.join(''));
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
