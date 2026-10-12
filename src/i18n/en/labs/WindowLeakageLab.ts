import type { Dict } from '../../translate';

/** LAB-WIN-01 WindowLeakageLab 영어 (D-054) */
const EN: Dict = {
  '윈도우 없음 (Uniform)': 'No window (Uniform)',
  'Hann (분석기 기본값)': 'Hann (analyzer default)',
  'Flat top (진폭 측정용)': 'Flat top (for amplitude)',
  'Blackman-Harris (작은 성분 찾기용)': 'Blackman-Harris (for small components)',
  '원래 신호': 'Original signal',
  '윈도우를 곱한 신호': 'Windowed signal',
  '윈도우 가중치': 'Window weight',
  '스펙트럼 [dB]': 'Spectrum [dB]',
  '스펙트럼 [Peak]': 'Spectrum [Peak]',
  윈도우: 'Window',
  '성분이 눈금(60 Hz)에서 벗어난 정도 δ': 'Offset of the component from the 60 Hz bin, δ',
  'dB로 보기 (멀리 새는 양이 보인다)': 'Show in dB (reveals far leakage)',
  '가리비 손실': 'scalloping loss',
  '가장 높은 막대': 'highest bar',
  '실제 진폭 ': 'true amplitude ',
  '성분 주파수': 'Component frequency',
  '가장 높은 막대 (실제 1)': 'Highest bar (true value 1)',
  '10 bin 떨어진 곳(70 Hz)의 크기': 'Level 10 bins away (70 Hz)',
  'δ = 0(성분이 정확히 60 Hz)에서 윈도우를 바꿔 보세요. 가장 높은 막대는 얼마인가요?':
    'At δ = 0 (the component exactly at 60 Hz), switch between windows. How high is the highest bar?',
  '네 윈도우 모두 1.000입니다. 다만 윈도우가 있으면 60 Hz 양옆 막대에도 값이 생깁니다(Hann은 59·61 Hz에 0.5). 봉우리 폭이 넓어진 것이지 진폭이 틀린 것은 아닙니다.':
    'It is 1.000 for all four windows. With a window, though, the bars on either side of 60 Hz also get values (0.5 at 59 and 61 Hz for Hann). The peak has become wider; the amplitude is not wrong.',
  '윈도우 없이 δ = 0.5로 옮기세요. 가장 높은 막대와 10 bin 떨어진 곳의 크기는?':
    'With no window, move to δ = 0.5. What are the highest bar and the level 10 bins away?',
  '가장 높은 막대가 약 0.64(−3.9 dB)로 깎이고, 70 Hz에도 약 −29 dB가 남습니다. Hann으로 바꾸면 0.85(−1.4 dB)와 약 −69 dB, Flat top이면 0.999(−0.01 dB)입니다.':
    'The highest bar is shaved to about 0.64 (−3.9 dB), and about −29 dB is left even at 70 Hz. With Hann it becomes 0.85 (−1.4 dB) and about −69 dB; with Flat top, 0.999 (−0.01 dB).',
  'dB로 보기를 켜고 δ = 0.5에서 윈도우 없음과 Blackman-Harris를 비교하세요.':
    'Turn on the dB view and compare no window with Blackman-Harris at δ = 0.5.',
  '윈도우 없음은 바닥 전체에 −30 ~ −40 dB의 누설이 깔리지만, Blackman-Harris는 성분에서 몇 bin만 벗어나면 −90 dB 아래로 떨어집니다. 그 대신 가운데 봉우리가 ±4 bin으로 넓습니다.':
    'With no window, leakage of −30 to −40 dB covers the whole floor, while with Blackman-Harris it falls below −90 dB just a few bins from the component. In exchange, the central peak is ±4 bins wide.',
  '누설과 가리비 손실': 'Leakage and scalloping loss',
  '시간파형: 1초 프레임 전체': 'Time waveform: the whole 1 s frame',
  '시간 [s]': 'Time [s]',
  값: 'Value',
  '윈도우를 곱한 시간파형': 'Windowed time waveform',
  '스펙트럼 ({0})': 'Spectrum ({0})',
  '주파수 [Hz]': 'Frequency [Hz]',
  '진폭 [Peak]': 'Amplitude [Peak]',
  '누설 스펙트럼': 'Leakage spectrum',
};

export default EN;
