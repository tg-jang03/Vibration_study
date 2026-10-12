import { deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { averagedSpectrum, bestBand, defectLines, envelope, floorOf, QUIET_RATIO, recordLength, runPipeline, scoreDefects, takeRecord } from './analysis';
import { parseCsv } from './csv';
import { EXAMPLE, exampleRates, exampleSignal, type ExampleKind } from './example';
import { CWRU_DE, cwruLabel, cwruSetup, datasetLabel, datasetSetup, paderbornLabel, readDataFile } from './index';
import { fft } from '../dsp/fft';
import { createRng } from '../dsp/random';
import { parseMat } from './mat';
import { parseWav } from './wav';

// ── 시험용 파일 쓰기 (MAT Level 5 · Level 4 · WAV) ──
const pad8 = (n: number) => Math.ceil(n / 8) * 8;
function element(type: number, payload: Uint8Array): Uint8Array {
  const out = new Uint8Array(8 + pad8(payload.length));
  const v = new DataView(out.buffer);
  v.setUint32(0, type, true);
  v.setUint32(4, payload.length, true);
  out.set(payload, 8);
  return out;
}
const cat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};
const u32 = (...xs: number[]) => new Uint8Array(new Uint32Array(xs).buffer);
const i32 = (...xs: number[]) => new Uint8Array(new Int32Array(xs).buffer);
const f64 = (xs: ArrayLike<number>) => new Uint8Array(Float64Array.from(xs).buffer);
const i16 = (xs: ArrayLike<number>) => new Uint8Array(Int16Array.from(xs).buffer);
const ascii = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));

/** miMATRIX: double 클래스. 자료 형식은 type(기본 miDOUBLE) — MATLAB은 작은 정수형으로 줄여 쓰기도 한다 */
function matrix(name: string, rows: number, cols: number, data: Uint8Array, dataType = 9, cls = 6): Uint8Array {
  // 이름이 4바이트 이하면 작은 원소 형식
  const nameEl = name.length <= 4 ? (() => {
    const e = new Uint8Array(8);
    const v = new DataView(e.buffer);
    v.setUint32(0, (name.length << 16) | 1, true);
    e.set(ascii(name), 4);
    return e;
  })() : element(1, ascii(name));
  const body = cat(element(6, u32(cls, 0)), element(5, i32(rows, cols)), nameEl, element(dataType, data));
  return element(14, body);
}
/** 구조체(1×n): 원소마다 필드 순서대로 이름 없는 miMATRIX */
function structMatrix(name: string, fields: string[], elements: Uint8Array[][]): Uint8Array {
  const fl = 32;
  const lenEl = new Uint8Array(8);
  const lv = new DataView(lenEl.buffer);
  lv.setUint32(0, (4 << 16) | 5, true);
  lv.setInt32(4, fl, true);
  const names = new Uint8Array(fields.length * fl);
  fields.forEach((f, i) => names.set(ascii(f), i * fl));
  const body = cat(element(6, u32(2, 0)), element(5, i32(1, elements.length)), element(1, ascii(name)), lenEl, element(1, names), ...elements.flat());
  return element(14, body);
}
const charMatrix = (text: string) => matrix('', 1, text.length, new Uint8Array(Uint16Array.from(text, (c) => c.charCodeAt(0)).buffer), 4, 4);
function cellMatrix(name: string, items: Uint8Array[]): Uint8Array {
  return element(14, cat(element(6, u32(1, 0)), element(5, i32(1, items.length)), element(1, ascii(name)), ...items));
}
function matFile(elements: Uint8Array[], compress = false): Uint8Array {
  const head = new Uint8Array(128).fill(32);
  head.set(ascii('MATLAB 5.0 MAT-file, Platform: test'), 0);
  const v = new DataView(head.buffer);
  v.setUint16(124, 0x0100, true);
  head[126] = 'I'.charCodeAt(0);
  head[127] = 'M'.charCodeAt(0);
  const els = compress
    ? elements.map((e) => {
        const z = new Uint8Array(deflateSync(e));
        const t = new Uint8Array(8 + z.length);
        const tv = new DataView(t.buffer);
        tv.setUint32(0, 15, true);
        tv.setUint32(4, z.length, true);
        t.set(z, 8);
        return t;
      })
    : elements;
  return cat(head, ...els);
}
const inflate = async (b: Uint8Array) => new Uint8Array((await import('node:zlib')).inflateSync(b));

