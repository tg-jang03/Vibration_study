import { describe, expect, it } from 'vitest';
import { dragGrid, snapDragValue } from './sliderSnap';

// FMAP-01 회전수 슬라이더: 300 ~ 6000 rpm, 10 rpm 간격 (570칸). 데스크톱 3열 배치의 트랙은 약 210 px.
const FMAP = { min: 300, max: 6000, step: 10, trackPx: 210 };

describe('dragGrid', () => {
  it('칸이 1 px 이상이면 step 그대로', () => {
    expect(dragGrid({ min: 600, max: 6000, step: 100, trackPx: 210 })).toBe(100);
    expect(dragGrid({ min: 0, max: 1.5, step: 0.01, trackPx: 210 })).toBe(0.01); // 150칸, 1.4 px
  });

  it('칸이 1 px보다 촘촘하면 1·2·5 배수 가운데 1.5 px 이상인 가장 작은 격자', () => {
    expect(dragGrid(FMAP)).toBe(50); // 50 rpm = 1.84 px
    expect(dragGrid({ ...FMAP, trackPx: 320 })).toBe(50);
    expect(dragGrid({ min: 300, max: 7200, step: 5, trackPx: 210 })).toBe(50); // 1.52 px
    expect(dragGrid({ min: -1, max: 1, step: 0.002, trackPx: 210 })).toBeCloseTo(0.02); // 0.01은 1.05 px
  });
});

describe('snapDragValue', () => {
  it('끌어서 3600 rpm에 멈출 수 있다 (근처 값이 3600으로)', () => {
    for (const raw of [3580, 3590, 3600, 3610, 3620]) expect(snapDragValue(raw, FMAP)).toBe(3600);
    expect(snapDragValue(3630, FMAP)).toBe(3650);
  });

  it('marks는 격자 밖이어도 가장 가까우면 고른다', () => {
    const opts = { ...FMAP, marks: [3570] };
    expect(snapDragValue(3570, opts)).toBe(3570);
    expect(snapDragValue(3560, opts)).toBe(3570);
    expect(snapDragValue(3540, opts)).toBe(3550);
    expect(snapDragValue(3590, opts)).toBe(3600);
  });

  it('양 끝은 그대로, 칸이 넉넉한 슬라이더는 손대지 않는다', () => {
    expect(snapDragValue(300, FMAP)).toBe(300);
    expect(snapDragValue(6000, FMAP)).toBe(6000);
    expect(snapDragValue(3570, { min: 600, max: 6000, step: 30, trackPx: 210 })).toBe(3570);
  });

  it('소수 간격도 부동소수 찌꺼기 없이', () => {
    const opts = { min: -1, max: 1, step: 0.002, trackPx: 210 };
    expect(snapDragValue(0.126, opts)).toBe(0.12);
    expect(snapDragValue(-0.054, opts)).toBe(-0.06);
  });

  it('0에서 센 배수가 step 격자에서 벗어나면 min에서 센다', () => {
    // min 1, step 3 → 1, 4, 7 …; 격자 30이면 1, 31, 61 …
    const opts = { min: 1, max: 3001, step: 3, trackPx: 210 };
    expect(dragGrid(opts)).toBe(30);
    expect(snapDragValue(34, opts)).toBe(31);
  });
});
