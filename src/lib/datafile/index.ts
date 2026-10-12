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
    // 아는 데이터셋(CWRU·Paderborn)의 파일이면 datasetSetup이 f_s를 정하고 따로 알린다
    if (fs === null && !cwruLabel(fileName) && !paderbornLabel(fileName)) notes.push('MAT 파일에 샘플링 주파수가 없습니다. 데이터를 받은 곳의 설명대로 f_s를 고르세요 (CWRU는 목록마다 12 kHz 또는 48 kHz).');
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
/** CWRU 다운로드 목록: 12 kHz 구동측 결함 · 48 kHz 구동측 결함 · 12 kHz 팬측 결함 · 정상 */
export type CwruSet = 'de12' | 'de48' | 'fe12' | 'normal';
export interface CwruLabel {
  file: number;
  set: CwruSet;
  fault: CwruFault;
  /** 결함 지름 [inch] (정상은 0) */
  size: number;
  /** 외륜 결함의 자리 (하중 영역 가운데 = 6시), 그 밖은 null */
  position: 6 | 3 | 12 | null;
  load: number;
  rpm: number;
  /** 그 목록의 샘플링 주파수 [Hz] */
  fs: number;
  /** 결함을 낸 베어링 (정상은 구동측 센서를 본다) */
  side: 'de' | 'fe';
  label: string;
}

const LOAD_RPM = [1797, 1772, 1750, 1730];
const FAULT_LABEL: Record<CwruFault, string> = { normal: '정상', inner: '내륜 결함', ball: '볼 결함', outer: '외륜 결함' };
const SET_INFO: Record<CwruSet, { fs: number; side: 'de' | 'fe'; name: string }> = {
  de12: { fs: 12000, side: 'de', name: '12 kHz 구동측 결함' },
  de48: { fs: 48000, side: 'de', name: '48 kHz 구동측 결함' },
  fe12: { fs: 12000, side: 'fe', name: '12 kHz 팬측 결함' },
  // 공식 페이지에는 f_s가 없다. 시험대의 고정 줄(147.8 · 161.7 · 191.5 · 360 Hz)이 결함 기록(12 kHz)과 같은 자리에 서는 것은 48 kHz로 볼 때다 (2026-10-12 확인, P11-2)
  normal: { fs: 48000, side: 'de', name: '정상' },
};

