import type { Dict } from '../../translate';

const EN: Dict = {
  '사각 (윈도우 없음)': 'Rectangular (no window)',
  '스펙트로그램 (색 지도)': 'Spectrogram (color map)',
  '워터폴 (세로 = 시간)': 'Waterfall (vertical = time)',
  '캐스케이드 (세로 = 회전수)': 'Cascade (vertical = speed)',
  '스펙트로그램 · 워터폴 · 캐스케이드': 'Spectrogram · Waterfall · Cascade',
  '프레임 길이 N': 'Frame length N',
  '겹침': 'Overlap',
  '윈도우': 'Window',
  '보기': 'View',
  '불안정 성분 (오일 휠 → 휩)': 'Unstable component (oil whirl → whip)',
  '2400 rpm부터 0.45X, 3333 rpm부터 25 Hz에 잠김': '0.45X from 2400 rpm, locked at 25 Hz from 3333 rpm',
  '번짐': 'smear',
  '프레임 수': 'Number of frames',
  '프레임 동안 1X가 움직인 폭 aT': 'Distance 1X moves during a frame, aT',
  '{0} s 1X 봉우리': '{0} s 1X peak',
  'N을 128 → 512 → 4096으로 바꾸며 20 s 1X 봉우리를 읽어 보세요. 실제 값(16.3 µm)에 가장 가까운 것은?': 'Change N from 128 → 512 → 4096 and read the 20 s 1X peak. Which is closest to the true value (16.3 µm)?',
  '128은 15.6, 512는 16.1, 4096은 3.65 µm입니다. 4096(8 s)은 한 프레임 동안 1X가 10 Hz 움직여 봉우리가 크게 낮아집니다. 1X가 1.25 Hz/s로 오르므로 T_best = 0.89 s입니다. 봉우리 높이가 실제 값에 가장 가까운 것은 N = 512이고, 줄 폭은 512 ~ 1024가 가늡니다.': '128 gives 15.6, 512 gives 16.1 and 4096 gives 3.65 µm. With 4096 (8 s), 1X moves 10 Hz during one frame, so the peak drops a lot. 1X rises at 1.25 Hz/s, so T_best = 0.89 s. The peak height closest to the true value is at N = 512, and the thinnest lines are at 512 to 1024.',
  '겹침을 0 % → 90 %로 바꾸면 줄의 굵기가 바뀌나요? 무엇이 바뀌나요?': 'If you change the overlap from 0 % → 90 %, does the thickness of the line change? What does change?',
  '줄의 굵기(주파수 쪽)는 그대로입니다. 프레임 길이가 같기 때문입니다. 바뀌는 것은 장 수와 세로 칸의 간격(hop)이라, 그림이 세로로 매끄러워집니다. 겹친 장은 완전히 새 정보가 아닙니다(P2-6 5.2절).': 'The thickness of the line (in frequency) stays the same, because the frame length is the same. What changes is the number of spectra and the spacing of the vertical cells (the hop), so the plot gets smoother vertically. Overlapping spectra are not completely new information (P2-6 §5.2).',
  '보기를 캐스케이드로 두고 "불안정 성분"을 켰다 껐다 해 보세요. 40 s 뒤 3600 rpm 높이에서 무엇이 달라지나요? 워터폴에서는?': 'With the view set to cascade, turn "unstable component" on and off. What changes at the 3600 rpm height after 40 s? And in the waterfall?',
  '켜면 3600 rpm 높이에 25 Hz 봉우리가 생기지만, 캐스케이드에서는 유지한 20초가 한 높이에 겹쳐 그 봉우리가 자라는 과정이 보이지 않습니다. 워터폴에서는 유지하는 동안(42 → 55 s) 25 Hz가 7.7 → 14.0 µm로 자라는 것이 보입니다.': 'When on, a 25 Hz peak appears at the 3600 rpm height, but in the cascade the 20 held seconds overlap at one height, so you cannot see the peak growing. In the waterfall you can see 25 Hz grow from 7.7 to 14.0 µm during the hold (42 → 55 s).',
  '주파수 [Hz]': 'Frequency [Hz]',
  '시간 [s]': 'Time [s]',
  '스펙트로그램': 'Spectrogram',
  '회전수 [rpm]': 'Speed [rpm]',
  '워터폴': 'Waterfall',
  '캐스케이드': 'Cascade',
};

export default EN;
