/**
 * 화면 틀의 문구 (D-054): 머리·바닥, 목차·이동, 홈·Part·랩 모음, 강조 상자, 그림, 랩 공용 UI.
 * 한국어(KO)가 기준이고 영어(EN)는 같은 키를 모두 가져야 한다 (타입이 잡는다).
 * 본문·그림 라벨·랩 고유 문자열은 여기가 아니라 src/i18n/en/* 사전과 영어 MDX에 둔다.
 */
import type { Lang } from './index';
import { SITE_NAME, SITE_NAME_EN, SITE_TAGLINE } from '../lib/site';

const KO = {
  // 사이트
  siteName: SITE_NAME,
  tagline: SITE_TAGLINE,
  defaultDescription: '진동의 물리와 신호처리부터 대형 회전기계(GT/ST) 상태 진단까지 연결하는 기계 진동 학습 아카이브',
  footer: '기계 진동 학습 아카이브',
  navLabel: '주 메뉴',
  navCurriculum: '커리큘럼',
  navLab: 'Signal Lab',
  navReference: '레퍼런스',
  /** 언어 전환 링크: 다른 언어의 이름 */
  switchLabel: 'English',
  switchTitle: '이 페이지의 영어판',
  switchTitleMissing: '이 페이지는 아직 영어판이 없습니다 — 영어 홈으로',
  /** 영어 페이지에서 아직 번역되지 않아 한국어 페이지로 가는 링크 표시 */
  koreanOnly: '한국어',
  koreanOnlyTitle: '아직 영어판이 없어 한국어 페이지로 갑니다',

  // 절 상태
  status: { planned: '계획', review: '검토', done: '완료' },
  comingSoon: '준비 중',

  // 절 페이지 (MdxLayout)
  partSections: (n: number) => `Part ${n} 절 목록`,
  onThisPage: '이 페이지',
  otherParts: '다른 Part',
  sectionPager: '절 이동',

  // 홈
  heroKicker: '진동 → 신호 → 센서 → 회전체 → 진단',
  heroTitle: '기계 진동 분석과 회전체 진단',
  heroLead: '진동의 물리와 신호처리부터 대형 회전기계(GT/ST)의 상태 진단까지, 그림과 수식, 직접 만져 보는 랩으로 하나의 흐름 안에서 익힙니다.',
  startHere: '처음부터',
  resume: '이어서 보기',
  labGallery: 'Signal Lab 랩 모음',
  statSections: '읽을 수 있는 절',
  statLabs: '직접 만져 보는 랩',
  artWave: '시간파형',
  artSpectrum: '스펙트럼',
  mapTitle: '학습 지도',
  mapLead: (parts: number) =>
    `네 단계, ${parts}개 Part입니다. 칸 하나가 절 하나이고, 색이 찬 칸은 지금 읽을 수 있습니다. 칸을 누르면 그 절로, Part 이름을 누르면 Part 목차로 갑니다.`,
  legendReadable: '(읽을 수 있음)',
  stage: (n: number) => `단계 ${n}`,
  partCellsLabel: (n: number) => `Part ${n}의 절`,
  readableCount: (ready: number, total: number) => `읽을 수 있는 절 ${ready} / ${total}`,
  labCount: (n: number) => `랩 ${n}`,

  // Part 목차
  sectionLabs: '이 절의 랩',
  partPager: 'Part 이동',

  // 랩 모음·랩 단독 페이지
  labTitleSuffix: '인터랙티브 랩',
  labIndexTitle: 'Signal Lab · 진동·신호처리 인터랙티브 랩 모음',
  labIndexDescription: '사이트의 인터랙티브 랩을 한곳에 모았다. 랩 하나만 골라 크게 열고, 원문 설명으로 바로 돌아갈 수 있다.',
  labHeroTitle: '랩 모음: 골라서 만져 보기',
  labHeroLead: (n: number) =>
    `페이지마다 흩어진 랩 ${n}개를 모았습니다. 하나만 골라 크게 열고, 설명이 필요하면 "원문 설명" 링크로 그 랩이 나온 절로 돌아갑니다.`,
  sandboxTag: 'Part 2 종합',
  open: '열기 →',
  filterLabel: 'Part로 거르기',
  filterAll: '전체',
  searchPlaceholder: '랩 이름·ID·내용으로 찾기 (예: 윈도우, 위상, AVG)',
  searchLabel: '랩 찾기',
  labRefPrefix: '원문:',
  moreRefs: (n: number) => ` 외 ${n}곳`,
  noResult: '찾는 랩이 없습니다.',
  sandboxFoot: ['샌드박스의 설정 순서와 근거는 ', '에 있습니다.'] as [string, string],
  explainedIn: '원문 설명',
  labPager: '랩 이동',
  labIndex: '랩 모음',
  labKoreanUi: '',

  // 강조 상자 (Callout)
  callout: { idea: '핵심', try: '따라 하기', warn: '주의', example: '숫자 예', term: '용어 풀이', field: '현장에서는' },

  // 그림 (Figure)
  figEnlarge: '크게 보기',
  figEnlargeLabel: '그림을 크게 보기',
  figDialogLabel: '그림 크게 보기',
  figClose: '닫기',
  heatmapLow: '작음',
  heatmapHigh: '큼',

  // 참고자료
  refSourceTitle: '레퍼런스 > 참고 문헌에서 보기',
  // 레퍼런스 머리 (RefHeader)
  refKicker: '레퍼런스',
  refTabsLabel: '레퍼런스 메뉴',
  refTabs: { home: '개요', sources: '참고 문헌', glossary: '용어집', formulas: '기호 · 공식' },

  // 랩 공용 UI (React)
  labOpen: '이 랩만 크게 보기 ↗',
  labTasks: '실험 과제 — 먼저 예측하고 조작해서 확인하세요',
  labCheck: '확인',
  readouts: '읽음값',
  readoutItem: '항목',
  readoutMeasured: '측정',
  readoutTheory: '이론',
  readoutError: '오차',
  play: '재생',
  pause: '멈춤',
  restart: '처음으로',
  playSpeed: '재생 속도',
  speedNames: ['느리게', '보통', '빠르게', '더 빠르게'] as string[],
  rateReal: '실제 속도',
  rateSlower: (x: string) => `실제의 1/${x}`,
  rateFaster: (x: string) => `실제의 ${x}배`,
  plotLoading: '그래프 불러오는 중…',
  plotError: '그래프를 불러오지 못했습니다. 페이지를 새로고침해 주세요.',
  polarRotationCcw: '회전 ↺',
  polarRotationCw: '회전 ↻',
  polarLagCcw: '지연 ↻',
  polarLagCw: '지연 ↺',
  polarZero: '0° = 센서 방향',
};

