import type { Dict } from '../../translate';

/** GearTsaLab (LAB-GEAR-02) 영어 (D-054). lib/faults/gear.ts의 이름(결함·기어·TSA 보기)은 k() 복사본으로 옮긴다 */
const EN: Dict = {
  '건전': 'Healthy',
  '마모': 'Wear',
  '편심': 'Eccentricity',
  '깨진 이': 'Broken tooth',
  '백래시 과다': 'Excess backlash',
  '헌팅 투스 (두 이빨이 함께 상함)': 'Hunting tooth (two teeth damaged together)',
  '피니언 (입력 23이빨)': 'Pinion (input, 23 teeth)',
  '기어 (출력 61이빨)': 'Gear (output, 61 teeth)',
  'TSA (한 바퀴 평균)': 'TSA (one-turn average)',
  'Residual (맞물림 하모닉·1X·2X를 뺀 것)': 'Residual (mesh harmonics, 1X and 2X removed)',
  'Difference (Residual에서 맞물림 ±1 측대역도 뺀 것)': 'Difference (Residual with the mesh ±1 sidebands also removed)',
  '피니언 축 (f₁ = {0} Hz)': 'Pinion shaft (f₁ = {0} Hz)',
  '기어 축 (f₂ = {0} Hz)': 'Gear shaft (f₂ = {0} Hz)',
  'TSA와 켑스트럼: 어느 축의 몇 번 이빨인가': 'TSA and cepstrum: which tooth on which shaft',
  '결함': 'Fault',
  '결함이 있는 기어': 'Faulty gear',
  'TSA 기준 축 (그 축의 키페이저로 자른다)': 'TSA reference shaft (cut with that shaft\'s keyphasor)',
  '평균할 바퀴 수 M': 'Number of turns to average M',
  '바퀴': 'turns',
  '측정 시간 {0} s': 'Measurement time {0} s',
  '보기': 'View',
  '결함 이빨 자리 보기 (정답)': 'Show faulty tooth position (answer)',
  '피니언': 'pinion',
  '기어': 'gear',
  '읽음값 ({0}{1}, {2} 축 TSA {3}바퀴)': 'Readouts ({0}{1}, {2} shaft TSA of {3} turns)',
  'FM4 = Difference 신호의 첨도 (건전 ≈ 3)': 'FM4 = kurtosis of the Difference signal (healthy ≈ 3)',
  'Residual의 가장 큰 |값|': 'Largest |value| of the Residual',
  'Residual이 가장 큰 각도': 'Angle of the largest Residual',
  '그 각도의 이빨 번호 (키페이저 다음 첫 이빨 = 1, 모두 {0}개)': 'Tooth number at that angle (first tooth after the keyphasor = 1, {0} in all)',
  '번': '',
  '켑스트럼 — 피니언 한 바퀴 1/f₁ = {0} ms 자리': 'Cepstrum — at one pinion turn 1/f₁ = {0} ms',
  '켑스트럼 — 기어 한 바퀴 1/f₂ = {0} ms 자리': 'Cepstrum — at one gear turn 1/f₂ = {0} ms',
  '처음 상태(깨진 이·기어, 기어 축 TSA 15바퀴, Residual)에서 봉우리는 몇 도, 몇 번 이빨인가요? "결함 이빨 자리 보기"로 맞춰 보세요.':
    'In the initial state (broken tooth · gear, gear shaft TSA of 15 turns, Residual), at what angle is the peak, and which tooth is it? Check with "Show faulty tooth position".',
  '약 102°, 18번 이빨입니다(이빨 한 칸 = 360° ÷ 61 = 5.9°). FM4는 약 100으로 건전한 기어(약 3)보다 훨씬 큽니다. 기어 축 기준으로 자르면 그 축의 이빨은 매 바퀴 같은 각도에 오므로 평균해도 남습니다.':
    'About 102°, tooth 18 (one tooth cell = 360° ÷ 61 = 5.9°). FM4 is about 100, much larger than a healthy gear (about 3). When cut by the gear shaft, that shaft\'s teeth come at the same angle every turn, so they survive the average.',
  '같은 결함에서 TSA 기준 축을 피니언으로 바꾸고, 바퀴 수를 1 → 5 → 15 → 40으로 늘리며 FM4를 보세요.':
    'With the same fault, change the TSA reference shaft to the pinion and increase the number of turns 1 → 5 → 15 → 40 while watching FM4.',
  'FM4가 약 33 → 17 → 5.3 → 3.5로 내려가 건전한 감속기(약 3.6)와 같아집니다. 기어 이빨의 충격은 피니언 각도로는 바퀴마다 다른 자리에 오므로(회전수비 2.652가 정수가 아니다) 평균할수록 사라집니다. 1바퀴만 보면 어느 축의 결함인지 모릅니다 — 충분히 평균해야 축이 갈립니다.':
    'FM4 falls from about 33 → 17 → 5.3 → 3.5 and becomes equal to a healthy reducer (about 3.6). The gear tooth impact comes at a different pinion angle every turn (the speed ratio 2.652 is not an integer), so it vanishes the more you average. With a single turn you cannot tell which shaft is faulty — only with enough averaging does the shaft separate.',
  '결함 기어를 피니언으로 바꾸고 피니언 축 TSA 40바퀴로 보세요. 이빨 번호와 켑스트럼은?':
    'Change the faulty gear to the pinion and look at the pinion shaft TSA of 40 turns. What are the tooth number and the cepstrum?',
  '6번 이빨(약 84°)에서 봉우리가 서고 FM4는 약 35입니다. 켑스트럼은 피니언 한 바퀴 자리(40.27 ms)가 약 0.11로 건전(약 0.009)보다 크고, 기어 한 바퀴 자리(106.8 ms)는 그대로입니다.':
    'The peak stands at tooth 6 (about 84°) and FM4 is about 35. In the cepstrum, the one-pinion-turn position (40.27 ms) is about 0.11, larger than healthy (about 0.009), and the one-gear-turn position (106.8 ms) is unchanged.',
  '편심(기어)을 고르고 기어 축 TSA를 Residual → Difference로 바꾸세요. FM4는?':
    'Choose eccentricity (gear) and change the gear shaft TSA from Residual → Difference. What is FM4?',
  'Residual에는 측대역 한 쌍이 만드는 맞물림 물결(크기가 한 바퀴 동안 천천히 오르내린다)이 남지만, ±1 측대역까지 뺀 Difference에는 거의 잡음만 남아 FM4가 약 3.7로 건전(약 3.2)과 비슷합니다. FM4는 고르게 퍼진 변화(편심)가 아니라 한 이빨에 몰린 변화(깨진 이)에 반응하도록 만든 숫자입니다. 편심은 측대역 한 쌍(LAB-GEAR-01)으로 봅니다.':
    'The Residual keeps the mesh ripple made by one pair of sidebands (its size rises and falls slowly over one turn), but the Difference, with the ±1 sidebands removed too, is left with almost only noise, so FM4 is about 3.7, similar to healthy (about 3.2). FM4 is a number built to react to a change concentrated at one tooth (a broken tooth), not to an evenly spread change (eccentricity). Judge eccentricity from the pair of sidebands (LAB-GEAR-01).',
  '설명용 모델입니다: LAB-GEAR-01과 같은 감속기(정도 60 %, 부하 80 %). 회전수가 일정하고 각 축의 키페이저가 있다고 두고, 한 바퀴 {0}점으로 각도 재샘플링을 마친 신호를 평균합니다 (회전수가 변하면 P5-4의 차수추적으로 먼저 각도를 맞춥니다). 켑스트럼은 8 s 시간 기록의 것입니다.':
    'An illustrative model: the same reducer as LAB-GEAR-01 (severity 60 %, load 80 %). It assumes a constant speed and a keyphasor on each shaft, and averages a signal already resampled in angle at {0} points per turn (if the speed varies, first align the angles with the order tracking of P5-4). The cepstrum is that of the 8 s time record.',
  '{0} — {1} 축 한 바퀴': '{0} — one turn of the {1} shaft',
  '결함 이빨 ({0}번) 맞물림 시작': 'Faulty tooth ({0}) starts to mesh',
  '그 축의 각도 [°] (키페이저 = 0°)': 'Angle of that shaft [°] (keyphasor = 0°)',
  'TSA 한 바퀴': 'TSA, one turn',
  '이 결함은 고른 축에 깨진 이빨이 없습니다.': 'With this fault, the chosen shaft has no broken tooth.',
  '켑스트럼 (5 ~ 250 ms) — 점선: 피니언 한 바퀴(주황)·기어 한 바퀴(초록)의 정수배': 'Cepstrum (5 to 250 ms) — dotted: integer multiples of one pinion turn (orange) and one gear turn (green)',
  '켑스트럼': 'Cepstrum',
  '1/f₁의 정수배': 'Integer multiples of 1/f₁',
  '1/f₂의 정수배': 'Integer multiples of 1/f₂',
};

export default EN;
