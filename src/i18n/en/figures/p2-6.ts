import type { Dict } from '../../translate';

/** src/figures/p2-6.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  [`그림 1. 같은 기계를 1초씩 두 번 잰 스펙트럼 (Δf = 1 Hz, Hann, 세로축 mm/s RMS). 성분은 두 개다 — 70 Hz(초록 점선) 0.049 mm/s, 32 Hz(주황 점선) 0.018 mm/s. 나머지는 불규칙한 잡음이다. 잡음 막대는 평균(회색 선, 0.031 mm/s) 근처에서 크게 들쭉날쭉하고, 그 모양이 잴 때마다 바뀐다. 한 번 잰 것만으로는 70 Hz 막대도 우연히 튄 잡음 봉우리와 잘 구분되지 않고, 32 Hz는 아예 보이지 않는다.`]:
    'Figure 1. Spectra of the same machine measured twice, 1 second each (Δf = 1 Hz, Hann, vertical axis mm/s RMS). There are two components — 70 Hz (green dashed) at 0.049 mm/s and 32 Hz (orange dashed) at 0.018 mm/s. The rest is irregular noise. The noise bars scatter widely around the mean (gray line, 0.031 mm/s), and the pattern changes with every measurement. From a single measurement the 70 Hz bar is hard to tell apart from a noise peak that happened to spike, and the 32 Hz component is not visible at all.',
  '0 ~ 1초에 잰 프레임': 'Frame measured at 0 to 1 s',
  '잡음의 평균 높이': 'Mean noise height',
  '5 ~ 6초에 잰 프레임': 'Frame measured at 5 to 6 s',
  // 그림 2
  [`그림 2. 그림 1과 같은 신호를 1, 4, 16, 64개 프레임만큼 파워 평균한 스펙트럼. 평균 횟수가 늘수록 바닥의 들쭉날쭉함이 줄어 매끈해지지만, 바닥의 높이는 회색 선(0.031 mm/s) 근처에서 그대로다. 매끈해진 바닥 위로 70 Hz 막대(0.052 mm/s)는 확실히 솟아 보인다. 하지만 바닥보다 작은 32 Hz 성분은 64개를 평균해도 0.032 mm/s로 바닥과 구분되지 않는다.`]:
    'Figure 2. The same signal as in Figure 1, power-averaged over 1, 4, 16 and 64 frames. As the number of averages grows, the ragged floor smooths out, but its height stays near the gray line (0.031 mm/s). Above the smoothed floor the 70 Hz bar (0.052 mm/s) clearly stands out. But the 32 Hz component, which is smaller than the floor, reads 0.032 mm/s even after 64 averages and cannot be told apart from the floor.',
  '1개 프레임 평균 (측정 1초)': '1-frame average (1 s measured)',
  '4개 프레임 평균 (측정 4초)': '4-frame average (4 s measured)',
  '16개 프레임 평균 (측정 16초)': '16-frame average (16 s measured)',
  '64개 프레임 평균 (측정 64초)': '64-frame average (64 s measured)',
  // 그림 3
  [`그림 3. 잡음 바닥만 떼어 내 평균 횟수 M에 따라 두 숫자를 쟀다 (처음 한 프레임의 이론값 = 1). 파랑: 바닥의 평균 높이(파워) — M을 64까지 늘려도 1 근처에 머문다. 초록: 바닥의 흔들림(표준편차 ÷ 평균) — 1에서 시작해 점선 1/√M을 따라 줄어든다 (M = 64에서 0.12). 파워 평균이 줄이는 것은 흔들림이지 높이가 아니다.`]:
    'Figure 3. With only the noise floor isolated, two numbers were measured against the number of averages M (theoretical value of the first single frame = 1). Blue: the average height of the floor (power) — it stays near 1 even when M is raised to 64. Green: the variation of the floor (standard deviation ÷ mean) — it starts at 1 and falls along the dotted 1/√M line (0.12 at M = 64). What power averaging reduces is the variation, not the height.',
  '바닥의 평균 높이': 'Mean floor height',
  '바닥의 흔들림 (표준편차 ÷ 평균)': 'Floor variation (std ÷ mean)',
  '평균한 프레임 수 M': 'Number of frames averaged M',
  // 그림 4
  [`그림 4. 프레임 8개에서 같은 bin의 값을 화살표로 그렸다. 화살표 길이는 크기, 방향은 위상이다 (P2-2의 cos·sin 두 합을 가로·세로로 놓은 것). 왼쪽: 프레임 시작을 축의 회전에 맞춘 동기 성분은 매번 거의 같은 방향이라, 8개를 평균한 화살표(주황)의 길이가 0.95로 거의 그대로다. 오른쪽: 잡음은 방향이 제멋대로라 서로 상쇄되어, 화살표 하나의 평균 길이 0.8가 평균하면 0.28로 줄어든다. 점선 원은 길이 1이다.`]:
    'Figure 4. The values of the same bin in 8 frames, drawn as arrows. Arrow length is the magnitude and direction is the phase (the two sums with the cos and sin templates from P2-2, placed as horizontal and vertical). Left: a synchronous component, with the frame start aligned to the shaft rotation, points in almost the same direction every time, so the average of the 8 arrows (orange) keeps a length of 0.95, almost unchanged. Right: the noise points in random directions and cancels, so a single arrow\'s average length of 0.8 shrinks to 0.28 when averaged. The dotted circle has length 1.',
  '동기 성분: 매번 거의 같은 방향': 'Synchronous component: nearly the same direction each time',
  '잡음: 매번 제멋대로': 'Noise: random each time',
  '8개 평균(주황) 길이 0.95': 'Average of 8 (orange): length 0.95',
  '8개 평균(주황) 길이 0.28': 'Average of 8 (orange): length 0.28',
  // 그림 5
  [`그림 5. 같은 64개 프레임을 세 가지로 평균했다. 위: 파워 평균 — 바닥이 0.031 mm/s 근처에 그대로 있고 32 Hz는 묻혀 있다. 가운데: 벡터 평균(프레임 시작을 회전에 맞춤) — 잡음 화살표가 서로 상쇄되어 바닥이 약 0.0038 mm/s(약 1/8)로 내려가고, 32 Hz 성분이 0.012 mm/s로 뚜렷하게 드러난다 (원래 값 0.018과의 차이는 덜 지워진 잡음). 70 Hz도 0.042 mm/s로 그대로 남는다. 아래: 프레임 시작을 맞추지 않고 벡터 평균하면 성분의 방향도 매번 달라져, 32 Hz는 0.0004 mm/s, 70 Hz는 0.0043 mm/s로 성분까지 깎인다. (세 패널 모두 세로축 0 ~ 0.06 mm/s)`]:
    'Figure 5. The same 64 frames averaged in three ways. Top: power averaging — the floor stays near 0.031 mm/s and the 32 Hz component is buried. Middle: vector averaging (frame start aligned to the rotation) — the noise arrows cancel, the floor drops to about 0.0038 mm/s (about 1/8), and the 32 Hz component shows up clearly at 0.012 mm/s (the difference from the original 0.018 is noise that was not fully cancelled). The 70 Hz component also remains, at 0.042 mm/s. Bottom: if you vector-average without aligning the frame start, the direction of the components also changes every time, so the components themselves are cut down — 32 Hz to 0.0004 mm/s and 70 Hz to 0.0043 mm/s. (All three panels have a vertical axis of 0 to 0.06 mm/s.)',
  '파워 평균 64개': '64 power averages',
  '파워 평균의 바닥': 'Floor of the power average',
  '벡터 평균 64개 (프레임 시작을 회전에 맞춤)': '64 vector averages (frame start aligned to rotation)',
  '벡터 평균 64개 (맞추지 않음)': '64 vector averages (not aligned)',
  // 그림 6
  [`그림 6. 20번째 프레임 뒤에 진동이 1 → 2 mm/s RMS로 커진 경우(회색 계단 = 매 프레임의 값). 처음부터 모두 같은 무게로 더하는 선형 평균(파랑)은 옛날 값에 끌려 60번째 프레임에도 1.73 mm/s에 머문다. 새 값에 1/8의 무게를 주는 지수 평균(초록)은 약 20프레임 만에 1.95 mm/s까지 따라간다.`]:
    'Figure 6. A case where the vibration grows from 1 to 2 mm/s RMS after the 20th frame (gray steps = the value of each frame). Linear averaging (blue), which adds everything with equal weight from the start, is dragged by old values and is still at 1.73 mm/s at the 60th frame. Exponential averaging (green), which gives the new value a weight of 1/8, follows up to 1.95 mm/s in about 20 frames.',
  '매 프레임의 값': 'Value of each frame',
  '선형 평균': 'Linear averaging',
  '지수 평균 (α = 1/8)': 'Exponential averaging (α = 1/8)',
  '여기서 진동이 커짐': 'Vibration grows here',
  '프레임 번호': 'Frame number',
  // 그림 7
  [`그림 7. 100초 동안 회전수를 올려 1X가 20 Hz에서 120 Hz로 옮겨 가는 동안(1초에 1 Hz씩) 1초 프레임 100개를 모았다 (1X 진폭 0.25 mm/s Peak = 0.18 mm/s RMS). 회색: 마지막 프레임 — 지금 1X는 120 Hz 근처에만 있다. 파랑: 선형 평균 — 지나간 위치들이 1/100씩 섞여 낮고 넓게 퍼진다. 주황: 피크 홀드 — 주파수마다 지금까지 가장 컸던 값을 남겨, 1X가 지나간 길 전체가 0.14 ~ 0.16 mm/s 높이로 그려진다 (실제 0.18보다 조금 낮은 것은 프레임 하나 동안 1X가 1 Hz 움직인 번짐(P2-4)과 가리비 손실(P2-5) 때문이다). 피크 홀드는 "지금 값"이 아니라 "지나간 최대값"이다.`]:
    'Figure 7. While the speed was raised over 100 seconds and 1X moved from 20 Hz to 120 Hz (1 Hz per second), 100 one-second frames were collected (1X amplitude 0.25 mm/s Peak = 0.18 mm/s RMS). Gray: the last frame — 1X is now only near 120 Hz. Blue: linear averaging — the places it has passed are mixed in by 1/100 each, giving a low, wide spread. Orange: peak hold — it keeps the largest value so far at each frequency, so the whole path 1X has traveled is drawn at a height of 0.14 to 0.16 mm/s (slightly below the actual 0.18 because of the smearing from 1X moving 1 Hz during one frame (P2-4) and the scalloping loss (P2-5)). Peak hold is "the maximum that has passed," not "the current value."',
  '마지막 프레임': 'Last frame',
  '피크 홀드': 'Peak hold',
  // 그림 8
  [`그림 8. 4.75초 동안 1초짜리 Hann 프레임을 몇 개 넣을 수 있는지 (종 모양 하나 = 프레임 하나의 가중치). 겹치지 않으면 4개, 50 % 겹치면 8개, 75 % 겹치면 16개다. 겹친 프레임은 데이터 일부를 같이 쓰므로 완전히 새로운 정보는 아니다. 그래도 Hann은 프레임 양 끝을 작게 보므로, 75 %로 겹친 16개는 겹치지 않은 독립 프레임 약 8.6개만큼 흔들림을 줄인다 — 같은 4.75초에 겹치지 않고 모은 4개의 두 배가 넘는다.`]:
    'Figure 8. How many 1-second Hann frames fit into 4.75 seconds (one bell shape = the weight of one frame). Without overlap it is 4, with 50 % overlap 8, and with 75 % overlap 16. Overlapping frames share part of their data, so they are not completely new information. Still, the Hann window gives little weight to the ends of a frame, so 16 frames at 75 % overlap reduce the variation as much as about 8.6 independent non-overlapping frames — more than twice the 4 collected without overlap in the same 4.75 s.',
  '오버랩 0 %: 프레임 4개': 'Overlap 0 %: 4 frames',
  '오버랩 50 %: 프레임 8개': 'Overlap 50 %: 8 frames',
  '다음 프레임까지 0.5초': '0.5 s to next frame',
  '오버랩 75 %: 프레임 16개': 'Overlap 75 %: 16 frames',
  '다음 프레임까지 0.25초': '0.25 s to next frame',
  // 그림 9
  [`그림 9. 기어 상자 센서 신호의 처음 세 바퀴(맨 위, 가속도 m/s²)와 그 안에 섞인 성분. 축 A는 1200 rpm(20 Hz)으로 돌고 기어 이빨이 15개라 맞물림 성분이 300 Hz(15차)에 생긴다(파랑). 120° 자리 이빨의 결함은 바퀴마다 한 번 '딱' 치고 울린다(주황). 축 A의 성분은 점선(키페이저) 사이 같은 자리에 같은 모양으로 되풀이된다. 이웃 축 B의 성분(보라, 13.4 × 20 = 268 Hz)은 한 바퀴에 13.4번 흔들려 바퀴마다 시작 위치가 다르다. 여기에 잡음(σ = 0.8 m/s²)까지 더해진 맨 위 신호에서는 결함 충격을 찾기 어렵다.`]:
    'Figure 9. The first three revolutions of a gearbox sensor signal (top, acceleration m/s²) and the components mixed into it. Shaft A turns at 1200 rpm (20 Hz) and the gear has 15 teeth, so the mesh component appears at 300 Hz (15th order) (blue). The fault of the tooth at 120° gives one sharp knock and ring per revolution (orange). The components of shaft A repeat at the same place with the same shape between the dotted lines (Keyphasor). The component of neighboring shaft B (purple, 13.4 × 20 = 268 Hz) oscillates 13.4 times per revolution, so its starting position differs every revolution. In the top signal, with noise (σ = 0.8 m/s²) added as well, the fault impact is hard to find.',
  '센서 신호 (모두 + 잡음)': 'Sensor signal (all + noise)',
  '키페이저': 'Keyphasor',
  '축 A: 1X + 맞물림 성분 (15차·30차)': 'Shaft A: 1X + mesh components (15th, 30th order)',
  '축 A 결함 충격 (바퀴마다 120° 자리)': 'Shaft A fault impact (at 120° every revolution)',
  '축 B 성분 (축 A 회전 주파수의 13.4배)': 'Shaft B component (13.4 × shaft A rotation frequency)',
  '시간 [ms] (점선: 축 A 키페이저 = 한 바퀴 시작)': 'Time [ms] (dashed: shaft A Keyphasor = start of a revolution)',
  // 그림 10
  [`그림 10. 키페이저 펄스마다 한 바퀴씩 잘라 가로축을 회전 각도로 바꿨다. 위: 처음 4바퀴를 겹쳐 그리면 바퀴마다 모양이 다르다(축 B 성분과 잡음이 매번 다르게 얹힌다). 가운데: 같은 각도끼리 4바퀴를 평균. 아래: 64바퀴를 평균하면 축 A 성분만의 참값(회색 점선)에 거의 겹친다. 참값과의 차이(RMS)는 한 바퀴 1.04 → 4바퀴 0.45 → 64바퀴 0.10 m/s²로 줄어든다. 120° 근처의 결함 충격은 아래 그림에서 맞물림 파형이 일그러진 모양으로 보인다.`]:
    'Figure 10. Cut one revolution at each Keyphasor pulse, with the horizontal axis changed to rotation angle. Top: overlaying the first 4 revolutions, each revolution has a different shape (the shaft B component and noise sit on top differently every time). Middle: the 4 revolutions averaged angle by angle. Bottom: averaging 64 revolutions nearly overlaps the true value of the shaft A components alone (gray dashed). The difference from the true value (RMS) shrinks from 1.04 for one revolution to 0.45 for 4 revolutions to 0.10 m/s² for 64 revolutions. The fault impact near 120° appears in the lower plot as a distortion of the mesh waveform.',
  '한 바퀴씩 잘라 겹친 것 (처음 4바퀴)': 'One revolution per cut, overlaid (first 4 revolutions)',
  '4바퀴 평균': '4-revolution average',
  '축 A 성분만 (참값)': 'Shaft A components only (true value)',
  '4바퀴 TSA': '4-revolution TSA',
  '64바퀴 평균': '64-revolution average',
  '64바퀴 TSA': '64-revolution TSA',
  '축 A 회전 각도 [°]': 'Shaft A rotation angle [°]',
  // 그림 11
  [`그림 11. 축 A 회전 주파수의 ρ배인 성분이 TSA 뒤에 남는 비율 |H|. 정수배(13, 14 …)는 1로 그대로 남고, 그 사이는 거의 지워진다 — 빗(comb)의 살처럼 생겼다. 평균 바퀴 수 M이 클수록 살이 가늘어진다(살이 0으로 떨어지는 곳까지의 거리 = 1/M). ρ = 13.4는 M = 16에서 0.0625(= 1/16)만 남지만, 정수에 가까운 ρ = 13.05는 0.235이 남는다. 13.05를 지우려면 M이 1/0.05 = 20 이상이어야 한다.`]:
    'Figure 11. The fraction |H| remaining after TSA for a component at ρ times shaft A\'s rotation frequency. Integer multiples (13, 14 …) remain at 1, and what lies between is almost erased — it looks like the teeth of a comb. The larger the number of revolutions averaged M, the thinner the teeth (distance to where a tooth falls to 0 = 1/M). At M = 16, ρ = 13.4 leaves only 0.0625 (= 1/16), but ρ = 13.05, close to an integer, leaves 0.235. To erase 13.05, M must be at least 1/0.05 = 20.',
  'ρ = 성분 주파수 ÷ 축 A 회전 주파수': 'ρ = component frequency ÷ shaft A rotation frequency',
  '남는 비율 |H|': 'Remaining fraction |H|',
  // 그림 12
  [`그림 12. 위: 64바퀴 TSA. 맞물림 성분이 커서 결함 충격은 파형의 작은 일그러짐일 뿐이다. 아래: 여기서 규칙적인 성분(1X, 맞물림 15차·30차)을 빼낸 나머지(Residual). 120° 자리에서 울림(최대 0.88 m/s²)이 다른 각도의 남은 잡음(RMS 0.11 m/s²)보다 확실히 크다. 이빨 하나가 24°를 차지하므로 0°부터 세어 여섯 번째 이빨(120° ~ 144°) 자리다.`]:
    'Figure 12. Top: the 64-revolution TSA. The mesh component is large, so the fault impact is only a small distortion of the waveform. Bottom: what remains after removing the regular components (1X, mesh orders 15 and 30) from it (Residual). At 120° the ringing (up to 0.88 m/s²) is clearly larger than the remaining noise at other angles (RMS 0.11 m/s²). One tooth takes up 24°, so counting from 0° it is the sixth tooth (120° to 144°).',
  '1X·맞물림 성분을 뺀 나머지 (Residual)': 'Remainder after removing 1X and mesh components (Residual)',
  '참값에서 뺀 것': 'Subtracted from the true value',
  '64바퀴 TSA에서 뺀 것': 'Subtracted from the 64-revolution TSA',
  '결함 충격': 'Fault impact',
};

export default EN;
