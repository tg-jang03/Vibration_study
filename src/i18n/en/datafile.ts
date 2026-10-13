/**
 * Korean text produced by src/lib/datafile (errors, notes, dataset labels, channel and bearing names,
 * defect-line labels) in English (D-054). The lib keeps the Korean; the lab calls these at render time.
 * Messages are matched against the lib templates; numbers and file names are captured and reinserted.
 */
import { cwruLabel, datasetLabel, type CwruFault, type CwruSet } from '../../lib/datafile/index';
import type { ExampleKind } from '../../lib/datafile/example';
import type { Lang } from '../index';

type Rule = [RegExp, (m: RegExpExecArray) => string];

const sideEn = (s: string) => (s === '팬측' ? 'fan-end' : 'drive-end');

const RULES: Rule[] = [
  // csv.ts
  [/^읽을 줄이 없습니다$/, () => 'There are no lines to read'],
  [/^숫자 줄이 두 줄 이상 있어야 합니다$/, () => 'There must be at least two numeric lines'],
  // index.ts
  [/^MAT 파일에서 길이 256 이상인 숫자 벡터를 찾지 못했습니다$/, () => 'No numeric vector of length 256 or more was found in the MAT file'],
  [
    /^MAT 파일에 샘플링 주파수가 없습니다\. 데이터를 받은 곳의 설명대로 f_s를 고르세요 \(CWRU는 목록마다 12 kHz 또는 48 kHz\)\.$/,
    () => 'The MAT file has no sampling frequency. Choose f_s as described where you got the data (CWRU is 12 kHz or 48 kHz depending on the list).',
  ],
  [
    /^WAV (실수|정수) (\d+)비트 — 크기는 전체 눈금 = 1입니다\. 실제 단위는 기록 장비의 감도로 바꿔 읽으세요\.$/,
    (m) => `WAV ${m[1] === '실수' ? 'floating-point' : 'integer'} ${m[2]}-bit — amplitude is full scale = 1. Convert to real units with the recorder's sensitivity.`,
  ],
  [/^시간 열 말고 다른 숫자 열이 없습니다$/, () => 'There is no numeric column other than the time column'],
  [/^시간 열이 없어 f_s를 알 수 없습니다\. 기록 조건대로 f_s를 넣으세요\.$/, () => 'There is no time column, so f_s is unknown. Enter f_s as given by the recording conditions.'],
  [/^시간 열 "(.*)"에서 f_s를 구했습니다\.$/, (m) => `f_s was obtained from the time column "${m[1]}".`],
  [
    /^CWRU 파일 번호 (\d+): 다운로드 표의 기록 조건대로 f_s ([\d.]+) kHz, (구동측|팬측) 채널과 (?:구동측|팬측) 베어링 배수로 맞췄습니다\.( \(이 목록은 공식 페이지에 f_s가 없어, 시험대의 고정 줄 자리로 확인한 값입니다\.\))?$/,
    (m) =>
      `CWRU file number ${m[1]}: set to f_s ${m[2]} kHz as in the download table's recording conditions, with the ${sideEn(m[3])} channel and the ${sideEn(m[3])} bearing multipliers.` +
      (m[4] ? ' (This list has no f_s on the official page; the value was confirmed from the fixed line positions of the test rig.)' : ''),
  ],
  [
    /^Paderborn 파일: 이름의 설정 코드대로 (\d+) rpm, 진동 채널\(64 kHz\)과 6203 베어링 배수로 맞췄습니다\. 다른 채널은 모터 전류\(64 kHz\)·회전수·토크·하중\(4 kHz\)이니, 그 채널을 볼 때는 f_s를 바꾸세요\.$/,
    (m) =>
      `Paderborn file: set to ${m[1]} rpm per the setting code in the name, with the vibration channel (64 kHz) and the 6203 bearing multipliers. The other channels are motor current (64 kHz) and speed, torque and load (4 kHz), so change f_s when you look at those channels.`,
  ],
  // mat.ts
  [
    /^이 브라우저는 압축된 MAT 파일을 풀 수 없습니다 \(DecompressionStream 없음\)\. MATLAB에서 save -v6으로 다시 저장해 주세요\.$/,
    () => 'This browser cannot decompress compressed MAT files (no DecompressionStream). Save it again in MATLAB with save -v6.',
  ],
  [/^지원하지 않는 숫자 형식 (.*)$/, (m) => `Unsupported numeric type ${m[1]}`],
  [/^MAT 파일 형식을 알아보지 못했습니다$/, () => 'The MAT file format was not recognized'],
  [
    /^MAT v7\.3\(HDF5\) 파일은 읽지 못합니다\. MATLAB에서 save\(…, '-v7'\)로 다시 저장해 주세요\.$/,
    () => "MAT v7.3 (HDF5) files cannot be read. Save it again in MATLAB with save(…, '-v7').",
  ],
  [/^MAT 파일 머리의 바이트 순서 표시를 읽지 못했습니다$/, () => 'The byte-order mark in the MAT file header could not be read'],
  // wav.ts
  [/^WAV\(RIFF\) 파일이 아닙니다$/, () => 'Not a WAV (RIFF) file'],
  [/^WAV의 fmt 덩어리가 없습니다$/, () => 'The WAV has no fmt chunk'],
  [/^WAV의 data 덩어리가 없습니다$/, () => 'The WAV has no data chunk'],
  [/^지원하지 않는 WAV 형식\((.*)\) — PCM 정수 또는 실수만 읽습니다$/, (m) => `Unsupported WAV format (${m[1]}) — only PCM integer or floating-point is read`],
  [/^지원하지 않는 비트 수 (.*)$/, (m) => `Unsupported bit depth ${m[1]}`],
];

