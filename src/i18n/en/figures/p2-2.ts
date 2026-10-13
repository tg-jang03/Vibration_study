import type { Dict } from '../../translate';

/** src/figures/p2-2.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 10 Hz 사각파(점선)를 정현파로 쌓아 가는 과정. 1차(10 Hz) 하나는 둥근 물결이지만, 3차(30 Hz)와 5차(50 Hz)를 알맞은 크기로 더할 때마다 꼭대기가 평평해지고 모서리가 가팔라진다. 15차(150 Hz)까지 더하면 거의 사각형이다. 모서리 옆의 작은 뿔(약 9 %)은 성분을 더 더해도 폭만 좁아질 뿐 남는다(깁스 현상, Gibbs Phenomenon).':
    'Figure 1. Building a 10 Hz square wave (dotted) out of sinusoids. The 1st order (10 Hz) alone is a round wave, but each time the 3rd (30 Hz) and 5th (50 Hz) are added at the right size, the top gets flatter and the corner steeper. Adding up to the 15th (150 Hz) gives nearly a square. The small horn beside the corner (about 9 %) stays even if more components are added; it only gets narrower (the Gibbs phenomenon).',
  '1차만 (10 Hz)': '1st only (10 Hz)',
  '1차 + 3차 (10 + 30 Hz)': '1st + 3rd (10 + 30 Hz)',
  '1 + 3 + 5차': '1 + 3 + 5',
  '15차까지 (홀수 8개)': 'Up to 15th (8 odd)',
  // 그림 2
  '그림 2. 그림 1의 사각파(높이 ±1)를 만드는 레시피 — 각 하모닉의 진폭. 홀수 차(10, 30, 50 … Hz)만 있고 크기는 4/(nπ)로 차수에 반비례해 줄어든다. 짝수 차(20, 40 … Hz)는 정확히 0이다. 이 막대그래프가 사각파의 진폭 스펙트럼이다.':
    'Figure 2. The recipe for the square wave of Figure 1 (height ±1): the amplitude of each harmonic. Only odd orders (10, 30, 50 … Hz) are present, and their size falls as 4/(nπ), inversely with the order. The even orders (20, 40 … Hz) are exactly 0. This bar chart is the amplitude spectrum of the square wave.',
  '1차 1.27': '1st 1.27',
  '3차 0.424': '3rd 0.424',
  '5차 0.255': '5th 0.255',
  '7차 0.182': '7th 0.182',
  // 그림 3
  '그림 3. 두 신호는 같은 성분(10·30·50·70 Hz, 진폭도 같음)으로 만들었고 3·5·7차의 위상만 다르다. 진폭 스펙트럼(아래)은 똑같고 RMS도 같지만, 파형 모양과 Crest factor(1.22 → 2.13)는 다르다. 진폭 스펙트럼은 위상을 버리고 그리기 때문이다.':
    'Figure 3. The two signals are made of the same components (10, 30, 50 and 70 Hz, with the same amplitudes) and differ only in the phases of the 3rd, 5th and 7th. The amplitude spectrum (bottom) is identical and the RMS is the same too, but the waveform shape and crest factor (1.22 → 2.13) differ. This is because the amplitude spectrum is drawn with the phase thrown away.',
  '위상을 맞춘 합 (사각파에 가까움): CF = 1.22': 'Phases aligned (near square wave): CF = 1.22',
  '3·5·7차 위상만 옮긴 합: CF = 2.13': 'Only 3rd, 5th, 7th phases shifted: CF = 2.13',
  '두 신호의 진폭 스펙트럼 (똑같다)': 'Amplitude spectrum of both signals (identical)',
  // 그림 4
  '그림 4. 10 Hz로 반복되는 펄스 두 개와 각각의 진폭 스펙트럼. 막대 키를 이은 모양(포락선)이 처음 0이 되는 주파수는 펄스 폭 τ의 역수 1/τ이다. 넓은 펄스(40 ms)는 성분이 25 Hz 안쪽에 몰려 있고, 좁은 펄스(10 ms)는 성분 하나하나는 작지만 100 Hz까지 넓게 퍼져 있다. 시간에서 짧은 것은 주파수에서 넓다 — 그래서 짧게 "탁" 치는 충격은 넓은 주파수 범위를 한꺼번에 흔든다. 0 Hz 막대는 평균값(DC)이다.':
    'Figure 4. Two pulses repeating at 10 Hz and the amplitude spectrum of each. The frequency at which the shape joining the bar tops (the envelope) first reaches 0 is 1/τ, the inverse of the pulse width τ. The wide pulse (40 ms) has its components crowded within 25 Hz, while the narrow pulse (10 ms) has smaller components that spread widely out to 100 Hz. Short in time means wide in frequency — so a short "tap" impact shakes a wide frequency range at once. The 0 Hz bar is the mean value (DC).',
  '넓은 펄스: 폭 τ = 40 ms (한 주기의 40 %)': 'Wide pulse: width τ = 40 ms (40 % of a period)',
  '첫 0점 1/τ = 25 Hz': 'First zero 1/τ = 25 Hz',
  '좁은 펄스: 폭 τ = 10 ms (한 주기의 10 %)': 'Narrow pulse: width τ = 10 ms (10 % of a period)',
  '첫 0점 1/τ = 100 Hz': 'First zero 1/τ = 100 Hz',
  // 그림 5
  '그림 5. 신호에 "4 Hz가 들었나?"를 묻는 방법. 위 두 칸: 4 Hz 템플릿을 대고 샘플마다 곱하면 두 파형이 늘 같은 방향이라 곱이 모두 0 이상이다 → 합이 16으로 크다. 아래 두 칸: 5 Hz 템플릿은 박자가 어긋나 곱이 +와 −를 오가고 → 합이 정확히 0이 된다. 합을 N/2(= 16)로 나누면 그 주파수 성분의 진폭(1)이 나온다.':
    'Figure 5. How to ask a signal "is there 4 Hz in you?" Top two panels: hold up a 4 Hz template and multiply sample by sample; the two waveforms always move the same way, so the products are all zero or above → the sum is large, 16. Bottom two panels: a 5 Hz template is out of step, so the products swing between + and − → the sum is exactly 0. Dividing the sum by N/2 (= 16) gives the amplitude of that frequency component (1).',
  '같은 주파수 템플릿 (4 Hz)': 'Template at the same frequency (4 Hz)',
  '신호 (4 Hz)': 'Signal (4 Hz)',
  '템플릿 (4 Hz)': 'Template (4 Hz)',
  '샘플마다 곱한 값 → 32개를 모두 더하면 16': 'Product per sample → all 32 added = 16',
  '다른 주파수 템플릿 (5 Hz)': 'Template at another frequency (5 Hz)',
  '템플릿 (5 Hz)': 'Template (5 Hz)',
  '샘플마다 곱한 값 → 32개를 모두 더하면 0': 'Product per sample → all 32 added = 0',
  '시간 [s] (샘플 32개, f_s = 32 Hz)': 'Time [s] (32 samples, f_s = 32 Hz)',
  // 그림 6
  '그림 6. 이번 신호는 같은 4 Hz지만 위상이 90° 늦다(꼭대기가 1/4 주기 늦게 온다). cos 템플릿과 곱하면 +와 −가 똑같이 나와 합이 0 — 성분이 있는데도 못 찾는다. sin 템플릿과 곱하면 합이 16이다. 신호의 위상을 미리 모르므로 DFT는 cos와 sin 두 템플릿을 모두 대 보고, 두 합을 피타고라스로 묶어 크기를 구한다.':
    'Figure 6. This time the signal is the same 4 Hz but lags by 90° (its peak comes a quarter period later). Multiplied by the cos template, + and − come out equal and the sum is 0 — the component is there but is not found. Multiplied by the sin template, the sum is 16. Since the phase of the signal is not known beforehand, the DFT tries both the cos and the sin template and combines the two sums with Pythagoras to get the size.',
  'cos 템플릿과 곱한 값 → 합 0': 'Product with cos template → sum 0',
  'sin 템플릿과 곱한 값 → 합 16': 'Product with sin template → sum 16',
  // 그림 7
  '그림 7. 진폭 1인 60 Hz 정현파의 스펙트럼 (f_s = 256 Hz). 위: DFT 계산 결과를 그대로 그리면 +60 Hz와 −60 Hz에 절반(0.5)씩 나뉘어 나온다(양측 스펙트럼). 실제 측정 신호에서는 −쪽이 +쪽의 거울상이라 새 정보가 없다. 아래: 분석기는 −쪽을 버리고 +쪽을 2배 해서 0 ~ f_s/2만 보여 준다(단일측 스펙트럼).':
    'Figure 7. Spectrum of a 60 Hz sinusoid of amplitude 1 (f_s = 256 Hz). Top: drawing the DFT result as it is gives half (0.5) at +60 Hz and half at −60 Hz (two-sided spectrum). For a real measured signal the − side is a mirror image of the + side and carries no new information. Bottom: the analyzer discards the − side, doubles the + side, and shows only 0 to f_s/2 (single-sided spectrum).',
  '양측 스펙트럼 (계산 결과 그대로)': 'Two-sided spectrum (raw result)',
  '단일측 스펙트럼 (분석기 화면)': 'Single-sided spectrum (analyzer display)',
  // 그림 8
  '그림 8. 8.3 Hz 정현파 하나의 스펙트럼. 점은 원래 bin, 선은 제로패딩으로 bin 사이를 촘촘히 채워 그린 모양이다. 위: 1초 측정 — 성분 하나가 폭 2 Hz(= 2/T)짜리 둔덕으로 그려진다. 패딩을 아무리 늘려도 이 둔덕은 더 촘촘히 그려질 뿐 좁아지지 않는다. 아래: 4초 측정 — 둔덕 폭이 0.5 Hz로 좁아진다. 가까운 두 성분을 가를 수 있는지는 이 둔덕 폭, 즉 측정 시간 T가 정한다.':
    'Figure 8. Spectrum of a single 8.3 Hz sinusoid. Dots are the original bins; the line is the shape drawn by filling in between bins densely with zero padding. Top: 1-second measurement — one component is drawn as a hump 2 Hz (= 2/T) wide. However much padding you add, the hump is only drawn more densely and does not get narrower. Bottom: 4-second measurement — the hump narrows to 0.5 Hz. Whether two close components can be separated is set by this hump width, that is, by the measurement time T.',
  'T = 1 s (N = 32) + 제로패딩 ×16': 'T = 1 s (N = 32) + zero padding ×16',
  '둔덕 폭 2/T = 2 Hz': 'Hump width 2/T = 2 Hz',
  'T = 4 s (N = 128) + 제로패딩 ×4': 'T = 4 s (N = 128) + zero padding ×4',
  // 그림 9
  '그림 9. 8.3 Hz와 8.8 Hz(주황 점선) 두 성분이 0.5 Hz 차이로 섞인 신호. 위: 1초 측정, bin 간격 1 Hz — 막대만으로는 알 수 없다. 가운데: 같은 1초 데이터에 제로패딩 ×16 — 곡선은 매끈해졌지만 둔덕은 하나이고, 꼭대기도 두 성분 사이의 엉뚱한 곳에 있다. 아래: 4초 측정 — 두 봉우리로 갈라진다. 제로패딩은 이미 잰 데이터를 촘촘히 그릴 뿐, 새로운 정보를 만들지 않는다.':
    'Figure 9. A signal mixing two components, 8.3 Hz and 8.8 Hz (orange dotted), 0.5 Hz apart. Top: 1-second measurement, bin spacing 1 Hz — the bars alone cannot tell. Middle: zero padding ×16 on the same 1-second data — the curve is smoother, but there is still one hump, and its top is in an odd place between the two components. Bottom: 4-second measurement — it splits into two peaks. Zero padding only draws already-measured data more densely and creates no new information.',
  'T = 1 s (N = 32), 패딩 없음: bin 간격 1 Hz': 'T = 1 s (N = 32), no padding: bin spacing 1 Hz',
  'T = 1 s (N = 32) + 제로패딩 ×16: 둔덕 하나': 'T = 1 s (N = 32) + zero padding ×16: one hump',
  'T = 4 s (N = 128): 측정 시간을 늘리면 갈라진다': 'T = 4 s (N = 128): lengthen the measurement and it splits',
};

export default EN;
