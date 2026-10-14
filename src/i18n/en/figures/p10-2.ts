import type { Dict } from '../../translate';

/** src/figures/p10-2.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 문서는 기계의 일생에서 쓰이는 때가 다릅니다. 장비 규격(617·612·616)이 설계 해석과 공장 시험의 요구를 담고, 684는 그 해석을 설명하는 튜토리얼, 670은 설치 뒤 보호 시스템, ISO 20816은 운전 중인 기계의 평가입니다.':
    'Figure 1. Each document is used at a different time in a machine\'s life. The equipment standards (617·612·616) hold the requirements for design analysis and the shop test, 684 is the tutorial that explains that analysis, 670 covers the protection system after installation, and ISO 20816 evaluates the machine in operation.',
  '설계 · 해석': 'Design · analysis',
  '해석 요구: 임계속도 ·': 'Analysis: critical',
  '불평형 응답 · 안정성': 'speed · unbalance · stability',
  '그 해석을 읽는 튜토리얼': 'Tutorial on reading it',
  '공장 시험': 'Shop test',
  '기계적 운전 시험 ·': 'Mech. running test ·',
  '성능 시험 · 계약 조건': 'perf. test · contract',
  '설치 · 시운전': 'Install · commission',
  '보호 시스템: 센서 ·': 'Protection system:',
  '모니터 · 트립 · 시험': 'sensor · monitor · trip',
  '운전 · 감시': 'Operation · monitoring',
  '설치된 기계의': 'Magnitude and',
  '크기 · 변화 평가': 'change evaluation',
  '알람 · 트립 운용': 'Alarm · trip use',
  // 그림 2
  '그림 2. 보호 경로를 사양서에서 따라가 봅니다. 칸의 위쪽은 신호가 지나는 길, 아래쪽 "확인"은 그 칸에서 볼 것입니다. 모니터의 버퍼 출력은 상태감시·진단 장비로 갈라져 나갑니다 — 진단 장비는 보호 기능에 끼어들지 않습니다. 각 기능의 뜻은 P3-5에서 다뤘습니다.':
    'Figure 2. Following the protection path through the specification. The upper part of each box is the path the signal takes; the "Check" in the lower part is what to look at in that box. The monitor\'s buffered output branches off to condition monitoring and diagnostic equipment — diagnostic equipment does not interfere with the protection function. The meaning of each function was covered in P3-5.',
  '프로브 · 가속도계': 'Probe · accel.',
  '확인': 'Check',
  '위치 · 방향 · 갭': 'Position · dir. · gap',
  '프록시미터 · 케이블': 'Proximitor · cable',
  '교정 · 범위 · Not OK': 'Calib. · range · Not OK',
  '모니터 채널': 'Monitor channel',
  'Alert · Danger · 지연': 'Alert · Danger · delay',
  '보팅 · 기동 중 배율': 'Voting · startup mult.',
  '릴레이 출력': 'Relay output',
  '트립 회로 · 경보': 'Trip circuit · alarm',
  '기능 시험 · 바이패스': 'Func. test · bypass',
  '기계': 'Machine',
  '정지': 'stop',
  '버퍼 출력 → 상태감시 · 진단 장비 (보호 경로 밖)': 'Buffered output → monitoring · diagnostics (outside protection path)',
  // 그림 3
  '그림 3. P4-1의 예시 로터(ζ 0.05)를 25 rpm 간격으로 읽은 런업(P4-1 4절과 같은 자료). 위 — 진폭: 피크 3000 rpm, 0.707배 지점 2866.5·3171.5 rpm에서 AF = 9.84. 운전 회전수 3600 rpm(보라)까지의 분리여유는 16.7 %. 아래 — 위상 지연은 피크 근처에서 90°를 지납니다.':
    'Figure 3. Run-up of the P4-1 example rotor (ζ 0.05) read at 25 rpm steps (same data as P4-1 §4). Top — amplitude: peak 3000 rpm, 0.707 points 2866.5·3171.5 rpm, so AF = 9.84. The separation margin to the operating speed of 3600 rpm (purple) is 16.7 %. Bottom — the phase lag passes 90° near the peak.',
  '1X 진폭 [µm p-p]': '1X amplitude [µm p-p]',
  '피크 × 0.707': 'Peak × 0.707',
  // 그림 4
  '그림 4. 같은 로터 배치(임계속도 예측 3000 rpm, 운전 3600 rpm, SM 16.7 %)에서 실제 임계속도가 10 % 높은 3300 rpm이었다면. 위 — 뾰족한 AF 10: 운전점 응답이 1.72배. 아래 — 펑퍼짐한 AF 2.5: 1.13배. 같은 오차가 뾰족한 봉우리에서 훨씬 크게 번집니다.':
    'Figure 4. Same rotor layout (predicted critical speed 3000 rpm, operating 3600 rpm, SM 16.7 %), if the actual critical speed turned out 10 % higher, at 3300 rpm. Top — sharp AF 10: the operating-point response is 1.72 times. Bottom — flat AF 2.5: 1.13 times. The same error spreads far more at a sharp peak.',
  'AF 10 — 운전점 응답 3.16 → 5.43 (1.72배)': 'AF 10 — operating-point response 3.16 → 5.43 (1.72×)',
  '진폭 / 편심 X/e': 'Amplitude / eccentricity X/e',
  '예측 (임계속도 3000 rpm)': 'Predicted (critical 3000 rpm)',
  '실제 (+10 % → 3300 rpm)': 'Actual (+10 % → 3300 rpm)',
  '운전 3600': 'Operating 3600',
  'AF 2.5 — 운전점 응답 2.21 → 2.5 (1.13배)': 'AF 2.5 — operating-point response 2.21 → 2.5 (1.13×)',
  // 그림 5
  '그림 5. P4-4 학습 모델(3000 rpm, ζ 0.05)에서 교차연성 q를 키울 때 첫 전진 모드의 로그 감쇠 δ. q = 0에서 δ = 0.315, q가 k의 10 %(q₀)에 닿으면 δ = 0. Level I의 생각은 예상 공력 교차연성 qₐ(가상: k의 4 %)에서의 δ(0.189)와 여유 q₀/qₐ(2.5)를 보는 것입니다. 기준값은 적용 판본에서 확인합니다.':
    'Figure 5. Logarithmic decrement δ of the first forward mode as the cross-coupling q is increased in the P4-4 learning model (3000 rpm, ζ 0.05). At q = 0, δ = 0.315; when q reaches 10 % of k (q₀), δ = 0. The Level I idea is to look at δ (0.189) at the expected aerodynamic cross-coupling qₐ (hypothetical: 4 % of k) and the margin q₀/qₐ (2.5). Check the criteria in the edition that applies.',
  '교차연성 q / k [%]': 'Cross-coupling q / k [%]',
  '로그 감쇠 δ': 'Log decrement δ',
  'δ = 0 — 안정 한계': 'δ = 0 — stability limit',
  'qₐ (가상) 4 %': 'qₐ (hypothetical) 4 %',
  '여유 q₀/qₐ = 2.5': 'Margin q₀/qₐ = 2.5',
  // 그림 6
  '그림 6. 기계적 운전 시험의 흐름(시간은 눈금 없이 순서만). 최대 연속 회전수(MCS)까지 올려 베어링 온도가 안정되기를 기다리고, 트립 회전수를 잠깐 확인한 뒤, MCS에서 정해진 시간 동안 연속 운전하며 진동을 평가합니다. 감속하면서 기록한 Bode로 임계속도·AF를 해석과 견줍니다. 구간 길이와 판정 항목은 적용 장비 규격·계약에서 확인합니다.':
    'Figure 6. Flow of the mechanical running test (time shown as order only, with no scale). The machine is run up to the maximum continuous speed (MCS), bearing temperatures are allowed to stabilize, the trip speed is briefly checked, and then the machine runs continuously at MCS for a set time while vibration is evaluated. The critical speed and AF from the Bode recorded during deceleration are compared with the analysis. Segment lengths and acceptance items are checked in the equipment standard and contract that apply.',
  '회전수 / MCS': 'Speed / MCS',
  '가속': 'Accel.',
  '온도 안정': 'Temp. stable',
  '트립 회전수': 'Trip speed',
  'MCS 연속 운전 — 진동 · 온도 기록과 평가': 'MCS continuous run — record & evaluate vib. · temp.',
  '감속 Bode': 'Decel. Bode',
  '임계속도 · AF 확인': 'Check critical speed · AF',
  // 그림 7
  '그림 7. 적합성 주장이 지나는 길. 적용 요구(문서·판본·항목) → 증거(시험 조건·채널·원자료의 위치) → 결론 세 가지 중 하나. "미확인"은 "충족"으로 바꾸지 않고, 이유와 다음 시험·승인 계획을 붙입니다.':
    'Figure 7. The path a conformity claim takes. Applicable requirement (document · edition · item) → evidence (test conditions · channels · location of raw data) → one of three conclusions. "Unconfirmed" is never changed to "met"; the reason and the next test or approval plan are attached.',
  '1. 적용 요구': '1. Requirement',
  '문서 · 판본 · 계약': 'Document · edition · contract',
  '해당 항목 · 예외': 'Item · exceptions',
  '2. 증거': '2. Evidence',
  '시험 조건 · 채널 · 교정': 'Test cond. · channels · calib.',
  '원자료 · 해석 모델 위치': 'Raw data · model location',
  '충족 — 근거 위치 함께': 'Met — with evidence location',
  '미충족 — 차이 · 조치': 'Not met — gap · action',
  '미확인 — 이유 · 다음 시험': 'Unconfirmed — reason · next test',
};

export default EN;
