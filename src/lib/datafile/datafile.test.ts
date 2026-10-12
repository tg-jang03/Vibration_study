import { deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { averagedSpectrum, bestBand, defectLines, envelope, recordLength, scoreDefects, takeRecord } from './analysis';
import { parseCsv } from './csv';
import { EXAMPLE, exampleRates, exampleSignal, type ExampleKind } from './example';
import { CWRU_DE, cwruLabel, readDataFile } from './index';
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
  it('Level 4 double 행렬', async () => {
    const head = i32(0, 3, 1, 0, 2);
    const bytes = cat(head, ascii('a\0'), f64([1.5, 2.5, 3.5]));
    const arrs = await parseMat(bytes, inflate);
    expect(arrs[0].name).toBe('a');
    expect(Array.from(arrs[0].data)).toEqual([1.5, 2.5, 3.5]);
  });
});

describe('readDataFile', () => {
  it('MAT: 벡터 채널 · RPM, f_s 없음 안내', async () => {
    const ds = await readDataFile('105.mat', matFile([matrix('X105_DE_time', 2048, 1, f64(sine(2048, 30, 12000))), matrix('X105_FE_time', 2048, 1, f64(sine(2048, 30, 12000))), matrix('X105RPM', 1, 1, f64([1797]))]), inflate);
    expect(ds.channels.map((c) => c.name)).toEqual(['X105_DE_time', 'X105_FE_time']);
    expect(ds.rpm).toBe(1797);
    expect(ds.fs).toBeNull();
    expect(ds.notes.join(' ')).toMatch(/12 kHz/);
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
  it('CWRU 파일 번호 → 라벨 (12 kHz 구동측 · 정상 목록)', () => {
    expect(cwruLabel('105.mat')?.label).toBe('내륜 결함 0.007″, 하중 0 hp, 약 1797 rpm');
    expect(cwruLabel('C:/data/133.mat')?.fault).toBe('outer');
    expect(cwruLabel('133.mat')?.load).toBe(3);
    expect(cwruLabel('99.mat')?.label).toBe('정상, 하중 2 hp, 약 1750 rpm');
    expect(cwruLabel('224.mat')?.fault).toBe('ball');
    expect(cwruLabel('109.mat')).toBeNull();
    expect(cwruLabel('rec.wav')).toBeNull();
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
  it('평균 스펙트럼: 진폭 1 g 사인 → 0.707 g rms (Hann, bin 중앙)', () => {
    const fs = 1024;
    const x = Float64Array.from({ length: 8192 }, (_, i) => Math.sin((2 * Math.PI * 64 * i) / fs));
    const s = averagedSpectrum(x, fs, 1024);
    expect(s.amp[64]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(s.frames).toBe(15);
  });
});
