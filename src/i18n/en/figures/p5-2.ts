import type { Dict } from '../../translate';

/** src/figures/p5-2.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 예시 기동(600 → 3600 rpm을 40초에 올린 뒤 20초 유지)의 축 변위 파형(맨 위)에서 1초짜리 프레임을 떼어 FFT한 스펙트럼 세 장. 10 s(1350 rpm)에는 1X가 22.5 Hz에, 30 s(2850 rpm)에는 47.5 Hz에, 50 s(3600 rpm)에는 60 Hz에 선다. 1X 아래에 생긴 막대(30 s의 21 Hz, 50 s의 25 Hz)는 2절에서 다룬다. 이렇게 프레임을 조금씩 밀며 FFT를 되풀이하는 것이 STFT다.':
    'Figure 1. Three spectra, each the FFT of a 1-second frame cut out of the shaft displacement waveform (top) of an example run-up (600 → 3600 rpm over 40 s, then held for 20 s). At 10 s (1350 rpm) 1X stands at 22.5 Hz, at 30 s (2850 rpm) at 47.5 Hz, and at 50 s (3600 rpm) at 60 Hz. The bars below 1X (21 Hz at 30 s, 25 Hz at 50 s) are covered in §2. Sliding the frame a little at a time and repeating the FFT is the STFT.',
  '축 변위 파형 (프레임 세 곳 표시)': 'Shaft displacement waveform (three frames marked)',
  '10 s 프레임 (1350 rpm, 1X = 22.5 Hz)': '10 s frame (1350 rpm, 1X = 22.5 Hz)',
  '30 s 프레임 (2850 rpm, 1X = 47.5 Hz)': '30 s frame (2850 rpm, 1X = 47.5 Hz)',
  '50 s 프레임 (3600 rpm, 1X = 60 Hz)': '50 s frame (3600 rpm, 1X = 60 Hz)',
  // 그림 2
  '그림 2. 같은 기동의 스펙트로그램: 프레임마다의 스펙트럼을 시각 높이에 놓고 크기를 색의 진하기로 칠한 지도(N = 512, T = 1 s, 겹침 50 %). 가로가 주파수, 세로가 시간이다. 1X·2X는 회전수를 따라 비스듬히 올라가고, 1X는 임계속도(1500 rpm, 12 s 근처)에서 가장 진하다(40.7 µm). 95 Hz 구조 공진은 세로줄로 늘 제자리이고, 2X가 그 위를 지나는 30 s(2850 rpm)에 2X가 10.2 µm로 커진다. 2400 rpm(24 s)부터 1X 아래에 0.45X 줄이 생겨 비스듬히 따라가다가 36.4 s(3333 rpm)에 25 Hz에서 세로로 꺾여 멈춘다.':
    'Figure 2. Spectrogram of the same run-up: the spectrum of each frame placed at its time height, with the magnitude painted as color intensity (N = 512, T = 1 s, 50 % overlap). Frequency is horizontal and time is vertical. 1X and 2X climb diagonally with the speed, and 1X is darkest at the critical speed (1500 rpm, near 12 s; 40.7 µm). The 95 Hz structural resonance is a vertical line that always stays in place, and 2X grows to 10.2 µm at 30 s (2850 rpm), where it passes over it. From 2400 rpm (24 s) a 0.45X line appears below 1X and follows it diagonally, then at 36.4 s (3333 rpm) it bends vertical at 25 Hz and stops.',
  'N = 512, T = 1 s, 겹침 50 %': 'N = 512, T = 1 s, 50 % overlap',
  '진폭 (dB re 1 µm)': 'Amplitude (dB re 1 µm)',
  '40 s: 3600 rpm 도달, 유지': '40 s: 3600 rpm reached, held',
  '95 Hz 구조 공진 (고정)': '95 Hz structural resonance (fixed)',
  '임계 1500 rpm': 'Critical 1500 rpm',
  '2X가 95 Hz를 지날 때': '2X crosses 95 Hz',
  '25 Hz에 잠김': 'Locked at 25 Hz',
  // 그림 3
  '그림 3. 같은 기동(0 ~ 40 s, 1X가 1초에 1.25 Hz씩 오름)을 프레임 길이만 바꿔 본 스펙트로그램. 위: N = 128(T = 0.25 s)은 시각은 촘촘하지만 Δf = 4 Hz라 줄이 굵다(20 s에서 1X 봉우리 폭 약 8.3 Hz). 가운데: N = 512(T = 1 s)는 줄이 가장 가늘다(2.1 Hz). 아래: N = 4096(T = 8 s)은 Δf = 0.125 Hz지만 한 프레임 동안 1X가 10 Hz 움직여 번지고, 봉우리도 16.1 → 3.65 µm로 낮아진다. 한 장이 8초를 뭉뚱그린다(칸 간격은 hop = 2초). 위 N = 128의 줄은 4 Hz 칸에 몇 장씩 머물러 계단처럼 보인다. 봉우리 폭은 반값 폭이다.':
    'Figure 3. Spectrograms of the same run-up (0 to 40 s, 1X rising 1.25 Hz per second), changing only the frame length. Top: N = 128 (T = 0.25 s) is fine in time, but Δf = 4 Hz makes the line thick (1X peak width about 8.3 Hz at 20 s). Middle: N = 512 (T = 1 s) gives the thinnest line (2.1 Hz). Bottom: N = 4096 (T = 8 s) has Δf = 0.125 Hz, but 1X moves 10 Hz during one frame and smears, and the peak also drops from 16.1 to 3.65 µm. One spectrum lumps together 8 seconds (cell spacing is hop = 2 s). In the top plot (N = 128) the line stays in each 4 Hz cell for several spectra and looks like a staircase. Peak width means half-width.',
  // 그림 4
  '그림 4. 같은 STFT 결과를 줄로 쌓은 두 그림. 위(워터폴, Waterfall): 시각 높이에 쌓는다. 40 s 뒤 회전수를 유지하는 동안에도 줄이 계속 쌓여, 25 Hz 성분이 7.7 µm에서 14 µm로 자라는 것이 보인다. 아래(캐스케이드, Cascade): 회전수 높이에 쌓는다. 회전 성분은 회전수에 비례하는 곧은 줄이 되지만, 유지하는 20초의 스펙트럼은 모두 3600 rpm 한 높이에 겹쳐 시간 변화가 숨는다.':
    'Figure 4. Two plots that stack the same STFT result as lines. Top (waterfall): stacked at the height of the time. Lines keep stacking even while the speed is held after 40 s, so you can see the 25 Hz component grow from 7.7 to 14 µm. Bottom (cascade): stacked at the height of the speed. Rotating components become straight lines proportional to the speed, but the spectra of the 20 held seconds all overlap at the single 3600 rpm height, hiding the change over time.',
  '워터폴: 세로 = 시간': 'Waterfall: vertical = time',
  '유지 시작': 'Hold starts',
  '캐스케이드: 세로 = 회전수': 'Cascade: vertical = speed',
  '40 ~ 60 s가 모두 3600 rpm에 겹침': '40 to 60 s all overlap at 3600 rpm',
  // 그림 5
  '그림 5. 회전수–주파수 평면에서 줄의 모양 읽기. 원점에서 나오는 곧은 줄은 회전을 따라가는 성분이고, 주파수 ÷ 회전수(Hz) 비가 차수다(1X, 2X, 0.45X). 세로가 회전수인 이 그림에서는 차수가 높을수록 줄이 눕는다. 세로줄은 회전수와 상관없이 제자리인 성분이다(구조 공진, 전원 주파수의 2배 같은 전기 성분). 비스듬히 따라가던 줄이 어느 회전수부터 세로로 꺾이면(0.45X → 25 Hz) 무언가에 "잠긴" 것이다. 회전 줄이 세로줄과 만나는 곳(1X × 25 Hz = 1500 rpm, 2X × 95 Hz = 2850 rpm)이 커질 수 있는 자리다.':
    'Figure 5. Reading the shapes of lines on the speed-frequency plane. A straight line from the origin is a component that follows the rotation, and the ratio frequency ÷ speed (Hz) is the order (1X, 2X, 0.45X). In this plot, where the vertical axis is speed, a higher order makes the line lie flatter. A vertical line is a component that stays in place regardless of speed (structural resonance, or an electrical component such as twice the line frequency). If a line that was following diagonally bends vertical from some speed on (0.45X → 25 Hz), it has become "locked" onto something. The places where a rotating line meets a vertical line (1X × 25 Hz = 1500 rpm, 2X × 95 Hz = 2850 rpm) are where the amplitude can grow.',
  '0.45X → 잠김': '0.45X → locked',
  '구조 공진 95 Hz': 'Structural resonance 95 Hz',
  '1차 임계 25 Hz': '1st critical 25 Hz',
  // 그림 6
  '그림 6. 시간–주파수 평면을 나누는 두 방식(개념도). 칸 하나가 "이만큼의 시간 동안, 이만큼의 주파수 폭"을 뜻하고, 넓이(시간 폭 × 주파수 폭)는 어느 쪽이든 1 근처보다 작아질 수 없다. 위: STFT는 프레임 길이 하나로 모든 주파수를 같은 칸으로 나눈다. 아래: 웨이블릿은 낮은 주파수는 길게(주파수를 촘촘히), 높은 주파수는 짧게(시각을 촘촘히) 나눈다 — 느린 변화와 짧은 충격을 한 그림에서 볼 때 쓴다.':
    'Figure 6. Two ways of dividing the time-frequency plane (concept sketch). One cell means "this much time, this much frequency width", and the area (time width × frequency width) cannot get much smaller than about 1 either way. Top: the STFT divides all frequencies into the same cells with a single frame length. Bottom: the wavelet divides low frequencies long (fine in frequency) and high frequencies short (fine in time), which is used to see slow changes and short impacts in one plot.',
  'STFT: 모든 주파수에서 같은 칸': 'STFT: same cells at every frequency',
  '주파수 →': 'Frequency →',
  '웨이블릿: 낮은 주파수는 길게, 높은 주파수는 짧게': 'Wavelet: long at low frequency, short at high frequency',
  '시간 →': 'Time →',
};

export default EN;
