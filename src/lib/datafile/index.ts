/**
 * 내 파일 열기 (LAB-DATA-01, P11-2 · P11-3, D-052). 파일 바이트 → 채널 목록. 순수 함수 — 파일은 브라우저 밖으로 나가지 않는다.
 * 형식은 확장자로 고르고, 모르면 앞 바이트(MATLAB · RIFF)로 짐작한다.
 */
import { parseCsv } from './csv';
import { parseMat, type Inflate } from './mat';
import { parseWav } from './wav';

export interface Channel {
  name: string;
  data: Float64Array;
}

export interface DataSet {
  fileName: string;
  format: 'mat' | 'wav' | 'csv';
  channels: Channel[];
  /** 파일에서 알아낸 f_s (모르면 null) */
  fs: number | null;
  /** 파일에 적힌 회전수 [rpm] (모르면 null) */
  rpm: number | null;
  notes: string[];
}

/** 채널로 쓸 만한 길이 */
const MIN_LEN = 256;

export async function readDataFile(fileName: string, bytes: ArrayBuffer | Uint8Array, inflate?: Inflate): Promise<DataSet> {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const ext = fileName.toLowerCase().split('.').pop() ?? '';
  const head = String.fromCharCode(...buf.subarray(0, 8));
  const notes: string[] = [];
  if (ext === 'mat' || head.startsWith('MATLAB')) {
    const arrays = await parseMat(buf, inflate);
    const channels: Channel[] = [];
    let rpm: number | null = null;
    let fs: number | null = null;
    for (const a of arrays) {
      const n = a.data.length;
      if (n === 1) {
        if (/rpm/i.test(a.name)) rpm = a.data[0];
        else if (/^(fs|sr|sample_?rate|sampling_?rate|fsamp)$/i.test(a.name)) fs = a.data[0];
        continue;
      }
      const [r, c] = [a.dims[0] ?? n, a.dims[1] ?? 1];
      if (r === 1 || c === 1) {
        if (n >= MIN_LEN) channels.push({ name: a.name, data: a.data });
      } else if (r >= MIN_LEN) {
        // 행렬은 열마다 한 채널 (열 우선 저장)
        for (let k = 0; k < c && k < 16; k++) channels.push({ name: `${a.name}(:,${k + 1})`, data: a.data.slice(k * r, (k + 1) * r) });
      }
    }
    if (channels.length === 0) throw new Error('MAT 파일에서 길이 256 이상인 숫자 벡터를 찾지 못했습니다');
    if (fs === null) notes.push('MAT 파일에 샘플링 주파수가 없습니다. 데이터를 받은 곳의 설명대로 f_s를 고르세요 (CWRU는 12 kHz 또는 48 kHz).');
    return { fileName, format: 'mat', channels, fs, rpm, notes };
  }
  if (ext === 'wav' || head.startsWith('RIFF')) {
    const w = parseWav(buf);
    notes.push(`WAV ${w.float ? '실수' : '정수'} ${w.bits}비트 — 크기는 전체 눈금 = 1입니다. 실제 단위는 기록 장비의 감도로 바꿔 읽으세요.`);
    return { fileName, format: 'wav', channels: w.channels.map((d, i) => ({ name: `채널 ${i + 1}`, data: d })), fs: w.fs, rpm: null, notes };
  }
  const text = new TextDecoder('utf-8').decode(buf);
  const c = parseCsv(text);
  const channels = c.columns.map((d, i) => ({ name: c.names[i], data: d })).filter((_, i) => i !== c.timeColumn);
  if (channels.length === 0) throw new Error('시간 열 말고 다른 숫자 열이 없습니다');
  if (c.fs === null) notes.push('시간 열이 없어 f_s를 알 수 없습니다. 기록 조건대로 f_s를 넣으세요.');
  else notes.push(`시간 열 "${c.names[c.timeColumn]}"에서 f_s를 구했습니다.`);
  return { fileName, format: 'csv', channels, fs: c.fs, rpm: null, notes };
}

// ── 공개 데이터셋 도우미 ──

/** 베어링 결함 주파수 배수 (회전 주파수의 몇 배) */
export interface BearingFactors {
  name: string;
  bpfo: number;
  bpfi: number;
  /** 볼 결함: 공개 표의 "rolling element" 값 그대로 (CWRU는 2×BSF) */
  ball: number;
  ftf: number;
}

/** CWRU Bearing Data Center의 베어링 정보 페이지 값 (R-10) */
export const CWRU_DE: BearingFactors = { name: 'CWRU 구동측 6205-2RS JEM SKF', bpfo: 3.5848, bpfi: 5.4152, ball: 4.7135, ftf: 0.39828 };
export const CWRU_FE: BearingFactors = { name: 'CWRU 팬측 6203-2RS JEM SKF', bpfo: 3.053, bpfi: 4.9469, ball: 3.9874, ftf: 0.3817 };

export type CwruFault = 'normal' | 'inner' | 'ball' | 'outer';
export interface CwruLabel {
  file: number;
  fault: CwruFault;
  /** 결함 지름 [inch] (정상은 0) */
  size: number;
  load: number;
  rpm: number;
  label: string;
}

const LOAD_RPM = [1797, 1772, 1750, 1730];
const FAULT_LABEL: Record<CwruFault, string> = { normal: '정상', inner: '내륜 결함', ball: '볼 결함', outer: '외륜 결함 (6시 방향)' };

/** CWRU 12 kHz 구동측 결함 목록과 정상 목록의 파일 번호 (공식 페이지 표, 2026-10-12 확인) */
const CWRU_12K_DE: [CwruFault, number, number][] = [
  ['normal', 0, 97],
  ['inner', 0.007, 105],
  ['ball', 0.007, 118],
  ['outer', 0.007, 130],
  ['inner', 0.014, 169],
  ['ball', 0.014, 185],
  ['outer', 0.014, 197],
  ['inner', 0.021, 209],
  ['ball', 0.021, 222],
  ['outer', 0.021, 234],
];

/** 파일 이름의 번호로 CWRU 12 kHz 구동측(또는 정상) 라벨 찾기. 다른 목록의 파일이면 null */
export function cwruLabel(fileName: string): CwruLabel | null {
  const m = /(^|[^0-9])(\d{2,3})\.mat$/i.exec(fileName.trim());
  if (!m) return null;
  const file = Number(m[2]);
  for (const [fault, size, first] of CWRU_12K_DE) {
    const load = file - first;
    if (load >= 0 && load <= 3) {
      const rpm = LOAD_RPM[load];
      const label = fault === 'normal' ? `${FAULT_LABEL.normal}, 하중 ${load} hp, 약 ${rpm} rpm` : `${FAULT_LABEL[fault]} ${size.toFixed(3)}″, 하중 ${load} hp, 약 ${rpm} rpm`;
      return { file, fault, size, load, rpm, label };
    }
  }
  return null;
}
