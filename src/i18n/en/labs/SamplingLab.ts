import type { Dict } from '../../translate';

/** LAB-SMP-01 SamplingLab 영어 (D-054). 키 = 소스의 한국어 원문 — 뼈대는 node scripts/i18n/scan-lab.mjs SamplingLab */
const EN: Dict = {
  '정상 샘플링 (60 Hz, fs=1000)': 'Normal sampling (60 Hz, fs=1000)',
  '940 Hz → 60 Hz로 보임 (f_s − f, 위상 반전)': '940 Hz → appears as 60 Hz (f_s − f, phase inverted)',
  '1060 Hz → 60 Hz로 보임 (f − f_s)': '1060 Hz → appears as 60 Hz (f − f_s)',
  '1940 Hz → 60 Hz로 보임 (2f_s − f, 위상 반전)': '1940 Hz → appears as 60 Hz (2f_s − f, phase inverted)',
  '나이퀴스트 한계 (500 Hz, 위상 0°)': 'Nyquist limit (500 Hz, phase 0°)',
  '나이퀴스트 소멸 (500 Hz, 위상 90° → 샘플 0)': 'Vanishing at Nyquist (500 Hz, phase 90° → samples are 0)',
  '직접 조작 (슬라이더)': 'Manual (sliders)',
  '참 신호 x(t) ({0} Hz)': 'True x(t) ({0} Hz)',
  '겉보기 신호 xa(t) ({0} Hz)': 'Apparent xa(t) ({0} Hz)',
  '샘플 점 x[n] (fs={0} Hz)': 'Samples x[n] (fs={0} Hz)',
  '단일측 스펙트럼': 'Single-sided spectrum',
  '샘플링 & 에일리어싱': 'Sampling & aliasing',
  '프리셋 시나리오': 'Preset scenario',
  '신호 주파수 f': 'Signal frequency f',
  '샘플링 주파수 fs': 'Sampling frequency fs',
  '신호 위상 φ': 'Signal phase φ',
  '시간 표시 범위': 'Time window shown',
  '참 신호 x(t)': 'True signal x(t)',
  '샘플 점 x[n]': 'Samples x[n]',
  '겉보기 신호 xa(t)': 'Apparent signal xa(t)',
  '나이퀴스트 주파수': 'Nyquist frequency',
  '위상 반전': 'phase inverted',
  '위상 유지': 'phase kept',
  '샘플 점들이 이 겉보기 정현파 위에 완벽히 놓임': 'the samples lie exactly on this apparent sine',
  '에일리어싱 없음 (정상 수집)': 'no aliasing (normal acquisition)',
  '입력 신호 주파수 f': 'Input signal frequency f',
  '나이퀴스트 주파수 fN': 'Nyquist frequency fN',
  '이론 에일리어스 주파수 fa': 'Theoretical alias frequency fa',
  '스펙트럼 측정 피크 주파수': 'Measured spectral peak frequency',
  '스펙트럼 피크 진폭': 'Spectral peak amplitude',
  'fs = 1000 Hz에서 신호 주파수가 60 Hz일 때와 940 Hz, 1060 Hz일 때 스펙트럼 피크는 각각 어디에 나타날까요?':
    'With fs = 1000 Hz, where does the spectral peak appear when the signal is at 60 Hz, at 940 Hz and at 1060 Hz?',
  '세 경우 모두 60 Hz에 같은 크기로 나타납니다. 940 Hz = 1000 − 60, 1060 Hz = 1000 + 60이라 둘 다 f_s에서 60 Hz만큼 떨어져 있기 때문입니다. 시간 그래프에서 샘플 점들이 60 Hz 겉보기 정현파(점선) 위에 놓이는 것을 확인하세요.':
    'In all three cases it appears at 60 Hz with the same height. Since 940 Hz = 1000 − 60 and 1060 Hz = 1000 + 60, both sit 60 Hz away from f_s. In the time plot, check that the samples lie on the 60 Hz apparent sine (dashed).',
  '940 Hz와 1060 Hz의 샘플 점은 둘 다 60 Hz로 보이는데, 둘 사이에 어떤 차이가 있을까요?':
    'The samples of 940 Hz and 1060 Hz both look like 60 Hz. What is the difference between them?',
  '위상이 다릅니다. 1060 Hz(f_s보다 위)는 원래 위상 +φ 그대로 보이지만, 940 Hz(f_s보다 아래)는 거울처럼 뒤집혀 접히므로 위상 부호가 바뀐 −φ로 보입니다. 진폭 스펙트럼만 보면 둘은 같습니다.':
    'The phase. 1060 Hz (above f_s) keeps its original phase +φ, but 940 Hz (below f_s) folds over like a mirror image, so it shows up with the opposite sign, −φ. In the amplitude spectrum alone the two look identical.',
  '신호 주파수를 정확히 나이퀴스트 한계인 f = fs/2 = 500 Hz에 놓고 위상 φ를 0°에서 90°로 바꾸면 샘플 점에 어떤 일이 생기나요?':
    'Put the signal exactly at the Nyquist limit, f = fs/2 = 500 Hz, and change the phase φ from 0° to 90°. What happens to the samples?',
  'φ = 0°이면 샘플 점이 +1, −1, +1, −1로 꼭대기와 바닥에 찍히지만, φ = 90°이면 모든 점이 0을 지나는 순간에 찍혀 신호가 사라집니다. 그래서 신호 주파수는 f_N과 "같아도" 안 되고 f_N보다 "작아야" 합니다.':
    'At φ = 0° the samples land on the peaks and troughs: +1, −1, +1, −1. At φ = 90° every sample lands on a zero crossing and the signal disappears. That is why the signal frequency must be strictly "below" f_N — being "equal" to it is not enough.',
  '원판 그림에서 재생을 누르고 60 Hz, 940 Hz, 1060 Hz 프리셋을 차례로 고르세요. 플래시로 본 원판은 각각 어느 방향으로, 플래시마다 얼마나 돌까요?':
    'Press play in the disk animation and pick the 60 Hz, 940 Hz and 1060 Hz presets in turn. Which way does the disk seen under the flash turn in each case, and by how much per flash?',
  '60 Hz와 1060 Hz는 플래시마다 +0.06바퀴, 반시계(실제와 같은 방향)로 천천히 돕니다. 940 Hz는 0.94바퀴를 돌지만 0.06바퀴 모자라 −0.06바퀴, 즉 거꾸로 도는 것처럼 보입니다. 이 "거꾸로"가 위상 부호가 뒤집혀 접히는 것(위상 반전)입니다. 오른쪽 띠의 샘플 점은 세 경우 모두 같은 느린 60 Hz 물결을 그립니다.':
    'At 60 Hz and 1060 Hz the disk creeps forward by +0.06 turn per flash, counterclockwise (the real direction). At 940 Hz it turns 0.94 turn, which is 0.06 short of a full turn, so it seems to move −0.06 turn — backwards. That "backwards" is the fold with an inverted phase sign. The samples in the strip on the right trace the same slow 60 Hz wave in all three cases.',
  '1940 Hz 프리셋을 누르면 왜 여전히 60 Hz로 보일까요?': 'Why does the 1940 Hz preset still look like 60 Hz?',
  '1940 Hz = 2 × 1000 − 60이라 2f_s에서 60 Hz만큼 떨어져 있기 때문입니다. f_N을 넘는 주파수는 f_s, 2f_s, 3f_s … 근처마다 지그재그로 계속 0 ~ f_N 안에 접혀 들어옵니다. 샘플만으로는 진짜와 가짜를 구분할 수 없으므로, 샘플링하기 전에 필터(AAF)로 높은 주파수를 미리 깎아야 합니다.':
    'Because 1940 Hz = 2 × 1000 − 60 sits 60 Hz away from 2f_s. Frequencies above f_N keep folding back into 0 to f_N in a zigzag around f_s, 2f_s, 3f_s, … The samples alone cannot tell the real from the fake, so high frequencies must be removed by a filter (AAF) before sampling.',
  '시간 t [s]': 'Time t [s]',
  '진폭 x(t)': 'Amplitude x(t)',
  '샘플링 시간영역 파형': 'Sampled time-domain waveform',
  '주파수 [Hz]': 'Frequency [Hz]',
  '스펙트럼 진폭 (Pk)': 'Spectral amplitude (Pk)',
  '단일측 진폭 스펙트럼 피크': 'Single-sided amplitude spectrum peak',
};

export default EN;
