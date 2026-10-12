import type { Dict } from '../../translate';

/** LAB-WIN-03 WindowCorrectionLab 영어 (D-054) */
const EN: Dict = {
  '정현파 하나 (60 Hz, 진폭 1 Peak)': 'One sine (60 Hz, amplitude 1 Peak)',
  '넓게 퍼진 잡음 (RMS 1)': 'Broadband noise (RMS 1)',
  '윈도우 없음 (둘 다 1)': 'No window (both 1)',
  '보정 안 함': 'No correction',
  'ACF 진폭 보정 (막대 높이를 맞춤)': 'ACF amplitude correction (matches bar height)',
  'ECF 에너지 보정 (전체 RMS를 맞춤)': 'ECF energy correction (matches overall RMS)',
  '보정 안 한 스펙트럼': 'Uncorrected spectrum',
  '{0}를 곱한 스펙트럼': 'Spectrum × {0}',
  신호: 'Signal',
  윈도우: 'Window',
  보정: 'Correction',
  '곱한 값': 'Factor applied',
  '막대 높이 오차': 'bar height error',
  '전체 RMS 오차': 'overall RMS error',
  '가장 높은 막대': 'Highest bar',
  '막대 높이 오차 (실제 1)': 'Bar height error (true value 1)',
  '전체 RMS': 'Overall RMS',
  '실제 RMS': 'True RMS',
  '정현파에서 "보정 안 함"과 "ACF"를 번갈아 고르세요. Hann에서 막대 높이가 왜 0.5에서 1로 바뀌나요?':
    'With the sine, switch between "No correction" and "ACF". Why does the bar height change from 0.5 to 1 with Hann?',
  'Hann 가중치의 평균이 0.5라서 보정하지 않으면 막대가 절반(0.5)으로 나옵니다. ACF = 1/0.5 = 2를 곱하면 실제 진폭 1이 됩니다.':
    'The Hann weights average 0.5, so without correction the bar comes out at half (0.5). Multiplying by ACF = 1/0.5 = 2 gives the true amplitude of 1.',
  '정현파에서 보정을 ECF로 바꾸면 막대 높이 오차는 몇 %인가요?': 'With the sine, change the correction to ECF. What is the bar height error in %?',
  'Hann의 ECF는 약 1.63이므로 막대가 0.5 × 1.63 ≈ 0.816, 즉 −18.4 %로 낮게 나옵니다. 정현파 진폭을 읽을 때 에너지 보정이 걸려 있으면 진폭을 작게 읽습니다.':
    "Hann's ECF is about 1.63, so the bar comes out at 0.5 × 1.63 ≈ 0.816 — 18.4 % low. If energy correction is on when you read a sine's amplitude, you read it too small.",
  '신호를 잡음으로 바꾸고 ACF와 ECF를 비교하세요. 전체 RMS가 맞는 쪽은?': 'Change the signal to noise and compare ACF with ECF. Which one gets the overall RMS right?',
  'ECF입니다(오차 거의 0). ACF를 곱하면 Hann에서 RMS가 2/1.63 ≈ 1.22배(+22 %), 파워로는 1.5배가 됩니다. 이 1.5가 Hann의 ENBW입니다.':
    "ECF (almost zero error). With ACF, Hann's RMS becomes 2/1.63 ≈ 1.22 times too large (+22 %), which is 1.5 times in power. That 1.5 is Hann's ENBW.",
  '진폭 보정(ACF)과 에너지 보정(ECF)': 'Amplitude correction (ACF) and energy correction (ECF)',
  '보정을 곱한 스펙트럼 (0 ~ 120 Hz)': 'Corrected spectrum (0 to 120 Hz)',
  '주파수 [Hz]': 'Frequency [Hz]',
  '진폭 [Peak]': 'Amplitude [Peak]',
  '보정을 곱한 스펙트럼': 'Corrected spectrum',
};

export default EN;
