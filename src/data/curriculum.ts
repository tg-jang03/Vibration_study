/**
 * 사이트 목차 데이터.
 * 기준 문서: docs/Curriculum.md(절 구성), docs/Contents.md §4(페이지 상태).
 * 절을 추가·변경하거나 페이지 상태가 바뀌면 이 파일도 함께 고친다.
 */

export type SectionStatus = 'planned' | 'review' | 'done';

export const STATUS_LABEL: Record<SectionStatus, string> = {
  planned: '계획',
  review: '검토',
  done: '완료',
};

export interface Section {
  /** 페이지 ID (Contents.md §4), 예: 'P2-5' */
  id: string;
  title: string;
  status: SectionStatus;
  /** 페이지가 생기면 BASE_URL 기준 경로를 넣는다. 예: '/p2-2/' */
  href?: string;
}

export interface Part {
  num: number;
  title: string;
  /** 이 Part가 답하려는 핵심 질문 (Curriculum.md §1) */
  question: string;
  sections: Section[];
}

export const PARTS: Part[] = [
  {
    num: 1,
    title: '진동의 기초: 기계는 왜, 어떻게 흔들리나',
    question: '기계는 왜, 어떻게 흔들리나?',
    sections: [
      { id: 'P1-1', title: '진동이란: 평형 · 복원력 · 관성', status: 'review', href: '/p1-1/' },
      { id: 'P1-2', title: '고유진동수: 물체마다 정해진 박자', status: 'review', href: '/p1-2/' },
      { id: 'P1-3', title: '감쇠: 흔들림은 왜 잦아드나', status: 'review', href: '/p1-3/' },
      { id: 'P1-4', title: '강제진동과 공진', status: 'review', href: '/p1-4/' },
      { id: 'P1-5', title: '여러 질량과 모드', status: 'review', href: '/p1-5/' },
      { id: 'P1-6', title: '회전기계의 구성: 무엇이 돌고, 무엇이 받치나?', status: 'review', href: '/p1-6/' },
      { id: 'P1-7', title: '회전기계의 진동: 불평형과 1X', status: 'review', href: '/p1-7/' },
      { id: 'P1-8', title: '기계 요소가 만드는 주파수: 한 바퀴에 몇 번?', status: 'review', href: '/p1-8/' },
      { id: 'P1-9', title: '응답에서 원인으로: 진단은 거꾸로 푸는 문제', status: 'review', href: '/p1-9/' },
    ],
  },
  {
    num: 2,
    title: '신호처리 기초',
    question: '분석기 설정 하나하나가 스펙트럼을 어떻게 바꾸나?',
    sections: [
      { id: 'P2-1', title: '신호와 스펙트럼의 기본', status: 'review', href: '/p2-1/' },
      { id: 'P2-2', title: '푸리에 기초: 신호를 주파수로 보는 법', status: 'review', href: '/p2-2/' },
      { id: 'P2-3', title: '샘플링 · 에일리어싱 · AAF · ADC', status: 'review', href: '/p2-3/' },
      { id: 'P2-4', title: '분해능 · 측정 시간 · Zoom FFT', status: 'review', href: '/p2-4/' },
      { id: 'P2-5', title: '윈도우', status: 'review', href: '/p2-5/' },
      { id: 'P2-6', title: '평균화와 TSA', status: 'review', href: '/p2-6/' },
      { id: 'P2-7', title: '스펙트럼 스케일링과 진동 단위', status: 'review', href: '/p2-7/' },
      { id: 'P2-8', title: '변조 · 측대역 · 맥놀이', status: 'review', href: '/p2-8/' },
      { id: 'P2-9', title: '측정 설정 종합: 목적별 의사결정', status: 'review', href: '/p2-9/' },
    ],
  },
  {
    num: 3,
    title: '센서와 측정 체인',
    question: '이 숫자는 무엇을, 얼마나 믿을 만하게 쟀나?',
    sections: [
      { id: 'P3-1', title: '센서 원리와 선택', status: 'review', href: '/p3-1/' },
      { id: 'P3-2', title: '프록시미티 프로브 시스템', status: 'review', href: '/p3-2/' },
      { id: 'P3-3', title: '키페이저 · 위상 · 1X 벡터', status: 'review', href: '/p3-3/' },
      { id: 'P3-4', title: '측정 체인 함정', status: 'review', href: '/p3-4/' },
      { id: 'P3-5', title: '과도 데이터 수집과 보호 시스템', status: 'review', href: '/p3-5/' },
    ],
  },
  {
    num: 4,
    title: '회전체 동역학 기초',
    question: '회전체는 무엇이 다르고, 언제 스스로 흔들리나?',
    sections: [
      { id: 'P4-1', title: '1자유도 불평형 응답을 Bode/Polar로', status: 'review', href: '/p4-1/' },
      { id: 'P4-2', title: 'Jeffcott 로터: 회전체 응답의 기본', status: 'review', href: '/p4-2/' },
      { id: 'P4-3', title: '유막 베어링과 Shaft centerline', status: 'review', href: '/p4-3/' },
      { id: 'P4-4', title: '안정성: 교차연성 · Whirl/Whip · Log decrement', status: 'review', href: '/p4-4/' },
    ],
  },
  {
    num: 5,
    title: '신호처리 확장',
    question: '묻혀 있는 결함 신호를 어떻게 꺼내나?',
    sections: [
      { id: 'P5-1', title: '디지털 필터와 적분', status: 'review', href: '/p5-1/' },
      { id: 'P5-2', title: '시간-주파수 분석: STFT · 스펙트로그램 · 워터폴', status: 'review', href: '/p5-2/' },
      { id: 'P5-3', title: '2채널 분석: FRF · 코히어런스 · Full spectrum', status: 'review', href: '/p5-3/' },
      { id: 'P5-4', title: '차수추적 (Order Tracking)', status: 'review', href: '/p5-4/' },
      { id: 'P5-5', title: '트래킹 · 노치 필터와 1X 벡터 추출', status: 'review', href: '/p5-5/' },
      { id: 'P5-6', title: '엔벨로프 분석 · Spectral Kurtosis · Kurtogram', status: 'review', href: '/p5-6/' },
      { id: 'P5-7', title: '켑스트럼 · 자기상관 · 시간영역 특징량', status: 'review', href: '/p5-7/' },
    ],
  },
  {
    num: 6,
    title: '현장 플롯 읽기',
    question: '각 플롯은 무엇을 보여주고 무엇을 숨기나?',
    sections: [
      { id: 'P6-1', title: '시간파형', status: 'review', href: '/p6-1/' },
      { id: 'P6-2', title: '스펙트럼 · Waterfall · Cascade', status: 'planned' },
      { id: 'P6-3', title: '오빗 (Orbit)', status: 'planned' },
      { id: 'P6-4', title: '트렌드 · 벡터 트렌드 · APHT', status: 'planned' },
    ],
  },
  {
    num: 7,
    title: '결함별 진단',
    question: '이 패턴은 어떤 결함 메커니즘을 가리키나?',
    sections: [
      { id: 'P7-1', title: '진단 주파수 지도와 회전수 추정', status: 'planned' },
      { id: 'P7-2', title: '1X 계열: 불평형 · 휨 · 크랙 · 편심 · 공진', status: 'planned' },
      { id: 'P7-3', title: '미스얼라인먼트 · 풀림 · 러브', status: 'planned' },
      { id: 'P7-4', title: '유체막 · 유체력 불안정', status: 'planned' },
      { id: 'P7-5', title: '구름베어링', status: 'planned' },
      { id: 'P7-6', title: '기어', status: 'planned' },
      { id: 'P7-7', title: '전기적 원인 (모터 · 발전기)', status: 'planned' },
      { id: 'P7-8', title: '유체 · 공력 원인', status: 'planned' },
      { id: 'P7-9', title: '비틀림 진동 · 블레이드 진동', status: 'planned' },
    ],
  },
  {
    num: 8,
    title: 'GT/ST 특화 현상',
    question: '우리 기계의 기동·운전 중 현상을 어떻게 해석하나?',
    sections: [
      { id: 'P8-1', title: '기동·정지와 임계속도 통과', status: 'planned' },
      { id: 'P8-2', title: 'Thermal bow · Turning gear · Morton effect', status: 'planned' },
      { id: 'P8-3', title: 'ST 특화', status: 'planned' },
      { id: 'P8-4', title: 'GT 특화', status: 'planned' },
      { id: 'P8-5', title: '발전기와 축계', status: 'planned' },
    ],
  },
  {
    num: 9,
    title: '구조 시험 · 밸런싱 · 정렬',
    question: '원인을 어떻게 확인하고 어떻게 고치나?',
    sections: [
      { id: 'P9-1', title: '구조 공진 판별과 임팩트 시험', status: 'planned' },
      { id: 'P9-2', title: '밸런싱', status: 'planned' },
      { id: 'P9-3', title: '정렬', status: 'planned' },
    ],
  },
  {
    num: 10,
    title: '규격 · 판정 · 진단 절차',
    question: '얼마나 나쁜가, 어떻게 판단하고 보고하나?',
    sections: [
      { id: 'P10-1', title: '진동 판정 규격 (ISO 20816 계열)', status: 'planned' },
      { id: 'P10-2', title: 'API 규격 요점', status: 'planned' },
      { id: 'P10-3', title: '진단 절차와 보고', status: 'planned' },
    ],
  },
  {
    num: 11,
    title: '종합 진단 연습',
    question: '처음 보는 데이터에서 결함을 찾을 수 있나?',
    sections: [
      { id: 'P11-1', title: '가상 기계 케이스', status: 'planned' },
      { id: 'P11-2', title: '공개 데이터셋 실습', status: 'planned' },
      { id: 'P11-3', title: '현장 데이터 복기 가이드', status: 'planned' },
    ],
  },
];

