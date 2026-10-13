import type { Dict } from '../../translate';

/** src/figures/p6-1.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. 3000 rpm은 한 바퀴 20 ms입니다. 파랑은 기준 진폭 A=20 µm의 정현파, 회색 점선은 키페이저 시각입니다. 한 바퀴마다 한 주기가 반복되며 Pk-Pk는 40 µm입니다.':
    'Figure 1. At 3000 rpm one revolution takes 20 ms. Blue is a sine wave with reference amplitude A = 20 µm; the gray dashed lines are the Keyphasor times. One cycle repeats every revolution, and Pk-Pk is 40 µm.',
  정현파: 'Sine wave',
  '그림 2. 위는 1X·1.1X의 맥놀이, 아래는 0.1X 박자로 진폭을 바꾼 AM입니다. 10바퀴=200 ms에서 크기 변화 한 주기를 봅니다. 두 신호의 RMS는 각각 10·15 µm입니다. 맥놀이는 봉우리가 키페이저 점선에서 조금씩 밀리고 포락선이 0까지 내려가지만, AM은 봉우리가 매 바퀴 점선에 고정됩니다. 모양만으로 발생 원인을 확정할 수는 없습니다.':
    'Figure 2. Top: beating of 1X and 1.1X. Bottom: AM, with the amplitude changed at a rhythm of 0.1X. One cycle of the size change fits in 10 revolutions = 200 ms. The RMS values of the two signals are 10 and 15 µm. In beating the peaks slip gradually against the Keyphasor dashed lines and the envelope falls to zero, whereas in AM the peaks stay fixed on the dashed lines every revolution. The shape alone cannot fix the cause.',
  맥놀이: 'Beating',
  '진폭 변조 (AM)': 'Amplitude modulation (AM)',
  '그림 3. 한 바퀴(20 ms)에 울림이 세 번 시작합니다. 주황 점은 모델이 정한 시작 시각이며 간격은 6.667 ms입니다. 울림 안의 여러 봉우리를 각각 사건으로 세지 마세요. 모양 비교를 위해 변위로 그렸지만, 실제 충격 울림은 가속도 파형에서 잘 보입니다.':
    'Figure 3. Ringing starts three times in one revolution (20 ms). The orange dots are start times set by the model, and the interval is 6.667 ms. Do not count each peak inside the ringing as an event. It is drawn as displacement to compare shapes, but real impact ringing shows up well in an acceleration waveform.',
  '반복 충격 울림': 'Repeated impact ringing',
  '모델 사건 시작': 'Model event start',
  '그림 4. 한쪽 절단은 아래를 −5 µm, 양쪽 클리핑은 ±13 µm에서 제한한 모양 예시입니다. Pk-Pk는 각각 25·26 µm입니다. 평탄부의 위치와 반복을 읽되 기계 접촉과 측정 체인 포화는 추가 확인으로 구별합니다.':
    'Figure 4. Example shapes with one-sided truncation limited at −5 µm at the bottom and two-sided clipping limited at ±13 µm. Pk-Pk is 25 and 26 µm respectively. Read the position and repetition of the flat parts, and tell machine contact from measurement-chain saturation with additional checks.',
  '한쪽 절단': 'One-sided truncation',
  '양쪽 클리핑': 'Two-sided clipping',
  '그림 5. 1X에 같은 위상의 2X를 0.35A 더하면 위쪽 Peak는 27 µm, 아래쪽 크기는 약 14.1 µm(2X 때문에 생긴 두 골의 바닥)입니다. 평균은 0인데 위아래가 다릅니다. 비대칭은 DC 이동과 구별해야 하며, 그 자체가 비선형 결함의 증명은 아닙니다.':
    'Figure 5. Adding a same-phase 2X of 0.35A to 1X gives an upper Peak of 27 µm and a lower magnitude of about 14.1 µm (the bottoms of the two troughs made by 2X). The mean is 0, yet the upper and lower sides differ. Asymmetry has to be told apart from a DC shift, and in itself it is not proof of a nonlinear fault.',
  '위아래 비대칭': 'Up-down asymmetry',
  '그림 6. 위는 잡음 없는 정현파, 아래는 σ=2 µm의 시드 고정 잡음을 더한 파형입니다. CF는 1.41에서 1.89로 바뀝니다. 고립된 봉우리 하나와 반복되는 울림을 구별하고, 필터·시간 길이도 함께 기록하세요.':
    'Figure 6. Top: a noise-free sine wave. Bottom: the same wave with fixed-seed noise of σ = 2 µm added. CF changes from 1.41 to 1.89. Tell a single isolated peak from repeating ringing, and record the filter and the time length as well.',
  '같은 정현파 + 잡음': 'Same sine wave + noise',
  '그림 7. 두 파형은 모두 1X 20 µm Peak·2X 7 µm Peak이며 RMS도 14.98 µm로 같습니다. 위는 2X 앞섬각 0°, 아래는 90°입니다. 진폭 스펙트럼이 숨긴 성분 사이 위상 차이가 파형 모양을 바꿉니다.':
    'Figure 7. Both waveforms have 1X of 20 µm Peak and 2X of 7 µm Peak, and the same RMS of 14.98 µm. Top: 2X lead angle 0°; bottom: 90°. The phase difference between components, which the amplitude spectrum hides, changes the waveform shape.',
  '2X 앞섬각 0°': '2X lead angle 0°',
  '2X 앞섬각 90°': '2X lead angle 90°',
  '시각 [ms]': 'Time [ms]',
  '변위 [µm]': 'Displacement [µm]',
};
export default EN;
