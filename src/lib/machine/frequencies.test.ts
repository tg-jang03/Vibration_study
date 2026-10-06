import { describe, expect, it } from 'vitest';
import {
  BEARING_6205,
  bearingFrequencies,
  beltFrequency,
  bladePass,
  electromagneticForce,
  gearMesh,
  gearPair,
  oilWhirlBand,
  perRevolution,
} from './frequencies';
import { buildMap, interestZones, PRESETS, zoneOf } from './frequencyMap';

describe('세는 규칙 — 한 바퀴에 k번 → k × f_r (Contents §6, D-032)', () => {
  it('3000 rpm에서 3번 → 150 Hz, 날개 7개 3600 rpm → 420 Hz', () => {
    expect(perRevolution(3, 3000 / 60)).toBeCloseTo(150, 12);
    expect(bladePass(7, 3600 / 60)).toBeCloseTo(420, 12);
  });

  it('기어 이빨 15·60, 입력 3000 rpm → 맞물림 750 Hz, 출력 축 12.5 Hz (z₁f₁ = z₂f₂)', () => {
    expect(gearMesh(15, 50)).toBe(750);
    const pair = gearPair(15, 60, 50);
    expect(pair.mesh).toBe(750);
    expect(pair.f2).toBeCloseTo(12.5, 12);
    expect(gearMesh(60, pair.f2)).toBeCloseTo(pair.mesh, 12);
  });

  it('전자기력은 전원 60 Hz의 두 배 120 Hz', () => {
    expect(electromagneticForce(60)).toBe(120);
  });
});

describe('구름베어링 주파수', () => {
  it('6205 (볼 9, d 7.94 mm, D 39.04 mm) → FTF 0.3983X, BPFO 3.585X, BPFI 5.415X, BSF 2.357X (2× 4.713X)', () => {
    const b = bearingFrequencies(BEARING_6205, 1);
    expect(b.ftf).toBeCloseTo(0.3983, 4);
    expect(b.bpfo).toBeCloseTo(3.585, 3);
    expect(b.bpfi).toBeCloseTo(5.415, 3);
    expect(b.bsf).toBeCloseTo(2.357, 3);
    expect(b.bsf2).toBeCloseTo(4.713, 3);
  });

  it('BPFO + BPFI = N_r × f_r (외륜·내륜에서 센 횟수의 합 = 볼 수 × 회전수)', () => {
    const b = bearingFrequencies({ balls: 12, ballDiameter: 0.01, pitchDiameter: 0.06, contactAngle: 0.3 }, 37);
    expect(b.bpfo + b.bpfi).toBeCloseTo(12 * 37, 9);
  });

  it('경험칙: d/D ≈ 0.2이면 BPFO ≈ 0.4·N_r·f_r, BPFI ≈ 0.6·N_r·f_r (±2 %)', () => {
    const b = bearingFrequencies(BEARING_6205, 50);
    expect(b.bpfo / (0.4 * 9 * 50)).toBeGreaterThan(0.98);
    expect(b.bpfo / (0.4 * 9 * 50)).toBeLessThan(1.02);
    expect(b.bpfi / (0.6 * 9 * 50)).toBeGreaterThan(0.98);
    expect(b.bpfi / (0.6 * 9 * 50)).toBeLessThan(1.02);
  });

  it('BPFO·BPFI는 1X의 정수배가 아니다 (6205)', () => {
    const b = bearingFrequencies(BEARING_6205, 1);
    expect(Math.abs(b.bpfo - Math.round(b.bpfo))).toBeGreaterThan(0.3);
    expect(Math.abs(b.bpfi - Math.round(b.bpfi))).toBeGreaterThan(0.3);
  });
});

describe('벨트 · 기름막', () => {
  it('풀리 0.2 m, 벨트 1.6 m, 1800 rpm → π·0.2·30/1.6 ≈ 11.78 Hz (1X보다 낮다)', () => {
    const f = beltFrequency(0.2, 1.6, 30);
    expect(f).toBeCloseTo((Math.PI * 0.2 * 30) / 1.6, 12);
    expect(f).toBeLessThan(30);
  });

  it('기름막 대역 0.38 ~ 0.48X', () => {
    expect(oilWhirlBand(60)).toEqual([0.38 * 60, 0.48 * 60]);
  });
});

describe('주파수 지도 (LAB-FMAP-01)', () => {
  it('관심 구간 4개가 이어져 있다: 1X 아래 / 1X ~ 10X / 10X ~ 수 kHz / 수 kHz 이상', () => {
    const zones = interestZones(60);
    expect(zones.map((z) => z.id)).toEqual(['sub', 'low', 'mid', 'high']);
    for (let i = 1; i < zones.length; i++) expect(zones[i].f1).toBe(zones[i - 1].f2);
    expect(zones[1].f2).toBe(600);
    expect(zoneOf(30, zones)).toBe('sub');
    expect(zoneOf(420, zones)).toBe('low');
    expect(zoneOf(1800, zones)).toBe('mid');
    expect(zoneOf(3000, zones)).toBe('high');
  });

  it('기어 상자 프리셋: 맞물림 750 Hz, 출력 축 12.5 Hz', () => {
    const p = PRESETS.gearbox;
    const map = buildMap('gearbox', { rpm: p.rpm, count: p.count, balls: 9 });
    const find = (el: string, label: string) => map.rows.find((row) => row.element === el)?.lines.find((l) => l.label === label)?.f;
    expect(find('기어 맞물림', '맞물림')).toBeCloseTo(750, 9);
    expect(find('출력 축', '1X')).toBeCloseTo(12.5, 9);
  });

  it('회전수를 바꾸면 회전 관련 줄만 같은 비율로 움직이고 전원·구조 줄은 그대로', () => {
    const a = buildMap('motorPump', { rpm: 3000, count: 7, balls: 9 });
    const b = buildMap('motorPump', { rpm: 3300, count: 7, balls: 9 });
    a.rows.forEach((row, i) =>
      row.lines.forEach((line, j) => {
        const ratio = b.rows[i].lines[j].f / line.f;
        if (line.kind === 'rotating') expect(ratio).toBeCloseTo(1.1, 12);
        else expect(ratio).toBe(1);
      }),
    );
  });

  it('GT-발전기 3600 rpm: 2X와 2 f_L이 둘 다 120 Hz', () => {
    const map = buildMap('gtGenerator', { rpm: 3600, count: 30, balls: 9 });
    const twoX = map.rows[0].lines.find((l) => l.label === '2X')?.f;
    const twoFL = map.rows.find((row) => row.element === '발전기 (전기)')?.lines[0].f;
    expect(twoX).toBeCloseTo(120, 12);
    expect(twoFL).toBe(120);
  });
});
