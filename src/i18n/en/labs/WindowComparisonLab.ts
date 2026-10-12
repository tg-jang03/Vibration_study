import type { Dict } from '../../translate';

/** LAB-WIN-02 WindowComparisonLab 영어 (D-054) */
const EN: Dict = {
  'Hann (분석기 기본값)': 'Hann (analyzer default)',
  '윈도우 없음 (Uniform)': 'No window (Uniform)',
  'Flat top (진폭 측정용)': 'Flat top (for amplitude)',
  'Blackman-Harris (작은 성분 찾기용)': 'Blackman-Harris (for small components)',
  'Hamming (Hann과 비슷, 첫 사이드로브가 더 낮음)': 'Hamming (like Hann, lower first side lobe)',
  '윈도우 없음': 'No window',
  '윈도우 A': 'Window A',
  '윈도우 B': 'Window B',
  'A {0}: 메인로브 반폭 (첫 0까지)': 'A {0}: main lobe half-width (to first zero)',
  'A {0}: 가장 높은 사이드로브': 'A {0}: highest side lobe',
  'A {0}: 최대 가리비 손실': 'A {0}: maximum scalloping loss',
  'B {0}: 메인로브 반폭 (첫 0까지)': 'B {0}: main lobe half-width (to first zero)',
  'B {0}: 가장 높은 사이드로브': 'B {0}: highest side lobe',
  'B {0}: 최대 가리비 손실': 'B {0}: maximum scalloping loss',
  'A를 Hann, B를 윈도우 없음으로 두고 아래 그래프를 보세요. 메인로브 폭과 사이드로브 높이는 각각 어느 쪽이 유리한가요?':
    'Set A to Hann and B to no window, and look at the plots below. Which one wins on main lobe width, and which on side lobe height?',
  '메인로브는 윈도우 없음이 좁고(±1 bin, Hann ±2 bin), 사이드로브는 Hann이 훨씬 낮습니다(−31.5 dB vs −13.3 dB). 가까운 두 성분 가르기에는 좁은 쪽이, 큰 성분 옆 작은 성분 찾기에는 낮은 쪽이 유리합니다.':
    'No window has the narrower main lobe (±1 bin vs ±2 bins for Hann), and Hann has much lower side lobes (−31.5 dB vs −13.3 dB). The narrow one is better for separating two close components; the low one is better for finding a small component next to a large one.',
  'B를 Flat top으로 바꾸세요. 가리비 손실과 메인로브 폭은 어떤가요?': 'Change B to Flat top. What about the scalloping loss and the main lobe width?',
  '가리비 손실은 약 0.01 dB로 거의 없지만, 메인로브가 ±5 bin으로 가장 넓습니다. 진폭을 정확히 읽을 때 쓰고, 가까운 성분을 가를 때는 쓰지 않습니다.':
    'The scalloping loss is only about 0.01 dB — almost none — but the main lobe is the widest, at ±5 bins. Use it to read amplitudes accurately, not to separate close components.',
  'B를 Blackman-Harris로 바꾸세요. Hann과 비교해 얻는 것과 잃는 것은?': 'Change B to Blackman-Harris. Compared with Hann, what do you gain and what do you lose?',
  '사이드로브가 −92 dB까지 내려가 큰 성분 옆의 아주 작은 성분이 보이지만(본문 그림 7), 메인로브가 ±4 bin으로 Hann의 두 배입니다.':
    'The side lobes drop to −92 dB, so a very small component next to a large one becomes visible (Figure 7 in the text), but the main lobe is ±4 bins — twice as wide as Hann.',
  '윈도우 비교: 메인로브와 사이드로브': 'Comparing windows: main lobe and side lobes',
  '윈도우 모양 (프레임 시작 0 → 끝 1)': 'Window shape (frame start 0 → end 1)',
  '프레임 안의 위치': 'Position in the frame',
  가중치: 'Weight',
  '윈도우 가중치 모양': 'Window weight shape',
  '성분 하나가 그려지는 모양 (성분에서 ±12 bin)': 'How a single component is drawn (±12 bins around it)',
  '성분에서 떨어진 거리 [bin]': 'Distance from the component [bin]',
  '윈도우의 주파수 모양': 'Frequency shape of the window',
};

export default EN;
