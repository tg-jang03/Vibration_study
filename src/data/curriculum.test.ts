import { describe, expect, it } from 'vitest';
import { PARTS, STATUS_LABEL, partProgress } from './curriculum';

describe('curriculum status', () => {
  it('uses only 계획, 검토, 완료', () => {
    expect(Object.values(STATUS_LABEL)).toEqual(['계획', '검토', '완료']);
    const used = new Set(PARTS.flatMap((part) => part.sections.map((section) => section.status)));
    for (const status of used) expect(Object.keys(STATUS_LABEL)).toContain(status);
  });

  it('gives every published page 검토 or 완료, and no unpublished page beyond 계획', () => {
    for (const section of PARTS.flatMap((part) => part.sections)) {
      if (section.href) expect(['review', 'done']).toContain(section.status);
      else expect(section.status).toBe('planned');
    }
  });

  it('marks the user-confirmed Part 1 pages (P1-1 ~ P1-4, 2026-10-06) as 완료', () => {
    const part1 = PARTS.find((part) => part.num === 1);
    expect(part1).toBeDefined();
    const status = (id: string) => part1?.sections.find((section) => section.id === id)?.status;
    for (const id of ['P1-1', 'P1-2', 'P1-3', 'P1-4']) expect(status(id)).toBe('done');
    const published = part1?.sections.filter((section) => section.href) ?? [];
    expect(part1 && partProgress(part1)).toEqual({
      review: published.filter((section) => section.status === 'review').length,
      done: published.filter((section) => section.status === 'done').length,
      ready: published.length,
      total: part1?.sections.length,
    });
  });

  it('keeps the revised Part 0 title used by the Part navigation', () => {
    expect(PARTS.find((part) => part.num === 0)?.title).toBe('진동의 기초: 기계는 왜, 어떻게 흔들리나');
  });
});