function wavFile(fs: number, chans: number[][], bits = 16): Uint8Array {
  const n = chans[0].length;
  const ch = chans.length;
  const data = new Uint8Array(n * ch * (bits / 8));
  const dv = new DataView(data.buffer);
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) dv.setInt16((i * ch + c) * 2, Math.round(chans[c][i] * 32767), true);
  const fmt = new Uint8Array(16);
  const fv = new DataView(fmt.buffer);
  fv.setUint16(0, 1, true);
  fv.setUint16(2, ch, true);
  fv.setUint32(4, fs, true);
  fv.setUint32(8, fs * ch * 2, true);
  fv.setUint16(12, ch * 2, true);
  fv.setUint16(14, bits, true);
  const chunk = (id: string, body: Uint8Array) => cat(ascii(id), u32(body.length), body);
  const riff = cat(ascii('WAVE'), chunk('fmt ', fmt), chunk('data', data));
  return cat(ascii('RIFF'), u32(riff.length), riff);
}

const sine = (n: number, f: number, fs: number, a = 1) => Array.from({ length: n }, (_, i) => a * Math.sin((2 * Math.PI * f * i) / fs));

describe('MAT Level 5', () => {
  const x = sine(1000, 50, 1000);
  it('double 벡터 · 작은 원소 이름 · 1×1 RPM', async () => {
    const bytes = matFile([matrix('X105_DE_time', 1000, 1, f64(x)), matrix('X105RPM', 1, 1, f64([1797])), matrix('ab', 3, 1, f64([1, 2, 3]))]);
    const arrs = await parseMat(bytes, inflate);
    expect(arrs.map((a) => a.name)).toEqual(['X105_DE_time', 'X105RPM', 'ab']);
    expect(arrs[0].dims).toEqual([1000, 1]);
    expect(arrs[0].data[25]).toBeCloseTo(x[25], 12);
    expect(arrs[1].data[0]).toBe(1797);
  });
  it('압축 원소(miCOMPRESSED)와 줄여 쓴 정수 자료(double 클래스, miINT16)', async () => {
    const ints = [3, -2, 1000, -32768];
    const bytes = matFile([matrix('v', 4, 1, i16(ints), 3)], true);
    const arrs = await parseMat(bytes, inflate);
    expect(Array.from(arrs[0].data)).toEqual(ints);
    expect(arrs[0].className).toBe('double');
  });
  it('기본 풀기(DecompressionStream)로도 압축 원소를 읽는다', async () => {
    const bytes = matFile([matrix('X097_DE_time', 512, 1, f64(sine(512, 7, 100)))], true);
    const arrs = await parseMat(bytes);
    expect(arrs[0].name).toBe('X097_DE_time');
    expect(arrs[0].data[100]).toBeCloseTo(Math.sin((2 * Math.PI * 7 * 100) / 100), 12);
  });
  it('문자 배열은 건너뛰고, v7.3은 알기 쉬운 오류', async () => {
    const bytes = matFile([matrix('txt', 1, 3, i16([65, 66, 67]), 4, 4), matrix('y', 300, 1, f64(sine(300, 5, 100)))]);
    expect((await parseMat(bytes, inflate)).map((a) => a.name)).toEqual(['y']);
    const v73 = new Uint8Array(128).fill(32);
    v73.set(ascii('MATLAB 7.3 MAT-file'), 0);
    await expect(parseMat(v73, inflate)).rejects.toThrow(/v7.3/);
  });
  it('구조체 · 셀 안의 숫자 행렬을 이름을 붙여 펼치고, 원소의 Name 필드를 앞에 붙인다', async () => {
    const y = structMatrix('', ['Name', 'Data'], [
      [charMatrix('force'), matrix('', 1, 300, f64(sine(300, 3, 100)))],
      [charMatrix('vibration_1'), matrix('', 1, 1024, f64(sine(1024, 50, 1000)))],
    ]);
    const top = structMatrix('N15_M07_F10_KA04_1', ['Info', 'Y'], [[charMatrix('test rig'), y]]);
    const cell = cellMatrix('c', [matrix('', 3, 1, f64([7, 8, 9]))]);
    const arrs = await parseMat(matFile([top, cell], true), inflate);
    expect(arrs.map((a) => a.name)).toEqual(['force (N15_M07_F10_KA04_1.Y(1).Data)', 'vibration_1 (N15_M07_F10_KA04_1.Y(2).Data)', 'c{1}']);
    expect(arrs[1].data[7]).toBeCloseTo(Math.sin((2 * Math.PI * 50 * 7) / 1000), 12);
    expect(Array.from(arrs[2].data)).toEqual([7, 8, 9]);
  });
  it('Level 4 double 행렬', async () => {
    const head = i32(0, 3, 1, 0, 2);
    const bytes = cat(head, ascii('a\0'), f64([1.5, 2.5, 3.5]));
    const arrs = await parseMat(bytes, inflate);
    expect(arrs[0].name).toBe('a');
    expect(Array.from(arrs[0].data)).toEqual([1.5, 2.5, 3.5]);
  });
});

