import { describe, expect, it } from 'vitest';
import { PARTS, STATUS_LABEL, partProgress } from './curriculum';

describe('curriculum status', () => {
  it('uses only 계획, 검토, 완료', () => {
    expect(Object.values(STATUS_LABEL)).toEqual(['계획', '검토', '완료']);
    expect(new Set(PARTS.flatMap((part) => part.sections.map((section) => section.status)))).toEqual(
      new Set(['planned', 'review']),
    );
  });

  it('marks every published Part 1 page as 검토', () => {
    const part1 = PARTS.find((part) => part.num === 1);
    expect(part1).toBeDefined();
    expect(part1?.sections.filter((section) => section.href)).toHaveLength(6);
    expect(part1?.sections.filter((section) => section.href).every((section) => section.status === 'review')).toBe(true);
    expect(part1 && partProgress(part1)).toEqual({ review: 6, done: 0, ready: 6, total: 9 });
  });

  it('keeps the revised Part 0 title used by the Part navigation', () => {
    expect(PARTS.find((part) => part.num === 0)?.title).toBe('진동의 기초: 기계는 왜, 어떻게 흔들리나');
  });
});
