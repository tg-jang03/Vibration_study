/**
 * 합성 예시 신호 (LAB-DATA-01 · P11-2 그림): CWRU 시험대(6205 구동측, 1797 rpm, 12 kHz)를 흉내 낸 **가상** 가속도 [g].
 * 실제 데이터가 아니다 — 파일 없이 랩을 써 보고, 분석 순서를 그림으로 보이려는 것. 순수 함수, 시드 고정.
 * - 충격: 결함 박자마다 시험대 공진(구동측 3.2 kHz · 팬측 2.2 kHz)이 울린다. 박자 흔들림 1 %, 크기 흔들림 10 %.
 * - 미끄럼 1 %: 케이지가 늦게 돌아 BPFO·볼 박자는 계산보다 조금 낮고, BPFI는 조금 높다 (P7-5).
 * - 내륜은 1X로, 볼은 FTF로 충격 크기가 출렁인다(하중 영역을 드나듦). 바탕 잡음과 작은 1X·2X.
 */
import { designIir, sosFilter } from '../dsp/filter';
import { createRng } from '../dsp/random';
import { CWRU_DE } from './index';

export type ExampleKind = 'normal' | 'outer' | 'inner' | 'ball';
export const EXAMPLE_LABEL: Record<ExampleKind, string> = { normal: '정상', outer: '외륜 결함', inner: '내륜 결함', ball: '볼 결함' };

export const EXAMPLE = { fs: 12000, rpm: 1797, seconds: 11, slip: 0.01, deHz: 3200, feHz: 2200, zeta: 0.04, noiseG: 0.05 } as const;

/** 미끄럼을 넣은 실제 결함 박자 [Hz] */
export function exampleRates(fr: number, slip: number = EXAMPLE.slip) {
  const b = CWRU_DE;
  return {
    bpfo: b.bpfo * fr * (1 - slip),
    bpfi: b.bpfi * fr + b.bpfo * fr * slip,
    ball: b.ball * fr * (1 - slip / 2),
    ftf: b.ftf * fr * (1 - slip),
  };
}

const IMPACT_G: Record<Exclude<ExampleKind, 'normal'>, number> = { outer: 0.5, inner: 0.5, ball: 0.35 };

export interface ExampleSignal {
  kind: ExampleKind;
  fs: number;
  rpm: number;
  /** 구동측(DE)·팬측(FE) 가속도 [g] */
  de: Float64Array;
  fe: Float64Array;
}

const cache = new Map<string, ExampleSignal>();

export function exampleSignal(kind: ExampleKind, seed = 2203): ExampleSignal {
  const key = `${kind}|${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { fs, rpm, seconds, zeta, noiseG } = EXAMPLE;
  const n = Math.round(fs * seconds);
  const fr = rpm / 60;
  const rng = createRng(seed + ['normal', 'outer', 'inner', 'ball'].indexOf(kind));
  const de = new Float64Array(n);
  const fe = new Float64Array(n);
  // 축 성분 (작다)
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    const s = 0.012 * Math.cos(2 * Math.PI * fr * t + 0.4) + 0.006 * Math.cos(4 * Math.PI * fr * t + 1.1);
    de[i] += s;
    fe[i] += 0.8 * s;
  }
  if (kind !== 'normal') {
    const r = exampleRates(fr);
    const rate = kind === 'outer' ? r.bpfo : kind === 'inner' ? r.bpfi : r.ball;
    const weight = kind === 'inner' ? (t: number) => 0.5 + 0.5 * Math.cos(2 * Math.PI * fr * t) : kind === 'ball' ? (t: number) => 0.55 + 0.45 * Math.cos(2 * Math.PI * r.ftf * t) : () => 1;
    const ring = (arr: Float64Array, fHz: number, amp: number, tk: number) => {
      const wn = 2 * Math.PI * fHz;
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      const i0 = Math.ceil(tk * fs);
      const len = Math.round((6 / (zeta * wn)) * fs);
      for (let i = Math.max(0, i0); i < Math.min(n, i0 + len); i++) {
        const tau = i / fs - tk;
        arr[i] += amp * Math.exp(-zeta * wn * tau) * Math.sin(wd * tau);
      }
    };
    for (let k = 0; k / rate < seconds; k++) {
      const tk = (k + 0.01 * rng.normal()) / rate;
      const a = IMPACT_G[kind] * Math.max(0, 1 + 0.1 * rng.normal()) * weight(tk);
      ring(de, EXAMPLE.deHz, a, tk);
      ring(fe, EXAMPLE.feHz, 0.25 * a, tk);
    }
  }
  for (let i = 0; i < n; i++) {
    de[i] += noiseG * rng.normal();
    fe[i] += noiseG * 0.8 * rng.normal();
  }
  // 가속도계 입력단의 고역 통과(10 Hz): 충격 울림이 남기는 아주 낮은 주파수 찌꺼기를 지운다
  const hp = designIir({ family: 'butterworth', kind: 'highpass', order: 2, fc: 10, fs }).sos;
  const out: ExampleSignal = { kind, fs, rpm, de: sosFilter(hp, de), fe: sosFilter(hp, fe) };
  if (cache.size > 8) cache.clear();
  cache.set(key, out);
  return out;
}