export type UiStrings = typeof KO;

const EN: UiStrings = {
  siteName: SITE_NAME_EN,
  tagline: 'Interactive learning for vibration, signal processing and machinery diagnostics',
  defaultDescription:
    'From vibration physics and signal processing to condition diagnostics of large rotating machinery (gas and steam turbines) — a learning archive with figures, equations and interactive labs.',
  footer: 'A machine vibration learning archive',
  navLabel: 'Main menu',
  navCurriculum: 'Curriculum',
  navLab: 'Signal Lab',
  navReference: 'Reference',
  switchLabel: '한국어',
  switchTitle: 'Korean version of this page (the original)',
  switchTitleMissing: 'Korean version of this page (the original)',
  koreanOnly: 'KO',
  koreanOnlyTitle: 'Not translated yet — opens the Korean page',

  status: { planned: 'Planned', review: 'In review', done: 'Done' },
  comingSoon: 'Coming soon',

  partSections: (n: number) => `Sections of Part ${n}`,
  onThisPage: 'On this page',
  otherParts: 'Other parts',
  sectionPager: 'Section navigation',

  heroKicker: 'Vibration → Signals → Sensors → Rotors → Diagnosis',
  heroTitle: 'Machine Vibration Analysis and Rotor Diagnostics',
  heroLead:
    'From vibration physics and signal processing to condition diagnostics of large rotating machinery (gas and steam turbines) — learned as one continuous story with figures, equations and labs you can play with.',
  startHere: 'Start here',
  resume: 'Continue',
  labGallery: 'Signal Lab gallery',
  statSections: 'Sections in English',
  statLabs: 'Interactive labs',
  artWave: 'Time waveform',
  artSpectrum: 'Spectrum',
  mapTitle: 'Learning map',
  mapLead: (parts: number) =>
    `Four stages, ${parts} parts. Each cell is one section: filled cells are available in English, outlined cells are still Korean only. Click a cell to open the section, or a part name for its table of contents.`,
  legendReadable: '(in English)',
  stage: (n: number) => `Stage ${n}`,
  partCellsLabel: (n: number) => `Sections of Part ${n}`,
  readableCount: (ready: number, total: number) => `${ready} of ${total} sections in English`,
  labCount: (n: number) => `${n} labs`,

  sectionLabs: 'Labs in this section',
  partPager: 'Part navigation',

  labTitleSuffix: 'interactive lab',
  labIndexTitle: 'Signal Lab · Interactive vibration and signal processing labs',
  labIndexDescription:
    'All interactive labs of the site in one place — open any lab on its own page and jump back to the section that explains it.',
  labHeroTitle: 'Lab gallery: pick one and play',
  labHeroLead: (n: number) =>
    `${n} labs gathered from across the site. Open any lab on its own page; when you need the explanation, the "Explained in" link takes you back to the section where it appears. Labs marked KO still have a Korean interface.`,
  sandboxTag: 'Part 2 capstone',
  open: 'Open →',
  filterLabel: 'Filter by part',
  filterAll: 'All',
  searchPlaceholder: 'Search by lab name, ID or content (e.g. window, phase, AVG)',
  searchLabel: 'Search labs',
  labRefPrefix: 'Explained in:',
  moreRefs: (n: number) => ` and ${n} more`,
  noResult: 'No labs match.',
  sandboxFoot: ['The setup order behind the sandbox is explained in ', '.'],
  explainedIn: 'Explained in',
  labPager: 'Lab navigation',
  labIndex: 'All labs',
  labKoreanUi: 'Korean interface',

  callout: { idea: 'Key idea', try: 'Try it', warn: 'Caution', example: 'By the numbers', term: 'Terms', field: 'In the field' },

  figEnlarge: 'Enlarge',
  figEnlargeLabel: 'Enlarge the figure',
  figDialogLabel: 'Enlarged figure',
  figClose: 'Close',
  heatmapLow: 'low',
  heatmapHigh: 'high',

  refSourceTitle: 'See it in Reference > Sources',
  refKicker: 'Reference',
  refTabsLabel: 'Reference menu',
  refTabs: { home: 'Overview', sources: 'Sources', glossary: 'Glossary', formulas: 'Symbols · Formulas' },

  labOpen: 'Open this lab on its own ↗',
  labTasks: 'Experiments — predict first, then check by changing the controls',
  labCheck: 'Check',
  readouts: 'Readouts',
  readoutItem: 'Quantity',
  readoutMeasured: 'Measured',
  readoutTheory: 'Theory',
  readoutError: 'Error',
  play: 'Play',
  pause: 'Pause',
  restart: 'Restart',
  playSpeed: 'Playback speed',
  speedNames: ['Slow', 'Normal', 'Fast', 'Faster'],
  rateReal: 'real time',
  rateSlower: (x: string) => `1/${x} of real time`,
  rateFaster: (x: string) => `${x}× real time`,
  plotLoading: 'Loading the plot…',
  plotError: 'Could not load the plot. Please reload the page.',
  polarRotationCcw: 'Rotation ↺',
  polarRotationCw: 'Rotation ↻',
  polarLagCcw: 'Lag ↻',
  polarLagCw: 'Lag ↺',
  polarZero: '0° = sensor direction',
};

export const UI: Record<Lang, UiStrings> = { ko: KO, en: EN };
export const ui = (lang: Lang): UiStrings => UI[lang];
