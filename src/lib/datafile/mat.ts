/**
 * MATLAB MAT 파일 읽기 (P11-2 · LAB-DATA-01, D-052). 순수 함수 — 파일 바이트만 받아 숫자 배열을 돌려준다(서버 전송 없음).
 * - Level 5 (MATLAB 5.0 ~ v7, `save -v6`·`-v7`): 숫자 행렬(실수부)만 꺼낸다. 압축된 원소(miCOMPRESSED)는 zlib을 풀어 읽는다.
 * - Level 4 (옛 형식): 숫자 행렬만.
 * - v7.3(HDF5)·문자·셀·구조체·희소 행렬은 건너뛴다 (v7.3은 오류로 알린다).
 * 형식: MathWorks "MAT-File Format" 문서(Level 5 data element·tag·array flags 구조).
 */

export interface MatArray {
  name: string;
  /** 'double' · 'single' · 'int16' … */
  className: string;
  /** 행 × 열 (그 이상 차원도 그대로) */
  dims: number[];
  /** 열 우선(column-major) 실수부 */
  data: Float64Array;
}

/** zlib(deflate) 풀기. 기본은 브라우저·Node의 DecompressionStream('deflate') */
export type Inflate = (bytes: Uint8Array) => Promise<Uint8Array>;

export async function defaultInflate(bytes: Uint8Array): Promise<Uint8Array> {
  const DS = (globalThis as { DecompressionStream?: new (format: string) => TransformStream<Uint8Array, Uint8Array> }).DecompressionStream;
  if (!DS) throw new Error('이 브라우저는 압축된 MAT 파일을 풀 수 없습니다 (DecompressionStream 없음). MATLAB에서 save -v6으로 다시 저장해 주세요.');
  const stream = new Blob([Uint8Array.from(bytes)]).stream().pipeThrough(new DS('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const MI = {
  INT8: 1,
  UINT8: 2,
  INT16: 3,
  UINT16: 4,
  INT32: 5,
  UINT32: 6,
  SINGLE: 7,
  DOUBLE: 9,
  INT64: 12,
  UINT64: 13,
  MATRIX: 14,
  COMPRESSED: 15,
  UTF8: 16,
} as const;

const CLASS_NAME: Record<number, string> = {
  1: 'cell',
  2: 'struct',
  3: 'object',
  4: 'char',
  5: 'sparse',
  6: 'double',
  7: 'single',
  8: 'int8',
  9: 'uint8',
  10: 'int16',
  11: 'uint16',
  12: 'int32',
  13: 'uint32',
  14: 'int64',
  15: 'uint64',
};
const NUMERIC_CLASS = new Set([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

const BYTES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 4, 6: 4, 7: 4, 9: 8, 12: 8, 13: 8 };

/** 숫자 원소를 Float64Array로 */
function readNumbers(v: DataView, off: number, nbytes: number, type: number, le: boolean): Float64Array {
  const size = BYTES[type];
  if (!size) throw new Error(`지원하지 않는 숫자 형식 ${type}`);
  const n = Math.floor(nbytes / size);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const p = off + i * size;
    switch (type) {
      case MI.INT8: out[i] = v.getInt8(p); break;
      case MI.UINT8: out[i] = v.getUint8(p); break;
      case MI.INT16: out[i] = v.getInt16(p, le); break;
      case MI.UINT16: out[i] = v.getUint16(p, le); break;
      case MI.INT32: out[i] = v.getInt32(p, le); break;
      case MI.UINT32: out[i] = v.getUint32(p, le); break;
      case MI.SINGLE: out[i] = v.getFloat32(p, le); break;
      case MI.DOUBLE: out[i] = v.getFloat64(p, le); break;
      case MI.INT64: out[i] = Number(v.getBigInt64(p, le)); break;
      case MI.UINT64: out[i] = Number(v.getBigUint64(p, le)); break;
    }
  }
  return out;
}

interface Tag {
  type: number;
  nbytes: number;
  data: number;
  next: number;
}

/** 원소 태그: 작은 원소(4바이트 안에 자료)면 한 줄 8바이트, 아니면 8바이트 태그 + 8바이트 경계로 맞춘 자료 */
function readTag(v: DataView, off: number, le: boolean): Tag {
  const first = v.getUint32(off, le);
  const small = first >>> 16;
  if (small !== 0) return { type: first & 0xffff, nbytes: small, data: off + 4, next: off + 8 };
  const nbytes = v.getUint32(off + 4, le);
  return { type: first, nbytes, data: off + 8, next: off + 8 + Math.ceil(nbytes / 8) * 8 };
}

function readName(v: DataView, t: Tag): string {
  let s = '';
  for (let i = 0; i < t.nbytes; i++) {
    const c = v.getUint8(t.data + i);
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s;
}

/** miMATRIX 하나를 읽는다. 숫자 행렬이 아니면 null */
function readMatrix(v: DataView, start: number, end: number, le: boolean): MatArray | null {
  const flagsTag = readTag(v, start, le);
  const flags = v.getUint32(flagsTag.data, le);
  const cls = flags & 0xff;
  const dimsTag = readTag(v, flagsTag.next, le);
  const dims = Array.from(readNumbers(v, dimsTag.data, dimsTag.nbytes, dimsTag.type, le));
  const nameTag = readTag(v, dimsTag.next, le);
  const name = readName(v, nameTag);
  if (!NUMERIC_CLASS.has(cls)) return null;
  const n = dims.reduce((a, b) => a * b, 1);
  if (n === 0) return { name, className: CLASS_NAME[cls], dims, data: new Float64Array(0) };
  if (nameTag.next >= end) return null;
  const realTag = readTag(v, nameTag.next, le);
  const data = readNumbers(v, realTag.data, realTag.nbytes, realTag.type, le);
  return { name, className: CLASS_NAME[cls], dims, data: data.length === n ? data : data.slice(0, n) };
}

async function readElements(buf: Uint8Array, start: number, le: boolean, inflate: Inflate, out: MatArray[]) {
  const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = start;
  while (off + 8 <= buf.byteLength) {
    const t = readTag(v, off, le);
    if (t.type === MI.COMPRESSED) {
      const inner = await inflate(buf.subarray(t.data, t.data + t.nbytes));
      await readElements(inner, 0, le, inflate, out);
      off = t.data + t.nbytes; // 압축 원소는 8바이트 경계로 맞추지 않는다
      continue;
    }
    if (t.type === MI.MATRIX && t.nbytes > 0) {
      const m = readMatrix(v, t.data, t.data + t.nbytes, le);
      if (m) out.push(m);
    }
    off = t.next;
  }
}

/** Level 4: 머리 정수 5개(형식 MOPT·행·열·허수 여부·이름 길이) + 이름 + 자료 */
function parseV4(buf: Uint8Array): MatArray[] {
  const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const out: MatArray[] = [];
  let off = 0;
  // 첫 정수로 바이트 순서를 정한다 (MOPT < 5000)
  const le = v.getInt32(0, true) >= 0 && v.getInt32(0, true) < 5000;
  while (off + 20 <= buf.byteLength) {
    const mopt = v.getInt32(off, le);
    const rows = v.getInt32(off + 4, le);
    const cols = v.getInt32(off + 8, le);
    const imag = v.getInt32(off + 12, le);
    const namlen = v.getInt32(off + 16, le);
    if (mopt < 0 || mopt > 4999 || rows < 0 || cols < 0 || namlen <= 0 || namlen > 64) throw new Error('MAT 파일 형식을 알아보지 못했습니다');
    const P = Math.floor((mopt % 100) / 10);
    const T = mopt % 10;
    let name = '';
    for (let i = 0; i < namlen - 1; i++) name += String.fromCharCode(v.getUint8(off + 20 + i));
    off += 20 + namlen;
    const types = [MI.DOUBLE, MI.SINGLE, MI.INT32, MI.INT16, MI.UINT16, MI.UINT8];
    const type = types[P];
    const n = rows * cols;
    const size = BYTES[type];
    const data = readNumbers(v, off, n * size, type, le);
    off += n * size * (imag ? 2 : 1);
    if (T === 0) out.push({ name, className: P === 0 ? 'double' : P === 1 ? 'single' : 'int', dims: [rows, cols], data });
  }
  return out;
}

/** MAT 파일 바이트 → 숫자 행렬 목록 */
export async function parseMat(bytes: ArrayBuffer | Uint8Array, inflate: Inflate = defaultInflate): Promise<MatArray[]> {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const head = String.fromCharCode(...buf.subarray(0, Math.min(116, buf.length)));
  if (head.startsWith('MATLAB 7.3')) throw new Error('MAT v7.3(HDF5) 파일은 읽지 못합니다. MATLAB에서 save(…, \'-v7\')로 다시 저장해 주세요.');
  if (head.startsWith('MATLAB') && buf.length >= 128) {
    const e = String.fromCharCode(buf[126], buf[127]);
    if (e !== 'IM' && e !== 'MI') throw new Error('MAT 파일 머리의 바이트 순서 표시를 읽지 못했습니다');
    const out: MatArray[] = [];
    await readElements(buf, 128, e === 'IM', inflate, out);
    return out;
  }
  return parseV4(buf);
}