/** Any error message or note produced by lib/datafile (including datasetSetup().note) in English; unknown text is returned unchanged */
export function dataMessage(text: string, lang: Lang): string {
  if (lang === 'ko') return text;
  for (const [re, f] of RULES) {
    const m = re.exec(text);
    if (m) return f(m);
  }
  return text;
}

const FAULT_EN: Record<CwruFault, string> = { normal: 'Normal', inner: 'Inner-race fault', ball: 'Ball fault', outer: 'Outer-race fault' };
const SET_EN: Record<CwruSet, string> = {
  de12: '12 kHz drive-end fault',
  de48: '48 kHz drive-end fault',
  fe12: '12 kHz fan-end fault',
  normal: 'Normal',
};
const POS_EN: Record<number, string> = {
  6: " (6 o'clock = center of the load zone)",
  3: " (3 o'clock = perpendicular to the load zone)",
  12: " (12 o'clock = opposite the load zone)",
};

// same file-name rule as lib/datafile paderbornLabel (N15_M07_F10_KA04_1.mat)
const PB_NAME = /(^|[\\/])N(09|15)_M(01|07)_F(04|10)_(K[0-9A-Z]{3})_(\d+)\.mat$/i;

/** English equivalent of datasetLabel(fileName); null when the file is not a known CWRU / Paderborn file */
export function datasetLabelText(fileName: string, lang: Lang): string | null {
  if (lang === 'ko') return datasetLabel(fileName);
  const c = cwruLabel(fileName);
  if (c) {
    const where = c.fault === 'normal' ? '' : `${c.side === 'de' ? 'Drive-end' : 'Fan-end'} `;
    const pos = c.position === null ? '' : POS_EN[c.position];
    const what = c.fault === 'normal' ? FAULT_EN.normal : `${where}${FAULT_EN[c.fault]} ${c.size.toFixed(3)}″${pos}`;
    return `${what}, load ${c.load} hp, about ${c.rpm} rpm · ${SET_EN[c.set]} list (${c.fs / 1000} kHz)`;
  }
  const m = PB_NAME.exec(fileName.trim());
  if (!m) return null;
  const rpm = m[2] === '15' ? 1500 : 900;
  const code = m[5].toUpperCase();
  const kind = /^K0/.test(code)
    ? 'no damage (normal)'
    : code[1] === 'A'
      ? 'outer-race damage'
      : code[1] === 'I'
        ? 'inner-race damage'
        : code[1] === 'B'
          ? 'outer- and inner-race damage'
          : 'unknown code';
  const cond = `${rpm} rpm · load torque ${m[3] === '07' ? 0.7 : 0.1} Nm · radial load ${m[4] === '10' ? 1000 : 400} N`;
  return `Bearing ${code}: ${kind} (check the dataset table to see whether it is artificial damage or real damage from an accelerated life test) · ${cond} · measurement ${m[6]}`;
}

/** Default channel names made by the lib ('열 3', '채널 2'); names read from the user's file are unchanged */
export function channelName(name: string, lang: Lang): string {
  if (lang === 'ko') return name;
  const m = /^(열|채널) (\d+)$/.exec(name);
  return m ? `${m[1] === '열' ? 'Column' : 'Channel'} ${m[2]}` : name;
}

const BEARING_EN: Record<string, string> = {
  'CWRU 구동측 6205-2RS JEM SKF': 'CWRU drive end 6205-2RS JEM SKF',
  'CWRU 팬측 6203-2RS JEM SKF': 'CWRU fan end 6203-2RS JEM SKF',
  'Paderborn 6203 (CWRU 팬측과 같은 형번)': 'Paderborn 6203 (same type as CWRU fan end)',
  '직접 입력': 'Custom',
};
export function bearingName(name: string, lang: Lang): string {
  return lang === 'ko' ? name : (BEARING_EN[name] ?? name);
}

const DEFECT_EN: Record<string, string> = {
  'BPFO (외륜)': 'BPFO (outer race)',
  'BPFI (내륜)': 'BPFI (inner race)',
  '볼 (표의 값)': 'Ball (table value)',
  'FTF (케이지)': 'FTF (cage)',
};
export function defectLabel(label: string, lang: Lang): string {
  return lang === 'ko' ? label : (DEFECT_EN[label] ?? label);
}

export const EXAMPLE_LABEL_EN: Record<ExampleKind, string> = {
  normal: 'Normal',
  outer: 'Outer-race fault',
  inner: 'Inner-race fault',
  ball: 'Ball fault',
  spiky: 'Outer-race fault + rare non-bearing spikes (5.6 kHz)',
};
