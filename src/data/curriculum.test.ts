import { describe, expect, it } from 'vitest';
import { PARTS, STAGES, STATUS_LABEL, partProgress } from './curriculum';

describe('curriculum status', () => {
  it('uses only 계획, 검토, 완료', () => {
    expect(Object.values(STATUS_LABEL)).toEqual(['계획', '검토', '완료']);
    const used = new Set(PARTS.flatMap((part) => part.sections.map((section) => section.status)));
    for (const status of used) expect(Object.keys(STATUS_LABEL)).toContain(status);
  });

  it('gives every published page 검토 and every unpublished page 계획 (2026-10-06 사용자 지시: 지금은 모두 검토)', () => {
    for (const section of PARTS.flatMap((part) => part.sections)) {
      if (section.href) expect(section.status).toBe('review');
      else expect(section.status).toBe('planned');
    }
    const part2 = PARTS.find((part) => part.num === 2)!;
    const published = part2.sections.filter((section) => section.href);
    expect(partProgress(part2)).toEqual({ review: published.length, done: 0, ready: published.length, total: part2.sections.length });
  });
});

describe('번호 체계 (D-039: Part와 절은 1부터)', () => {
  it('Part는 1 ~ 11, 각 Part의 절은 P{Part}-1부터 빈틈없이', () => {
    expect(PARTS.map((part) => part.num)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (const part of PARTS) {
      part.sections.forEach((section, i) => {
        expect(section.id).toBe(`P${part.num}-${i + 1}`);
        if (section.href) expect(section.href).toBe(`/p${part.num}-${i + 1}/`);
      });
    }
  });

  it('학습 단계 넷이 모든 Part를 한 번씩 담는다', () => {
    expect(STAGES.flatMap((s) => s.parts).sort((a, b) => a - b)).toEqual(PARTS.map((part) => part.num));
  });

  it('keeps the Part 1 title used by the Part navigation', () => {
    expect(PARTS.find((part) => part.num === 1)?.title).toBe('진동의 기초: 기계는 왜, 어떻게 흔들리나');
  });
});
