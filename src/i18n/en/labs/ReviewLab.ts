import type { Dict } from '../../translate';

/** src/components/labs/ReviewLab.tsx 화면 문자열의 영어 (D-054). 키 = 한국어 원문 */
const EN: Dict = {
  '기록 A — 1년 전 정지': 'Record A — shutdown a year ago',
  '기록 B — 이번 정지': 'Record B — this shutdown',
  '채널을 고르세요': 'Select a channel',
  '키페이저 펄스를 {0}개만 찾았습니다 — 채널·방향(내려감/올라감)·f_s를 확인하세요':
    'Only {0} Keyphasor pulses were found — check the channel, direction (falling/rising) and f_s',
  '키페이저와 진동, 채널이 둘 이상 있어야 합니다': 'The file needs at least two channels: the Keyphasor and a vibration channel',
  '기동·정지 기록 복기: 다시 뽑고 다시 그리기': 'Startup/shutdown record review: re-extract and redraw',
  '빠진·남는 키페이저 펄스 고치기': 'Repair missing/extra Keyphasor pulses',
  'slow roll 벡터 빼기': 'Subtract slow-roll vector',
  '성분': 'Component',
  '벡터 하나에 평균할 바퀴': 'Turns to average per vector',
  '{0}바퀴': '{0} turn(s)',
  'Bode 회전수 칸': 'Bode speed bin',
  'slow roll 범위 시작 [rpm]': 'Slow-roll range start [rpm]',
  'slow roll 범위 끝 [rpm]': 'Slow-roll range end [rpm]',
  '처음 상태(잰 그대로)에서 두 기록의 Bode 봉우리를 비교하세요. 당시 판단처럼 "B에서 불평형이 커졌다"고 볼 수 있나요?':
    'In the initial state (as measured), compare the Bode peaks of the two records. Can you say, as the judgment at the time did, that "unbalance grew in B"?',
  '잰 그대로는 B 봉우리가 3050 rpm에서 84 µm p-p로 A(3350 rpm, 77 µm)보다 크고, 최고 회전수 1X도 21 → 34 µm p-p로 커 보입니다. 하지만 아직 slow roll을 확인하지 않았습니다.':
    "As measured, B's peak is 84 µm p-p at 3050 rpm, larger than A's (3350 rpm, 77 µm), and the top-speed 1X also looks bigger, 21 → 34 µm p-p. But slow roll has not been checked yet.",
  '읽음값 표에서 slow roll 1X를 비교한 뒤 "slow roll 벡터 빼기"를 켜세요. 봉우리와 6000 rpm 근처 1X는 어떻게 바뀌나요?':
    'Compare the slow-roll 1X in the readout table, then turn on "Subtract slow-roll vector". How do the peaks and the 1X near 6000 rpm change?',
  'slow roll 1X가 A 3.9 µm, B 24 µm p-p입니다 — B의 프로브 궤도 런아웃이 커졌습니다. 빼면 B 봉우리는 60 µm(A 75 µm)로 오히려 작고, 최고 회전수 1X는 A 17 · B 16 µm p-p로 거의 같습니다. 불평형은 그대로입니다.':
    "Slow-roll 1X is 3.9 µm p-p for A and 24 µm p-p for B — the runout on B's probe track has grown. After subtracting, B's peak is actually smaller, 60 µm (A 75 µm), and the top-speed 1X is almost the same, A 17 and B 16 µm p-p. Unbalance is unchanged.",
  '보상한 상태에서 두 기록의 봉우리 회전수, AF, 3000 rpm의 위상을 비교하세요. 무엇이 변했나요?':
    'In the compensated state, compare the peak speed, AF and the phase at 3000 rpm of the two records. What changed?',
  '봉우리가 3300 → 3050 rpm으로 내려왔고(강성으로 약 14 % ↓), 3000 rpm의 지연각이 약 80° → 130°로 커졌습니다. 같은 회전수에서 위상이 더 늦으면 고유진동수가 내려온 것입니다(P10-3). 밸런싱보다 베어링 간극·받침 상태를 먼저 봅니다.':
    'The peak came down from 3300 → 3050 rpm (about 14 % lower in stiffness), and the lag angle at 3000 rpm grew from about 80° → 130°. If the phase lags more at the same speed, the natural frequency has come down (P10-3). Check bearing clearance and support condition before balancing.',
  '"펄스 고치기"를 끄고 회전수 그래프를 보세요. 기록 B에 무엇이 보이나요?':
    'Turn off "Repair pulses" and look at the speed plot. What do you see in record B?',
  '펄스가 빠진 세 곳에서 회전수가 반으로 떨어지고, 잡음 펄스가 찍힌 곳에서 몇 배로 튑니다. 그 바퀴의 1X 벡터도 틀립니다. 복기 전에 키페이저부터 확인하는 까닭입니다.':
    'At the three places where pulses are missing, the speed drops to half, and where a noise pulse was picked up it jumps up by a factor of several. The 1X vector of that turn is wrong as well. This is why you check the Keyphasor before a review.',
  '파일은 이 브라우저 안에서만 읽습니다(서버로 보내지 않음). 합성 기록은 가상의 압축기이며 현장 자료가 아닙니다. 복기 메모는 저장되지 않습니다 — 필요하면 복사해 두세요.':
    'Files are read only inside this browser (nothing is sent to a server). The synthetic records come from a hypothetical compressor and are not field data. The review memo is not saved — copy it if you need it.',
  '내 파일 열기 (키페이저 + 진동)': 'Open my file (Keyphasor + vibration)',
  '합성 기록으로': 'Back to synthetic record',
  '파일을 읽지 못했습니다: ': 'Could not read the file: ',
  '키페이저 채널': 'Keyphasor channel',
  '진동 채널': 'Vibration channel',
  '파일에 f_s가 없습니다': 'The file has no f_s',
  '진동 1단위 = ? µm': '1 vibration unit = ? µm',
  '근접 프로브를 V로 기록했다면 1 ÷ 감도 — 7.87 V/mm면 127': 'If the proximity probe was recorded in V: 1 ÷ sensitivity — 127 for 7.87 V/mm',
  '펄스 방향': 'Pulse direction',
  '내려감 (홈)': 'Falling (notch)',
  '올라감 (돌기·TTL)': 'Rising (projection · TTL)',
  '펄스 {0}개': '{0} pulses',
  ' → 고친 뒤 {0}개 (메움 {1} · 지움 {2})': ' → {0} after repair (filled {1} · removed {2})',
  ' · 최고 {0} rpm': ' · max {0} rpm',
  '1. 키페이저 확인 — 펄스 사이마다 회전수': '1. Check the Keyphasor — speed from every pulse interval',
  '시각 [s]': 'Time [s]',
  '회전수 [rpm]': 'Speed [rpm]',
  '키페이저로 구한 회전수': 'Speed from the Keyphasor',
  '키페이저': 'Keyphasor',
  '문턱': 'Threshold',
  '찾은 펄스': 'Detected pulses',
  '시각 [ms] ({0}, 처음 50 ms)': 'Time [ms] ({0}, first 50 ms)',
  '[채널 단위]': '[channel units]',
  '키페이저 파형과 문턱': 'Keyphasor waveform and threshold',
  '(slow roll 벡터를 뺌)': '(slow-roll vector subtracted)',
  '(잰 그대로)': '(as measured)',
  'Bode 크기': 'Bode magnitude',
  '지연각 [°]': 'Lag angle [°]',
  'Bode 위상': 'Bode phase',
  '보상한 뒤': 'after compensation',
  '잰 그대로': 'as measured',
  '읽음값 — {0}X {1}': 'Readout — {0}X {1}',
  '항목': 'Item',
  '기록 {0}': 'Record {0}',
  '범위에 점 없음': 'No points in range',
  '가장 큰 {0}X': 'Largest {0}X',
  '구할 수 없음': 'Cannot be found',
  '위상이 90° 더 늦는 회전수': 'Speed where phase lags a further 90°',
  '최고 회전수의 {0}X': '{0}X at top speed',
  '3. 캐스케이드': '3. Cascade',
  '기록': 'Record',
  '주파수 범위': 'Frequency range',
  '주파수 [Hz]': 'Frequency [Hz]',
  '캐스케이드': 'Cascade',
  '이 기록은 아직 분석할 수 없습니다.': 'This record cannot be analyzed yet.',
  '4. 복기 메모': '4. Review memo',
  '당시 판단: …\n다시 그린 자료가 보여 준 것: …\n당시와 다른 점과 그 까닭: …\n다음에 바꿀 것(기준선·측정·판단 절차): …':
    'Judgment at the time: …\nWhat the redrawn data showed: …\nWhat differs from then, and why: …\nWhat to change next (baseline, measurement, judgment procedure): …',
  '복기 메모': 'Review memo',
};

export default EN;
