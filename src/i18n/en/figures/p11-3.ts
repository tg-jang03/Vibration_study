import type { Dict } from '../../translate';

/** src/figures/p11-3.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 이 페이지의 복기 순서. ①은 기록이 남아 있어야 할 수 있고, ②에서 기록이 쓸 만한지부터 확인합니다. ③ ~ ④는 당시 화면을 그대로 믿지 않고 원파형에서 같은 방법으로 다시 뽑는 단계, ⑤(파랑)가 복기의 핵심 — 당시 판단이 다시 그린 자료와 맞는지 봅니다. ⑥에서 얻은 것을 다음 판단의 기준으로 남깁니다.':
    'Figure 1. The order of a review on this page. ① is only possible if the records still exist, and ② first checks whether the records are usable. ③ ~ ④ do not trust the screen from back then but extract everything again from the raw waveform in the same way; ⑤ (blue) is the heart of the review — checking whether the judgment at the time agrees with the redrawn data. In ⑥, what you learned is kept as the basis for the next judgment.',
  '① 기록 모으기': '① Collect records',
  '원파형 · 키페이저 · 운전 · 당시 판단': 'Raw · Keyphasor · log · judgment',
  '② 기록 확인': '② Check records',
  '채널 · f_s · 단위 · 펄스': 'Channels · f_s · units · pulses',
  '③ 다시 뽑기': '③ Re-extract',
  '회전수 · 회전마다 1X 벡터': 'Speed · per-turn 1X vector',
  '④ 다시 그리기': '④ Redraw',
  'Bode · Polar · 캐스케이드': 'Bode · polar · cascade',
  '⑤ 당시 판단과 비교': '⑤ Compare judgment',
  'slow roll 보상 · 기준 기록': 'Slow-roll comp. · reference',
  '⑥ 남기기': '⑥ Keep lessons',
  '배운 점 · 기준선 · 절차': 'Lessons · baseline · procedure',
  // 그림 2
  '그림 2. 기록 B의 20.3초 근처. 위 — 키페이저 전압(파랑)과 문턱 −11.9 V(회색 점선), 찾은 펄스(갈색 주황 점). 홈이 지나가야 할 자리에서 전압이 떨어지지 않아 펄스 하나가 빠졌습니다(프로브·케이블의 순간 이상을 흉내 냄). 아래 — 펄스 간격으로 구한 회전수: 고치지 않으면(회색) 그 바퀴만 1676 rpm으로 반이 되고, 이웃 간격의 두 배인 간격을 둘로 나누어 메우면(파랑) 3353 rpm 근처로 이어집니다.':
    'Figure 2. Record B near 20.3 s. Top — the Keyphasor voltage (blue), the threshold −11.9 V (gray dashed line) and the detected pulses (brownish-orange dots). The voltage did not drop where the notch should have passed, so one pulse is missing (imitating a momentary probe or cable fault). Bottom — speed from the pulse intervals: if not repaired (gray), only that turn drops to half, 1676 rpm; if the interval that is twice its neighbors is split in two and filled (blue), the curve continues near 3353 rpm.',
  '키페이저 [V]': 'Keyphasor [V]',
  '여기서 펄스가 빠졌다': 'Pulse missing here',
  '펄스 그대로': 'As detected',
  '빠진 펄스를 메움': 'Missing pulse filled',
  // 그림 3
  '그림 3. 기록 A에서 4001 rpm일 때의 한 바퀴. 키페이저 펄스 = 0°, 다음 펄스 = 360°로 놓고 샘플 77개(파랑 점)에 X = (2/N) Σ x e^(−jθ)를 하면 1X 벡터 38.6 µm p-p ∠198°가 나옵니다. 주황은 그 벡터로 그린 1X 코사인 — 양의 봉우리가 지연각 198°(점선)에 섭니다. 점이 주황 곡선에서 벗어난 만큼이 2X 런아웃과 잡음입니다.':
    'Figure 3. One turn of record A at 4001 rpm. Setting the Keyphasor pulse = 0° and the next pulse = 360°, applying X = (2/N) Σ x e^(−jθ) to the 77 samples (blue dots) gives the 1X vector 38.6 µm p-p ∠198°. Orange is the 1X cosine drawn from that vector — its positive peak stands at the lag angle 198° (dashed line). How far the dots depart from the orange curve is the 2X runout and noise.',
  '키페이저부터 돈 각 [°]': 'Angle from Keyphasor [°]',
  '뽑은 1X': 'Extracted 1X',
  '그 바퀴의 샘플': 'Samples of this turn',
  // 그림 4
  '그림 4. 기록 A를 다시 그린 Bode(50 rpm 칸). 회색 — 잰 그대로: 200 ~ 500 rpm에서도 1X가 3.9 µm p-p ∠198°(런아웃)이고 봉우리는 3350 rpm 76.7 µm p-p. 파랑 — 그 벡터를 뺀 것: 저속에서 0으로 시작해 3299 rpm 74.7 µm p-p 봉우리, Half-power AF 5.95. 아래 위상도 보상한 쪽이 저속 44°에서 시작해 봉우리를 지나며 약 180° 늦어집니다.':
    'Figure 4. Record A redrawn as Bode (50 rpm bins). Gray — as measured: even at 200 ~ 500 rpm the 1X is 3.9 µm p-p ∠198° (runout), and the peak is 76.7 µm p-p at 3350 rpm. Blue — with that vector subtracted: it starts from zero at low speed and has a 74.7 µm p-p peak at 3299 rpm, half-power AF 5.95. In the phase below, the compensated curve starts at 44° at low speed and lags by about 180° through the peak.',
  '잰 그대로': 'As measured',
  'slow roll 벡터를 뺌': 'Slow-roll vector subtracted',
  // 그림 5
  '그림 5. 기록 B를 4096점 창(0.8초)마다 스펙트럼으로 바꿔 회전수 순으로 쌓은 캐스케이드(진할수록 큼, 가장 큰 값 아래 40 dB까지). 비스듬한 진한 줄이 1X, 그 오른쪽의 옅은 줄은 2X(런아웃 2X)입니다. 1X 아래 성분이나 회전수와 무관한 세로 줄은 없습니다 — 복기할 때 Bode만 보지 않고 캐스케이드로 "다른 성분은 없었나"를 함께 확인합니다.':
    'Figure 5. Record B converted to a spectrum for every 4096-point window (0.8 s) and stacked in order of speed as a cascade (darker = larger, down to 40 dB below the largest value). The slanted dark line is 1X, and the fainter line to its right is 2X (runout 2X). There are no sub-1X components or vertical lines unrelated to speed — in a review, do not look at Bode alone; use the cascade to check "were there any other components?" as well.',
  '크기 [dB re 1 µm p-p]': 'Level [dB re 1 µm p-p]',
  // 그림 6
  '그림 6. slow roll 벡터를 뺀 두 기록. 위 — 봉우리가 1년 전(파랑) 3299 rpm → 이번(주황) 3051 rpm으로 내려왔고, 크기는 74.7 → 60.0 µm p-p로 오히려 작아졌습니다. 최고 회전수의 1X는 17.2 → 16.1 µm p-p로 거의 같습니다. 가운데 — 3000 rpm의 지연각이 80° → 130°로 커졌습니다. 아래 — Polar(0° 위, 지연은 시계 방향, 600 rpm부터): B의 원이 조금 작고, 같은 회전수에서 더 많이 돌아가 있습니다.':
    'Figure 6. The two records with the slow-roll vector subtracted. Top — the peak came down from 3299 rpm a year ago (blue) → 3051 rpm this time (orange), and its size actually became smaller, 74.7 → 60.0 µm p-p. The 1X at top speed is almost the same, 17.2 → 16.1 µm p-p. Middle — the lag angle at 3000 rpm grew from 80° → 130°. Bottom — polar plot (0° at top, lag clockwise, from 600 rpm): B\'s circle is a little smaller and has turned further at the same speed.',
  'A 1년 전': 'A: 1 yr ago',
  'B 이번': 'B: this time',
};

export default EN;
