/**
 * 그림·참고자료의 한국어 → 영어 사전을 모은다 (D-054, 빌드 때만 읽음).
 * - 그림: src/i18n/en/figures/p{Part}-{절}.ts — 그림 파일(src/figures/…)의 라벨·제목·캡션 원문을 키로
 * - 참고자료: src/i18n/en/references.ts — data/references.ts의 한국어 서지·링크 이름
 * 그림 코드는 고치지 않는다. 영어 페이지에서 Figure·References가 이 사전으로 바꿔 그린다.
 */
import { compileDict, type Dict } from './translate';
import { REFERENCES_EN } from './en/references';

const figureDicts = import.meta.glob<{ default: Dict }>('./en/figures/*.ts', { eager: true });

export const FIGURE_EN = compileDict(...Object.values(figureDicts).map((m) => m.default));
export const REFERENCE_EN = compileDict(REFERENCES_EN);