/** [목록, 결함, 지름(mil), 외륜 자리, 하중 0 ~ 3 hp의 파일 번호(없으면 0)] — 공식 다운로드 페이지 표 (2026-10-12 확인) */
type Row = [CwruSet, CwruFault, number, 6 | 3 | 12 | null, [number, number, number, number]];
const CWRU_FILES: Row[] = [
  ['normal', 'normal', 0, null, [97, 98, 99, 100]],
  ['de12', 'inner', 7, null, [105, 106, 107, 108]],
  ['de12', 'ball', 7, null, [118, 119, 120, 121]],
  ['de12', 'outer', 7, 6, [130, 131, 132, 133]],
  ['de12', 'outer', 7, 3, [144, 145, 146, 147]],
  ['de12', 'outer', 7, 12, [156, 158, 159, 160]],
  ['de12', 'inner', 14, null, [169, 170, 171, 172]],
  ['de12', 'ball', 14, null, [185, 186, 187, 188]],
  ['de12', 'outer', 14, 6, [197, 198, 199, 200]],
  ['de12', 'inner', 21, null, [209, 210, 211, 212]],
  ['de12', 'ball', 21, null, [222, 223, 224, 225]],
  ['de12', 'outer', 21, 6, [234, 235, 236, 237]],
  ['de12', 'outer', 21, 3, [246, 247, 248, 249]],
  ['de12', 'outer', 21, 12, [258, 259, 260, 261]],
  ['de12', 'inner', 28, null, [3001, 3002, 3003, 3004]],
  ['de12', 'ball', 28, null, [3005, 3006, 3007, 3008]],
  ['de48', 'inner', 7, null, [109, 110, 111, 112]],
  ['de48', 'ball', 7, null, [122, 123, 124, 125]],
  ['de48', 'outer', 7, 6, [135, 136, 137, 138]],
  ['de48', 'outer', 7, 3, [148, 149, 150, 151]],
  ['de48', 'outer', 7, 12, [161, 162, 163, 164]],
  ['de48', 'inner', 14, null, [174, 175, 176, 177]],
  ['de48', 'ball', 14, null, [189, 190, 191, 192]],
  ['de48', 'outer', 14, 6, [201, 202, 203, 204]],
  ['de48', 'inner', 21, null, [213, 214, 215, 217]],
  ['de48', 'ball', 21, null, [226, 227, 228, 229]],
  ['de48', 'outer', 21, 6, [238, 239, 240, 241]],
  ['de48', 'outer', 21, 3, [250, 251, 252, 253]],
  ['de48', 'outer', 21, 12, [262, 263, 264, 265]],
  ['fe12', 'inner', 7, null, [278, 279, 280, 281]],
  ['fe12', 'ball', 7, null, [282, 283, 284, 285]],
  ['fe12', 'outer', 7, 6, [294, 295, 296, 297]],
  ['fe12', 'outer', 7, 3, [298, 299, 300, 301]],
  ['fe12', 'outer', 7, 12, [302, 305, 306, 307]],
  ['fe12', 'inner', 14, null, [274, 275, 276, 277]],
  ['fe12', 'ball', 14, null, [286, 287, 288, 289]],
  ['fe12', 'outer', 14, 6, [313, 0, 0, 0]],
  ['fe12', 'outer', 14, 3, [310, 309, 311, 312]],
  ['fe12', 'inner', 21, null, [270, 271, 272, 273]],
  ['fe12', 'ball', 21, null, [290, 291, 292, 293]],
  ['fe12', 'outer', 21, 6, [315, 0, 0, 0]],
  ['fe12', 'outer', 21, 3, [0, 316, 317, 318]],
];

/** 파일 이름의 번호로 CWRU 라벨 찾기 (위 네 목록). 목록에 없는 번호·다른 파일이면 null */
export function cwruLabel(fileName: string): CwruLabel | null {
  const m = /(^|[^0-9])(\d{2,4})\.mat$/i.exec(fileName.trim());
  if (!m) return null;
  const file = Number(m[2]);
  for (const [set, fault, mil, position, files] of CWRU_FILES) {
    const load = files.indexOf(file);
    if (load < 0) continue;
    const rpm = LOAD_RPM[load];
    const { fs, side, name } = SET_INFO[set];
    const size = mil / 1000;
    const where = fault === 'normal' ? '' : `${side === 'de' ? '구동측' : '팬측'} `;
    const pos = position === null ? '' : position === 6 ? ' (6시 = 하중 영역 가운데)' : position === 3 ? ' (3시 = 하중 영역과 직각)' : ' (12시 = 하중 영역 반대편)';
    const what = fault === 'normal' ? FAULT_LABEL.normal : `${where}${FAULT_LABEL[fault]} ${size.toFixed(3)}″${pos}`;
    return { file, set, fault, size, position, load, rpm, fs, side, label: `${what}, 하중 ${load} hp, 약 ${rpm} rpm · ${name} 목록 (${fs / 1000} kHz)` };
  }
  return null;
}

/** 공개 데이터셋 파일을 열 때 맞출 분석 설정. 결함 종류는 알려 주지 않는다 (라벨은 랩에서 따로 연다) */
export interface FileSetup {
  fs: number;
  channel: number;
  /** 결함 주파수 배수를 고를 베어링 */
  bearing: 'de' | 'fe' | 'pb';
  /** 파일 이름이 알려 주는 회전수 (모르면 null — 파일 안의 RPM이 먼저) */
  rpm: number | null;
  note: string;
}

