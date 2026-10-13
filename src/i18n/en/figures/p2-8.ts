import type { Dict } from '../../translate';

/** src/figures/p2-8.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 위: 100 Hz 정현파(크기 1 mm/s Peak). 아래: 같은 정현파의 크기를 1초에 5번 오르내리게 한 진동 — 크기가 0.5에서 1.5 mm/s 사이를 오간다 (회색 점선 = 포락선, 꼭대기를 이은 선). 빠르게 떠는 100 Hz는 그대로이고, 그 크기가 5 Hz로 천천히 바뀐다. 이렇게 크기가 주기적으로 변하는 것을 진폭 변조(AM)라고 한다.':
    'Figure 1. Top: a 100 Hz sinusoid (size 1 mm/s Peak). Bottom: the same sinusoid with its size made to rise and fall 5 times a second — the size swings between 0.5 and 1.5 mm/s (gray dashed line = envelope, the line joining the peaks). The fast 100 Hz oscillation stays as it is, and its size changes slowly at 5 Hz. A size that varies periodically like this is called amplitude modulation (AM).',
  '100 Hz 정현파 (변조 없음)': '100 Hz sinusoid (no modulation)',
  '크기를 5 Hz로 오르내리게 함 (m = 0.5)': 'Size swung at 5 Hz (m = 0.5)',
  '한 번 오르내리는 데 1/5 = 0.2 s': 'One swing takes 1/5 = 0.2 s',
  // 그림 2
  '그림 2. 그림 1 아래 진동의 스펙트럼 (측정 8 s, Hann). 막대는 셋이다 — 가운데 100 Hz(반송파) 1 mm/s, 양옆 95 Hz와 105 Hz(측대역) 각 0.25 mm/s. 측대역은 반송파에서 변조 주파수(5 Hz)만큼 떨어져 있고, 높이는 m/2 = 0.25배(−12 dB)다. 5 Hz 자리에는 아무것도 없다.':
    'Figure 2. Spectrum of the lower vibration in Figure 1 (8 s measurement, Hann). There are three bars — 100 Hz (carrier) in the middle at 1 mm/s, and 95 Hz and 105 Hz (sidebands) on both sides at 0.25 mm/s each. The sidebands are one modulating frequency (5 Hz) away from the carrier, and their height is m/2 = 0.25 times (−12 dB). There is nothing at 5 Hz.',
  '반송파 1': 'Carrier 1',
  '측대역 0.25': 'Sideband 0.25',
  '간격 5 Hz = 변조 주파수': 'Spacing 5 Hz = modulating freq.',
  // 그림 3
  '그림 3. 기어 상자에서 맞물림 주파수(P2-6) 300 Hz의 크기가 오르내리는 두 경우. 위: 20 Hz로 도는 축 A가 원인 — 측대역이 280·320 Hz, 간격 20 Hz. 아래: 12.5 Hz로 도는 축 B가 원인 — 측대역이 287.5·312.5 Hz, 간격 12.5 Hz. 반송파는 같아도 측대역 간격이 다르다. 간격을 재면 크기를 흔드는 것이 어느 축인지 알 수 있다.':
    'Figure 3. Two cases in a gearbox where the size of the 300 Hz gear mesh frequency (P2-6) rises and falls. Top: shaft A turning at 20 Hz is the cause — sidebands at 280 and 320 Hz, spacing 20 Hz. Bottom: shaft B turning at 12.5 Hz is the cause — sidebands at 287.5 and 312.5 Hz, spacing 12.5 Hz. The carrier is the same, but the sideband spacing differs. Measuring the spacing tells you which shaft is shaking the size.',
  '축 A(20 Hz)가 한 바퀴에 한 번씩 맞물림을 세게 함': 'Shaft A (20 Hz) strengthens the mesh once per turn',
  '축 B(12.5 Hz)가 한 바퀴에 한 번씩 맞물림을 세게 함': 'Shaft B (12.5 Hz) strengthens the mesh once per turn',
  // 그림 4
  '그림 4. 맞물림 300 Hz가 한 바퀴(1/20 s)에 한 번 짧게 커지는 경우 — 예를 들어 이빨 하나가 상했을 때. 위: 파형과 포락선. 아래: 스펙트럼. 크기의 변화가 정현파 모양이 아니라 짧은 펄스 모양이면 측대역이 한 쌍이 아니라 여러 쌍(여기서 눈에 띄는 것만 ±4쌍) 생긴다. 그래도 간격은 모두 20 Hz — 원인 축의 회전 주파수 — 로 같다.':
    'Figure 4. The 300 Hz mesh grows briefly once per revolution (1/20 s) — for example when one tooth is damaged. Top: waveform and envelope. Bottom: spectrum. If the size change is a short pulse rather than a sinusoid, there is not one pair of sidebands but several pairs (here ±4 pairs are noticeable). The spacing is still the same 20 Hz for all of them — the rotation frequency of the causing shaft.',
  '파형 (회색 점선 = 포락선)': 'Waveform (gray dashed = envelope)',
  '스펙트럼': 'Spectrum',
  // 그림 5
  '그림 5. 위: 40 Hz 정현파의 주파수를 1초에 5번 흔든 진동(FM). 크기는 늘 1 mm/s로 일정하지만, 물결 간격이 촘촘해졌다 넓어졌다를 되풀이한다. 아래: 그 순간의 주파수 — 30 Hz와 50 Hz 사이를 오간다. 최대 흔들림 10 Hz를 변조 주파수 5 Hz로 나눈 β = 2가 FM 변조 지수다.':
    'Figure 5. Top: a 40 Hz sinusoid whose frequency is shaken 5 times a second (FM). The size is always a constant 1 mm/s, but the spacing of the waves repeatedly tightens and widens. Bottom: the instantaneous frequency — it swings between 30 Hz and 50 Hz. The maximum deviation of 10 Hz divided by the modulating frequency of 5 Hz gives β = 2, the FM modulation index.',
  '주파수를 5 Hz로 흔듦 (β = 2)': 'Frequency shaken at 5 Hz (β = 2)',
  '그 순간의 주파수': 'Instantaneous frequency',
  // 그림 6
  '그림 6. 100 Hz 반송파의 주파수를 5 Hz로 흔든 FM 진동을 β만 바꿔 가며 스펙트럼으로 봤다. 측대역이 5 Hz 간격으로 여러 쌍 서고, 높이는 베셀 함수 Jₙ(β)를 따른다. β = 1이면 반송파 0.77, 첫째 측대역 0.44, 둘째 0.11. β가 커질수록 의미 있는 측대역이 대략 β + 1쌍으로 늘어나고, β = 2.4 근처에서는 반송파가 거의 사라진다(0.003). 크기는 그대로이고 주파수만 흔들려도, 스펙트럼에는 반송파 하나가 아니라 넓게 퍼진 막대들이 보인다.':
    'Figure 6. Spectra of an FM vibration (100 Hz carrier, frequency shaken at 5 Hz) with only β changed. Several pairs of sidebands stand at 5 Hz spacing, and their heights follow the Bessel function Jₙ(β). For β = 1 the carrier is 0.77, the first sideband 0.44, the second 0.11. As β grows, the number of significant sideband pairs rises to roughly β + 1, and near β = 2.4 the carrier almost vanishes (0.003). Even though the size is unchanged and only the frequency fluctuates, the spectrum shows not one carrier but widely spread bars.',
  // 그림 7
  '그림 7. 같은 5 Hz로 크기와 주파수가 함께 흔들리면? 위·가운데: AM만, FM만이면 측대역이 양쪽 같은 높이다 (AM 0.2, FM 0.29). 아래: 둘이 함께, 크기가 가장 클 때 주파수도 가장 높으면 위쪽 측대역 0.48, 아래쪽 0.096로 한쪽이 커진다 (이론 0.48·0.096). 측대역의 좌우 높이가 다르면 AM과 FM이 함께 있다는 표시다. 간격은 여전히 5 Hz다.':
    'Figure 7. What if the size and the frequency shake together at the same 5 Hz? Top and middle: with AM only or FM only, the sidebands have equal height on both sides (AM 0.2, FM 0.29). Bottom: with both together, when the frequency is highest at the moment the size is largest, one side grows — upper sideband 0.48, lower 0.096 (theory 0.48 and 0.096). Unequal sideband heights on the two sides indicate that AM and FM are present together. The spacing is still 5 Hz.',
  'AM만 (m = 0.4)': 'AM only (m = 0.4)',
  'FM만 (β = 0.6)': 'FM only (β = 0.6)',
  '둘 다, 크기가 클 때 주파수도 높음 (위상차 0°)': 'Both, frequency high when size is large (phase 0°)',
  // 그림 8
  '그림 8. 이웃한 두 기계 — 30 Hz(1800 rpm, 크기 1)와 29.5 Hz(1770 rpm, 크기 0.6) — 의 진동이 한 센서에 함께 들어온 경우. 위: 크기가 2 s마다 한 번 1.6까지 커졌다 0.4까지 작아진다 (맥놀이, P2-4). 아래: 스펙트럼에는 막대가 둘뿐이다 — AM(그림 2)처럼 가운데 반송파와 대칭인 측대역 셋이 아니다. 둘을 가르려면 1/0.5 Hz = 2 s보다 훨씬 길게 재야 한다 (여기서는 8 s).':
    'Figure 8. Vibration of two neighboring machines — 30 Hz (1800 rpm, size 1) and 29.5 Hz (1770 rpm, size 0.6) — arriving together at one sensor. Top: once every 2 s the size grows to 1.6 and shrinks to 0.4 (beating, P2-4). Bottom: the spectrum has only two bars — not three with a carrier in the middle and symmetric sidebands as in AM (Figure 2). To separate the two you must measure much longer than 1/0.5 Hz = 2 s (here 8 s).',
  '스펙트럼 (측정 8 s)': 'Spectrum (8 s measurement)',
};

export default EN;
