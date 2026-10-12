import type { Dict } from '../../translate';

/** src/figures/p2-5.ts 그림의 영어 (D-054) */
const EN: Dict = {
  // 그림 1
  '그림 1. FFT는 잰 1초 프레임이 앞뒤로 똑같이 되풀이된다고 보고 계산한다(점선). 위: 프레임 안에 정확히 3주기가 들어가면 끝과 다음 시작이 매끄럽게 이어져, 에너지가 3 Hz bin 하나에 모인다. 아래: 3.5주기면 프레임 경계에서 신호가 뚝 끊긴다. 이 끊김을 만들려면 여러 주파수가 필요하므로, 에너지가 주변 bin들로 새어 나간다 — 누설이다.':
    'Figure 1. The FFT computes as if the measured 1 s frame repeated identically before and after itself (dashed). Top: with exactly 3 cycles in the frame, the end joins the next start smoothly, and the energy gathers in the single 3 Hz bin. Bottom: with 3.5 cycles the signal breaks abruptly at the frame boundary. Making that break takes many frequencies, so the energy leaks into the surrounding bins — this is leakage.',
  '3.0주기: 끝과 시작이 이어진다': '3.0 cycles: end and start join up',
  '잰 프레임 (1초)': 'Measured frame (1 s)',
  'FFT가 가정하는 다음 반복': 'Next repetition assumed by the FFT',
  '프레임 경계': 'Frame boundary',
  '3.5주기: 경계에서 끊긴다': '3.5 cycles: breaks at the boundary',
  '끊김(불연속)': 'Break (discontinuity)',
  // 그림 2
  '그림 2. 진폭 1인 정현파를 윈도우 없이 1초 동안 잰 스펙트럼 (Δf = 1 Hz). 위: 60.0 Hz는 1초에 정확히 60주기라 60 Hz 막대 하나에 높이 1로 모인다. 가운데: 60.5 Hz는 60.5주기라 프레임 끝이 끊기고(그림 1), 에너지가 양옆 막대로 새면서 가장 높은 막대도 0.64로 낮아진다. 아래: 가운데와 같은 스펙트럼을 dB로 그리면, 10 bin 떨어진 70 Hz에도 −29 dB(약 1/30)가 남아 있다. 새어 나간 에너지가 아주 멀리까지 깔린다.':
    'Figure 2. Spectrum of a sine of amplitude 1 measured for 1 s without a window (Δf = 1 Hz). Top: 60.0 Hz is exactly 60 cycles in 1 s, so it gathers into the single 60 Hz bar with height 1. Middle: 60.5 Hz is 60.5 cycles, so the frame end breaks (Figure 1); energy leaks into the neighboring bars and even the highest bar drops to 0.64. Bottom: the same spectrum drawn in dB still has −29 dB (about 1/30) at 70 Hz, 10 bins away. The leaked energy spreads very far.',
  '60.0 Hz (1초에 정확히 60주기): 막대 하나': '60.0 Hz (exactly 60 cycles in 1 s): a single bar',
  '60.5 Hz (60.5주기): 옆으로 퍼지고 낮아진다': '60.5 Hz (60.5 cycles): spreads out and drops',
  '가장 높은 막대 0.64': 'Highest bar 0.64',
  '같은 60.5 Hz를 dB로 보면: 멀리까지 깔린다': 'The same 60.5 Hz in dB: it spreads far',
  '10 bin 떨어진 곳: −29 dB': '10 bins away: −29 dB',
  // 그림 3
  '그림 3. 그림 1 아래의 3.5주기 신호에 Hann 윈도우를 곱한 모습. 위: Hann 가중치(주황 점선)는 프레임 가운데에서 1, 양 끝에서 0인 종 모양이다. 아래: 곱한 신호는 양 끝이 0으로 모이므로, FFT가 가정하는 다음 반복(점선)과 경계에서 끊김 없이 이어진다. 끊김이 없으니 멀리까지 새는 에너지가 크게 줄어든다.':
    'Figure 3. The 3.5-cycle signal from the bottom of Figure 1 multiplied by a Hann window. Top: the Hann weight (orange dashed) is bell-shaped, 1 in the middle of the frame and 0 at both ends. Bottom: the multiplied signal goes to 0 at both ends, so it joins the next repetition assumed by the FFT (dashed) without a break at the boundary. With no break, the energy leaking far away is greatly reduced.',
  '원래 신호와 Hann 가중치': 'Original signal and Hann weight',
  '잰 신호 (3.5주기)': 'Measured signal (3.5 cycles)',
  'Hann 가중치 w(t)': 'Hann weight w(t)',
  '가중치를 곱한 신호: 양 끝이 0이라 반복해도 끊기지 않는다': 'Weighted signal: 0 at both ends, so repeating it does not break',
  '곱한 신호': 'Weighted signal',
  // 그림 4
  '그림 4. 같은 60.5 Hz 신호(진폭 1)를 윈도우 없이(위)와 Hann 윈도우로(아래) 잰 dB 스펙트럼. Hann은 가운데 봉우리가 조금 넓어지지만, 10 bin 떨어진 70 Hz의 누설이 −29 dB에서 −69 dB로 약 40 dB(1/100) 내려가고, 가장 높은 막대도 0.64 → 0.85로 실제 값 1에 가까워진다.':
    'Figure 4. dB spectra of the same 60.5 Hz signal (amplitude 1) measured without a window (top) and with a Hann window (bottom). With Hann the central peak gets a little wider, but the leakage at 70 Hz, 10 bins away, drops by about 40 dB (1/100), from −29 dB to −69 dB, and the highest bar rises from 0.64 to 0.85, closer to the true value of 1.',
  '윈도우 없음 (Uniform)': 'No window (Uniform)',
  'Hann 윈도우': 'Hann window',
  // 그림 5
  '그림 5. 진폭 1인 성분의 주파수를 59 Hz에서 62 Hz까지 조금씩 옮기며, 스펙트럼에서 가장 높은 막대의 높이를 그렸다 (Δf = 1 Hz, 세로축은 0.55부터). 성분이 눈금(59, 60, 61, 62 Hz) 위에 있으면 모두 1이지만, 눈금 한가운데(예: 60.5 Hz)에서는 윈도우 없음 0.64, Hann 0.85, Flat top 0.999으로 깎인다. 눈금마다 되풀이되는 아치 모양 때문에 이 깎임을 가리비 손실(Scallop Loss)이라 부른다.':
    'Figure 5. The height of the highest bar in the spectrum as a component of amplitude 1 is moved little by little from 59 Hz to 62 Hz (Δf = 1 Hz; the vertical axis starts at 0.55). On a bin (59, 60, 61, 62 Hz) all windows give 1, but halfway between bins (e.g. 60.5 Hz) the bar is shaved to 0.64 with no window, 0.85 with Hann and 0.999 with Flat top. Because of the arches repeating at every bin, this shaving is called scalloping loss (scallop loss).',
  'Uniform (윈도우 없음)': 'Uniform (no window)',
  '성분의 주파수 [Hz] (눈금 = 59, 60, 61, 62 Hz)': 'Component frequency [Hz] (bins at 59, 60, 61, 62 Hz)',
  '가장 높은 막대': 'Highest bar',
  // 그림 6
  '그림 6. 진폭 1인 성분 하나가 각 윈도우에서 어떤 모양으로 그려지는지를, 성분에서 떨어진 거리(bin)에 따라 그렸다. 위(그대로의 높이): 가운데 봉우리 — 메인로브 — 가 처음 0이 되는 곳이 윈도우 없음 1 bin, Hann 2 bin, Blackman-Harris 4 bin, Flat top 5 bin이다. 봉우리가 넓을수록 가까운 두 성분이 하나로 뭉치기 쉽다. 아래(dB): 메인로브 바깥의 작은 봉우리들 — 사이드로브 — 의 가장 높은 값(점선)이 윈도우 없음 −13.3 dB, Hann −31.5 dB, Blackman-Harris −92 dB, Flat top −93.5 dB이다. 사이드로브가 낮을수록 큰 성분 옆의 작은 성분이 덜 가려진다.':
    'Figure 6. How a single component of amplitude 1 is drawn by each window, against the distance from the component (in bins). Top (linear height): the central peak — the main lobe — first reaches 0 at 1 bin with no window, 2 bins with Hann, 4 bins with Blackman-Harris and 5 bins with Flat top. The wider the peak, the more easily two close components merge into one. Bottom (dB): the highest of the small peaks outside the main lobe — the side lobes — (dashed) is −13.3 dB with no window, −31.5 dB with Hann, −92 dB with Blackman-Harris and −93.5 dB with Flat top. The lower the side lobes, the less a small component next to a large one is hidden.',
  '그대로의 높이: 메인로브 폭': 'Linear height: main lobe width',
  'dB로 본 높이: 사이드로브 높이': 'Height in dB: side lobe level',
  '성분에서 떨어진 거리 [bin]': 'Distance from the component [bin]',
  // 그림 7
  '그림 7. 큰 성분(100.5 Hz, 진폭 1)에서 8 bin 떨어진 곳(108.5 Hz, 주황 점선)에 −70 dB(약 1/3000) 작은 성분이 있다. 작은 성분 자리에 큰 성분이 흘린 누설은 윈도우 없음 −27 dB, Hann −62 dB, Blackman-Harris −93 dB이다. 이 누설보다 작은 성분이 커야 보인다. 작은 성분이 −50 dB였다면 Hann으로도 보였을 것이다.':
    'Figure 7. A small component of −70 dB (about 1/3000) sits 8 bins (108.5 Hz, orange dashed) from a large component (100.5 Hz, amplitude 1). The leakage the large component spills at the small one is −27 dB with no window, −62 dB with Hann and −93 dB with Blackman-Harris. The small component is visible only if it is larger than this leakage. Had it been −50 dB, Hann would have shown it too.',
  '윈도우 없음: 큰 성분의 누설에 완전히 묻힌다': "No window: fully buried in the large component's leakage",
  '작은 성분 (−70 dB)': 'Small component (−70 dB)',
  'Hann: 아직 묻힌다': 'Hann: still buried',
  'Blackman-Harris: 작은 성분이 드러난다': 'Blackman-Harris: the small component shows',
  // 그림 8
  '그림 8. Hann 가중치 w(t)(파랑)와 그 제곱 w²(t)(초록). 정현파 막대의 높이는 신호에 w를 곱한 만큼 줄어드는데, w의 평균이 0.5이므로 막대가 절반이 된다 → 2배 해 주는 진폭 보정(ACF = 2). 잡음처럼 넓게 퍼진 신호는 에너지(제곱)로 따지므로 w²의 평균 0.375만큼 줄어든다 → 에너지를 되돌리려면 1/√0.375 ≈ 1.63배 하는 에너지 보정(ECF ≈ 1.63). 두 평균이 다르기 때문에 보정도 두 가지가 필요하다.':
    'Figure 8. The Hann weight w(t) (blue) and its square w²(t) (green). The height of a sine bar shrinks by the factor w applied to the signal; the average of w is 0.5, so the bar is halved → amplitude correction doubles it (ACF = 2). A broadband signal such as noise is judged by its energy (the square), so it shrinks by the average of w², 0.375 → restoring the energy takes energy correction by 1/√0.375 ≈ 1.63 (ECF ≈ 1.63). The two averages differ, so two kinds of correction are needed.',
  '가중치 w(t)': 'Weight w(t)',
  '가중치의 제곱 w²(t)': 'Squared weight w²(t)',
  'w의 평균 0.5': 'Mean of w: 0.5',
  'w²의 평균 0.375': 'Mean of w²: 0.375',
  '프레임 안의 시간 (0 = 시작, 1 = 끝)': 'Time within the frame (0 = start, 1 = end)',
};

export default EN;
