import type { FigureSpec } from '../lib/figure';
import { grid } from '../lib/figure';
import { halfPowerAF, separationMargin } from '../lib/rotor/runup';
import { cards } from './p10-shared';

// Original normalized peak for reading widths, not an API rotor or acceptance limit.
const rpm = grid(2400, 3600, 121);
const response = rpm.map(n => ({ rpm: n, amp: 1 / Math.sqrt(1 + ((n - 3000) / 180) ** 2), lag: 0 }));
export const P102_VALUES = { width: halfPowerAF(response)!, conceptSM: separationMargin(3600, 3000) };
export const purposes = cards('fig-p10-2-1', '그림 1. API 문서는 질문에 따라 찾습니다. 보호 시스템, 로터 해석의 설명, 개별 장비 요구사항은 서로 연결되지만 목적이 다릅니다.', [
  { title: 'API 670', lines: ['센서·채널·보호 시스템', '무엇을 감시하고 보호하나'] },
  { title: 'API 684 계열', lines: ['로터 해석의 튜토리얼', '응답·안정성을 어떻게 읽나'] },
  { title: 'API 612 / 616 / 617', lines: ['ST / GT / 압축기', '어느 시험·인수 조건인가'] },
]);
export const protection = cards('fig-p10-2-2', '그림 2. 보호는 센서 한 개로 끝나지 않습니다. 입력의 유효성, 경보 논리, 실제 출력까지 경로를 확인하고 시험·변경 기록을 남깁니다.', [
  { title: '입력', lines: ['센서·위치·방향·단위', '범위·갭·신호 유효성'] },
  { title: '판단', lines: ['알람·트립 논리', '지연·투표·바이패스 상태'] },
  { title: '출력과 증거', lines: ['지정 동작·기능 시험', '설정·승인·변경 기록'] },
]);
export const peak: FigureSpec = {
  id: 'fig-p10-2-3', caption: '그림 3. 폭 읽기용 가상 정규화 봉우리: 피크 3000 rpm, 0.707배 지점 2820·3180 rpm, 폭 360 rpm에서 AF=8.33입니다. 규격 허용값이나 실제 로터 해석 결과가 아닙니다.',
  panels: [{ height: 180, x: { range: [2400, 3600], label: '표시 회전수 [rpm]', ticks: [2400, 2820, 3000, 3180, 3600] }, y: { range: [0, 1.2], label: '피크 대비 진폭 [무차원]' },
    series: [{ x: rpm, y: response.map(p => p.amp), color: 'c1' }], annotations: [
      { type: 'hline', y: 1 / Math.SQRT2, label: '피크 / √2', color: 'muted', dash: true },
      { type: 'vline', x: 2820, color: 'muted', dash: true }, { type: 'vline', x: 3180, color: 'muted', dash: true },
      { type: 'arrow', x1: 2820, y1: .2, x2: 3180, y2: .2, label: '폭 360 rpm', double: true, color: 'c1' },
    ] }],
};
export const model = cards('fig-p10-2-4', '그림 4. 해석 결과에는 입력 가정과 불확실성을 붙입니다. 공진 간격을 읽는 것과 안정성·간극·허용 응답을 검토하는 것은 별도 질문입니다.', [
  { title: '입력과 가정', lines: ['질량·축·지지·씰·온도', '하중·동계수·불평형 위치'] },
  { title: '응답과 안정성', lines: ['임계속도·AF·SM', '모드 감쇠·성장·간극'] },
  { title: '민감도와 확인', lines: ['지지·씰 조건을 바꾸기', '시험과 차이·근거 기록'] },
]);
export const acceptance = cards('fig-p10-2-5', '그림 5. 장비 규격의 시험·인수 조건을 확인할 때는 시험 종류, 평가량, 결과의 추적 경로를 함께 묶습니다. 회전수가 같아도 다른 상태의 시험일 수 있습니다.', [
  { title: '시험 조건', lines: ['공장 / 현장 · 시험 종류', '부하·열 상태·보조 설비'] },
  { title: '평가 조건', lines: ['측정량·위치·대역', '지정 운전 범위·판정 근거'] },
  { title: '기록과 예외', lines: ['채널·교정·원자료', '판본·계약·차이·승인'] },
]);
export const trace = cards('fig-p10-2-6', '그림 6. 적합성 주장은 적용 요구사항, 시험·해석 증거, 결론의 세 단계가 연결돼야 합니다. 문서 번호만 적으면 판정 근거가 남지 않습니다.', [
  { title: '1. 적용 요구', lines: ['문서·판본·계약·해당 절', '적용 범위·예외 확인'] },
  { title: '2. 증거 위치', lines: ['시험 조건·채널·자료', '해석 모델·결과·검토자'] },
  { title: '3. 결론', lines: ['충족 / 미충족 / 미확인', '이유·추가 시험·승인'] },
]);
