import type { FigureSpec } from '../lib/figure';
import { cards } from './p10-shared';
/** Entirely fictional measurements, not a machine acceptance limit or field record. */
export const P103_VALUES = { rpm: 3000, hz: 3000 / 60, baselinePeak: 20e-6, currentPeak: 40e-6,
  ratio: 40e-6 / 20e-6, speedRpm: [2400, 3000, 3600], peak: [20e-6, 40e-6, 20e-6] };
export const loop = cards('fig-p10-3-1', '그림 1. 측정 유효성 → 조건을 맞춘 비교 → 가설과 예측 → 확인 시험 → 권고와 재검증을 반복합니다. 아래는 이 사이트가 재구성한 학습 절차입니다.', [
  { title: '1. 유효한 자료', lines: ['기계·운전 정보', '센서·단위·기록 확인'] },
  { title: '2. 이상과 후보', lines: ['기준선·규격·추세', '지지·반증·미확인 증거'] },
  { title: '3. 시험과 조치', lines: ['예측 → 확인 → 권고', '결과로 가설·기준 재검토'] },
]);
export const validity = cards('fig-p10-3-2', '그림 2. 진단 전에는 기계 지도, 운전 이력, 측정 유효성을 확인합니다. 서로 다른 조건의 수치를 묶으면 원인보다 측정 차이를 설명하게 됩니다.', [
  { title: '기계 지도', lines: ['축·베어링·기어·날개', '센서 위치와 키페이저'] },
  { title: '운전·정비 이력', lines: ['회전수·부하·열 상태', '언제부터·무엇을 바꿨나'] },
  { title: '자료 품질', lines: ['단위·대역·교정·부착', '클리핑·갭·시각·위상'] },
]);
export const evidence = cards('fig-p10-3-3', '그림 3. 가상 3000 rpm의 1X는 50 Hz입니다. 1X 변위 Peak가 20→40 µm로 늘었다는 관측을 주파수·진폭·위상·방향·운전조건과 함께 기록합니다.', [
  { title: '주파수·진폭', lines: ['1X = 50 Hz', '20 → 40 µm Peak'] },
  { title: '위상·방향', lines: ['기준과 비교할 위상', 'H·V·A / 베어링 양쪽'] },
  { title: '운전 조건', lines: ['속도·부하·열 상태', '지지·반증·미확인 분리'] },
]);
export const experiment: FigureSpec = {
  id: 'fig-p10-3-4', caption: '그림 4. 가상 속도별 1X Peak는 2400·3000·3600 rpm에서 20·40·20 µm입니다. 가운데 속도점의 응답 증가가 공진 후보를 지지하지만, 위상·구조 시험 없이 원인을 확정하지 않습니다.',
  panels: [{ height: 175, x: { range: [2200, 3800], label: '회전수 [rpm]', ticks: [2400, 3000, 3600] }, y: { range: [0, 50], label: '가상 1X 변위 [µm Peak]' },
    series: [{ x: P103_VALUES.speedRpm, y: P103_VALUES.peak.map(v => v * 1e6), kind: 'dots', color: 'c1', radius: 5 }],
    annotations: [{ type: 'text', x: 3000, y: 46, anchor: 'middle', text: '관측점 3개 · 사이의 모양은 미확인' }] }],
};
export const report = cards('fig-p10-3-5', '그림 5. 보고서 첫 장은 관측·판단·권고를 구별합니다. 다음 장의 데이터, 확신도와 미확인 항목이 첫 장의 조치를 뒷받침합니다.', [
  { title: '요약·권고 먼저', lines: ['무엇이 변했고 무엇을 할까', '대상·조건·담당·시점'] },
  { title: '근거와 확신도', lines: ['관측 / 해석 / 미확인', '대안·반증·원자료 연결'] },
  { title: '후속 확인', lines: ['재측정·시험·중단 기준', '조치 후 같은 조건 비교'] },
]);
export const prognosis = cards('fig-p10-3-6', '그림 6. 추세선은 관측 범위의 요약입니다. 남은 수명과 다음 고장 시점을 말하려면 열화 모델·조건·불확실성이 더 필요합니다.', [
  { title: '관측', lines: ['어떤 크기가 언제 변했나', '조건별 비교·자료 품질'] },
  { title: '예측', lines: ['열화 모델·반복 관측', '범위·가정·불확실성'] },
  { title: '재검증', lines: ['조치 뒤 기준 조건 측정', '변화 이유·재발·부작용'] },
]);
export const categories = cards('fig-p10-3-7', '그림 7. CAT I~IV는 분석 인력의 교육·경험·평가 범주입니다. 기계의 진동 등급이나 설비 운전 승인 등급이 아닙니다.', [
  { title: 'CAT I / II', lines: ['정해진 측정 / 기본 분석', '자료 품질·기기 설정'] },
  { title: 'CAT III', lines: ['진단·감시 프로그램', '시험 설계·근거 있는 권고'] },
  { title: 'CAT IV', lines: ['복잡한 진단·해석', '설계 개선·전문 검토'] },
]);