describe('readDataFile', () => {
  it('MAT: 벡터 채널 · RPM, f_s 없음 안내 (CWRU 번호면 cwruSetup이 f_s · 채널 · 베어링을 정한다)', async () => {
    const mat = (tag: string) => matFile([matrix(`X${tag}_DE_time`, 2048, 1, f64(sine(2048, 30, 12000))), matrix(`X${tag}_FE_time`, 2048, 1, f64(sine(2048, 30, 12000))), matrix(`X${tag}RPM`, 1, 1, f64([1797]))]);
    const ds = await readDataFile('105.mat', mat('105'), inflate);
    expect(ds.channels.map((c) => c.name)).toEqual(['X105_DE_time', 'X105_FE_time']);
    expect(ds.rpm).toBe(1797);
    expect(ds.fs).toBeNull();
    expect(ds.notes).toHaveLength(0);
    expect(cwruSetup(ds)).toMatchObject({ fs: 12000, channel: 0, bearing: 'de' });
    const fe = await readDataFile('283.mat', mat('283'), inflate);
    expect(cwruSetup(fe)).toMatchObject({ fs: 12000, channel: 1, bearing: 'fe' });
    const normal = await readDataFile('97.mat', mat('097'), inflate);
    expect(cwruSetup(normal)?.fs).toBe(48000);
    const other = await readDataFile('my_record.mat', mat('1'), inflate);
    expect(cwruSetup(other)).toBeNull();
    expect(other.notes.join(' ')).toMatch(/12 kHz 또는 48 kHz/);
  });
  it('WAV 16비트 두 채널', async () => {
    const ds = await readDataFile('rec.wav', wavFile(8000, [sine(400, 100, 8000, 0.5), sine(400, 200, 8000, 0.25)]));
    expect(ds.fs).toBe(8000);
    expect(ds.channels).toHaveLength(2);
    expect(ds.channels[0].data[20]).toBeCloseTo(0.5 * Math.sin((2 * Math.PI * 100 * 20) / 8000), 3);
    const w = parseWav(wavFile(1000, [[0, 0.5, -0.5]]));
    expect(Array.from(w.channels[0])).toEqual([0, 16384 / 32768, -16383 / 32768]);
  });
  it('CSV: 머리 줄 · 시간 열에서 f_s · 세미콜론과 소수점 쉼표', async () => {
    const rows = Array.from({ length: 300 }, (_, i) => `${(i / 2000).toFixed(6)},${Math.sin(i / 7).toFixed(5)},${i}`);
    const ds = await readDataFile('a.csv', new TextEncoder().encode(['time [s],acc_g,count', ...rows].join('\n')));
    expect(ds.fs).toBeCloseTo(2000, 6);
    expect(ds.channels.map((c) => c.name)).toEqual(['acc_g', 'count']);
    const semi = parseCsv(['# 주석', 't;x', '0;1,5', '0,001;2,5', '0,002;3,5'].join('\n'));
    expect(Array.from(semi.columns[1])).toEqual([1.5, 2.5, 3.5]);
    expect(semi.fs).toBeCloseTo(1000, 6);
    const plain = parseCsv('1 2\n3 4\n5 6');
    expect(plain.timeColumn).toBe(0);
  });
  it('CWRU 파일 번호 → 라벨 (12 kHz 구동측 · 48 kHz 구동측 · 12 kHz 팬측 · 정상 목록)', () => {
    expect(cwruLabel('105.mat')?.label).toBe('구동측 내륜 결함 0.007″, 하중 0 hp, 약 1797 rpm · 12 kHz 구동측 결함 목록 (12 kHz)');
    expect(cwruLabel('C:/data/133.mat')).toMatchObject({ fault: 'outer', position: 6, load: 3, fs: 12000 });
    expect(cwruLabel('99.mat')).toMatchObject({ set: 'normal', load: 2, rpm: 1750, fs: 48000 });
    expect(cwruLabel('224.mat')?.fault).toBe('ball');
    expect(cwruLabel('3005.mat')).toMatchObject({ fault: 'ball', size: 0.028, load: 0 });
    expect(cwruLabel('109.mat')).toMatchObject({ set: 'de48', fault: 'inner', fs: 48000 });
    expect(cwruLabel('217.mat')).toMatchObject({ set: 'de48', size: 0.021, load: 3 });
    expect(cwruLabel('313.mat')).toMatchObject({ set: 'fe12', side: 'fe', position: 6, load: 0 });
    expect(cwruLabel('316.mat')).toMatchObject({ position: 3, load: 1 });
    expect(cwruLabel('157.mat')).toBeNull();
    expect(cwruLabel('rec.wav')).toBeNull();
  });
  it('Paderborn 파일 이름 → 설정(64 kHz · 진동 채널 · 회전수 · 6203)과 라벨', async () => {
    const y = structMatrix('', ['Name', 'Data'], [
      [charMatrix('phase_current_1'), matrix('', 1, 1024, f64(sine(1024, 50, 1000)))],
      [charMatrix('vibration_1'), matrix('', 1, 1024, f64(sine(1024, 50, 1000)))],
    ]);
    const ds = await readDataFile('N09_M07_F04_KI21_3.mat', matFile([structMatrix('N09_M07_F04_KI21_3', ['Y'], [[y]])]), inflate);
    expect(ds.notes).toHaveLength(0);
    expect(datasetSetup(ds)).toMatchObject({ fs: 64000, channel: 1, bearing: 'pb', rpm: 900 });
    expect(datasetLabel('C:/x/N09_M07_F04_KI21_3.mat')).toMatch(/KI21: 내륜 손상.*900 rpm · 부하 토크 0.7 Nm · 반경 하중 400 N · 측정 3/);
    expect(paderbornLabel('N15_M01_F10_K002_20.mat')?.label).toMatch(/K002: 손상 없음/);
    expect(paderbornLabel('N15_M07_F10_KB23_1.mat')?.label).toMatch(/외륜·내륜 손상/);
    expect(datasetLabel('105.mat')).toMatch(/내륜 결함/);
    expect(datasetLabel('rec.mat')).toBeNull();
  });
});

