/**
 * WAV(RIFF) 읽기 (P11-2 · LAB-DATA-01). 순수 함수. PCM 정수 8 · 16 · 24 · 32비트와 실수 32 · 64비트, 여러 채널.
 * 정수는 전체 눈금을 ±1로 바꾼다 — 실제 단위(g 등)는 기록 장비의 감도로 따로 정한다.
 */

export interface WavData {
  fs: number;
  bits: number;
  float: boolean;
  channels: Float64Array[];
}

const tag = (v: DataView, off: number) => String.fromCharCode(v.getUint8(off), v.getUint8(off + 1), v.getUint8(off + 2), v.getUint8(off + 3));

export function parseWav(bytes: ArrayBuffer | Uint8Array): WavData {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (buf.length < 12 || tag(v, 0) !== 'RIFF' || tag(v, 8) !== 'WAVE') throw new Error('WAV(RIFF) 파일이 아닙니다');
  let off = 12;
  let fmt: { format: number; ch: number; fs: number; bits: number } | null = null;
  let dataOff = -1;
  let dataLen = 0;
  while (off + 8 <= buf.length) {
    const id = tag(v, off);
    const size = v.getUint32(off + 4, true);
    const body = off + 8;
    if (id === 'fmt ') {
      let format = v.getUint16(body, true);
      const ch = v.getUint16(body + 2, true);
      const fs = v.getUint32(body + 4, true);
      const bits = v.getUint16(body + 14, true);
      // WAVE_FORMAT_EXTENSIBLE: 하위 형식 GUID의 앞 2바이트가 실제 형식
      if (format === 0xfffe && size >= 26) format = v.getUint16(body + 24, true);
      fmt = { format, ch, fs, bits };
    } else if (id === 'data') {
      dataOff = body;
      dataLen = Math.min(size, buf.length - body);
    }
    off = body + size + (size % 2);
  }
  if (!fmt) throw new Error('WAV의 fmt 덩어리가 없습니다');
  if (dataOff < 0) throw new Error('WAV의 data 덩어리가 없습니다');
  const { format, ch, fs, bits } = fmt;
  const float = format === 3;
  if (format !== 1 && format !== 3) throw new Error(`지원하지 않는 WAV 형식(${format}) — PCM 정수 또는 실수만 읽습니다`);
  const bytesPer = bits / 8;
  const frames = Math.floor(dataLen / (bytesPer * ch));
  const channels = Array.from({ length: ch }, () => new Float64Array(frames));
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < ch; c++) {
      const p = dataOff + (i * ch + c) * bytesPer;
      let x: number;
      if (float) x = bits === 64 ? v.getFloat64(p, true) : v.getFloat32(p, true);
      else if (bits === 8) x = (v.getUint8(p) - 128) / 128;
      else if (bits === 16) x = v.getInt16(p, true) / 32768;
      else if (bits === 24) {
        const raw = v.getUint8(p) | (v.getUint8(p + 1) << 8) | (v.getUint8(p + 2) << 16);
        x = (raw & 0x800000 ? raw - 0x1000000 : raw) / 8388608;
      } else if (bits === 32) x = v.getInt32(p, true) / 2147483648;
      else throw new Error(`지원하지 않는 비트 수 ${bits}`);
      channels[c][i] = x;
    }
  }
  return { fs, bits, float, channels };
}
