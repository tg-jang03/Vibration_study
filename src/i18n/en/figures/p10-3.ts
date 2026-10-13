import type { Dict } from '../../translate';

/** src/figures/p10-3.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 진단의 순환(이 사이트의 재구성). ① ~ ⑥을 돌고, 조치 뒤에는 같은 조건으로 다시 재서 ①로 돌아갑니다. 가운데 파랑 화살표처럼 ④의 확인 시험 결과도 새 자료로 ①에 들어가 가설을 바꿉니다. ISO 13373-1·-3·17359의 취지를 연결했지만 규격 도표의 복제가 아닙니다.':
    'Figure 1. The diagnostic cycle (this site\'s reconstruction). It runs through ① to ⑥, and after an action you measure again under the same conditions and return to ①. As the blue arrow in the middle shows, the result of the confirmation test in ④ also enters ① as new data and changes the hypotheses. It links the intent of ISO 13373-1, -3 and 17359 but is not a copy of any standard\'s diagram.',
  '① 자료 수집': '① Collect data',
  '기계 정보 · 측정 유효성': 'Machine info · valid data',
  '② 비교': '② Compare',
  '기준선 · 규격 · 추세': 'Baseline · standard · trend',
  '③ 이상 감지': '③ Detect anomaly',
  '무엇이 · 언제부터': 'What · since when',
  '④ 진단': '④ Diagnose',
  '가설 · 확인 시험': 'Hypotheses · tests',
  '⑤ 예측': '⑤ Prognosis',
  '모델 · 가정 · 불확실성': 'Model · assumptions · range',
  '⑥ 권고 · 조치': '⑥ Recommend · act',
  '대상 · 담당 · 시점': 'Target · owner · timing',
  '조치 뒤 재측정': 'Re-measure after action',
  '확인 시험 결과 = 새 자료': 'Test result = new data',
  // 그림 2
  '그림 2. 가상 사례의 120일 기록. 위 — 3000 rpm 1X 진폭이 60 ~ 90일에 20 → 40 µm p-p로 올랐습니다. 아래 — 같은 프로브의 gap 전압은 그대로(파랑)입니다. 회색 점선처럼 gap이 함께 움직였다면 축이 아니라 프로브·부착·케이블을 먼저 의심합니다.':
    'Figure 2. The 120-day record of the hypothetical case. Top — the 3000 rpm 1X amplitude rose from 20 → 40 µm p-p over days 60 ~ 90. Bottom — the gap voltage of the same probe is unchanged (blue). If the gap had moved along with it, like the gray dashed line, suspect the probe, mounting and cable first rather than the shaft.',
  '날짜 [일]': 'Day',
  '증가 구간': 'Rise',
  '만약 회색 점선처럼 움직였다면 → 센서 먼저': 'Moved like the dashes? → sensor first',
  // 그림 3
  '그림 3. 후보 × 증거 5요소. 위 — 지금 아는 것(3000 rpm 1X가 20 → 40 µm p-p)은 세 후보 모두를 지지해 아무것도 가르지 못합니다. 아래 — gap·slow roll 점검과 코스트다운 진폭·위상(그림 4)을 본 뒤: H1은 위상과 속도별 응답에서, H3은 진폭·위상·속도별 응답에서 반증이 나오고 H2만 남습니다. 방향은 아직 미확인입니다.':
    'Figure 3. Candidates × five evidence elements. Top — what we know now (3000 rpm 1X went 20 → 40 µm p-p) supports all three candidates and discriminates nothing. Bottom — after the gap and slow roll check and the coastdown amplitude and phase (Figure 4): H1 is disconfirmed by phase and response versus speed, H3 by amplitude, phase and response versus speed, and only H2 remains. Direction is still unchecked.',
  '지금 아는 것': 'What we know now',
  '주파수': 'Frequency',
  '방향 H/V': 'Direction H/V',
  '속도별 응답': 'Speed response',
  'H1 가진 증가 (불평형·휨)': 'H1 Excitation up (unbalance, bow)',
  '지지': 'Supports',
  '미확인': 'Unchecked',
  'H2 고유진동수 이동 (받침)': 'H2 Natural freq. shift (support)',
  'H3 런아웃 · 측정 변화': 'H3 Runout · measurement change',
  '확인 뒤 (gap · slow roll · 코스트다운)': 'After checks (gap · slow roll · coastdown)',
  '반증': 'Disconfirms',
  // 그림 4
  '그림 4. 1년 전(회색)과 지금(파랑 점)의 코스트다운 1X. 두 가설 모두 3000 rpm의 40.1 µm p-p에 맞췄습니다. H1 가진 증가(주황 점선)는 곡선 전체를 같은 배수로 올리고 위상은 그대로라고, H2 고유진동수 이동(초록 점선)은 3500 → 3165 rpm으로 내려와 같은 회전수의 위상이 커진다고 예측합니다. 기록은 H2를 따릅니다 — 3000 rpm 위상 27.3° → 56.4°.':
    'Figure 4. Coastdown 1X a year ago (gray) and now (blue dots). Both hypotheses were fitted to 40.1 µm p-p at 3000 rpm. H1 excitation increase (orange dashed) predicts the whole curve rising by the same factor with the phase unchanged; H2 natural frequency shift (green dashed) predicts the critical speed coming down from 3500 → 3165 rpm so that the phase at the same speed grows. The record follows H2 — 3000 rpm phase 27.3° → 56.4°.',
  '1년 전': 'A year ago',
  'H1 가진 증가': 'H1 excitation up',
  'H2 고유진동수 이동': 'H2 natural freq. shift',
  '지금 기록': 'Current record',
  // 그림 5
  '그림 5. 사례 보고서의 첫 쪽. 맨 위 칸만 읽어도 무엇이 변했고 무엇을 할지 압니다(파랑). 아래 칸은 같은 결론에 다시 도달할 수 있게 근거·확신도·다음 확인을 따로 적습니다. 관측(측정값)과 판단("맞는다")을 한 문장에 섞지 않습니다.':
    'Figure 5. The first page of the case report. Reading only the top box tells you what changed and what to do (blue). The boxes below list the basis, confidence and next check separately so that the same conclusion can be reached again. An observation (a measured value) and a judgment ("is consistent with") are not mixed in one sentence.',
  '요약 · 권고': 'Summary · Advice',
  '3000 rpm 1X가 60 ~ 90일에 20 → 40 µm p-p. 받침 쪽 고유진동수가 내려온 것과 맞는다.':
    '3000 rpm 1X rose 20 → 40 µm p-p over days 60 ~ 90. Consistent with a lower support natural frequency.',
  '권고: 밸런싱 보류, 다음 정지 때 받침 임팩트 시험 · 소프트 풋 · 기초 볼트 점검.':
    'Recommend: hold balancing; at next stop, support impact test · soft foot · foundation bolts.',
  '근거': 'Basis',
  '코스트다운 진폭 · 위상(그림 4): 3000 rpm 위상 27.3° → 56.4°, 2500 rpm은 8.2 → 12.5 µm (2배가 아님).':
    'Coastdown amp. · phase (Fig. 4): 3000 rpm phase 27.3° → 56.4°, 2500 rpm 8.2 → 12.5 µm (not 2x).',
  'gap · slow roll 벡터 그대로(그림 2) — 측정 경로 변화는 반증. 원자료 파일 · 채널 위치.':
    'Gap · slow roll vector unchanged (Fig. 2) — measurement path change disconfirmed. Raw files · channels.',
  '확신도 · 한계': 'Confidence · Limits',
  '중간 — 코스트다운 한 번의 비교, 방향(H/V) 비교와 구조 시험 전.':
    'Medium — one coastdown comparison; before direction (H/V) and structural tests.',
  '가진 증가와 함께 일어났을 가능성은 남는다.': 'An excitation increase may also be present.',
  '다음 확인': 'Next check',
  '임팩트 시험으로 받침 고유진동수 확인 → 결과로 판단과 권고를 갱신.':
    'Impact test for support natural frequency → update judgment and recommendation.',
  '담당 · 시점 · 중단 기준을 적고, 보호 대응은 기존 승인 절차를 따른다.':
    'State owner · timing · stop criteria; protection response follows approved procedure.',
  // 그림 6
  '그림 6. 같은 11주 관측점(파랑)에 직선(주황 점선)과 지수(보라 점선)를 맞추면, 가상 조치 기준 80 µm p-p에 닿는 때가 30.2주와 19.8주로 갈립니다. 관측 범위 밖의 날짜는 모델이 정합니다 — 열화 메커니즘·운전 조건·불확실성을 갖추기 전에는 고장 날짜를 말하지 않습니다.':
    'Figure 6. Fitting a straight line (orange dashed) and an exponential (purple dashed) to the same 11 weekly points (blue), the time to reach the hypothetical action limit of 80 µm p-p splits into 30.2 and 19.8 weeks. Dates beyond the observed range are decided by the model — do not state a failure date before you have the degradation mechanism, operating conditions and uncertainty.',
  '주': 'Weeks',
  '직선 모델': 'Linear model',
  '지수 모델': 'Exponential model',
  '관측': 'Observed',
  '관측 범위': 'Observed range',
  '가상 조치 기준 80': 'Notional limit 80',
  '19.8주': '19.8 wk',
  '30.2주': '30.2 wk',
  // 그림 7
  '그림 7. ISO 18436-2의 진동 분석 인력 네 범주(Vibration Institute의 공개 설명을 줄임). 위로 갈수록 판단의 폭이 넓어집니다. 기계의 진동 등급도, 특정 설비의 운전·보호 변경 권한도 아닙니다.':
    'Figure 7. The four categories of vibration analysis personnel in ISO 18436-2 (abbreviated from the Vibration Institute\'s public description). The higher you go, the wider the scope of judgment. It is neither a vibration grade of a machine nor an authority to change the operation or protection of a specific plant.',
  '정해진 절차로 측정': 'Measure by set procedure',
  '자료 품질 확인': 'Check data quality',
  '기기 설정 · 기본 분석': 'Instrument setup · basics',
  '스펙트럼 · 파형 판독': 'Read spectra · waveforms',
  '진단 · 감시 프로그램': 'Diagnosis · programs',
  '확인 시험 설계 · 권고': 'Test design · recommend',
  '복잡한 진단 · 해석': 'Complex diagnosis',
  '로터동역학 · 모드 · 개선': 'Rotordynamics · modes',
};

export default EN;
