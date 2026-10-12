/**
 * 참고자료(src/data/references.ts)에 든 한국어의 영어 (D-054). 키 = 한국어 원문 ({0} = 무엇이든 오는 자리).
 * 영어 페이지의 <References>·<Cite>가 서지(저자·제목·출처·연도)와 링크 이름을 이 사전으로 옮긴다. 쓴 곳 메모는 영어 MDX에 직접 쓴다.
 */
import type { Dict } from '../translate';

export const REFERENCES_EN: Dict = {
  // 링크 이름 (refLink)
  원문: 'source',
  찾아보기: 'search',
  // 저자: "… 외" = et al.
  '{0} 외': '{0} et al.',
  '{0} 외, {1}': '{0} et al., {1}',
  '{0} 외 ({1})': '{0} et al. ({1})',
  // 출처
  'ASME Turbo Expo 발표 개요': 'ASME Turbo Expo presentation abstract',
  'NASA NTRS (학회 발표)': 'NASA NTRS (conference paper)',
  'NASA NTRS (학회 발표, Bently Nevada)': 'NASA NTRS (conference paper, Bently Nevada)',
  'NASA PCoE 데이터 저장소 (data.gov)': 'NASA PCoE data repository (data.gov)',
  'NI 공식 문서': 'NI documentation',
  'NPTEL 공개 강의': 'NPTEL open course',
  'NumPy 공식 문서': 'NumPy documentation',
  'SciPy 공식 문서': 'SciPy documentation',
  'Proc. 16th International Symposium on Magnetic Bearings (ISMB16) · 저자 공개 논문':
    "Proc. 16th International Symposium on Magnetic Bearings (ISMB16) · author's open copy",
  // 제목·연도
  'Fluke 805 Vibration Meter 사용자 설명서': 'Fluke 805 Vibration Meter user manual',
  'ORBIT Magazine 아카이브': 'ORBIT Magazine archive',
  '틸팅패드 지지 압축기의 불안정 사례': 'Instability cases of compressors on tilting-pad bearings',
  '2005 (RP 2판) · 2019 (TR 684-1)': '2005 (RP 2nd ed.) · 2019 (TR 684-1)',
  '2025 (6판)': '2025 (6th ed.)',
};