/**
 * 홈의 학습 지도: Part를 네 단계로 묶는다 (D-037). 모든 Part를 같은 모양으로 보이고, 단계마다 색 하나를 쓴다.
 * color는 CSS 변수 이름 (global.css의 --plot-n).
 */
export interface Stage {
  num: number;
  title: string;
  summary: string;
  color: string;
  parts: number[];
}

export const STAGES: Stage[] = [
  { num: 1, title: '기초: 흔들림 · 신호 · 센서', summary: '기계가 왜 흔들리는지, 그 흔들림을 어떻게 재고 스펙트럼으로 바꾸는지', color: 'var(--plot-1)', parts: [1, 2, 3] },
  { num: 2, title: '모델과 도구', summary: '회전체가 흔들리는 원리와 묻힌 신호를 꺼내는 분석 도구', color: 'var(--plot-3)', parts: [4, 5] },
  { num: 3, title: '진단', summary: '현장 플롯을 읽고 결함 메커니즘과 GT/ST 현상을 가려내기', color: 'var(--plot-2)', parts: [6, 7, 8] },
  { num: 4, title: '조치와 종합', summary: '확인 시험·밸런싱·정렬, 판정 규격과 보고, 처음 보는 데이터로 연습', color: 'var(--plot-4)', parts: [9, 10, 11] },
];

/** 검토·완료 단계에 들어간 절 수 / 전체 절 수 */
export function partProgress(part: Part): { review: number; done: number; ready: number; total: number } {
  const review = part.sections.filter((s) => s.status === 'review').length;
  const done = part.sections.filter((s) => s.status === 'done').length;
  return {
    review,
    done,
    ready: review + done,
    total: part.sections.length,
  };
}
