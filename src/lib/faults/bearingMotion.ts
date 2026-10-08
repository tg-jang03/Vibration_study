/**
 * 볼베어링이 도는 모습과 결함 충격의 시각 (P7-5, LAB-BRG-02의 움직이는 그림, D-044). 순수 함수.
 * 외륜 고정, 내륜 = 축(1초에 f_r 바퀴), 케이지 = 1초에 FTF 바퀴, 볼 = 케이지와 함께 돌며 스스로 BSF로 돈다.
 * 각도는 아래(하중대 가운데, 축 무게가 실리는 쪽) = 0, 반시계 + [rad].
 * 충격 세기의 하중대 가중은 bearingSignal(bearing.ts)과 같다: 0.55 + 0.45 cos(자리의 각도).
 */
import type { BearingFrequencies } from '../machine/frequencies';
import type { BearingFault } from './bearing';

const TWO_PI = 2 * Math.PI;

export interface BearingPose {
  /** 내륜(축)의 각도 */
  inner: number;
  /** 케이지 각도 = 0번 볼의 자리 */
  cage: number;
  /** 각 볼 중심의 자리 */
  balls: number[];
  /** 볼의 자전 각도 (케이지에서 본 것, 내륜과 반대 방향으로 돈다) */
  spin: number;
}

/** 시각 t의 자세. t = 0에 0번 볼·내륜 표시·외륜 결함이 모두 아래(0)에 있다 */
export function bearingPose(b: BearingFrequencies, fr: number, balls: number, t: number): BearingPose {
  const cage = TWO_PI * b.ftf * t;
  return {
    inner: TWO_PI * fr * t,
    cage,
    balls: Array.from({ length: balls }, (_, k) => cage + (TWO_PI * k) / balls),
    spin: TWO_PI * b.bsf * t,
  };
}

/** 하중대 가중: 아래(0)에서 1, 위(π)에서 0.1 */
export const loadWeight = (angle: number) => 0.55 + 0.45 * Math.cos(angle);

export interface BearingImpact {
  t: number;
  /** 충격 세기 (외륜 결함 = 1 기준) */
  w: number;
  /** 충격이 난 자리 */
  angle: number;
  /** 볼 결함일 때 닿은 궤도면 */
  race?: 'outer' | 'inner';
}

/**
 * t0 ≤ t < t1 사이의 결함 충격.
 * - 외륜(아래 고정): 볼이 하나씩 지날 때마다 → 간격 1/(N·FTF) = 1/BPFO, 세기 일정
 * - 내륜(축과 함께 돎): 결함이 볼을 따라잡을 때마다 → 1/(N(f_r − FTF)) = 1/BPFI, 결함 자리의 하중대 가중 → 1X로 오르내림
 * - 볼(0번 볼의 흠): 자전 반 바퀴마다 외륜·내륜에 번갈아 → 1/(2·BSF), 볼 자리의 하중대 가중 → FTF로 오르내림
 * - 케이지(0번 칸이 부러짐): 그 칸이 하중대 가운데를 지날 때 → 1/FTF
 */
export function bearingImpacts(fault: BearingFault, b: BearingFrequencies, fr: number, balls: number, t0: number, t1: number): BearingImpact[] {
  const out: BearingImpact[] = [];
  const each = (rate: number, make: (j: number, t: number) => BearingImpact | null) => {
    for (let j = Math.ceil(t0 * rate - 1e-9); j / rate < t1; j++) {
      const t = j / rate;
      if (t < t0) continue;
      const hit = make(j, t);
      if (hit) out.push(hit);
    }
  };
  switch (fault) {
    case 'outer':
      each(balls * b.ftf, (_, t) => ({ t, w: 1, angle: 0 }));
      break;
    case 'inner':
      each(balls * (fr - b.ftf), (_, t) => {
        const angle = TWO_PI * fr * t;
        return { t, w: loadWeight(angle), angle };
      });
      break;
    case 'ball':
      each(2 * b.bsf, (j, t) => {
        const angle = TWO_PI * b.ftf * t;
        const outer = j % 2 === 0;
        return { t, w: (outer ? 1 : 0.6) * loadWeight(angle), angle, race: outer ? 'outer' : 'inner' };
      });
      break;
    case 'cage':
      each(b.ftf, (_, t) => ({ t, w: 0.4, angle: 0 }));
      break;
  }
  return out;
}
