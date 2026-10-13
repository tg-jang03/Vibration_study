import type { Dict } from '../../translate';

/** LAB-FEAT-01 FeatureLab 영어 (D-054). 키 = 소스의 한국어 원문 */
const EN: Dict = {
  "지금": 'Now',
  "시간영역 특징량: 결함이 진행하는 동안의 추세": 'Time-domain features: trends while a fault progresses',
  "결함 진행 (설명용)": 'Fault progression (illustrative)',
  "0 = 건전, 100 = 손상이 넓게 퍼짐": '0 = healthy, 100 = damage widely spread',
  "지금 모델: 결함 충격 {0} g(BPFO 박자), 여기저기 생기는 충격 초당 {1}번, 넓은 대역 잡음 σ {2} g.": 'Current model: defect impact {0} g (at the BPFO rhythm), scattered impacts {1} per second, broadband noise σ {2} g.',
  "읽음값 (건전할 때와 비교)": 'Readouts (compared with the healthy state)',
  "건전할 때": 'Healthy',
  "건전 대비 변화": 'Change vs. healthy',
  "첨도 K": 'Kurtosis K',
  "왜도 S": 'Skewness S',
  "진행 0 → 30 %로 옮기면 RMS와 첨도는 각각 몇 배가 되나요?": 'If you move progression from 0 to 30 %, by what factor do RMS and kurtosis each grow?',
  "RMS는 0.087 → 0.17 g로 약 2배, 첨도는 2.36 → 10.7로 약 4.5배입니다. 초기에는 드문 충격이 커지므로 첨도와 CF가 RMS보다 먼저, 크게 반응합니다.": 'RMS goes from 0.087 to 0.17 g, about 2 times, and kurtosis from 2.36 to 10.7, about 4.5 times. Early on the rare impacts grow, so kurtosis and CF react earlier and more strongly than RMS.',
  "진행 55 %와 100 %의 첨도를 비교하세요. 100 %의 첨도만 보고 \"좋아졌다\"고 해도 되나요?": 'Compare the kurtosis at 55 % and 100 % progression. Can you say "it got better" from the kurtosis at 100 % alone?',
  "55 %에서 약 14.8(이 근처가 가장 큼), 100 %에서 약 3.4로 내려옵니다. 손상이 넓어져 충격이 자주 겹치면 신호가 정규 잡음처럼 되기 때문입니다. 같은 동안 RMS는 0.31 → 0.82 g로 계속 올랐으므로 좋아진 것이 아닙니다 — 특징량 하나가 아니라 여러 개의 추세를 함께 봅니다.": 'It is about 14.8 at 55 % (the largest is near here) and comes down to about 3.4 at 100 %. This is because when the damage spreads and impacts overlap often, the signal becomes like normal noise. Over the same span RMS kept rising from 0.31 to 0.82 g, so it did not get better — look at the trends of several features together, not just one.',
  "진행 100 % 근처에서 슬라이더를 조금씩 움직이면 CF가 들쭉날쭉합니다. 왜일까요?": 'Near 100 % progression, CF is jagged as you nudge the slider. Why?',
  "Peak는 표본 하나(가장 큰 값)로 정해지므로 잡음의 우연한 봉우리에 흔들립니다. RMS와 첨도는 모든 표본을 평균하므로 더 안정적입니다.": 'Peak is set by a single sample (the largest value), so it is shaken by an accidental peak of the noise. RMS and kurtosis average over all the samples, so they are more stable.',
  "신호는 설명용 모델입니다: 베어링 하우징 가속도(f_s {0} Hz, 1초) = 1X {1} g + 바탕 잡음 + 외륜 결함 충격(BPFO {2} Hz, 공진 {3} Hz, ζ {4}). 진행에 따라 결함 충격이 커지고(10 ~ 55 %), 그 뒤 임의 시각의 충격과 넓은 대역 잡음이 늘어납니다(50 ~ 100 %). 실제 결함의 진행 속도와 값은 기계마다 다릅니다.": 'The signal is an illustrative model: bearing-housing acceleration (f_s {0} Hz, 1 s) = 1X {1} g + background noise + outer-race fault impacts (BPFO {2} Hz, resonance {3} Hz, ζ {4}). As progression advances the defect impact grows (10 – 55 %), and after that impacts at random times and broadband noise increase (50 – 100 %). The progression rate and values of a real fault differ from machine to machine.',
  "지금의 파형 (50 ms)": 'Current waveform (50 ms)',
  "가속도": 'Acceleration',
  "시각 [ms]": 'Time [ms]',
  "가속도 파형": 'Acceleration waveform',
  "결함 진행 [%]": 'Fault progression [%]',
  "RMS 추세": 'RMS trend',
  "Crest factor 추세": 'Crest factor trend',
  "첨도": 'Kurtosis',
  "정규 잡음 = 3": 'Normal noise = 3',
  "첨도 추세": 'Kurtosis trend',
};

export default EN;
