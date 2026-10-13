import type { Dict } from '../../translate';

/** src/figures/p5-5.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 런업(600 → 3600 rpm) 동안 성분들의 주파수. 1X(파랑)·2X(보라)는 회전수를 따라 오르고, 0.45X(초록)는 3300 rpm부터 나타난다. 회색 띠는 27 ± 2 Hz에 고정한 띠 통과 필터다 — 810 rpm 근처에서는 2X를, 1620 rpm 근처에서는 1X를, 3600 rpm에서는 0.45X를 통과시킨다. 같은 필터 출력이 회전수마다 다른 성분을 담는다. 주황 띠는 트래킹 필터로, 통과 띠의 가운데가 늘 1X에 있다 (폭은 보기 좋게 과장).':
    'Figure 1. Frequencies of the components during a run-up (600 → 3600 rpm). 1X (blue) and 2X (purple) rise with speed, and 0.45X (green) appears from 3300 rpm. The gray band is a band-pass filter fixed at 27 ± 2 Hz — it passes 2X near 810 rpm, 1X near 1620 rpm and 0.45X at 3600 rpm. The same filter output holds a different component at each speed. The orange band is a tracking filter, whose passband center is always on 1X (width exaggerated for visibility).',
  '트래킹 필터 (1X를 따라 움직임)': 'Tracking filter (moves with 1X)',
  '고정 띠 통과 27 ± 2 Hz': 'Fixed band-pass 27 ± 2 Hz',
  // 그림 2
  '그림 2. 트래킹 필터의 계산 (3600 rpm, 1X 31.6 µm pp∠164.7° + 2X 6 µm pp). 위: 측정 파형. 가운데·아래: 파형에 2cos θ와 −2sin θ를 곱한 값(옅은 선)은 빠르게 출렁이지만, 그 가운데는 일정하다. 저역 통과(B = 2 Hz, 진한 선)를 지나면 출렁임이 사라지고 실수부 −15.2 µm, 허수부 −4.15 µm에 자리 잡는다 — 이 두 숫자가 1X의 크기와 위상이다.':
    'Figure 2. The tracking filter calculation (3600 rpm, 1X 31.6 µm pp∠164.7° + 2X 6 µm pp). Top: the measured waveform. Middle and bottom: the waveform multiplied by 2cos θ and −2sin θ (light lines) swings rapidly, but its center is constant. After the low-pass (B = 2 Hz, dark lines) the swing disappears and it settles at a real part of −15.2 µm and an imaginary part of −4.15 µm — these two numbers are the amplitude and phase of 1X.',
  '① 측정 파형 x(t) (0.1초 = 6바퀴)': '① Measured waveform x(t) (0.1 s = 6 revolutions)',
  '② 실수부: 2x cos θ → 저역 통과': '② Real part: 2x cos θ → low-pass',
  '③ 허수부: −2x sin θ → 저역 통과': '③ Imaginary part: −2x sin θ → low-pass',
  '시각 [s]': 'Time [s]',
  // 그림 3
  '그림 3. 3600 rpm에서 t = 4 s에 1X가 31.6 → 47.4 µm pp로 바뀐다(회색 점선). 넓은 대역 잡음 σ = 5 µm가 섞여 있다. 같은 신호를 폭이 다른 트래킹 필터 셋으로 읽었다. B = 5 Hz는 0.092 s 만에 변화의 절반을 따라잡지만 크기가 ±1.47 µm pp(표준편차, 이론값)쯤 흔들린다. B = 0.2 Hz는 흔들림이 0.29 µm pp로 작지만 절반에 2.28 s, 90 %에 4.2 s가 걸린다.':
    'Figure 3. At 3600 rpm, 1X changes from 31.6 to 47.4 µm pp at t = 4 s (gray dotted). Wide-band noise of σ = 5 µm is mixed in. The same signal is read with three tracking filters of different widths. B = 5 Hz catches up with half of the change in 0.092 s, but its amplitude ripples by about ±1.47 µm pp (standard deviation, theoretical value). B = 0.2 Hz has a small ripple of 0.29 µm pp, but it takes 2.28 s to reach half and 4.2 s to reach 90 %.',
  'B = 5 Hz — 지연 τ_g 0.09 s, 잡음 흔들림(이론) 1.47 µm pp': 'B = 5 Hz — lag τ_g 0.09 s, noise ripple (theory) 1.47 µm pp',
  'B = 1 Hz — 지연 τ_g 0.45 s, 잡음 흔들림(이론) 0.659 µm pp': 'B = 1 Hz — lag τ_g 0.45 s, noise ripple (theory) 0.659 µm pp',
  'B = 0.2 Hz — 지연 τ_g 2.25 s, 잡음 흔들림(이론) 0.295 µm pp': 'B = 0.2 Hz — lag τ_g 2.25 s, noise ripple (theory) 0.295 µm pp',
  // 그림 4
  '그림 4. P4-1의 예시 로터를 200 rpm/s로 올리며(잡음 σ = 5 µm) 실시간 트래킹 필터로 그린 Bode. 회색 점선은 각 회전수의 참 응답(봉우리 3008 rpm, 100.1 µm pp). B = 2 Hz(파랑)는 봉우리 3066 rpm·98.9 µm pp로 거의 맞는다. B = 0.5 Hz(주황)는 봉우리가 3197 rpm으로 밀리고 76.5 µm pp로 낮아지며, 위상 90°도 3187 rpm으로 밀린다. 지연 0.9 s 동안 회전수가 180 rpm 올라가기 때문이다.':
    'Figure 4. Bode plot of the P4-1 example rotor run up at 200 rpm/s (noise σ = 5 µm), drawn with a real-time tracking filter. The gray dotted line is the true response at each speed (peak 3008 rpm, 100.1 µm pp). B = 2 Hz (blue) is nearly right, with the peak at 3066 rpm and 98.9 µm pp. With B = 0.5 Hz (orange) the peak is pushed to 3197 rpm and lowered to 76.5 µm pp, and the 90° phase is also pushed to 3187 rpm. This is because the speed rises 180 rpm during the 0.9 s lag.',
  '1X 크기': '1X amplitude',
  '참값 (그 회전수의 정상 응답)': 'True value (steady response at that speed)',
  '1X 위상 (지연각)': '1X phase (lag angle)',
  '회전수 [rpm]': 'Speed [rpm]',
  // 그림 5
  '그림 5. 같은 B = 0.5 Hz, 200 rpm/s. 위: 실시간 필터는 늘 "지나온 쪽"으로 밀린다 — 런업(주황, 그림 4와 같은 기록)은 봉우리가 3197 rpm, 코스트다운(파랑)은 2864 rpm으로 둘이 333 rpm 벌어진다. 아래: 기록을 두 번 거르면(영위상, P5-1) 지연이 없어 봉우리 회전수가 3038 rpm으로 거의 돌아오지만, 크기는 69.0 µm pp로 오히려 더 깎인다(초록). 폭을 2 Hz로 넓혀 두 번 거르면(보라) 3014 rpm·97.6 µm pp로 참값에 가깝다.':
    'Figure 5. Same B = 0.5 Hz, 200 rpm/s. Top: a real-time filter is always pushed toward "where it has been" — the run-up (orange, the same record as Figure 4) has its peak at 3197 rpm and the coastdown (blue) at 2864 rpm, 333 rpm apart. Bottom: filtering the record twice (zero phase, P5-1) removes the lag, so the peak speed returns almost to 3038 rpm, but the amplitude is shaved even more, to 69.0 µm pp (green). Widening to 2 Hz and filtering twice (purple) gives 3014 rpm and 97.6 µm pp, close to the true value.',
  '실시간(한 방향): 런업 vs 코스트다운': 'Real-time (one direction): run-up vs coastdown',
  '런업': 'Run-up',
  '코스트다운': 'Coastdown',
  '저장된 기록을 두 번 거르기 (런업)': 'Filtering a stored record twice (run-up)',
  'B = 0.5 Hz, 두 번': 'B = 0.5 Hz, twice',
  'B = 2 Hz, 두 번': 'B = 2 Hz, twice',
  // 그림 6
  '그림 6. 노치로 1X를 지운다 (트래킹 필터 B = 2 Hz로 뽑은 1X 파형을 뺀다). 위: 3600 rpm의 측정 파형 — 1X(31.6 µm pp)에 섞인 0.45X(12 µm pp)는 봉우리 높이를 들쭉날쭉하게 할 뿐, 그것이 무엇이고 얼마인지는 파형으로 읽기 어렵다. 가운데: 1X를 뺀 Not-1X 파형(주황)은 참 성분(회색 점선, 2X + 0.45X + 잡음)과 겹친다. 아래 둘: 런업(50 rpm/s) 동안 0.25초마다 잰 RMS. 0.45X가 생기는 3300 rpm 위에서 Not-1X(주황)는 2.35 → 4.86 µm로 두 배가 넘게 커지지만, 직접(파랑)은 1X가 대부분이라 그 변화가 드러나지 않는다. 임계속도 근처의 작은 언덕은 1X가 빨리 변해 노치가 다 지우지 못한 몫이다.':
    'Figure 6. Removing 1X with a notch (subtract the 1X waveform extracted by a tracking filter with B = 2 Hz). Top: the measured waveform at 3600 rpm — the 0.45X (12 µm pp) mixed into 1X (31.6 µm pp) only makes the peak heights ragged, and what it is and how large is hard to read from the waveform. Middle: the Not-1X waveform with 1X subtracted (orange) overlaps the true components (gray dotted, 2X + 0.45X + noise). Bottom two: RMS measured every 0.25 s during a run-up (50 rpm/s). Above 3300 rpm, where 0.45X appears, Not-1X (orange) more than doubles from 2.35 to 4.86 µm, but the direct value (blue) is mostly 1X, so the change does not show. The small hump near the critical speed is the part the notch could not fully remove because 1X changes quickly.',
  '① 직접 (거르지 않은 파형), 3600 rpm': '① Direct (unfiltered waveform), 3600 rpm',
  '② Not-1X = 직접 − 뽑은 1X': '② Not-1X = direct − extracted 1X',
  '③ 런업 동안의 직접 RMS (0.25초마다)': '③ Direct RMS during the run-up (every 0.25 s)',
  '④ 같은 런업의 Not-1X RMS (세로 눈금이 다르다)': '④ Not-1X RMS of the same run-up (note the different vertical scale)',
  '참 Not-1X': 'True Not-1X',
  // 그림 7
  '그림 7. 3600 rpm에서 X(가로, 오른쪽 +)·Y(세로, 위 +) 두 센서로 8바퀴 동안 그린 오빗 (P4-2). 왼쪽: 거르지 않은 직접 오빗 — 1X 타원에 0.45X(바퀴마다 조금씩 어긋나는 큰 고리)와 2X·잡음이 더해져 바퀴마다 다른 길을 간다. 오른쪽: 두 채널을 각각 트래킹 필터(B = 2 Hz)로 거른 1X 필터 오빗 — 8바퀴가 한 타원에 겹친다. 1X 필터 오빗은 1X(동기) 응답 — 이 예에서는 불평형 응답 — 의 모양을, 직접 오빗은 1X 밖의 움직임까지 보여 준다. 읽는 법은 P6-3.':
    'Figure 7. Orbits drawn over 8 revolutions at 3600 rpm with two sensors, X (horizontal, + to the right) and Y (vertical, + up) (P4-2). Left: the unfiltered direct orbit — 0.45X (a large loop that drifts a little each revolution), 2X and noise are added to the 1X ellipse, so each revolution takes a different path. Right: the 1X filtered orbit, with each of the two channels passed through a tracking filter (B = 2 Hz) — the 8 revolutions overlap on one ellipse. The 1X filtered orbit shows the shape of the 1X (synchronous) response — in this example the unbalance response — while the direct orbit also shows the motion outside 1X. How to read it: P6-3.',
  '직접 오빗': 'Direct orbit',
  '1X 필터 오빗': '1X filtered orbit',
};
export default EN;
