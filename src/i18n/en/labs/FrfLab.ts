import type { Dict } from '../../translate';

const EN: Dict = {
  '{0}장': '{0}',
  '참 FRF': 'True FRF',
  'H1 위상': 'H1 phase',
  'FRF 추정과 코히어런스': 'FRF estimation and coherence',
  '평균한 프레임 수 M': 'Number of averaged frames M',
  '응답 쪽 잡음 (응답 평균 크기 대비)': 'Response noise (relative to mean response magnitude)',
  '힘 쪽 잡음 (힘 크기 대비)': 'Force noise (relative to force magnitude)',
  '80 Hz (공진) H1': '80 Hz (resonance) H1',
  '80 Hz (공진) H2': '80 Hz (resonance) H2',
  '{0} Hz (반공진) H1': '{0} Hz (antiresonance) H1',
  '{0} Hz (반공진) H2': '{0} Hz (antiresonance) H2',
  '{0} Hz 코히어런스 γ²': '{0} Hz coherence γ²',
  '80 Hz 코히어런스 γ²': '80 Hz coherence γ²',
  '응답 쪽 잡음 10 %에서 M을 16 → 256으로 늘리면 반공진의 H1과 H2는 각각 참값(0.177)에 가까워지나요?':
    'With 10 % response noise, as you raise M from 16 to 256, do H1 and H2 at the antiresonance each approach the true value (0.177)?',
  'H1은 0.275 → 0.153으로 참값 쪽으로 모입니다(평균할수록 흔들림이 줄어듦). H2는 1.23 → 1.90으로 참값에 가까워지지 않습니다. 응답 쪽 잡음이 G_yy에 쌓이는 쏠림이라, 평균을 아무리 늘려도 H2는 참값이 아니라 |H|/γ² ≈ 1.6(참값의 약 9배) 근처로 모이고, 평균이 적으면 그 둘레에서 크게 흔들립니다.':
    'H1 converges toward the true value, 0.275 → 0.153 (the more you average, the less it scatters). H2 does not approach the true value, 1.23 → 1.90. It is a bias from response noise piling up in G_yy, so however many averages you take, H2 converges not to the true value but to around |H|/γ² ≈ 1.6 (about 9 times the true value), and with few averages it swings widely around that.',
  '힘 쪽 잡음만 30 %로 두면 80 Hz의 H1은 참값(16.7)의 몇 배가 되나요? 평균 수를 바꾸면?':
    'With only 30 % force noise, how many times the true value (16.7) is H1 at 80 Hz? What if you change the number of averages?',
  '약 1/(1 + 0.3²) = 0.917배, 15.4 근처입니다. 평균 수를 늘려도 이 비율은 그대로이고 흔들림만 줄어듭니다. 이 경우는 H2가 참값에 맞습니다.':
    'About 1/(1 + 0.3²) = 0.917 times, near 15.4. More averages leave this ratio unchanged and only reduce the scatter. In this case H2 matches the true value.',
  '주파수 [Hz]': 'Frequency [Hz]',
  '크기 [dB]': 'Magnitude [dB]',
  'FRF 크기: 참값, H1, H2': 'FRF magnitude: true value, H1, H2',
  '위상 [°]': 'Phase [°]',
  'FRF 위상': 'FRF phase',
  '코히어런스': 'Coherence',
};

export default EN;
