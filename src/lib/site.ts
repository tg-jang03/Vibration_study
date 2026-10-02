/**
 * BASE_URL(GitHub Pages 하위 경로)을 붙인 사이트 내부 경로를 만든다.
 * withBase('/parts/1/') → '/Vibration_study/parts/1/'
 */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

export const SITE_NAME = '진동공부';
export const REPO_URL = 'https://github.com/tg-jang03/Vibration_study';
