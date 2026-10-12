import type { Dict } from '../../translate';

/** LAB-SMP-03 AdcLab 영어 (D-054). 키 = 소스의 한국어 원문 — 뼈대는 node scripts/i18n/scan-lab.mjs AdcLab */
const EN: Dict = {
  '16 bit (레인지 1.5 V, 작은 성분 −60 dBFS)': '16 bit (range 1.5 V, small component −60 dBFS)',
  '8 bit (잡음 바닥이 높아 −60 dB 성분이 묻힘)': '8 bit (high noise floor buries the −60 dB component)',
  '24 bit (잡음 바닥 −140 dBFS 아래)': '24 bit (noise floor below −140 dBFS)',
  '클리핑 (신호 1.0 V > 레인지 0.7 V → 홀수 하모닉)': 'Clipping (signal 1.0 V > range 0.7 V → odd harmonics)',
  '레인지가 너무 큼 (10 V → 20 dB 손해)': 'Range too large (10 V → 20 dB lost)',
  '직접 파라미터 조작': 'Manual (set the parameters yourself)',
  '8 bit (256 단계, SQNR ≈ 50 dB)': '8 bit (256 levels, SQNR ≈ 50 dB)',
  '12 bit (4,096 단계, SQNR ≈ 74 dB)': '12 bit (4,096 levels, SQNR ≈ 74 dB)',
  '16 bit (65,536 단계, SQNR ≈ 98 dB)': '16 bit (65,536 levels, SQNR ≈ 98 dB)',
  '24 bit (16,777,216 단계, SQNR ≈ 146 dB)': '24 bit (16,777,216 levels, SQNR ≈ 146 dB)',
  '원 신호 x(t)': 'Original signal x(t)',
  '양자화 신호 y[n] ({0} bit)': 'Quantized signal y[n] ({0} bit)',
  '스펙트럼 ({0} bit ADC)': 'Spectrum ({0} bit ADC)',
  '이론 잡음 바닥 ({0} dBFS)': 'Theoretical noise floor ({0} dBFS)',
  '0 dBFS (포화 클리핑 한계)': '0 dBFS (full-scale clipping limit)',
  'ADC 분해능(bit)과 입력 레인지(Headroom)': 'ADC resolution (bit) and input range (headroom)',
  '실험 프리셋': 'Experiment preset',
  'ADC 비트 수': 'Number of ADC bits',
  '입력 풀스케일 레인지 V_fs': 'Input full-scale range V_fs',
  '작은 성분 크기 (136 Hz, 큰 톤 대비 dB)': 'Small component level (136 Hz, dB relative to the large tone)',
  '시간 파형 확대 (계단 스텝 관찰)': 'Zoom in on the time waveform (see the staircase steps)',
  '양자화 스텝': 'quantization step',
  '풀스케일 정현파 이론비': 'theoretical value for a full-scale sine',
  'bin 하나의 잡음 바닥': 'noise floor per bin',
  'ADC 분해능': 'ADC resolution',
  '풀스케일 레인지 V_fs': 'Full-scale range V_fs',
  '1 LSB 전압 크기': 'Voltage of 1 LSB',
  '풀스케일 SQNR (6.02b + 1.76)': 'Full-scale SQNR (6.02b + 1.76)',
  '유효 SNR (레인지 여유 반영)': 'Effective SNR (including range headroom)',
  '잡음 바닥 (스펙트럼 평균)': 'Noise floor (spectrum average)',
  '주 톤 레벨 (50 Hz)': 'Main tone level (50 Hz)',
  '작은 톤 레벨 (136 Hz)': 'Small tone level (136 Hz)',
  '클리핑 샘플 비율': 'Share of clipped samples',
  '16 bit에서 −60 dB, −100 dB의 작은 성분이 보이나요? 레인지를 신호보다 10배 크게(10 V) 잡으면 어떻게 되나요?':
    'At 16 bit, can you see a small component at −60 dB? At −100 dB? What happens if you set the range 10 times larger than the signal (10 V)?',
  '16 bit, N = 1024이면 양자화 잡음이 512개 bin에 나뉘어 bin 하나의 잡음 바닥이 약 −125 dBFS까지 내려가므로 −100 dB 성분도 보입니다. 레인지를 10배 키우면 잡음 바닥은 −125 dBFS 그대로지만 신호가 칸을 1/10만 쓰게 되어 큰 톤이 −20 dBFS로 내려옵니다. 신호와 잡음 바닥의 간격이 20 dB 줄어, −100 dB 성분(−120 dBFS)이 잡음 바닥에 거의 붙어 버립니다.':
    'With 16 bit and N = 1024, the quantization noise is spread over 512 bins, so the noise floor per bin drops to about −125 dBFS and even the −100 dB component is visible. Make the range 10 times larger and the noise floor stays at −125 dBFS, but the signal now uses only 1/10 of the quantization levels, so the large tone drops to −20 dBFS. The gap between the signal and the noise floor shrinks by 20 dB, and the −100 dB component (−120 dBFS) ends up almost sitting on the noise floor.',
  '레인지를 신호 진폭보다 작은 0.7 V로 설정하면 파형과 스펙트럼에 어떤 현상이 발생하나요?':
    'Set the range to 0.7 V, smaller than the signal amplitude. What happens to the waveform and the spectrum?',
  '신호 꼭대기가 +0.7 V, −0.7 V에서 잘려 평평해집니다(클리핑). 잘린 파형은 사각파에 가까워지므로 스펙트럼에 150 Hz(3X), 250 Hz(5X), 350 Hz(7X) … 홀수 하모닉이 생깁니다. 기계와 상관없이 측정 과정이 만든 성분입니다.':
    'The peaks of the signal are cut off flat at +0.7 V and −0.7 V (clipping). The clipped waveform looks more like a square wave, so odd harmonics appear in the spectrum at 150 Hz (3X), 250 Hz (5X), 350 Hz (7X), … These components are created by the measurement itself and have nothing to do with the machine.',
  '8 bit ADC와 24 bit ADC의 잡음 바닥 차이는 얼마나 되나요?':
    'How far apart are the noise floors of an 8 bit ADC and a 24 bit ADC?',
  '1 bit마다 약 6 dB씩 차이가 나므로 16 bit 차이면 약 96 dB입니다. 8 bit에서는 잡음 바닥이 약 −77 dBFS라 −60 dB 성분이 잡음과 잘 구별되지 않고, 24 bit에서는 잡음 바닥이 −170 dBFS 아래로 내려가 아주 작은 성분도 보입니다.':
    'Each bit is worth about 6 dB, so a 16 bit difference is about 96 dB. At 8 bit the noise floor is about −77 dBFS, so the −60 dB component is hard to tell apart from the noise; at 24 bit the noise floor drops below −170 dBFS and even very small components are visible.',
  '시간 t [s]': 'Time t [s]',
  '전압 [V]': 'Voltage [V]',
  'ADC 양자화 및 클리핑 시간 파형': 'ADC quantization and clipping time waveform',
  '주파수 [Hz]': 'Frequency [Hz]',
  '스펙트럼 진폭 [dBFS]': 'Spectral amplitude [dBFS]',
  'dBFS 스펙트럼 및 양자화 잡음 바닥': 'dBFS spectrum and quantization noise floor',
};

export default EN;
