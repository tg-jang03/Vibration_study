import type { Dict } from '../../translate';

/** src/figures/p7-8.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. 날개 7장의 원심 펌프(3575 rpm, 1X = 59.58 Hz). 위: 임펠러(파랑)가 돌며 날개 끝이 볼류트 혀(주황 점) 앞을 지날 때마다 그 자리의 압력이 한 번씩 출렁인다. 가운데: 혀 앞의 압력 — 두 바퀴(33.6 ms)에 14번. 아래: 베어링 하우징 속도 스펙트럼(최고 효율점에서) — 1X와 함께 날개 통과 주파수 VPF = 7 × 59.58 = 417.1 Hz와 그 2배 834.2 Hz에 줄이 선다.':
    'Figure 1. A centrifugal pump with 7 blades (3575 rpm, 1X = 59.58 Hz). Top: as the impeller (blue) turns, the pressure at the volute tongue (orange dot) surges once each time a blade tip passes in front of it. Middle: pressure in front of the tongue — 14 surges in two revolutions (33.6 ms). Bottom: bearing housing velocity spectrum (at the best efficiency point) — together with 1X, lines appear at the blade pass frequency BPF = 7 × 59.58 = 417.1 Hz and at twice that, 834.2 Hz.',
  '볼류트 혀': 'Volute tongue',
  '토출 →': 'Discharge →',
  '임펠러: 날개 7장, 반시계 회전': 'Impeller: 7 blades, CCW',
  '케이싱(볼류트)': 'Casing (volute)',
  '혀 앞의 압력 (두 바퀴)': 'Pressure at the tongue (two revolutions)',
  '베어링 하우징 속도 스펙트럼 (최고 효율점)': 'Bearing housing velocity spectrum (at BEP)',
  '그림 2. 회전수를 그대로 두고 유량(Q/Q_BEP)만 바꿀 때. 위: 양정(파랑)과 효율(회색 점선) — 효율이 가장 높은 유량이 최고 효율점(BEP)이다. 가운데: 날개 통과 성분(파랑)은 BEP에서 가장 작고(0.6 mm/s) 유량을 40 %로 줄이면 1.25 mm/s로 커진다. 유량이 60 % 아래로 내려가면 재순환이 만드는 낮은 주파수 넓은 대역(주황)이 나타난다. 임펠러 유로가 고르지 않은 펌프의 1X(보라)는 BEP에서 멀어질수록 커지지만, 기계 불평형의 1X(회색)는 유량과 무관하다. 아래: 흡입 여유(NPSHa ÷ 필요 NPSH)는 유량이 늘수록 줄어든다. 이 모델에서는 1.2 아래에서 캐비테이션이 시작된다 — 흡입 압력이 낮은 펌프(주황)는 BEP에서 이미 1.0이다.':
    'Figure 2. Changing only the flow (Q/Q_BEP) with the speed held. Top: head (blue) and efficiency (gray dashed) — the flow with the highest efficiency is the best efficiency point (BEP). Middle: the blade pass component (blue) is smallest at the BEP (0.6 mm/s) and grows to 1.25 mm/s when the flow is cut to 40 %. Below 60 % flow, a low-frequency broadband (orange) produced by recirculation appears. The 1X of a pump with uneven impeller passages (purple) grows the further it is from the BEP, but the 1X of mechanical unbalance (gray) does not depend on flow. Bottom: the suction margin (NPSHa ÷ required NPSH) decreases as the flow increases. In this model cavitation starts below 1.2 — the pump with low suction pressure (orange) is already at 1.0 at the BEP.',
  '성능 곡선': 'Performance curves',
  '양정 (BEP = 1)': 'Head (BEP = 1)',
  '효율 (BEP = 1)': 'Efficiency (BEP = 1)',
  '성분 크기': 'Component size',
  '날개 통과 VPF': 'Vane pass VPF',
  '재순환 (5 ~ 40 Hz)': 'Recirculation (5 – 40 Hz)',
  '1X — 수력 불평형': '1X — hydraulic unbalance',
  '1X — 기계 불평형 (일정)': '1X — mech. unbalance (const.)',
  '흡입 여유 NPSHa ÷ NPSHr(Q)': 'Suction margin NPSHa ÷ NPSHr(Q)',
  '흡입 압력 정상': 'Normal suction',
  '흡입 압력 낮음': 'Low suction',
  '캐비테이션 시작 (이 모델)': 'Cavitation onset (this model)',
  '그림 3. 같은 펌프·같은 회전수에서 유량만 바꾼 속도 스펙트럼(1 s, Hann). BEP(가운데)에서는 1X(59.6 Hz)와 작은 날개 통과(417 Hz)뿐이다. 유량 40 %(위)에서는 날개 통과가 1.25 mm/s로 커지고, 5 ~ 40 Hz에 줄이 아닌 넓은 둔덕(재순환, 대역 RMS 약 1.8 mm/s)이 선다. 유량 125 %(아래)에서도 날개 통과가 0.71 mm/s로 조금 커진다. 회전 성분(1X)은 세 경우 모두 같다.':
    'Figure 3. Velocity spectra (1 s, Hann) of the same pump at the same speed with only the flow changed. At the BEP (middle) there are only 1X (59.6 Hz) and a small blade pass (417 Hz). At 40 % flow (top), blade pass grows to 1.25 mm/s, and a broad hump rather than a line (recirculation, band RMS about 1.8 mm/s) stands at 5 to 40 Hz. At 125 % flow (bottom), blade pass is also a little larger at 0.71 mm/s. The rotating component (1X) is the same in all three cases.',
  '유량 40 % (저유량)': 'Flow 40 % (low)',
  '유량 100 % (BEP)': 'Flow 100 % (BEP)',
  '유량 125 %': 'Flow 125 %',
  '그림 4. 흡입 압력이 낮아 캐비테이션이 생긴 펌프(BEP 유량). 위: 가속도 스펙트럼(dB, 1 g rms = 0 dB) — 정상(회색)은 회전·날개 통과의 줄 몇 개뿐인데, 캐비테이션(주황)은 2 ~ 6 kHz 넓은 대역이 대역 RMS 1 g로 솟는다. 줄이 아니라 둔덕이다. 둘째·셋째: 2 ~ 6 kHz만 남긴 파형 40 ms — 캐비테이션(주황)은 불규칙한 잡음이고, 구름베어링 외륜 결함(파랑, P7-5와 같은 펌프)은 BPFO(213.6 Hz)마다 울리는 충격이다. 아래: 같은 대역의 포락선 스펙트럼(P5-6) — 베어링은 BPFO와 그 하모닉에 줄이 서고, 캐비테이션은 줄 없이 평평하다.':
    'Figure 4. A pump with cavitation caused by low suction pressure (at BEP flow). Top: acceleration spectrum (dB, 1 g rms = 0 dB) — the normal pump (gray) has only a few lines from rotation and blade pass, while with cavitation (orange) a broad 2 to 6 kHz band rises to a band RMS of 1 g. It is a hump, not lines. Second and third: 40 ms waveforms with only 2 to 6 kHz kept — cavitation (orange) is irregular noise, while a rolling bearing outer race defect (blue, the same pump as P7-5) is an impact ringing at every BPFO (213.6 Hz). Bottom: envelope spectrum (P5-6) of the same band — the bearing shows lines at BPFO and its harmonics, and cavitation is flat with no lines.',
  '가속도 스펙트럼 (dB)': 'Acceleration spectrum (dB)',
  '캐비테이션': 'Cavitation',
  '캐비테이션: 2 ~ 6 kHz 파형': 'Cavitation: 2 – 6 kHz waveform',
  '외륜 결함: 2 ~ 6 kHz 파형': 'Outer race defect: 2 – 6 kHz waveform',
  '포락선 스펙트럼 (2 ~ 6 kHz 대역)': 'Envelope spectrum (2 – 6 kHz band)',
  '외륜 결함': 'Outer race defect',
  '그림 5. 원심 압축기의 한 회전수(9000 rpm) 성능 곡선. 유량을 설계점(1.0, 압력비 2.29)에서 줄이면 압력비가 오르다가 서지선(유량 0.55)에서 꼭대기(3.0)에 닿는다. 그 왼쪽(점선)에서는 압축기가 더 높은 압력을 만들지 못해 흐름이 거꾸로 밀려 나오는 서지가 된다. 서지선보다 앞의 0.72 아래에서는 Rotating stall이 먼저 생긴다(이 모델). 서지 방지 제어는 재순환 밸브를 열어 압축기를 지나는 유량을 0.62 아래로 내리지 않는다 — 서지는 막지만 stall 구간은 남을 수 있다.':
    'Figure 5. Performance curve of a centrifugal compressor at one speed (9000 rpm). As the flow is reduced from the design point (1.0, pressure ratio 2.29), the pressure ratio rises until it reaches the peak (3.0) at the surge line (flow 0.55). To its left (dotted) the compressor cannot build a higher pressure and the flow is pushed backward: surge. Rotating stall appears first, below 0.72, before the surge line (in this model). Anti-surge control opens the recycle valve so the flow through the compressor does not drop below 0.62 — it prevents surge, but the stall region can remain.',
  '유량 / 설계 유량': 'Flow / design flow',
  '압력비': 'Pressure ratio',
  '서지선': 'Surge line',
  '서지 방지선': 'Anti-surge line',
  'stall 시작': 'Stall onset',
  '설계점': 'Design point',
  '서지 (0.5)': 'Surge (0.5)',
  '그림 6. 위: 유량 0.64(stall 구간)의 축 변위 스펙트럼 — 1X(150 Hz) 아래 29.4 Hz(0.196X)에 실속 셀이 도는 성분(8 µm)이 선다. 유량을 0.70으로 늘리면 2 µm로 줄고, 0.72에 이르면 사라진다. 가운데·아래: 서지 방지를 끄고 유량 0.5로 내렸을 때 10초 기록 — 토출 압력이 천천히 올랐다가 흐름이 거꾸로 밀려 나오는 순간 급히 떨어지기를 0.7 Hz(1.4 s마다)로 되풀이하고, 그때마다 축방향 위치가 약 120 µm 튄다(추력이 뒤집힘).':
    'Figure 6. Top: shaft displacement spectrum at flow 0.64 (stall region) — below 1X (150 Hz), a component from the rotating stall cells (8 µm) appears at 29.4 Hz (0.196X). When the flow is increased to 0.70 it drops to 2 µm, and at 0.72 it disappears. Middle and bottom: a 10 s record with anti-surge off and the flow reduced to 0.5 — the discharge pressure rises slowly and then drops sharply the moment the flow is pushed backward, repeating at 0.7 Hz (every 1.4 s), and each time the axial position jumps by about 120 µm (the thrust reverses).',
  '축 변위 스펙트럼 (유량 0.64)': 'Shaft displacement spectrum (flow 0.64)',
  '토출 압력 (서지, 유량 0.5)': 'Discharge pressure (surge, flow 0.5)',
  '[% 설계]': '[% of design]',
  '축방향 위치 (서지)': 'Axial position (surge)',
};
export default EN;
