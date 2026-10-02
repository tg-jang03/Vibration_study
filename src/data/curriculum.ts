/**
 * 사이트 목차 데이터.
 * 기준 문서: docs/Curriculum.md(절 구성), docs/Contents.md §4(페이지 상태).
 * 절을 추가·변경하거나 페이지 상태가 바뀌면 이 파일도 함께 고친다.
 */

export type SectionStatus = 'planned' | 'spec' | 'wip' | 'review' | 'done';

export const STATUS_LABEL: Record<SectionStatus, string> = {
  planned: '계획',
  spec: '사양',
  wip: '구현중',
  review: '검토',
  done: '완료',
};

export interface Section {
  /** 페이지 ID (Contents.md §4), 예: 'P1-4' */
  id: string;
  title: string;
  status: SectionStatus;
  /** 페이지가 생기면 BASE_URL 기준 경로를 넣는다. 예: '/p1-1/' */
  href?: string;
}

export interface Part {
  num: number;
  title: string;
  /** 이 Part가 답하려는 핵심 질문 (Curriculum.md §1) */
  question: string;
  featured?: boolean;
  sections: Section[];
}

export const PARTS: Part[] = [
  {
    num: 0,
    title: '출발점: MCK에서 회전체로',
    question: '학교에서 배운 것이 현장 플롯의 어디에 있나?',
    sections: [
      { id: 'P0-1', title: '순문제와 역문제: 현장 사고방식', status: 'planned' },
      { id: 'P0-2', title: '1자유도 강제진동을 Bode/Polar로 다시 보기', status: 'spec' },
      { id: 'P0-3', title: 'Jeffcott 로터: 회전체 응답의 기본', status: 'planned' },
      { id: 'P0-4', title: '유막 베어링과 안정성 입문', status: 'planned' },
    ],
  },
  {
    num: 1,
    title: '신호처리 기초',
    question: '분석기 설정 하나하나가 스펙트럼을 어떻게 바꾸나?',
    featured: true,
    sections: [
      { id: 'P1-1', title: '푸리에 기초: 신호를 주파수로 보는 법', status: 'spec' },
      { id: 'P1-2', title: '샘플링 · 에일리어싱 · AAF · ADC', status: 'spec' },
      { id: 'P1-3', title: '분해능 · 측정 시간 · Zoom FFT', status: 'spec' },
      { id: 'P1-4', title: '윈도우', status: 'spec' },
      { id: 'P1-5', title: '평균화와 TSA', status: 'spec' },
      { id: 'P1-6', title: '스펙트럼 스케일링과 진동 단위', status: 'spec' },
      { id: 'P1-7', title: '변조 · 측대역 · 맥놀이', status: 'spec' },
      { id: 'P1-8', title: '측정 설정 종합: 목적별 의사결정', status: 'planned' },
    ],
  },
  {
    num: 2,
    title: '센서와 측정 체인',
    question: '이 숫자는 무엇을, 얼마나 믿을 만하게 쟀나?',
    sections: [
      { id: 'P2-1', title: '센서 원리와 선택', status: 'planned' },
      { id: 'P2-2', title: '프록시미티 프로브 시스템', status: 'planned' },
      { id: 'P2-3', title: '키페이저 · 위상 · 1X 벡터', status: 'planned' },
      { id: 'P2-4', title: '측정 체인 함정', status: 'planned' },
      { id: 'P2-5', title: '과도 데이터 수집과 보호 시스템', status: 'planned' },
    ],
  },
  {
    num: 3,
    title: '신호처리 확장',
    question: '묻혀 있는 결함 신호를 어떻게 꺼내나?',
    sections: [
      { id: 'P3-1', title: '디지털 필터', status: 'planned' },
      { id: 'P3-2', title: '적분과 미분', status: 'planned' },
      { id: 'P3-3', title: '시간-주파수 분석: STFT · 스펙트로그램 · 워터폴', status: 'planned' },
      { id: 'P3-4', title: '2채널 분석: FRF · 코히어런스 · Full spectrum', status: 'planned' },
      { id: 'P3-5', title: '차수추적 (Order Tracking)', status: 'planned' },
      { id: 'P3-6', title: '트래킹 · 노치 필터와 1X 벡터 추출', status: 'planned' },
      { id: 'P3-7', title: '엔벨로프 분석 · Spectral Kurtosis · Kurtogram', status: 'planned' },
      { id: 'P3-8', title: '켑스트럼 · 자기상관 · 시간영역 특징량', status: 'planned' },
    ],
  },
  {
    num: 4,
    title: '현장 플롯 읽기',
    question: '각 플롯은 무엇을 보여주고 무엇을 숨기나?',
    sections: [
      { id: 'P4-1', title: '시간파형', status: 'planned' },
      { id: 'P4-2', title: '스펙트럼 · Waterfall · Cascade', status: 'planned' },
      { id: 'P4-3', title: '오빗 (Orbit)', status: 'planned' },
      { id: 'P4-4', title: 'Shaft Centerline', status: 'planned' },
      { id: 'P4-5', title: 'Bode · Polar · APHT', status: 'planned' },
      { id: 'P4-6', title: '트렌드 & 벡터 트렌드', status: 'planned' },
    ],
  },
  {
    num: 5,
    title: '결함별 진단',
    question: '이 패턴은 어떤 결함 메커니즘을 가리키나?',
    sections: [
      { id: 'P5-0', title: '진단 주파수 지도와 회전수 추정', status: 'planned' },
      { id: 'P5-1', title: '1X 계열: 불평형 · 휨 · 크랙 · 편심 · 공진', status: 'planned' },
      { id: 'P5-2', title: '미스얼라인먼트 · 풀림 · 러브', status: 'planned' },
      { id: 'P5-3', title: '유체막 · 유체력 불안정', status: 'planned' },
      { id: 'P5-4', title: '구름베어링', status: 'planned' },
      { id: 'P5-5', title: '기어', status: 'planned' },
      { id: 'P5-6', title: '전기적 원인 (모터 · 발전기)', status: 'planned' },
      { id: 'P5-7', title: '유체 · 공력 원인', status: 'planned' },
      { id: 'P5-8', title: '비틀림 진동 · 블레이드 진동', status: 'planned' },
    ],
  },
  {
    num: 6,
    title: 'GT/ST 특화 현상',
    question: '우리 기계의 기동·운전 중 현상을 어떻게 해석하나?',
    sections: [
      { id: 'P6-1', title: '기동·정지와 임계속도 통과', status: 'planned' },
      { id: 'P6-2', title: 'Thermal bow · Turning gear · Morton effect', status: 'planned' },
      { id: 'P6-3', title: 'ST 특화', status: 'planned' },
      { id: 'P6-4', title: 'GT 특화', status: 'planned' },
      { id: 'P6-5', title: '발전기와 축계', status: 'planned' },
    ],
  },
  {
    num: 7,
    title: '구조 시험 · 밸런싱 · 정렬',
    question: '원인을 어떻게 확인하고 어떻게 고치나?',
    sections: [
      { id: 'P7-1', title: '구조 공진 판별과 임팩트 시험', status: 'planned' },
      { id: 'P7-2', title: '밸런싱', status: 'planned' },
      { id: 'P7-3', title: '정렬', status: 'planned' },
    ],
  },
  {
    num: 8,
    title: '규격 · 판정 · 진단 절차',
    question: '얼마나 나쁜가, 어떻게 판단하고 보고하나?',
    sections: [
      { id: 'P8-1', title: '진동 판정 규격 (ISO 20816 계열)', status: 'planned' },
      { id: 'P8-2', title: 'API 규격 요점', status: 'planned' },
      { id: 'P8-3', title: '진단 절차와 보고', status: 'planned' },
    ],
  },
  {
    num: 9,
    title: '종합 진단 연습',
    question: '처음 보는 데이터에서 결함을 찾을 수 있나?',
    sections: [
      { id: 'P9-1', title: '가상 기계 케이스', status: 'planned' },
      { id: 'P9-2', title: '공개 데이터셋 실습', status: 'planned' },
      { id: 'P9-3', title: '현장 데이터 복기 가이드', status: 'planned' },
    ],
  },
];

/** 완료된 절 수 / 전체 절 수 */
export function partProgress(part: Part): { done: number; total: number } {
  return {
    done: part.sections.filter((s) => s.status === 'done').length,
    total: part.sections.length,
  };
}
