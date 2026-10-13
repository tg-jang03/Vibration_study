import type { Dict } from '../../translate';

/** GearSpectrumLab (LAB-GEAR-01) 영어 (D-054). lib/faults/gear.ts의 결함·기어 이름은 k() 복사본으로 옮긴다 */
const EN: Dict = {
  '건전': 'Healthy',
  '마모': 'Wear',
  '편심': 'Eccentricity',
  '깨진 이': 'Broken tooth',
  '백래시 과다': 'Excess backlash',
  '헌팅 투스 (두 이빨이 함께 상함)': 'Hunting tooth (two teeth damaged together)',
  '피니언 (입력 23이빨)': 'Pinion (input, 23 teeth)',
  '기어 (출력 61이빨)': 'Gear (output, 61 teeth)',
  '피니언 간격 f₁ = {0} Hz': 'Pinion spacing f₁ = {0} Hz',
  '기어 간격 f₂ = {0} Hz': 'Gear spacing f₂ = {0} Hz',
  '기어 결함의 스펙트럼 지문': 'Spectrum fingerprints of gear faults',
  '결함': 'Fault',
  '결함이 있는 기어': 'Faulty gear',
  '피니언 {0}번·기어 {1}번 이빨이 함께 상했다': 'Pinion tooth {0} and gear tooth {1} are damaged together',
  '두 기어 사이의 일이라 고르지 않는다': 'This concerns the pair of gears, so there is nothing to choose',
  '정도': 'Severity',
  '부하': 'Load',
  '맞물림 힘은 부하와 함께 커진다': 'The mesh force grows with load',
  '피니언': 'pinion',
  '기어': 'gear',
  '읽음값 ({0}{1} · 부하 {2} %)': 'Readouts ({0}{1} · load {2} %)',
  'GMF 줄 ({0} Hz)': 'GMF line ({0} Hz)',
  '측대역 ±1 ~ ±6 합 ÷ GMF — 피니언 간격 {0} Hz': 'Sum of sidebands ±1 to ±6 ÷ GMF — pinion spacing {0} Hz',
  '측대역 ±1 ~ ±6 합 ÷ GMF — 기어 간격 {0} Hz': 'Sum of sidebands ±1 to ±6 ÷ GMF — gear spacing {0} Hz',
  'GMF의 {0} %를 넘는 측대역 수 (±{1}까지) — 피니언 간격': 'Number of sidebands above {0} % of the GMF (up to ±{1}) — pinion spacing',
  '개': '',
  'GMF의 {0} %를 넘는 측대역 수 (±{1}까지) — 기어 간격': 'Number of sidebands above {0} % of the GMF (up to ±{1}) — gear spacing',
  '맞물림 공진 대역 RMS ({0} ~ {1} kHz)': 'Mesh resonance band RMS ({0} to {1} kHz)',
  '가속도 RMS': 'Acceleration RMS',
  '크레스트 팩터 (8 s)': 'Crest factor (8 s)',
  '첨도 K': 'Kurtosis K',
  '건전 → 편심(피니언) → 편심(기어)으로 바꾸며 맞물림 둘레 확대 그래프와 측대역 숫자를 보세요. 측대역의 간격과 개수는?':
    'Change from healthy → eccentric (pinion) → eccentric (gear) and watch the zoomed plot around the mesh and the sideband numbers. What are the spacing and number of the sidebands?',
  '건전하면 GMF 옆이 거의 비어 있습니다(1 %를 넘는 측대역 0개). 피니언 편심은 {0} Hz 간격, 기어 편심은 {1} Hz 간격으로 첫 쌍이 GMF의 약 19 %씩 서고, 1 %를 넘는 것은 ±1·±2 네 개뿐입니다. 간격이 그 기어의 회전 주파수이므로 어느 축이 편심인지 압니다.':
    'When healthy, the sides of the GMF are almost empty (0 sidebands above 1 %). With pinion eccentricity the spacing is {0} Hz and with gear eccentricity {1} Hz, the first pair standing at about 19 % of the GMF each, and only four, ±1 and ±2, exceed 1 %. The spacing is that gear\'s rotation frequency, so you know which shaft is eccentric.',
  '깨진 이를 고르고 결함 기어를 피니언 ↔ 기어로 바꾸세요. 측대역 수와 0.25 s 파형은 어떻게 다른가요?':
    'Choose broken tooth and switch the faulty gear between pinion and gear. How do the number of sidebands and the 0.25 s waveform differ?',
  '기어 이빨이 깨지면 기어 간격 측대역이 30개(±15까지 모두), 피니언 이빨이면 피니언 간격 측대역이 30개 섭니다 — 편심의 한두 쌍과 달리 낮지만 넓게 많이 섭니다. 파형에서는 충격이 기어 한 바퀴({0} ms) 또는 피니언 한 바퀴({1} ms)마다 한 번 옵니다.':
    'If a gear tooth is broken, 30 sidebands stand at the gear spacing (all of them out to ±15); if a pinion tooth, 30 stand at the pinion spacing — unlike the one or two pairs of eccentricity, they are low but wide and many. In the waveform an impact comes once per gear turn ({0} ms) or once per pinion turn ({1} ms).',
  '마모(기어)를 고르고 정도를 0 → 60 → 100 %로 올리세요. 어느 숫자가 가장 많이 변하나요?':
    'Choose wear (gear) and raise the severity 0 → 60 → 100 %. Which number changes the most?',
  '2×GMF ÷ GMF가 0.35 → 0.79, 3×GMF ÷ GMF가 0.15 → 0.46(60 %)으로 GMF 자신(0.86 → 0.96 g)보다 훨씬 많이 커지고, 맞물림 공진 대역 RMS가 0.018 → 0.067 g로 오릅니다. 이 모양(하모닉이 커지는 것)이 고르게 닳은 이의 특징입니다. 측대역은 별로 늘지 않습니다.':
    '2×GMF ÷ GMF goes 0.35 → 0.79 and 3×GMF ÷ GMF 0.15 → 0.46 (at 60 %), growing much more than the GMF itself (0.86 → 0.96 g), and the mesh resonance band RMS rises 0.018 → 0.067 g. This shape (growing harmonics) is the signature of evenly worn teeth. The sidebands do not increase much.',
  '백래시 과다를 고르고 부하를 80 → 30 → 100 %로 바꾸세요. 건전일 때와 비교하면?':
    'Choose excess backlash and change the load 80 → 30 → 100 %. How does it compare with the healthy case?',
  '맞물림 공진 대역 RMS가 0.044 → 0.14 → 0.020 g로 부하가 가벼울수록 커지고, 100 %에서는 건전과 같아집니다. 건전한 기어는 부하와 상관없이 약 0.015 ~ 0.020 g입니다. GMF 줄은 둘 다 부하와 함께 커집니다. 부하를 바꿔 보면 백래시를 가를 수 있습니다.':
    'The mesh resonance band RMS goes 0.044 → 0.14 → 0.020 g, growing the lighter the load, and at 100 % it equals the healthy value. A healthy gear stays at about 0.015 to 0.020 g regardless of load. The GMF line grows with load in both. Changing the load lets you separate backlash.',
  '헌팅 투스를 고르고 8 s 파형을 보세요. 큰 충격 사이의 간격은?':
    'Choose hunting tooth and look at the 8 s waveform. What is the spacing between the large impacts?',
  '약 {0} s(1.42 → 3.88 → 6.33 s)마다 한 번입니다. 피니언 {1}바퀴, 기어 {2}바퀴 = 맞물림 {3}번마다 상한 두 이빨이 다시 만납니다. 그 사이에는 각 이빨의 작은 충격이 한 바퀴에 한 번씩 옵니다. 헌팅 투스 주파수 {4} Hz는 스펙트럼보다 긴 파형에서 찾기 쉽습니다.':
    'Once every about {0} s (1.42 → 3.88 → 6.33 s). The two damaged teeth meet again every {1} pinion turns, {2} gear turns = {3} engagements. In between, the small impact of each tooth comes once per turn. The hunting tooth frequency of {4} Hz is easier to find in a long waveform than in the spectrum.',
  '설명용 모델입니다: P7-1의 감속기(피니언 {0}이빨 {1} rpm ↔ 기어 {2}이빨), f_s {3} Hz, 8 s, Hann. 맞물림 1·2·3배와 맞물림마다의 짧은 충격(맞물림 공진 {4} Hz를 울림), 두 축의 1X, 흰 잡음 {5} g. 크기는 판정 기준이 아닙니다.':
    'An illustrative model: the P7-1 reducer (pinion {0} teeth at {1} rpm ↔ gear {2} teeth), f_s {3} Hz, 8 s, Hann. The mesh at 1, 2 and 3 times, a short impact at each engagement (exciting the mesh resonance at {4} Hz), the 1X of both shafts, and white noise {5} g. The sizes are not criteria.',
  '기어가 도는 모습: 상한 이빨이 맞물릴 때 충격': 'The gears turning: an impact when a damaged tooth engages',
  '가속도 스펙트럼 0 ~ 3.5 kHz (dB re 1 g)': 'Acceleration spectrum 0 to 3.5 kHz (dB re 1 g)',
  '가속도': 'Acceleration',
  'GMF의 정수배': 'Integer multiples of GMF',
  '맞물림 공진 대역': 'Mesh resonance band',
  '주파수 [kHz]': 'Frequency [kHz]',
  '가속도 스펙트럼': 'Acceleration spectrum',
  '맞물림 둘레 확대 (GMF ± {0} Hz) — 위쪽 눈금: 측대역이 설 자리': 'Zoom around the mesh (GMF ± {0} Hz) — scale above: where the sidebands should stand',
  '주파수 [Hz]': 'Frequency [Hz]',
  '맞물림 둘레 확대 스펙트럼': 'Zoomed spectrum around the mesh',
  '가속도 파형 (처음 {0} ms)': 'Acceleration waveform (first {0} ms)',
  '시각 [ms]': 'Time [ms]',
  '가속도 파형': 'Acceleration waveform',
  '8 s 기록 (포락선의 짧은 구간마다 최댓값)': '8 s record (maximum of the envelope in each short interval)',
  '포락선 최댓값': 'Envelope maximum',
  '시각 [s]': 'Time [s]',
  '8초 기록의 포락선 최댓값': 'Envelope maximum of the 8 s record',
};

export default EN;
