import type { FigureSpec } from '../lib/figure';
import { compareChange, compareMagnitude, DEMO } from '../lib/assessment/severity';
import { cards } from './p10-shared';

export const P101_VALUES = { ...DEMO, zone: compareMagnitude(DEMO.value, DEMO.limits).zone,
  change: compareChange(DEMO.value, DEMO.baseline, DEMO.limits[1], DEMO.rate),
  smallChange: compareChange(1.8, DEMO.baseline, DEMO.limits[1], DEMO.rate) };

export const scope = cards('fig-p10-1-1', '그림 1. 규격은 기계의 구성에서 찾습니다. 일반 지침은 20816-1, 기계별 후보는 -2/-3/-4/-5입니다. 적용·제외 조건과 판본을 원문에서 확인합니다.', [
  { title: '20816-1', lines: ['측정·평가의 일반 지침', '크기와 변화라는 두 질문'] },
  { title: '20816-2 / -4', lines: ['육상 GT/ST·발전기 / GT', '출력·속도·베어링 대조'] },
  { title: '20816-3 / -5', lines: ['산업용 기계 / 수력 설비', '지지·운전 조건까지 대조'] },
]);
export const quantities = cards('fig-p10-1-2', '그림 2. 속도 RMS와 축 상대 변위 p-p는 서로 다른 위치·기준·통계량입니다. 단위만 바꿔 같은 판정표에 넣을 수 없습니다.', [
  { title: '비회전부', lines: ['베어링 하우징·받침', '속도 RMS · mm/s'] },
  { title: '축 상대 진동', lines: ['프로브 지지부 대비 축', '변위 p-p · µm'] },
  { title: '비교 전에 맞출 것', lines: ['위치·방향·대역·통계량', '회전수·부하·열 상태'] },
]);
export const zones: FigureSpec = {
  id: 'fig-p10-1-3', caption: '그림 3. 규격과 무관한 무차원 예제: 경계 2·5·9에서 현재값 3은 B 구간입니다. 실제 경계는 적용 규격과 기계 분류에 따라 사용자가 입력합니다.',
  panels: [{ height: 135, x: { range: [0, 12], label: '가상 크기 x [무차원]', ticks: [0, 2, 3, 5, 9, 12] }, y: { range: [0, 1], ticks: 'none' }, series: [],
    annotations: [
      ...DEMO.limits.map(x => ({ type: 'vline' as const, x, color: 'muted' as const, dash: true })),
      ...[1, 3.5, 7, 10.5].map((x, i) => ({ type: 'text' as const, x, y: .7, text: ['A', 'B', 'C', 'D'][i], bold: true })),
      { type: 'point', x: DEMO.value, y: .32, label: '현재 3', color: 'c1', dy: 22 },
      { type: 'point', x: DEMO.baseline, y: .32, label: '기준 1.5', color: 'c3', dy: -15 },
    ] }],
};
export const changes: FigureSpec = {
  id: 'fig-p10-1-4', caption: '그림 4. 가상값 1.5→3의 변화량은 1.5, B/C 경계 5 대비 30%입니다. 예제 비교율 20%를 넘지만 크기는 B입니다. 20%는 이 예제만의 임의값입니다.',
  panels: [{ height: 165, x: { range: [0, 2], label: '가상 기록 순서', ticks: [0, 1, 2] }, y: { range: [0, 6], label: '가상 크기 [무차원]' },
    series: [{ x: [0, 1, 2], y: [1.5, 1.8, 3], color: 'c1', kind: 'line' }, { x: [0, 1, 2], y: [1.5, 1.8, 3], color: 'c1', kind: 'dots' }],
    annotations: [{ type: 'hline', y: 5, label: '가상 B/C=5', color: 'muted', dash: true }, { type: 'point', x: 1, y: 1.8, label: '변화 6%', dy: -20, color: 'c1' }, { type: 'point', x: 2, y: 3, label: '변화 30%', dx: -90, dy: -20, color: 'c1' }] }],
};
export const limits = cards('fig-p10-1-5', '그림 5. Zone 경계, 상태감시 알람, 보호 트립, 계약 인수 조건은 목적이 다릅니다. B/C 경계 하나를 모든 설정으로 복사하지 않습니다.', [
  { title: '상태감시 알람', lines: ['기준선·변화·운전 조건', '확인과 조사로 연결'] },
  { title: '보호 트립', lines: ['장비·채널·보호 논리', '승인된 설정과 시험'] },
  { title: '인수 판정', lines: ['계약·판본·시험 조건', '지정 평가량과 기록'] },
]);
export const exclusions = cards('fig-p10-1-6', '그림 6. 광대역 크기 평가가 목적이어도, 포함되지 않는 현상과 좁은 대역의 새 성분을 따로 확인합니다. 판정 구간은 결함 이름이나 잔여 수명이 아닙니다.', [
  { title: 'GT 연소 동압', lines: ['압력 신호·공간 모드', 'P8-4의 별도 관찰'] },
  { title: '발전기 2×LF·비틀림', lines: ['국부 공진·각변동', 'P8-5·P7-9의 별도 측정'] },
  { title: '새 결함 성분', lines: ['전체 RMS가 비슷해도', 'P6·P7 증거를 확인'] },
]);
