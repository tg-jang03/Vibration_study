/**
 * Signal Lab 랩 모음 목록 (D-037). 랩 하나 = 단독 페이지 하나 (/lab/{slug}/).
 * 원문 설명으로 가는 링크(어느 페이지의 어느 절에 쓰였나)는 src/lib/labRefs.ts가 페이지 MDX를 읽어 자동으로 모은다.
 * 새 랩을 만들면 여기에 한 줄을 더하고, src/pages/lab/[slug].astro의 렌더 목록에도 한 줄을 더한다.
 */

export interface LabEntry {
  /** 주소 (/lab/{slug}/) */
  slug: string;
  /** 랩 ID (Contents.md §5). 한 ID를 여러 컴포넌트가 나눠 쓰기도 한다 (LAB-FOU-01) */
  id: string;
  /** src/components/labs/의 컴포넌트 이름 — 페이지에서 쓰인 곳을 찾는 열쇠 */
  component: string;
  title: string;
  /** 무엇을 바꿔 무엇을 보나 (한 문장) */
  summary: string;
  part: number;
}

export const LABS: LabEntry[] = [
  // Part 1
  { slug: 'mck-01', id: 'LAB-MCK-01', component: 'MassSpringLab', part: 1, title: '질량-스프링 자유진동', summary: '질량·강성·처음 변위를 바꿔 평형 둘레의 왕복과 주기·고유진동수를 본다.' },
  { slug: 'bas-01', id: 'LAB-BAS-01', component: 'SineBasicsLab', part: 1, title: '정현파의 세 숫자: 진폭 · 주파수 · 위상', summary: '진폭·주파수·위상을 하나씩 바꾸며 파형이 어떻게 바뀌는지 본다.' },
  { slug: 'damp-01', id: 'LAB-DAMP-01', component: 'DampingLab', part: 1, title: '감쇠: 흔들림은 몇 주기 동안 남나', summary: '감쇠비를 바꿔 진동이 잦아드는 모양과 대수감쇠율을 본다.' },
  { slug: 'frc-01', id: 'LAB-FRC-01', component: 'ForcedVibrationLab', part: 1, title: '강제진동과 공진', summary: '가진 주파수를 고유진동수 둘레로 옮기며 진폭과 위상 지연이 바뀌는 것을 본다.' },
  { slug: '2dof-01', id: 'LAB-2DOF-01', component: 'TwoDofModeLab', part: 1, title: '2자유도 모드와 에너지 교환', summary: '두 질량의 동상·역상 모드와 약한 결합의 맥놀이를 본다.' },
  { slug: 'sup-01', id: 'LAB-SUP-01', component: 'SupportStiffnessLab', part: 1, title: '받침대를 단단하게 하면 어디까지 바뀔까', summary: '지지 강성과 질량을 바꿔 직렬 등가 강성과 고유진동수가 어디까지 바뀌는지 본다.' },
  { slug: 'unb-01', id: 'LAB-UNB-01', component: 'UnbalanceLab', part: 1, title: '불평형 런업과 1X', summary: '회전수를 올리며 원심력·1X 진폭·위상이 임계속도를 지나 바뀌는 것을 본다.' },
  { slug: 'fmap-01', id: 'LAB-FMAP-01', component: 'FrequencyMapLab', part: 1, title: '주파수 지도: 요소마다 어디에 줄이 서나', summary: '기계 요소(날개·기어·베어링·벨트)마다 관심 주파수가 어디에 오는지 지도로 본다.' },
  { slug: 'src-01', id: 'LAB-SRC-01', component: 'SourceSynthesisLab', part: 1, title: '원인 합성: 파형 한 줄에 섞인 응답들', summary: '원인을 켜고 끄며 합쳐진 파형과 막대 스펙트럼에서 다시 가려낼 수 있는지 본다.' },
  // Part 2
  { slug: 'bas-02', id: 'LAB-BAS-02', component: 'AmplitudeMeasuresLab', part: 2, title: '진폭을 숫자 하나로: Peak · Pk-Pk · RMS · CF', summary: '파형 모양을 바꿔 Peak·Pk-Pk·RMS·Crest factor가 어떻게 달라지는지 본다.' },
  { slug: 'fou-01', id: 'LAB-FOU-01', component: 'FourierHarmonicsLab', part: 2, title: '하모닉 쌓기: 신호는 정현파의 합', summary: '하모닉을 하나씩 더해 사각파·톱니파가 만들어지는 과정과 위상의 영향을 본다.' },
  { slug: 'fou-01-dft', id: 'LAB-FOU-01', component: 'DftCorrelationLab', part: 2, title: 'DFT = 템플릿 정현파와의 상관', summary: '템플릿 주파수를 바꿔 곱의 합이 언제 커지고 언제 0이 되는지 본다.' },
  { slug: 'fou-01-zeropad', id: 'LAB-FOU-01', component: 'ZeroPaddingLab', part: 2, title: '제로패딩 vs 측정 시간', summary: '0을 붙이는 것과 오래 재는 것 중 무엇이 두 성분을 가르는지 비교한다.' },
  { slug: 'smp-01', id: 'LAB-SMP-01', component: 'SamplingLab', part: 2, title: '샘플링과 에일리어싱', summary: '신호 주파수와 f_s를 바꿔 나이퀴스트 위의 성분이 어디로 접히는지 본다.' },
  { slug: 'smp-02', id: 'LAB-SMP-02', component: 'AafLab', part: 2, title: 'AAF와 f_s = 2.56 F_max', summary: '안티에일리어싱 필터의 차수·차단 주파수를 바꿔 접혀 들어오는 성분이 얼마나 깎이는지 본다.' },
  { slug: 'smp-03', id: 'LAB-SMP-03', component: 'AdcLab', part: 2, title: 'ADC 분해능과 입력 레인지', summary: '비트 수와 레인지를 바꿔 양자화 잡음과 클리핑을 본다.' },
  { slug: 'res-01', id: 'LAB-RES-01', component: 'ResolutionLab', part: 2, title: '분해능과 두 성분 분리', summary: '측정 시간(라인 수)을 바꿔 가까운 두 성분이 언제 갈라지는지 본다.' },
  { slug: 'res-02', id: 'LAB-RES-02', component: 'SmearingLab', part: 2, title: '스미어링: 측정 중에 회전수가 변하면', summary: '회전수 변화율과 측정 시간을 바꿔 1X가 몇 bin에 번지는지 본다.' },
  { slug: 'zoom-01', id: 'LAB-ZOOM-01', component: 'ZoomLab', part: 2, title: 'Zoom FFT', summary: '좁은 대역만 촘촘하게 보는 Zoom FFT로 붙어 있던 성분을 가른다.' },
  { slug: 'win-01', id: 'LAB-WIN-01', component: 'WindowLeakageLab', part: 2, title: '누설과 가리비 손실', summary: '성분을 bin 사이로 옮기며 윈도우마다 누설과 진폭 손실이 어떻게 다른지 본다.' },
  { slug: 'win-02', id: 'LAB-WIN-02', component: 'WindowComparisonLab', part: 2, title: '윈도우 비교: 메인로브와 사이드로브', summary: '윈도우를 바꿔 큰 성분 옆의 작은 성분이 보이는지, 가까운 성분이 갈라지는지 본다.' },
  { slug: 'win-03', id: 'LAB-WIN-03', component: 'WindowCorrectionLab', part: 2, title: '진폭 보정(ACF)과 에너지 보정(ECF)', summary: '윈도우의 보정계수와 ENBW가 정현파와 잡음의 읽음값을 어떻게 바꾸는지 본다.' },
  { slug: 'avg-01', id: 'LAB-AVG-01', component: 'AveragingLab', part: 2, title: '평균화: 잡음 바닥의 높이와 흔들림', summary: '평균 방식·횟수·오버랩을 바꿔 잡음 바닥과 작은 성분이 어떻게 보이는지 본다.' },
  { slug: 'avg-02', id: 'LAB-AVG-02', component: 'TsaLab', part: 2, title: 'TSA: 한 바퀴씩 잘라 평균하기', summary: '평균 바퀴 수를 바꿔 다른 축의 성분과 잡음이 지워지고 결함 충격만 남는 것을 본다.' },
  { slug: 'spc-01', id: 'LAB-SPC-01', component: 'SpectrumScalingLab', part: 2, title: '스펙트럼의 세로축: 진폭 · 파워 · PSD', summary: '라인 수와 세로축 스케일을 바꿔 정현파와 잡음의 높이가 어떻게 달라지는지 본다.' },
  { slug: 'spc-02', id: 'LAB-SPC-02', component: 'AmplitudeScaleLab', part: 2, title: '진폭 표기와 dB', summary: '어느 Peak인지(true·derived)와 선형·dB 세로축이 작은 성분의 보임을 어떻게 바꾸는지 본다.' },
  { slug: 'unit-01', id: 'LAB-UNIT-01', component: 'UnitConverterLab', part: 2, title: '진동 단위 환산기', summary: '변위·속도·가속도와 pp·pk·rms, mil·in/s·g를 정현파 하나에 대해 서로 바꾼다.' },
  { slug: 'mod-01', id: 'LAB-MOD-01', component: 'ModulationLab', part: 2, title: '변조 · 측대역 · 맥놀이', summary: 'AM·FM·맥놀이를 만들어 측대역의 간격과 높이, 포락선을 본다.' },
  { slug: 'sbx-01', id: 'LAB-SBX-01', component: 'SandboxLab', part: 2, title: 'Signal Lab 샌드박스: 내 설정으로 무엇이 보이나', summary: '기계 신호와 F_max·라인 수·윈도우·평균을 정하면 성분마다 지금 설정으로 보이는지 판정한다 (Part 2 종합).' },
  // Part 3
  { slug: 'sns-01', id: 'LAB-SNS-01', component: 'SensorLab', part: 3, title: '센서 = 질량-스프링 계', summary: '센서 종류·고유진동수·감쇠·마운팅을 바꿔 평탄 대역과 측정 스펙트럼의 왜곡을 본다.' },
  { slug: 'prox-01', id: 'LAB-PROX-01', component: 'ProximityLab', part: 3, title: '비접촉 변위 센서: gap 전압과 런아웃', summary: 'gap·진동·회전수·런아웃을 바꿔 출력 전압의 DC·AC와 선형 범위, 런아웃을 본다.' },
  { slug: 'phs-01', id: 'LAB-PHS-01', component: 'PhaseLab', part: 3, title: '위상 측정: 키페이저 펄스와 1X 위상', summary: '위상·회전수·2X·관례를 바꿔 Δt에서 위상을 읽고 Polar에 찍는다.' },
  { slug: 'sro-01', id: 'LAB-SRO-01', component: 'SlowRollLab', part: 3, title: 'Slow roll 보상: 런아웃을 벡터로 빼기', summary: '런아웃·Slow roll 회전수·보상 방법을 바꿔 런업 Bode·Polar가 어떻게 바뀌는지 본다.' },
  { slug: 'chain-01', id: 'LAB-CHAIN-01', component: 'ChainQuizLab', part: 3, title: '센서 문제인가, 기계 문제인가 (판정 퀴즈)', summary: '측정 체인 함정 7가지 사례에 확인 동작을 해 보며 무엇이 사라지는지 보고 판정한다.' },
  { slug: 'alm-01', id: 'LAB-ALM-01', component: 'AlarmLab', part: 3, title: '보호 시스템 알람 논리', summary: '레벨·시간 지연·보팅·트립 배율을 바꿔 알람과 트립이 언제 서는지 본다.' },
  // Part 4
  { slug: 'af-01', id: 'LAB-AF-01', component: 'RunUpBodeLab', part: 4, title: 'Run-up Bode와 증폭계수 (AF)', summary: '고유 회전수·감쇠·측정 간격을 바꿔 런업 Bode·Polar에서 Half-power로 증폭계수를 읽는다.' },
  { slug: 'jef-01', id: 'LAB-JEF-01', component: 'JeffcottLab', part: 4, title: 'Jeffcott 로터: 선회와 오빗', summary: '회전수·강성비·감쇠를 바꿔 원형·타원 오빗과 정방향·역방향 선회를 비교한다.' },
  { slug: 'scl-01', id: 'LAB-SCL-01', component: 'ShaftCenterlineLab', part: 4, title: '유막 지지와 Shaft centerline', summary: '회전수·하중·점성계수로 평균 축 위치를 구하고, 냉간 기준점·두 프로브의 DC 전압·드리프트를 비교한다.' },
  { slug: 'stb-01', id: 'LAB-STB-01', component: 'StabilityLab', part: 4, title: '교차연성과 안정성', summary: '교차 강성·감쇠·회전수를 바꾸며 자유응답, 복소 고유치, Log decrement와 안정 한계를 비교한다.' },
  // Part 5
  { slug: 'flt-01', id: 'LAB-FLT-01', component: 'FilterLab', part: 5, title: '필터 설계: 크기 · 군지연 · 시간파형', summary: '종류·차수·차단 주파수를 바꿔 깎이는 정도와 늦음, 파형 모양, 두 번 거르기를 본다.' },
  { slug: 'int-01', id: 'LAB-INT-01', component: 'IntegrationLab', part: 5, title: '적분 & ski-slope', summary: '가속도를 속도·변위로 적분하며 하한 컷오프, ski-slope, 직류 오프셋의 드리프트를 본다.' },
  { slug: 'stft-01', id: 'LAB-STFT-01', component: 'StftLab', part: 5, title: '스펙트로그램 · 워터폴 · 캐스케이드', summary: '기동 신호를 프레임 길이·겹침을 바꿔 STFT하고, 스펙트로그램·워터폴·캐스케이드로 줄을 읽는다.' },
];

export const labBySlug = (slug: string) => LABS.find((l) => l.slug === slug);
