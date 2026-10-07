import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * MDX의 마크다운 링크 안에는 JS 식이 들어가지 않는다: [글](  {withBase('/p4-4/')}  )는 href="%7BwithBase…%7D"로 깨진다.
 * 사이트 안 링크는 <a href={withBase('/p4-4/')}>글</a>로 쓴다 (2026-10-07, 트랙 B 페이지 8곳에서 발견).
 */
describe('MDX 페이지 링크', () => {
  const dir = path.resolve(__dirname, '../pages');
  const files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  it.each(files)('%s: 마크다운 링크 안에 {withBase(…)}를 쓰지 않는다', (f) => {
    const text = readFileSync(path.join(dir, f), 'utf8');
    expect(text.match(/\]\(\s*\{\s*withBase/g) ?? []).toEqual([]);
  });
});