describe('합성 예시와 분석 순서', () => {
  const fr = EXAMPLE.rpm / 60;
  const run = (kind: ExampleKind) => {
    const s = exampleSignal(kind);
    const x = takeRecord(s.de, recordLength(s.de.length));
    const { kg, band } = bestBand(x, s.fs, 3 * CWRU_DE.bpfi * fr);
    const e = envelope(x, s.fs, band, 500);
    const scores = scoreDefects(e.freq, e.amp, defectLines(CWRU_DE, fr), fr, 2, band[1] - band[0]);
    return { x, band, e, scores, sk: kg.best.sk };
  };
  it('CWRU 배수: 1797 rpm에서 BPFO 107.4 · BPFI 162.2 · 볼 141.2 · FTF 11.93 Hz', () => {
    const l = defectLines(CWRU_DE, fr);
    expect(l[0].f).toBeCloseTo(107.36, 2);
    expect(l[1].f).toBeCloseTo(162.19, 2);
    expect(l[2].f).toBeCloseTo(141.17, 2);
    expect(l[3].f).toBeCloseTo(11.93, 2);
    const r = exampleRates(fr);
    expect(r.bpfo).toBeCloseTo(106.29, 2);
    expect(r.bpfi).toBeCloseTo(163.26, 2);
  });
  it('기록 길이: 132000점 → 2^17', () => {
    expect(exampleSignal('normal').de.length).toBe(132000);
    expect(recordLength(132000)).toBe(131072);
  });
  for (const [kind, key] of [['outer', 'bpfo'], ['inner', 'bpfi'], ['ball', 'ball']] as const) {
    it(`${kind}: Kurtogram 대역이 구동측 공진(3.2 kHz)을 담고, 가장 두드러진 결함 = ${key}`, () => {
      const { band, scores } = run(kind);
      expect(band[0]).toBeLessThan(3200);
      expect(band[1]).toBeGreaterThan(3200);
      const top = [...scores].sort((a, b) => b.ratio - a.ratio)[0];
      expect(top.key).toBe(key);
      expect(top.ratio).toBeGreaterThan(5);
    });
  }
  it('정상: 가장 충격적인 대역도 SK ≈ 0, 어느 결함 자리도 바닥의 4배를 넘지 않는다', () => {
    const { scores, sk } = run('normal');
    expect(sk).toBeLessThan(0.3);
    for (const s of scores) expect(s.ratio).toBeLessThan(4);
  });
  it('빈 대역 빼기: AAF 위(신호 없음)에 튀는 값 몇 개만 있는 칸은 SK가 커도 고르지 않는다', () => {
    // 2.5 kHz 위를 완전히 잘라 낸 잡음 + 아주 작은 튀는 값 3개 (f_s 12 kHz)
    const fs = 12000;
    const n = 1 << 15;
    const rng = createRng(7);
    const X = fft(Float64Array.from({ length: n }, () => rng.normal()));
    const cut = Math.round((2500 / fs) * n);
    for (let k = cut; k <= n - cut; k++) X.real[k] = X.imag[k] = 0;
    const back = fft(X.real, X.imag.map((v) => -v));
    const x = back.real.map((v) => v / n);
    for (const i of [5000, 15000, 25000]) x[i] += 0.4;
    const raw = bestBand(x, fs, 500, 7, Infinity);
    expect(raw.kg.best.f1).toBeGreaterThan(2500);
    expect(raw.kg.best.sk).toBeGreaterThan(50);
    const { kg, empty } = bestBand(x, fs, 500);
    expect(empty).toBeGreaterThan(0);
    expect(kg.best.f2).toBeLessThanOrEqual(3000);
    expect(kg.best.sk).toBeLessThan(1);
  });
  it('평균 스펙트럼: 진폭 1 g 사인 → 0.707 g rms (Hann, bin 중앙)', () => {
    const fs = 1024;
    const x = Float64Array.from({ length: 8192 }, (_, i) => Math.sin((2 * Math.PI * 64 * i) / fs));
    const s = averagedSpectrum(x, fs, 1024);
    expect(s.amp[64]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(s.frames).toBe(15);
  });
});

// LAB-DATA-01 과제 답과 P11-2 본문이 인용하는 숫자 (랩과 같은 runPipeline)
describe('LAB-DATA-01 과제 숫자', () => {
  const rpm = EXAMPLE.rpm;
  const run = (kind: ExampleKind, ch: 'de' | 'fe' = 'de', band?: [number, number]) => runPipeline(exampleSignal(kind)[ch], EXAMPLE.fs, rpm, CWRU_DE, { band });
  const score = (p: ReturnType<typeof run>, key: string) => p.scores.find((s) => s.key === key)!;
  const near = (p: ReturnType<typeof run>, f: number, tol: number) => {
    let a = 0;
    for (let k = 0; k < p.spectrum.freq.length; k++) if (Math.abs(p.spectrum.freq[k] - f) < tol) a = Math.max(a, p.spectrum.amp[k]);
    return a;
  };
  it('예시 B(외륜): 스펙트럼의 BPFO 줄은 바닥의 약 3배 · 1X보다 낮고, 엔벨로프에서는 106.3 Hz가 약 200배', () => {
    const p = run('outer');
    expect(p.n).toBe(131072);
    expect(p.autoBand).toEqual([1500, 4500]);
    expect(p.kg.best.sk).toBeCloseTo(3.83, 2);
    const floor = floorOf(p.spectrum.freq, p.spectrum.amp, 50, 1000);
    expect(near(p, 107.4, 3) / floor).toBeGreaterThan(2.8);
    expect(near(p, 107.4, 3) / floor).toBeLessThan(3.8);
    expect(near(p, 107.4, 3)).toBeLessThan(near(p, 29.95, 1));
    const b = score(p, 'bpfo');
    expect(b.harmonics[0].f).toBeCloseTo(106.29, 1);
    expect(b.ratio).toBeGreaterThan(190);
    expect(b.ratio).toBeLessThan(215);
    expect(b.harmonics[1].ratio).toBeGreaterThan(100);
    expect(b.harmonics[2].ratio).toBeGreaterThan(80);
  });
  it('대역을 직접: 300 ~ 900 Hz는 약 25배, 2500 ~ 4500 Hz는 약 210배', () => {
    const lo = score(run('outer', 'de', [300, 900]), 'bpfo').ratio;
    expect(lo).toBeGreaterThan(22);
    expect(lo).toBeLessThan(28);
    const hi = score(run('outer', 'de', [2500, 4500]), 'bpfo').ratio;
    expect(hi).toBeGreaterThan(195);
    expect(hi).toBeLessThan(220);
  });
  it('예시 A · C · D: 정상 SK 0.04 · 모든 자리 4배 아래, 내륜 163.2 Hz와 ±1X 측대역, 볼 140.4 Hz와 FTF 11.8 Hz', () => {
    const a = run('normal');
    expect(a.kg.best.sk).toBeCloseTo(0.04, 2);
    for (const s of a.scores) for (const h of s.harmonics) expect(h.ratio).toBeLessThan(4);
    const c = score(run('inner'), 'bpfi');
    expect(c.harmonics[0].f).toBeCloseTo(163.2, 0);
    expect(c.ratio).toBeGreaterThan(100);
    expect(c.sideband).toBeGreaterThan(30);
    const d = run('ball');
    expect(score(d, 'ball').harmonics[0].f).toBeCloseTo(140.4, 0);
    expect(score(d, 'ball').ratio).toBeGreaterThan(80);
    expect(score(d, 'ftf').harmonics[0].f).toBeCloseTo(11.8, 0);
    expect(score(d, 'ftf').ratio).toBeGreaterThan(40);
  });
  it('예시 E: Kurtogram은 튐 대역(5.25 ~ 6 kHz, SK 약 33)을 고르고 거기서는 어느 줄도 6배를 넘지 않는다, 2.5 ~ 4.5 kHz에서는 BPFO 약 200배', () => {
    const p = run('spiky');
    expect(p.autoBand).toEqual([5250, 6000]);
    expect(p.kg.best.sk).toBeGreaterThan(30);
    expect(p.kg.best.sk).toBeLessThan(36);
    for (const s of p.scores) expect(s.ratio).toBeLessThan(QUIET_RATIO);
    const m = score(run('spiky', 'de', [2500, 4500]), 'bpfo');
    expect(m.harmonics[0].f).toBeCloseTo(106.29, 1);
    expect(m.ratio).toBeGreaterThan(190);
    expect(m.ratio).toBeLessThan(220);
  });
  it('f_s를 잘못 넣으면(12 kHz 기록을 48 kHz로): 1X가 4배 자리(약 120 Hz)에, 표에서는 볼 3배 칸만 우연히 선다', () => {
    const w = runPipeline(exampleSignal('outer').de, 48000, rpm, CWRU_DE);
    let best = { f: 0, a: 0 };
    for (let k = 2; k < w.spectrum.freq.length && w.spectrum.freq[k] < 200; k++) if (w.spectrum.amp[k] > best.a) best = { f: w.spectrum.freq[k], a: w.spectrum.amp[k] };
    expect(Math.abs(best.f - 4 * (rpm / 60))).toBeLessThan(w.spectrum.df);
    const ball = score(w, 'ball');
    expect(ball.ratio).toBeLessThan(QUIET_RATIO);
    expect(ball.harmonics[2].f).toBeCloseTo(425.2, 0);
    expect(ball.harmonics[2].ratio).toBeGreaterThan(100);
    for (const k of ['bpfo', 'bpfi', 'ftf']) expect(score(w, k).ratio).toBeLessThan(QUIET_RATIO);
  });
  it('예시 B 팬측: 대역이 2.2 kHz 쪽(1.5 ~ 3 kHz)으로, BPFO 바닥 대비는 구동측의 절반 아래', () => {
    const p = run('outer', 'fe');
    expect(p.autoBand).toEqual([1500, 3000]);
    const r = score(p, 'bpfo').ratio;
    expect(r).toBeGreaterThan(80);
    expect(r).toBeLessThan(100);
  });
});
