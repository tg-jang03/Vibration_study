/**
 * 맞물린 기어 한 쌍이 도는 모습과 맞물림마다의 충격 (P7-6, LAB-GEAR-01의 움직이는 그림, D-044). 순수 함수.
 * 맞물림 n의 시각 = (n + offset)/GMF, 그때 맞물리는 이빨 = 피니언 n mod z₁, 기어 n mod z₂ — gear.ts의 신호 모델과 같다.
 * 각도는 화면 수학 각(+x = 0, 반시계 +). 피니언은 반시계, 기어는 시계로 돈다. 맞물림 자리 = 두 중심을 잇는 선 위.
 * 충격 세기는 설명용 상대값(건전한 맞물림 = 1)이고 신호 모델의 크기와는 따로다.
 */
import { GEAR_DEMO, GEAR_PAIR, type GearFault, type GearSide } from './gear';

const TWO_PI = 2 * Math.PI;
const { z1, z2, gmf, f1, f2 } = GEAR_PAIR;

export const meshTime = (n: number) => (n + GEAR_DEMO.offset) / gmf;

/** 피니언 이빨 p의 각도: 시각 meshTime(n), p = n mod z₁일 때 맞물림 자리(0, 기어 쪽)에 온다 */
export const pinionToothAngle = (p: number, t: number) => TWO_PI * f1 * t - (TWO_PI * (p + GEAR_DEMO.offset)) / z1;

/** 기어 이빨 g의 각도: 시각 meshTime(n), g = n mod z₂일 때 맞물림 자리(π, 피니언 쪽)에 온다 */
export const gearToothAngle = (g: number, t: number) => Math.PI - TWO_PI * f2 * t + (TWO_PI * (g + GEAR_DEMO.offset)) / z2;

export interface MeshEvent {
  t: number;
  n: number;
  /** 맞물린 피니언·기어 이빨 번호 (0부터) */
  p: number;
  g: number;
  /** 충격 세기 (건전한 맞물림 = 1) */
  w: number;
  /** 상한 이빨이 끼었나 (2 = 두 상한 이빨이 함께) */
  damaged: 0 | 1 | 2;
}

const mod = (a: number, m: number) => ((a % m) + m) % m;

/** t0 ≤ t < t1의 맞물림. onlyDamaged면 상한 이빨이 낀 것만 (헌팅 투스 주기처럼 긴 창에서) */
export function meshEvents(fault: GearFault, side: GearSide, t0: number, t1: number, onlyDamaged = false): MeshEvent[] {
  const out: MeshEvent[] = [];
  const nFirst = Math.ceil(t0 * gmf - GEAR_DEMO.offset - 1e-9);
  for (let n = nFirst; meshTime(n) < t1; n++) {
    const t = meshTime(n);
    const p = mod(n, z1);
    const g = mod(n, z2);
    let damaged: 0 | 1 | 2 = 0;
    let w = 1;
    if (fault === 'broken') {
      if ((side === 'pinion' && p === GEAR_DEMO.pinionTooth) || (side === 'gear' && g === GEAR_DEMO.gearTooth)) {
        damaged = 1;
        w = 5;
      }
    } else if (fault === 'hunting') {
      const hp = p === GEAR_DEMO.pinionTooth;
      const hg = g === GEAR_DEMO.gearTooth;
      if (hp && hg) {
        damaged = 2;
        w = 6;
      } else if (hp || hg) {
        damaged = 1;
        w = 1.8;
      }
    } else if (fault === 'eccentric') {
      // 편심 기어가 한 바퀴에 한 번 더 깊게 물린다
      w = 1 + 0.6 * Math.cos(TWO_PI * (side === 'pinion' ? f1 : f2) * t);
    } else if (fault === 'wear') {
      w = 1.35;
    }
    if (!onlyDamaged || damaged > 0) out.push({ t, n, p, g, w, damaged });
  }
  return out;
}
