/**
 * BASE_URL(GitHub Pages 하위 경로)을 붙인 사이트 내부 경로를 만든다.
 * withBase('/parts/1/') → '/Vibration_study/parts/1/'
 */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

export const SITE_NAME = '기계 진동 분석';
/** 영어 이름 (D-054) — 영어판 머리·검색 결과의 다른 이름 */
export const SITE_NAME_EN = 'Machine Vibration Analysis';
/** 홈 제목 뒤에 붙는 한 줄 소개 (검색 결과 제목) */
export const SITE_TAGLINE = '진동·신호처리·회전기계 진단 인터랙티브 학습';
/**
 * 검색엔진 소유 확인 코드 (D-054). 사용자가 Google Search Console(URL 접두어 속성)·네이버 서치어드바이저·
 * Bing 웹마스터 도구에서 "HTML 태그" 방식을 고르면 나오는 content 값만 넣는다. 빈 값이면 태그를 넣지 않는다.
 */
export const SITE_VERIFICATION = { google: '-5U1wI8_T2onMVncxroPF8viemxlGrfQNcxIoP_NOm0', naver: '', bing: '' };
export const REPO_URL = 'https://github.com/tg-jang03/Vibration_study';
