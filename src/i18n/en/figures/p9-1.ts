import type { Dict } from '../../translate';

/** src/figures/p9-1.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. P7-2 그림 7의 받침대(수평 고유진동수 47.5 Hz)를 회전수 2400 → 2850 → 3000 rpm에서 잰 속도 스펙트럼(dB, 1 mm/s = 0 dB). 1X(점)는 40 → 47.5 → 50 Hz로 회전수를 따라 움직이지만, 바닥의 둔덕은 세 번 모두 47.5 Hz에 머문다(20 Hz 바닥보다 약 24 dB 높다). 흐름·마찰 같은 넓은 대역의 힘이 고유진동수 자리만 키우기 때문이다. 1X가 둔덕 자리에 오는 2850 rpm에서 1X가 2.21 mm/s로 가장 크다(2400 rpm 0.31, 3000 rpm 1.38).':
    'Figure 1. Velocity spectra (dB, 1 mm/s = 0 dB) of the pedestal of P7-2 Figure 7 (horizontal natural frequency 47.5 Hz), measured at 2400 → 2850 → 3000 rpm. The 1X (dot) follows the speed, 40 → 47.5 → 50 Hz, but the hump on the floor stays at 47.5 Hz in all three (about 24 dB above the floor at 20 Hz), because wide-band forces such as flow and friction raise only the natural-frequency spot. At 2850 rpm, where 1X comes to the hump, 1X is largest at 2.21 mm/s (0.31 at 2400 rpm, 1.38 at 3000 rpm).',
  '받침대 47.5 Hz': 'Pedestal 47.5 Hz',
  '그림 2. 임팩트 시험. 힘 센서가 달린 해머로 베어링 받침대를 치고(채널 1 = 힘), 같은 자리의 가속도계가 응답을 잰다(채널 2). 아래는 플라스틱 팁으로 한 번 친 기록: 힘은 2 ms 동안만 3.9 kN까지 솟고(가운데), 응답은 그 뒤로 여러 고유진동수가 섞여 울리다 잦아든다(아래). 분석기는 두 채널로 FRF(P1-4)를 구한다.':
    'Figure 2. The impact test. A hammer with a force sensor strikes the bearing pedestal (channel 1 = force), and an accelerometer at the same spot measures the response (channel 2). Below, one strike with the plastic tip: the force rises to 3.9 kN for only 2 ms (middle), and after that the response rings with several natural frequencies mixed and dies out (bottom). From the two channels the analyzer gets the FRF (P1-4).',
  '해머 (끝에 힘 센서)': 'Hammer (force sensor in tip)',
  '가속도계': 'Accelerometer',
  '분석기': 'Analyzer',
  'ch1 힘 · ch2 가속도': 'ch1 force · ch2 accel.',
  'FRF · 코히어런스': 'FRF · coherence',
  '채널 1: 힘 (앞 40 ms)': 'Channel 1: force (first 40 ms)',
  '채널 2: 가속도 (1 s)': 'Channel 2: acceleration (1 s)',
  '그림 3. 같은 충격량(5 N·s, 펄스의 면적)으로 팁만 바꾼 힘. 위: 접촉 시간이 고무 8 ms(초록) · 플라스틱 2 ms(파랑) · 강철 0.4 ms(주황)로 짧아질수록 최대 힘은 0.98 → 3.9 → 19.6 kN으로 커진다(세로는 각자의 최대 힘으로 나눔). 아래: 힘 스펙트럼은 저주파에서 셋 다 같고, 짧을수록 멀리까지 평평하다. −10 dB까지 내려가는 주파수(가진 대역)는 약 1/t_c — 고무 127 Hz, 플라스틱 510 Hz, 강철 2550 Hz. 회색 점선은 받침대의 세 고유진동수: 고무 팁은 290 Hz를 −32 dB로 거의 못 흔든다.':
    'Figure 3. The force with only the tip changed, at the same impulse (5 N·s, the area of the pulse). Top: as the contact time gets shorter, rubber 8 ms (green) · plastic 2 ms (blue) · steel 0.4 ms (orange), the peak force grows 0.98 → 3.9 → 19.6 kN (vertical axis divided by each tip\'s own peak force). Bottom: at low frequency the three force spectra are the same, and the shorter the contact, the farther the spectrum stays flat. The frequency where it falls to −10 dB (the excitation bandwidth) is about 1/t_c — rubber 127 Hz, plastic 510 Hz, steel 2550 Hz. The gray dotted lines are the pedestal\'s three natural frequencies: the rubber tip hardly shakes 290 Hz, at −32 dB.',
  '힘 ÷ 최대 힘': 'Force ÷ peak force',
  '고무 (무름) 8 ms': 'Rubber (soft) 8 ms',
  '플라스틱 (중간) 2 ms': 'Plastic (medium) 2 ms',
  '강철 (단단함) 0.4 ms': 'Steel (hard) 0.4 ms',
  '힘 스펙트럼 (저주파 = 0 dB)': 'Force spectrum (low frequency = 0 dB)',
  '그림 4. 감쇠가 아주 작은 2차 모드(141.6 Hz, ζ 0.003)는 1 s 프레임 끝에서도 처음 울림의 6.9 %가 남아 잘린다(위, 파랑). 지수 윈도우 e^(−t/τ)(τ = 0.1 s, 회색 점선)를 곱하면 끝이 0으로 줄어든다(초록). 아래: 2차 봉우리 확대(dB, 1 (m/s²)/kN = 0 dB). 윈도우 없이(파랑)는 Δf = 1 Hz가 봉우리 폭(0.85 Hz)보다 넓어 bin 1.6개로 읽고 ζ 0.0058(참값의 약 1.9배)가 나온다. 지수 윈도우(초록)는 봉우리를 넓혀 bin 4.2개로 읽게 하지만 ζ가 0.0147로 커진다. 윈도우가 보탠 몫(1/(τω_n) = 0.0112)을 빼면 0.0034로 참값 0.003에 가까워진다.':
    'Figure 4. The very lightly damped second mode (141.6 Hz, ζ 0.003) still has 6.9 % of its initial ringing at the end of the 1 s frame, so it is cut off (top, blue). Multiplying by the exponential window e^(−t/τ) (τ = 0.1 s, gray dotted line) shrinks the end to 0 (green). Bottom: zoom on the second peak (dB, 1 (m/s²)/kN = 0 dB). Without a window (blue), Δf = 1 Hz is wider than the peak width (0.85 Hz), so it is read with 1.6 bins and gives ζ 0.0058 (about 1.9 times the true value). The exponential window (green) widens the peak so it is read with 4.2 bins, but ζ grows to 0.0147. Subtracting the share the window added (1/(τω_n) = 0.0112) gives 0.0034, close to the true value 0.003.',
  '응답 기록 (1 s 프레임, 2차가 끝까지 울린다)': 'Response record (1 s frame, 2nd mode rings to the end)',
  '원기록': 'Raw record',
  '지수 윈도우 곱함': 'Exp. window applied',
  '윈도우 (× 30)': 'Window (× 30)',
  '2차 봉우리 확대 (Δf = 1 Hz)': 'Zoom on 2nd peak (Δf = 1 Hz)',
  '윈도우 없음': 'No window',
  '지수 윈도우 τ 0.1 s': 'Exp. window τ 0.1 s',
  '그림 5. 해머가 튀어 한 번 더 맞은 더블 히트(플라스틱 팁, 평균 5회). 위: 첫 펄스가 시작되고 4.4 ms 뒤 첫 펄스의 0.55배인 두 번째 펄스가 선다(주황). 회색 띠는 Force 윈도우가 남기는 구간이라 두 번째 펄스는 지워진다. 가운데: 두 펄스가 다 실린 힘 스펙트럼에는 1/(2 × 간격) = 114 Hz 자리에 골(−6.9 dB)이 생기고, 간격이 칠 때마다 달라 골 자리도 바뀐다. 아래 두 칸: Force 윈도우를 거친 힘으로 구한 FRF(주황, 정상 = 파랑, 참 = 회색 점선)는 1차 봉우리를 58.5(참 47.6), 2차를 131(참 278) (m/s²)/kN로 읽는다. 응답에는 두 번 친 결과가, 힘에는 한 번만 남았기 때문이다. 정상 기록도 2차가 참값보다 낮은 것은 Δf 1 Hz와 잘림 탓이다(3·5절).':
    'Figure 5. A double hit, where the hammer bounces and strikes once more (plastic tip, 5 averages). Top: 4.4 ms after the first pulse starts, a second pulse 0.55 times the first stands up (orange). The gray band is the interval the force window keeps, so the second pulse is erased. Middle: in the force spectrum carrying both pulses, a notch (−6.9 dB) appears at 1/(2 × spacing) = 114 Hz, and since the spacing differs with every hit, the notch position changes too. Bottom two panels: the FRF obtained with the force that went through the force window (orange; normal = blue, true = gray dotted line) reads the first peak as 58.5 (true 47.6) and the second as 131 (true 278) (m/s²)/kN, because the response holds the result of two strikes while the force keeps only one. That the second peak is lower than the true value even in the normal record is due to Δf 1 Hz and truncation (§3 · §5).',
  '채널 1: 힘 (앞 25 ms)': 'Channel 1: force (first 25 ms)',
  '더블 히트': 'Double hit',
  'Force 윈도우': 'Force window',
  '두 펄스가 다 실린 힘 스펙트럼 (한 번 친 펄스의 저주파 = 0 dB)': 'Force spectrum with both pulses (low frequency of a single pulse = 0 dB)',
  '골 114 Hz': 'Notch 114 Hz',
  '1차 둘레: Force 윈도우를 거친 |H1| [(m/s²)/kN]': 'Around 1st mode: |H1| through the force window [(m/s²)/kN]',
  '2차 둘레': 'Around 2nd mode',
  '그림 6. 1차 봉우리(참 ζ 0.035, 봉우리 폭 2ζf_n = 3.3 Hz)에서 Half-power 읽기. 봉우리 높이의 1/√2(주황 점선)를 지나는 두 주파수 f_a·f_b를 bin 사이 직선으로 찾아 ζ ≈ (f_b − f_a)/(2f_peak)를 계산한다. 위: T = 4 s(Δf 0.25 Hz)면 폭 안에 bin 13개가 들어 ζ = 0.0339(참값보다 3.2 % 작다 — 잡음 몫). 아래: T = 0.25 s(Δf 4 Hz)면 폭 안에 bin이 약 1개뿐이라 봉우리 높이를 참값보다 8.6 % 낮게 읽고 ζ = 0.0404으로 읽는다. 회색 점선은 참 FRF.':
    'Figure 6. Half-power reading on the first peak (true ζ 0.035, peak width 2ζf_n = 3.3 Hz). The two frequencies f_a and f_b where the curve passes through 1/√2 of the peak height (orange dotted line) are found along straight lines between bins, and ζ ≈ (f_b − f_a)/(2f_peak) is computed. Top: with T = 4 s (Δf 0.25 Hz), 13 bins fall inside the width and ζ = 0.0339 (3.2 % below the true value — the noise share). Bottom: with T = 0.25 s (Δf 4 Hz), only about 1 bin falls inside the width, so the peak height is read 8.6 % below the true value and ζ is read as 0.0404. The gray dotted line is the true FRF.',
  '봉우리 × 1/√2': 'Peak × 1/√2',
  'f_a 45.9 · f_b 49.2 Hz → ζ 0.0339 (bin 13개)': 'f_a 45.9 · f_b 49.2 Hz → ζ 0.0339 (13 bins)',
  'f_a 46 · f_b 49.9 Hz → ζ 0.0404 (bin 0.97개)': 'f_a 46 · f_b 49.9 Hz → ζ 0.0404 (0.97 bins)',
  '그림 7. 3000 rpm으로 도는 기계의 받침대를 고무 팁으로 치며 잰 가속도 스펙트럼(dB, 1 m/s² = 0 dB, T = 4 s). 위: 한 기록에서는 50 Hz 1X(3.05 m/s²)와 운전 잡음이 커서 47.5 Hz 봉우리가 바닥에 묻힌다. 아래: 타격 순간에 맞춰 16개 기록을 시간 평균하면 타격 응답은 매번 같은 자리에 있어 그대로 남고, 1X는 기록마다 위상이 달라 0.72 m/s²(약 4.2분의 1)로 줄어든다. 바닥 잡음도 함께 내려가 47.5 Hz 둘레의 둔덕이 드러난다.':
    'Figure 7. Acceleration spectra (dB, 1 m/s² = 0 dB, T = 4 s) measured by striking the pedestal of a machine running at 3000 rpm with the rubber tip. Top: in a single record the 50 Hz 1X (3.05 m/s²) and the operating noise are large, so the 47.5 Hz peak is buried in the floor. Bottom: when 16 records are time-averaged aligned to the moment of impact, the strike response sits in the same place every time and stays, while the 1X, whose phase differs from record to record, shrinks to 0.72 m/s² (about 1/4.2). The noise floor drops too, and the hump around 47.5 Hz appears.',
  '한 기록': 'Single record',
  '타격에 맞춘 평균 16회': 'Impact-synchronous average, 16',
  '그림 8. 운전 중(1X) 받침대의 높이 다섯 곳에서 잰 수평 진폭과 위상으로 그린 ODS(가상의 세 경우). 가로 = 진폭(mm/s), 베어링(기준 센서)과 같은 위상이면 +, 반대면 −. 파랑: 위로 갈수록 커지고 기초는 거의 서 있다 → 받침대 자체가 흔들린다(받침대 강성·공진). 주황: 기초부터 이미 크다 → 기초째 흔들린다(기초 강성). 초록: 기초(−0.3)와 베이스 플레이트(2.4) 사이에서 진폭이 뛰고 위상이 뒤집힌다 → 그 이음이 풀렸다(P7-3의 구조적 풀림).':
    'Figure 8. The ODS drawn from the horizontal amplitude and phase measured at five heights of the pedestal while running (1X), for three hypothetical cases. Horizontal axis = amplitude (mm/s), + if in phase with the bearing (the reference sensor), − if opposite. Blue: it grows toward the top and the foundation hardly moves → the pedestal itself shakes (pedestal stiffness, resonance). Orange: already large from the foundation → the whole thing shakes with the foundation (foundation stiffness). Green: the amplitude jumps and the phase flips between the foundation (−0.3) and the base plate (2.4) → that joint has come loose (structural looseness of P7-3).',
  '1X 진폭 [mm/s] (+ 기준과 같은 위상, − 반대)': '1X amplitude [mm/s] (+ in phase with reference, − opposite)',
  '높이 [m]': 'Height [m]',
  '받침대가 흔들린다': 'Pedestal shakes',
  '기초째 흔들린다': 'Foundation shakes too',
  '이음(베이스 볼트)이 풀렸다': 'Joint (base bolts) loose',
  '기초': 'Foundation',
  '베이스 플레이트': 'Base plate',
  '받침대 아래': 'Pedestal bottom',
  '받침대 가운데': 'Pedestal middle',
  '그림 9. 모터 발 네 곳(A ~ D)의 볼트를 하나씩 풀며 다이얼 게이지로 잰, 발이 뜨는 양(예시 값). 다른 발은 18 ~ 25 µm인데 C만 140 µm 뜬다 → C가 바닥에 제대로 닿지 않은 소프트 풋이다. 볼트로 조이면 프레임이 비틀려 공극·정렬·고유진동수가 바뀐다. 심(shim)으로 C를 받친 뒤 다시 잰다.':
    'Figure 9. How much each foot lifts, measured with a dial gauge while loosening the bolts of the four motor feet (A to D) one at a time (example values). The other feet lift 18 to 25 µm, but only C lifts 140 µm → C is a soft foot that is not sitting properly on the floor. Tightening its bolt twists the frame and changes the air gap, alignment and natural frequency. Support C with a shim and measure again.',
  '발': 'Foot',
  '뜨는 양 [µm]': 'Lift [µm]',
};

export default EN;
