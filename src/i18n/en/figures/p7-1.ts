import type { Dict } from '../../translate';

const EN: Dict = {
  '그림 1. 주파수 → 원인 지도 (2극 전동기-펌프, 3575 rpm, 6205 베어링, 베인 7개, 60 Hz 계통). 세로는 원인 갈래(회전체 · 미끄럼베어링 기름막 · 구름베어링 · 날개 · 전기), 가로는 1X의 몇 배인가(차수)다. 회전체의 원인은 1X의 정수배·½X에, 미끄럼베어링의 기름막은 0.38 ~ 0.48X 구간에, 구름베어링은 정수배가 아닌 자리(BPFO 3.585X 등)에, 날개는 날개 수 × X에 선다. 전기(2×LF = 120 Hz)는 회전수와 무관한 자리라 이 회전수에서는 2.014X — 2X 바로 옆에 선다. 구조 공진은 어느 자리에나 설 수 있어 지도에 그리지 않았다.':
    'Figure 1. Frequency → cause map (2-pole motor-pump, 3575 rpm, 6205 bearing, 7 vanes, 60 Hz grid). The rows are the cause families (rotor · journal-bearing oil film · rolling bearing · blades · electrical); the horizontal axis is how many times 1X (order). Rotor causes sit at integer multiples of 1X and at ½X, the oil film of journal bearings in the 0.38 to 0.48X band, rolling bearings at non-integer spots (BPFO 3.585X, etc.), and blades at blade count × X. Electrical (2×LF = 120 Hz) sits at a spot independent of speed, so at this speed it is at 2.014X — right next to 2X. Structural resonance can appear at any spot, so it is not drawn on the map.',
  '7X (베인 7개)': '7X (7 vanes)',
  '2×LF (고정)': '2×LF (fixed)',
  '회전체': 'Rotor',
  '기름막': 'Oil film',
  '구름': 'Rolling',
  '날개': 'Blades',
  '그림 2. 같은 펌프에 불평형(위)과 정렬 불량(아래)을 넣었다 (정도 0.6, 설명용). 둘 다 수평 1X가 커서 수평 스펙트럼 하나로는 가르기 어렵다. 나머지 증거가 다르다 — 불평형은 반경 방향이 크고 축방향 1X가 0.49 mm/s로 작으며, 수직이 수평보다 90° 늦다(회전하는 힘). 정렬 불량은 축방향 1X가 3.1 mm/s로 가장 크고 2X도 크며, 수평·수직의 위상차가 26°로 90°에서 멀다(한 방향으로 미는 힘).':
    'Figure 2. Unbalance (top) and misalignment (bottom) put into the same pump (severity 0.6, illustrative). Both have a large horizontal 1X, so a single horizontal spectrum can hardly separate them. The remaining evidence differs — unbalance is large in the radial directions with a small axial 1X of 0.49 mm/s, and vertical lags horizontal by 90° (a rotating force). Misalignment has the largest axial 1X at 3.1 mm/s, a large 2X too, and a horizontal-vertical phase difference of 26°, far from 90° (a force pushing in one direction).',
  '불평형 — 수직이 90° 늦음': 'Unbalance — vertical lags by 90°',
  '정렬 불량 — 수평·수직 위상차 26°': 'Misalignment — H-V phase diff. 26°',
  '방향 · 성분': 'Direction · component',
  '그림 3. 같은 신호(정렬 불량 + 전기)의 110 ~ 130 Hz. 위: 2초 기록(Δf 0.5 Hz)에서는 2X(119.17 Hz, 0.96 mm/s)와 2×LF(120 Hz, 1.27 mm/s)가 따로 선다. 아래: 0.5초 기록(Δf 2 Hz)에서는 두 줄이 2.25 mm/s 하나로 합쳐진다 — 0.83 Hz 떨어진 두 원인을 가르려면 기록을 길게 잡는다 (P2-4).':
    'Figure 3. The same signal (misalignment + electrical), 110 to 130 Hz. Top: with a 2 s record (Δf 0.5 Hz), 2X (119.17 Hz, 0.96 mm/s) and 2×LF (120 Hz, 1.27 mm/s) appear separately. Bottom: with a 0.5 s record (Δf 2 Hz), the two lines merge into one of 2.25 mm/s — to separate two causes 0.83 Hz apart, take a long record (P2-4).',
  '2초 기록 (Δf 0.5 Hz)': '2 s record (Δf 0.5 Hz)',
  '0.5초 기록 (Δf 2 Hz)': '0.5 s record (Δf 2 Hz)',
  '그림 4. 결함 합성기(LAB-FAULT-01)로 만든 원인마다의 지문 (정도 0.6). ① ~ ③의 점선은 1X의 정수배, ④의 점선은 BPFO의 정수배다. ① 불평형 · 수평: 1X 하나. ② 정렬 불량 · 축방향: 1X·2X·3X. ③ 풀림 · 수직: 1X ~ 8X가 늘어서고 그 사이 ½X 자리에도 줄(½X 0.98 mm/s). ④ 외륜 결함 · 수직 가속도의 엔벨로프 스펙트럼(2800 ~ 3800 Hz): 1X의 정수배가 아닌 BPFO 213.6 Hz(3.585X)와 그 2배에 줄이 선다(BPFO 0.41 g) — 속도 스펙트럼에서는 작게만 보인다 (P5-6).':
    'Figure 4. Fingerprint of each cause made with the fault synthesizer (LAB-FAULT-01), severity 0.6. The dotted lines in ① to ③ are integer multiples of 1X; in ④ they are integer multiples of BPFO. ① Unbalance · horizontal: a single 1X. ② Misalignment · axial: 1X, 2X, 3X. ③ Looseness · vertical: 1X to 8X lined up, with lines also at the ½X spots in between (½X 0.98 mm/s). ④ Outer-race fault · envelope spectrum of vertical acceleration (2800 to 3800 Hz): lines stand at BPFO 213.6 Hz (3.585X, not an integer multiple of 1X) and at twice that (BPFO 0.41 g) — it looks small in the velocity spectrum (P5-6).',
  '① 불평형 · 수평 속도': '① Unbalance · horizontal velocity',
  '② 정렬 불량 · 축방향 속도': '② Misalignment · axial velocity',
  '③ 풀림 · 수직 속도': '③ Looseness · vertical velocity',
  '④ 외륜 결함 · 수직 가속도의 엔벨로프': '④ Outer-race fault · envelope of vertical accel.',
  '그림 5. 회전수를 모른다고 하고 펌프의 수평 속도 스펙트럼(위)에서 1X를 찾는다. 가운데: 하모닉 무리 점수 — 후보 f₀마다 정수배 자리의 줄 높이(로그)에서 반 칸 자리의 높이를 뺀 평균. 59.56 Hz(3573 rpm)에서 가장 크다(참값 59.58 Hz). 아래: 켑스트럼(P5-7)은 16.8 ms가 아니라 그 2배 자리를 골라 29.9 Hz — 절반으로 읽었다. 방법 하나로 정하지 않는다.':
    'Figure 5. Pretending the speed is unknown, find 1X in the pump\'s horizontal velocity spectrum (top). Middle: harmonic-cluster score — for each candidate f₀, the average of the line heights (log) at integer-multiple spots minus the heights at half-step spots. It is largest at 59.56 Hz (3573 rpm) (true value 59.58 Hz). Bottom: the cepstrum (P5-7) picked twice the 16.8 ms spot, giving 29.9 Hz — it read half. Do not settle on a single method.',
  '수평 속도 스펙트럼 (점선 = 하모닉 무리로 찾은 f₀의 정수배)': 'Horizontal velocity spectrum (dotted = integer multiples of f₀ found by harmonic cluster)',
  '하모닉 무리 점수': 'Harmonic cluster score',
  '후보 f₀ [Hz]': 'Candidate f₀ [Hz]',
  '켑스트럼 (가로 = 1/quefrency로 바꾼 주파수)': 'Cepstrum (horizontal = frequency as 1/quefrency)',
  '참 1X': 'True 1X',
  '그림 6. 부하가 늘어 유도전동기의 슬립이 커지면 회전수가 3575 → 3545 rpm으로 조금 내려간다 (파랑 → 주황). 왼쪽: 2X는 119.17 → 118.17 Hz로 따라 움직이지만 2×LF는 120 Hz 그대로다. 오른쪽: 베인 통과 7X는 417.1 → 413.6 Hz로 7배만큼 더 크게 움직인다. 따라 움직이면 회전 관련, 그대로면 전기·구조 쪽이다.':
    'Figure 6. When the load rises and the induction motor slip grows, the speed drops slightly from 3575 → 3545 rpm (blue → orange). Left: 2X follows, moving 119.17 → 118.17 Hz, but 2×LF stays at 120 Hz. Right: the vane-pass 7X moves seven times as much, 417.1 → 413.6 Hz. If it follows, it is rotation-related; if it stays, it is on the electrical or structural side.',
  '2X와 2×LF': '2X and 2×LF',
  '베인 통과 7X': 'Vane pass 7X',
};

export default EN;
