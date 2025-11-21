// Audio utilities for the chatbot
export const decode = (base64Audio: string): ArrayBuffer => {
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Prepend WAV header to raw LPCM data
  const sampleRate = 24000; // From mimeType: rate=24000
  const numChannels = 1; // Assuming mono for speech
  const bitDepth = 16; // From mimeType: L16

  const headerSize = 44; // Standard WAV header size
  const totalSize = headerSize + len; // Total size of WAV file
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // RIFF chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // FMT sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // DATA sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, len, true); // Subchunk2Size (data size)

  // Write PCM data
  for (let i = 0; i < len; i++) {
    view.setUint8(headerSize + i, bytes[i]);
  }

  return buffer;
};

// Helper function to write string to DataView
const writeString = (view: DataView, offset: number, str: string) => {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
};

export const decodeAudioData = (base64Audio: string, audioContext: AudioContext): Promise<AudioBuffer> => {
  return new Promise((resolve, reject) => {
    const audioData = decode(base64Audio);
    audioContext.decodeAudioData(audioData, resolve, reject);
  });
};