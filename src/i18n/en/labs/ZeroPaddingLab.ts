import type { Dict } from '../../translate';

const EN: Dict = {
  '없음 (×1)': 'None (×1)',
  '제로패딩 vs 측정 시간: 무엇이 두 성분을 갈라놓나': 'Zero padding vs measurement time: what separates the two components?',
  '두 톤 간격 Δ': 'Two-tone spacing Δ',
  '제로패딩 배수 P': 'Zero-padding factor P',
  '샘플 수 N (측정 시간)': 'Number of samples N (measurement time)',
  '분해능': 'resolution',
  '표시 간격': 'display spacing',
  '간격 ÷ 분해능 (bin 수)': 'Spacing ÷ resolution (in bins)',
  '보이는 피크 수': 'Visible peak count',
  '실제 톤 수': 'Actual tone count',
  'Δ = 0.5 Hz, N = 32(1초)에서 제로패딩을 ×1 → ×16으로 늘리면 두 피크로 갈라질까요?':
    'With Δ = 0.5 Hz and N = 32 (1 s), if you raise zero padding from ×1 to ×16, does it split into two peaks?',
  '갈라지지 않습니다. 곡선이 매끈해질 뿐 둔덕은 하나이고, 꼭대기도 두 톤 사이(약 8.55 Hz)의 엉뚱한 곳에 생깁니다. 제로패딩은 1초 데이터에 이미 들어 있던 모양을 촘촘히 그릴 뿐 새 정보를 만들지 않습니다.':
    'It does not. The curve only gets smoother; there is still one hump, and its top lands in an odd place between the two tones (about 8.55 Hz). Zero padding only draws more densely the shape already in the 1-second data and creates no new information.',
  '패딩은 그대로 두고 N을 128로(측정 시간 4초) 바꾸면?':
    'What if you leave the padding as it is and change N to 128 (a 4-second measurement)?',
  '두 봉우리로 갈라지고 위치도 8.3·8.8 Hz 가까이로 옵니다. 톤 하나가 만드는 둔덕의 폭(약 2/T)이 T가 길어질수록 좁아지기 때문입니다. "가까운 성분을 가르려면 오래 잰다" (P2-4).':
    'It splits into two peaks, and their positions come close to 8.3 and 8.8 Hz. The width of the hump one tone makes (about 2/T) narrows as T gets longer. "To separate close components, measure longer" (P2-4).',
  '이번엔 Δ = 1 Hz, N = 32, 제로패딩 ×16으로 두세요. 두 봉우리처럼 보이나요? 봉우리 위치는 실제 톤 위치(점선)와 맞나요?':
    'Now set Δ = 1 Hz, N = 32 and zero padding ×16. Does it look like two peaks? Do the peak positions match the real tone positions (dotted lines)?',
  '골이 생겨 두 봉우리처럼 보입니다. 하지만 봉우리가 약 8.1 Hz와 9.5 Hz로 실제(8.3, 9.3 Hz)에서 벗어나 있습니다. 간격이 1/T 근처면 두 둔덕이 겹친 모양이 위상에 따라 달라지는 경계 상태입니다. 패딩한 곡선의 골만 보고 "분리됐다"고 판단하면 안 되는 이유입니다.':
    'A valley forms and it looks like two peaks. But the peaks, at about 8.1 Hz and 9.5 Hz, are off from the real tones (8.3 and 9.3 Hz). When the spacing is near 1/T, how the two humps overlap depends on the phases, so this is a borderline state. That is why you must not conclude "separated" just from the valley in a padded curve.',
  '그렇다면 제로패딩은 어디에 쓸까요?': 'Then what is zero padding good for?',
  '피크 하나의 주파수·진폭을 bin 사이에서 더 정확히 읽을 때(보간), 스펙트럼 모양을 매끈하게 볼 때, FFT 크기를 2의 거듭제곱으로 맞출 때 씁니다.':
    'It is used to read the frequency and amplitude of a single peak more accurately between bins (interpolation), to see the spectrum shape smoothly, and to set the FFT size to a power of 2.',
  '제로패딩 ×{0} (표시 간격 {1} Hz)': 'Zero padding ×{0} (display spacing {1} Hz)',
  '원래 bin (Δf = {0} Hz)': 'Original bins (Δf = {0} Hz)',
  '실제 톤 위치': 'Actual tone position',
  '실제 톤 위치 2': 'Actual tone position 2',
  '주파수 [Hz]': 'Frequency [Hz]',
  '진폭 (Pk)': 'Amplitude (Pk)',
};

export default EN;
