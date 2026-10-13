import type { Dict } from '../../translate';

/** src/figures/p7-7.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. 60 Hz 전류(위)와 그 전류가 만드는 자기 끌림(가운데, 전류의 제곱에 비례). 전류가 +일 때도 −일 때도 철을 끌어당기므로, 힘은 전류 한 주기(16.7 ms)에 두 번 세진다 — 봉우리 간격 8.33 ms, 곧 120 Hz다. 아래 스펙트럼에서 전류는 60 Hz 한 줄이지만, 힘은 0 Hz(늘 당기는 평균)와 120 Hz(출렁임) 두 줄이 된다. 진동이 되는 것은 120 Hz 출렁임이다.':
    'Figure 1. A 60 Hz current (top) and the magnetic pull it makes (middle, proportional to the square of the current). The iron is pulled whether the current is + or −, so the force becomes strong twice per current cycle (16.7 ms) — a peak spacing of 8.33 ms, that is, 120 Hz. In the spectrum below, the current is a single line at 60 Hz, but the force has two lines, 0 Hz (the constant average pull) and 120 Hz (the surge). The 120 Hz surge is what becomes vibration.',
  '전류 i(t), 60 Hz': 'Current i(t), 60 Hz',
  '자기 끌림 ∝ i², 120 Hz로 출렁임': 'Magnetic pull ∝ i², surging at 120 Hz',
  '평균 (늘 당김)': 'Average (constant pull)',
  '스펙트럼으로 보면': 'In the spectrum',
  '전류': 'Current',
  '자기 끌림': 'Magnetic pull',
  '평균': 'Average',
  '그림 2. 고정자(회색 고리) 안에서 도는 회전자(파랑)와 공극. 작은 화살표는 회전자를 고정자 쪽으로 끄는 자기력이고, 공극이 좁은 쪽일수록 세다. 왼쪽: 공극이 고르면 사방의 끌림이 상쇄되어 회전자에는 합력이 없고, 고정자 철심만 2×LF로 출렁인다. 가운데: 회전자가 한쪽으로 치우친 정적 편심은 좁은 쪽(주황 점)이 고정되어, 그 방향으로 2×LF 합력(주황 화살표)이 생긴다. 오른쪽: 회전자 자체가 회전 중심에서 벗어난 동적 편심은 좁은 쪽이 회전자와 함께 돌아, 도는 끌림이 1X와 극통과 주파수(PPF)로 변조된다(점선 = 회전자가 도는 자리).':
    'Figure 2. The rotor (blue) turning inside the stator (gray ring), and the air gap. The small arrows are the magnetic force pulling the rotor toward the stator, stronger where the air gap is narrower. Left: with an even gap the pulls in all directions cancel, so the rotor has no resultant force and only the stator core surges at 2×LF. Middle: with static eccentricity, where the rotor is shifted to one side, the narrow side (orange dot) is fixed, and a 2×LF resultant (orange arrow) arises in that direction. Right: with dynamic eccentricity, where the rotor itself is off the rotation center, the narrow side turns with the rotor, and the rotating pull is modulated at 1X and the pole-pass frequency (PPF) (dotted line = the circle the rotor turns on).',
  '고른 공극': 'Even gap',
  '정적 편심': 'Static eccentricity',
  '동적 편심': 'Dynamic eccentricity',
  '끌림이 상쇄, 합력 0': 'Pulls cancel, resultant 0',
  '고정자만 2×LF로 출렁': 'Only the stator surges at 2×LF',
  '좁은 쪽이 고정': 'Narrow side fixed',
  '한 방향 2×LF 합력': 'One-direction 2×LF force',
  '좁은 쪽이 회전자와 함께 돈다': 'Narrow side turns with the rotor',
  '그림 3. 부하 60 %로 도는 유도전동기의 회전 하모닉(파랑)과 2×LF(주황). 2극 60 Hz 전동기는 동기속도 60 Hz보다 슬립 0.67 %만큼 늦은 59.6 Hz(3576 rpm)로 돌아, 2X 119.2 Hz가 2×LF 120 Hz보다 0.8 Hz 아래에 선다. 4극 50 Hz 전동기는 24.7 Hz(1482 rpm)로 돌고, 2×LF 100 Hz에 붙는 것은 2X가 아니라 4X 98.8 Hz다(1.2 Hz 차이). 어느 쪽이든 2×LF는 극수 번째 하모닉보다 극통과 주파수 PPF만큼 위에 있다.':
    'Figure 3. The rotation harmonics (blue) and 2×LF (orange) of an induction motor at 60 % load. The 2-pole 60 Hz motor turns at 59.6 Hz (3576 rpm), 0.67 % slip behind the synchronous speed of 60 Hz, so 2X at 119.2 Hz stands 0.8 Hz below 2×LF at 120 Hz. The 4-pole 50 Hz motor turns at 24.7 Hz (1482 rpm), and what sits next to 2×LF at 100 Hz is not 2X but 4X at 98.8 Hz (a 1.2 Hz difference). Either way, 2×LF is above the pole-number harmonic by the pole-pass frequency PPF.',
  '2극 · 60 Hz · 부하 60 %': '2-pole · 60 Hz · load 60 %',
  '회전 하모닉 (기계)': 'Rotation harmonic (mech.)',
  '2×LF (전기)': '2×LF (elec.)',
  '동기속도 60 Hz': 'Synchronous speed 60 Hz',
  '2X와 2×LF 확대': 'Zoom on 2X and 2×LF',
  '4극 · 50 Hz · 부하 60 %': '4-pole · 50 Hz · load 60 %',
  '동기속도 25 Hz': 'Synchronous speed 25 Hz',
  '4X와 2×LF 확대': 'Zoom on 4X and 2×LF',
  '그림 4. 로터바가 깨진 2극 전동기(부하 60 %)의 1X 둘레. 기록 2 s(Δf 0.5 Hz, 위)에서는 1X(59.6 Hz)와 양옆 0.8 Hz 떨어진 측대역이 한 덩어리(봉우리 1개)라 불평형의 1X와 구별되지 않는다. 기록 8 s(Δf 0.125 Hz, 가운데)로 늘리면 58.8·59.6·60.4 Hz 세 줄(봉우리 3개)로 갈라진다. 아래는 1X 둘레만 남긴 파형(파랑)과 포락선(회색): 1X의 크기가 1.25 s(= 1/PPF)마다 커졌다 작아진다 — 맥놀이(P2-8)다.':
    'Figure 4. Around 1X of a 2-pole motor (load 60 %) with a broken rotor bar. With a 2 s record (Δf 0.5 Hz, top), 1X (59.6 Hz) and the sidebands 0.8 Hz away on either side are one lump (1 peak), indistinguishable from the 1X of unbalance. Lengthening the record to 8 s (Δf 0.125 Hz, middle) separates it into three lines at 58.8 · 59.6 · 60.4 Hz (3 peaks). Bottom: the waveform with only the region around 1X kept (blue) and its envelope (gray): the size of 1X grows and shrinks every 1.25 s (= 1/PPF) — beating (P2-8).',
  '기록 2 s (Δf 0.5 Hz)': 'Record 2 s (Δf 0.5 Hz)',
  '기록 8 s (Δf 0.125 Hz)': 'Record 8 s (Δf 0.125 Hz)',
  '1X 둘레만 남긴 파형 (54 ~ 66 Hz)': 'Waveform around 1X only (54 to 66 Hz)',
  '그림 5. 미스얼라인(기계 2X)과 고정자 문제(전기 2×LF)가 함께 있는 2극 전동기(부하 60 %)의 전원을 t = 0에 끊었을 때. 위: 0.5 s 프레임 스펙트로그램(Δf 2 Hz). 차단 전에는 2X(119.2 Hz)와 2×LF(120 Hz)가 한 칸에 섞여 1.25 s마다 진해졌다 옅어진다(맥놀이). 차단하는 순간 2×LF는 사라지고, 남은 2X는 회전수를 따라 아래로 휘며 천천히 약해진다. 아래: 성분별 크기. 0.5 s 뒤 전기 성분은 처음의 0.67 %, 기계 2X는 73 %이고 그 주파수는 102.2 Hz다(회전수 86 %).':
    'Figure 5. When the power is cut at t = 0 on a 2-pole motor (load 60 %) with both misalignment (mechanical 2X) and a stator problem (electrical 2×LF). Top: a 0.5 s frame spectrogram (Δf 2 Hz). Before the cut, 2X (119.2 Hz) and 2×LF (120 Hz) are mixed in one bin and become darker and fainter every 1.25 s (beating). At the moment of the cut 2×LF disappears, and the remaining 2X bends downward following the speed and weakens slowly. Bottom: the size of each component. After 0.5 s the electrical component is 0.67 % of its initial value and the mechanical 2X is 73 %, at a frequency of 102.2 Hz (speed 86 %).',
  '스펙트로그램 (진할수록 큼)': 'Spectrogram (darker = larger)',
  '시간 [s] (0 = 전원 차단)': 'Time [s] (0 = power cut)',
  '2X + 2×LF (맥놀이)': '2X + 2×LF (beating)',
  '2X가 회전수를 따라 내려감': '2X goes down with the speed',
  '성분별 크기': 'Size of each component',
  '2X (기계)': '2X (mech.)',
  '전원 차단': 'Power cut',
  '그림 6. 2극 동기 발전기(60 Hz)는 슬립이 없어 1X = 60 Hz = LF, 2X = 120 Hz = 2×LF로 자리가 정확히 겹친다(위). 기록을 아무리 늘려도 갈라지지 않으므로, 회전수를 3600 rpm으로 유지한 채 t = 0에 계자(회전자 전자석의 전류)를 끊는 시험으로 가른다(아래). 고정자 쪽 자기력이 주인이면(주황) 120 Hz가 3.4 → 0.46 mm/s로 자속을 따라 몇 초 안에 줄고, 기계 2X가 주인이면(파랑) 3.38 → 3.26 mm/s로 거의 그대로다. 발전기 쪽 시험은 P8-5에서 다시 다룬다.':
    'Figure 6. A 2-pole synchronous generator (60 Hz) has no slip, so 1X = 60 Hz = LF and 2X = 120 Hz = 2×LF overlap exactly (top). No matter how long the record, they do not separate, so they are separated by a test that cuts the field (the current of the rotor electromagnet) at t = 0 while keeping the speed at 3600 rpm (bottom). If stator magnetic force dominates (orange), 120 Hz falls 3.4 → 0.46 mm/s within a few seconds following the flux, and if mechanical 2X dominates (blue) it is almost unchanged, 3.38 → 3.26 mm/s. The generator-side test is covered again in P8-5.',
  '자리: 1X = LF, 2X = 2×LF': 'Positions: 1X = LF, 2X = 2×LF',
  '120 Hz 크기 — t = 0에 계자 차단 (회전수 유지)': '120 Hz size — field cut at t = 0 (speed kept)',
  '고정자 자기력이 주인': 'Stator magnetic force dominates',
  '기계 2X가 주인': 'Mechanical 2X dominates',
  '계자 차단': 'Field cut',
};

export default EN;
