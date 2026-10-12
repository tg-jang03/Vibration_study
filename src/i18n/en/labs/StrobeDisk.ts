import type { Dict } from '../../translate';

/** StrobeDisk (LAB-SMP-01의 스트로브 원판) 영어 (D-054) */
const EN: Dict = {
  '플래시 1초에 2번': 'Flash 2 times per second',
  '플래시 1초에 5번': 'Flash 5 times per second',
  '플래시 1초에 12번': 'Flash 12 times per second',
  '멈춰 보임 (플래시마다 정확히 정수 바퀴)': 'looks frozen (exactly whole turns between flashes)',
  '반 바퀴씩 건너뜀 — 방향을 알 수 없음 (f = f_N)': 'jumps half a turn — direction cannot be told (f = f_N)',
  '반시계(실제와 같은 방향)로 1초에 {0}바퀴': 'turning counterclockwise (the real direction) at {0} turns per second',
  '시계 방향(거꾸로)으로 1초에 {0}바퀴': 'turning clockwise (backwards) at {0} turns per second',
  '플래시 n = {0} · 실제의 1/{1}': 'Flash n = {0} · 1/{1} of real time',
  '1초에 {0}바퀴 도는 원판을 1초에 {1}번 플래시로 보면 {2}. 플래시마다 {3}바퀴.':
    'A disk turning {0} times per second, seen under a flash {1} times per second, is {2}. {3} turn per flash.',
  '실제 원판 · 1초에 {0}바퀴': 'Real disk · {0} rev/s',
  '플래시로 본 원판 · 1초에 {0}번': 'Under the flash · {0} flashes/s',
  '플래시 때의 높이 = 샘플 x[n]': 'Height at flash = sample x[n]',
  '플래시 사이(1/f_s = {0} ms)에 원판은 {1}바퀴 돕니다. 정수 바퀴를 빼면 플래시마다':
    'Between flashes (1/f_s = {0} ms) the disk turns {1} times. Dropping the whole turns, each flash moves it by',
  '{0}{1}바퀴': '{0}{1} turn',
  겉보기로: 'so it appears',
  '흐린 점은 앞선 플래시 5번의 자리입니다.': 'The faded dots are the positions at the previous five flashes.',
};

export default EN;