/** CWRU 파일이면: f_s(파일에 없으면 목록의 값), 결함 베어링 쪽 채널, 그 베어링의 배수 */
export function cwruSetup(ds: DataSet): FileSetup | null {
  const l = cwruLabel(ds.fileName);
  if (!l) return null;
  const tag = l.side === 'fe' ? /_FE_/i : /_DE_/i;
  const channel = Math.max(0, ds.channels.findIndex((c) => tag.test(c.name)));
  const fs = ds.fs ?? l.fs;
  const sideName = l.side === 'fe' ? '팬측' : '구동측';
  return {
    fs,
    channel,
    bearing: l.side,
    rpm: l.rpm,
    note: `CWRU 파일 번호 ${l.file}: 다운로드 표의 기록 조건대로 f_s ${fs / 1000} kHz, ${sideName} 채널과 ${sideName} 베어링 배수로 맞췄습니다.${l.set === 'normal' ? ' (이 목록은 공식 페이지에 f_s가 없어, 시험대의 고정 줄 자리로 확인한 값입니다.)' : ''}`,
  };
}

// ── Paderborn KAt-DataCenter (R-92) ──

/** 시험 베어링 6203: CWRU 팬측과 같은 형번이라 그 배수를 쓴다 (제조사마다 1 % 안팎 다를 수 있다 — 결함 대조의 허용 폭 ±2 % 안) */
export const PADERBORN_6203: BearingFactors = { ...CWRU_FE, name: 'Paderborn 6203 (CWRU 팬측과 같은 형번)' };

/** 진동 신호의 샘플링 주파수 (4초 기록 ≈ 256,000점) */
export const PADERBORN_FS = 64000;

/** 파일 이름 `N15_M07_F10_KA04_1.mat` = 회전수 · 부하 토크 · 반경 하중 · 베어링 코드 · 측정 번호 */
const PB_NAME = /(^|[\\/])N(09|15)_M(01|07)_F(04|10)_(K[0-9A-Z]{3})_(\d+)\.mat$/i;

export function paderbornLabel(fileName: string): { bearing: string; rpm: number; label: string } | null {
  const m = PB_NAME.exec(fileName.trim());
  if (!m) return null;
  const rpm = m[2] === '15' ? 1500 : 900;
  const code = m[5].toUpperCase();
  // 코드의 둘째 글자: 0 = 손상 없음, A = 외륜(Außenring), I = 내륜(Innenring), B = 둘 다
  const kind = /^K0/.test(code) ? '손상 없음(정상)' : code[1] === 'A' ? '외륜 손상' : code[1] === 'I' ? '내륜 손상' : code[1] === 'B' ? '외륜·내륜 손상' : '알 수 없는 코드';
  const cond = `${rpm} rpm · 부하 토크 ${m[3] === '07' ? 0.7 : 0.1} Nm · 반경 하중 ${m[4] === '10' ? 1000 : 400} N`;
  return { bearing: code, rpm, label: `베어링 ${code}: ${kind} (인공 손상인지 가속 수명 시험의 실제 손상인지는 데이터셋 표에서 확인) · ${cond} · 측정 ${m[6]}` };
}

export function paderbornSetup(ds: DataSet): FileSetup | null {
  const l = paderbornLabel(ds.fileName);
  if (!l) return null;
  const v = ds.channels.findIndex((c) => /vibration/i.test(c.name));
  return {
    fs: ds.fs ?? PADERBORN_FS,
    channel: Math.max(0, v),
    bearing: 'pb',
    rpm: l.rpm,
    note: `Paderborn 파일: 이름의 설정 코드대로 ${l.rpm} rpm, 진동 채널(64 kHz)과 6203 베어링 배수로 맞췄습니다. 다른 채널은 모터 전류(64 kHz)·회전수·토크·하중(4 kHz)이니, 그 채널을 볼 때는 f_s를 바꾸세요.`,
  };
}

/** 아는 데이터셋이면 설정 (CWRU → Paderborn 순서) */
export const datasetSetup = (ds: DataSet): FileSetup | null => cwruSetup(ds) ?? paderbornSetup(ds);
/** 아는 데이터셋이면 정답 라벨 문장 */
export const datasetLabel = (fileName: string): string | null => cwruLabel(fileName)?.label ?? paderbornLabel(fileName)?.label ?? null;
