import type { Dict } from '../../translate';

const EN: Dict = {
  '예시 A': 'Example A',
  '예시 B': 'Example B',
  '예시 C': 'Example C',
  '예시 D': 'Example D',
  '예시 E': 'Example E',
  '직접 입력': 'Custom',
  '구동측 DE (합성)': 'Drive end DE (synthetic)',
  '팬측 FE (합성)': 'Fan end FE (synthetic)',
  '합성 {0}': 'Synthetic {0}',
  '{0} (합성, 미끄럼 1 %)': '{0} (synthetic, slip 1 %)',
  '전체 눈금': 'full scale',
  '파일 단위': 'file units',
  '엔벨로프 대역': 'Envelope band',
  '{0}점 ({1} s)': '{0} points ({1} s)',
  '{0}점': '{0} points',
  '내 파일 분석기: 실측 신호에서 베어링 결함 찾기': 'My-file analyzer: finding bearing faults in measured signals',
  '합성 예시': 'Synthetic example',
  '내 파일': 'My file',
  '어느 예시가 무슨 결함인지는 라벨 보기 전까지 가립니다': 'Which example has which fault stays hidden until you show the label',
  '채널': 'Channel',
  '{0} ({1}점)': '{0} ({1} points)',
  '샘플링 주파수 f_s': 'Sampling frequency f_s',
  '파일에 f_s가 없습니다 — 받은 곳의 설명대로': 'The file has no f_s — use the description from where you got it',
  '회전수 [rpm]': 'Speed [rpm]',
  '파일 기록 {0} rpm': 'Recorded in file: {0} rpm',
  '베어링 (결함 주파수 배수)': 'Bearing (defect-frequency multipliers)',
  '기록 길이': 'Record length',
  'Kurtogram이 고른 대역': 'Band picked by the kurtogram',
  '직접 정하기': 'Set manually',
  '스펙트럼 세로축 로그': 'Log spectrum vertical axis',
  '처음 상태(합성 예시 B, 구동측 DE)에서 위 스펙트럼과 아래 엔벨로프 스펙트럼의 BPFO(107.4 Hz) 자리를 비교하세요.':
    'In the initial state (synthetic example B, drive end DE), compare the BPFO (107.4 Hz) position in the spectrum above and in the envelope spectrum below.',
  '스펙트럼에서는 106 Hz 근처에 바닥의 3배쯤 되는 작은 줄이 1X보다 낮게 있을 뿐이고, 3 ~ 3.4 kHz에 둔덕이 섭니다. Kurtogram이 고른 1.5 ~ 4.5 kHz 대역의 엔벨로프에서는 106.3 Hz 줄이 바닥의 약 200배로 서고 2·3배가 이어집니다. 계산값보다 1 % 낮은 것은 미끄럼 때문입니다(P7-5). 외륜 결함입니다.':
    'In the spectrum there is only a small line near 106 Hz, about 3 times the floor and lower than 1X, and a hump at 3 to 3.4 kHz. In the envelope of the 1.5 to 4.5 kHz band the kurtogram picked, the 106.3 Hz line stands at about 200 times the floor, followed by the 2× and 3×. It is 1 % lower than the calculated value because of slip (P7-5). It is an outer-race fault.',
  '대역을 "직접 정하기"로 바꾸고 300 ~ 900 Hz로 두면 엔벨로프는 어떻게 되나요? 2500 ~ 4500 Hz로 두면?':
    'Change the band to "Set manually" and enter 300 to 900 Hz. What happens to the envelope? And with 2500 to 4500 Hz?',
  '300 ~ 900 Hz로 두면 BPFO 줄의 바닥 대비가 약 200배에서 25배로 줄어듭니다 — 충격이 크게 울리는 공진 대역을 비켜 갔기 때문입니다. 2500 ~ 4500 Hz는 3.2 kHz 공진을 담아 약 210배로 Kurtogram 대역과 비슷합니다. 실제 기록처럼 결함이 약하면 엉뚱한 대역에서는 줄이 아예 묻힙니다.':
    'With 300 to 900 Hz, the floor ratio of the BPFO line drops from about 200 to 25 — the band avoids the resonance band where the impacts ring strongly. 2500 to 4500 Hz contains the 3.2 kHz resonance and gives about 210, similar to the kurtogram band. If the fault is weak, as in real records, the line is buried altogether in the wrong band.',
  '예시 A·C·D를 차례로 열어, 결함 대조 표와 Kurtogram 최고 SK로 각각 무엇인지 판단한 뒤 라벨을 보세요.':
    'Open examples A, C and D in turn, judge what each one is from the defect comparison table and the kurtogram maximum SK, and then show the label.',
  'A는 최고 SK가 0.04로 충격 대역이 없고 어느 결함 자리도 바닥의 4배를 넘지 않습니다(정상). C는 BPFI(계산 162.2 Hz) 자리 163.2 Hz와 그 양옆 ±1X 측대역(내륜), D는 볼 자리 140.4 Hz와 FTF 11.8 Hz가 섭니다(볼).':
    'A has a maximum SK of 0.04, so there is no impact band, and no defect position exceeds 4 times the floor (normal). In C, the BPFI position (calculated 162.2 Hz) stands at 163.2 Hz with ±1X sidebands on both sides (inner race); in D, the ball position 140.4 Hz and FTF 11.8 Hz stand (ball).',
  '예시 B에서 채널을 팬측 FE로 바꾸면 무엇이 달라지나요?': 'In example B, what changes if you switch the channel to the fan end FE?',
  '결함은 구동측에 있어 FE에는 충격이 약하게 전해지고(합성 예시는 4분의 1), 울리는 공진도 2.2 kHz로 다릅니다. Kurtogram 대역이 1.5 ~ 3 kHz로 옮겨 가고 BPFO 줄의 바닥 대비가 약 200배에서 90배로 줄어듭니다. 결함에 가까운 센서를 쓰는 까닭입니다.':
    'The fault is at the drive end, so the impacts reach FE only weakly (a quarter in the synthetic example), and the resonance that rings is different too, 2.2 kHz. The kurtogram band moves to 1.5 to 3 kHz and the floor ratio of the BPFO line drops from about 200 to 90. This is why you use the sensor closest to the fault.',
  '예시 E를 여세요. Kurtogram은 어느 대역을 고르고, 결함 대조 표는 무엇을 말하나요? 대역을 직접 2500 ~ 4500 Hz로 두면?':
    'Open example E. Which band does the kurtogram pick, and what does the defect comparison table say? And if you set the band to 2500 to 4500 Hz yourself?',
  'Kurtogram은 5.25 ~ 6 kHz(SK 약 33)를 고르지만, 그 대역의 엔벨로프에는 어느 결함 자리도 바닥의 6배를 넘지 않습니다(안내 문장이 뜹니다). 그 대역의 충격은 베어링과 상관없는 드문 튐이기 때문입니다. 2500 ~ 4500 Hz로 두면 BPFO 자리 106.3 Hz가 바닥의 약 200배로 서서 외륜 결함이 드러납니다. SK가 가장 큰 대역이 늘 결함 대역은 아닙니다.':
    'The kurtogram picks 5.25 to 6 kHz (SK about 33), but in the envelope of that band no defect position exceeds 6 times the floor (a note appears). The impacts in that band are rare spikes unrelated to the bearing. With 2500 to 4500 Hz, the BPFO position 106.3 Hz stands at about 200 times the floor and the outer-race fault shows. The band with the largest SK is not always the defect band.',
  '파일은 이 브라우저 안에서만 읽습니다(서버로 보내지 않음). 합성 예시는 CWRU 시험대(6205 구동측, 1797 rpm, 12 kHz)를 흉내 낸 가상 신호이며 실제 데이터가 아닙니다. 결함 대조 표는 어느 자리가 바닥 위로 섰는지 보여 줄 뿐, 판정을 대신하지 않습니다.':
    'The file is read only inside this browser (never sent to a server). The synthetic examples are made-up signals imitating the CWRU test rig (6205 drive end, 1797 rpm, 12 kHz), not real data. The defect comparison table only shows which positions stand above the floor; it does not replace a judgment.',
  '내 파일 열기 (.mat · .wav · .csv · .txt)': 'Open my file (.mat · .wav · .csv · .txt)',
  '읽는 중…': 'Reading…',
  '지금 자료: {0}': 'Current data: {0}',
  '파일을 읽지 못했습니다: {0}': 'Could not read the file: {0}',
  '{0} 배수': '{0} multiplier',
  '대역 시작 [Hz]': 'Band start [Hz]',
  '대역 끝 [Hz]': 'Band end [Hz]',
  '1. 파형 (처음 {0} ms)': '1. Waveform (first {0} ms)',
  '파형': 'Waveform',
  '시각 [ms]': 'Time [ms]',
  '기록 {0}점 = {1} s · f_s {2} Hz · 1X = {3} Hz': 'Record {0} points = {1} s · f_s {2} Hz · 1X = {3} Hz',
  '첨도 (정규 잡음 = 3)': 'Kurtosis (normal noise = 3)',
  '크레스트 팩터': 'Crest factor',
  '2. 평균 스펙트럼 (Hann, {0}점 프레임 · 50 % 겹침 · {1}번 평균, Δf {2} Hz)': '2. Average spectrum (Hann, {0}-point frames · 50 % overlap · {1} averages, Δf {2} Hz)',
  '스펙트럼': 'Spectrum',
  '주파수 [Hz]': 'Frequency [Hz]',
  '평균 스펙트럼': 'Average spectrum',
  '3. Kurtogram — 충격이 가장 두드러진 대역 찾기': '3. Kurtogram — finding the band where the impacts stand out most',
  '레벨 (아래 = 좁은 대역)': 'Level (bottom = narrow)',
  '최고 SK {0} — 대역 {1} ~ {2} Hz (레벨 {3}). 대역 폭이 가장 높은 결함 주파수의 {4}배({5} Hz)보다 좁은 레벨은 보지 않습니다. SK가 0 근처면 충격이 두드러진 대역이 없다는 뜻입니다.':
    'Maximum SK {0} — band {1} to {2} Hz (level {3}). Levels whose band width is narrower than {4} times the highest defect frequency ({5} Hz) are not examined. An SK near 0 means no band has stand-out impacts.',
  ' 신호가 거의 없는 칸 {0}개(평균 밀도보다 40 dB 넘게 낮음 — AAF가 잘라 낸 나이퀴스트 근처 등)는 튀는 값 몇 개로 SK가 부풀므로 0으로 두고 고르지 않았습니다.':
    ' {0} cells with almost no signal (more than 40 dB below the average density — for example near the Nyquist frequency cut by the AAF) were set to 0 and not picked, because a few spiky values inflate their SK.',
  '4. 엔벨로프 스펙트럼 ({0} ~ {1} Hz 대역)': '4. Envelope spectrum (band {0} to {1} Hz)',
  '엔벨로프': 'Envelope',
  '엔벨로프 스펙트럼': 'Envelope spectrum',
  '결함 주파수 대조 — 계산 자리 ± {0} % 안의 봉우리 ÷ 엔벨로프 바닥(중앙값)': 'Defect-frequency comparison — peak within ± {0} % of the calculated position ÷ envelope floor (median)',
  '자리': 'Position',
  '계산 [Hz]': 'Calculated [Hz]',
  '찾은 봉우리 [Hz]': 'Peak found [Hz]',
  '1 · 2 · 3배 바닥 대비': '1× · 2× · 3× vs. floor',
  '± 1X 측대역': '± 1X sidebands',
  'Kurtogram이 고른 대역에는 충격이 있는데(SK {0}), 결함 자리 어디에도 바닥의 {1}배 넘는 줄이 서지 않았습니다. SK는 "드물게 튀는 정도"일 뿐, 그 튐이 베어링에서 왔는지는 모릅니다(전기 잡음 등). 스펙트럼의 둔덕을 보고 "엔벨로프 대역 → 직접 정하기"로 다른 대역을 열어 보세요.':
    'The band the kurtogram picked has impacts (SK {0}), but no line more than {1} times the floor stands at any defect position. SK only measures "how rarely it spikes" and does not know whether the spikes came from the bearing (electrical noise and the like). Look at the hump in the spectrum and open another band with "Envelope band → Set manually."',
  '정답 라벨 보기 (먼저 스스로 판단한 뒤)': 'Show answer label (after judging for yourself first)',
  '라벨: {0}': 'Label: {0}',
  '이 파일 이름에서는 라벨을 찾지 못했습니다 (CWRU 다운로드 목록 — 12 kHz 구동측·48 kHz 구동측·12 kHz 팬측·정상 — 의 번호와 Paderborn 파일 이름 규칙만 압니다). 받은 곳의 목록과 비교하세요.':
    'No label was found for this file name (only the numbers of the CWRU download lists — 12 kHz drive end, 48 kHz drive end, 12 kHz fan end, normal — and the Paderborn file-name rule are known). Compare with the list where you got the file.',
};

export default EN;
