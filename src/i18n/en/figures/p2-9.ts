import type { Dict } from '../../translate';

/** src/figures/p2-9.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 측정 설정을 정하는 순서. 위 줄(파랑)은 "무엇을, 어디까지, 얼마나 촘촘히"를 정해 F_max와 라인 수를 고르는 단계, 주황 상자는 그 결과 측정 시간 T가 운전이 일정한 시간 안인지 되묻는 단계, 아래 줄(초록)은 같은 프레임을 어떻게 다듬어 보여 줄지 정하는 단계다. 괄호 안은 근거를 설명한 페이지다. 마지막에는 결과가 믿을 만한지 확인한다(보라).':
    'Figure 1. The order for choosing the measurement setup. The top row (blue) decides "what, up to where, how finely" and so picks F_max and the number of lines. The orange box then asks whether the resulting measurement time T fits within the time the machine runs steadily. The bottom row (green) decides how the same frame is refined and displayed. The pages in parentheses explain the basis. Finally you check whether the result can be trusted (purple).',
  '① 무엇을 보나': '① What to look at',
  '목적: 어떤 성분·결함': 'Purpose: which components / faults',
  '② 가장 높은 주파수': '② Highest frequency',
  '③ 가를 최소 간격': '③ Minimum spacing',
  '→ 라인 수·Δf (P2-4)': '→ Lines · Δf (P2-4)',
  '④ T = 1/Δf가 괜찮나': '④ Is T = 1/Δf OK?',
  '그동안 회전수 일정?': 'Speed steady meanwhile?',
  '⑤ 윈도우': '⑤ Window',
  '진폭·분리·누설 (P2-5)': 'Amplitude · separation · leakage (P2-5)',
  '⑥ 평균·오버랩': '⑥ Averaging · overlap',
  '→ 총 측정 시간 (P2-6)': '→ Total time (P2-6)',
  '⑦ 표시': '⑦ Display',
  '⑧ 결과 확인': '⑧ Check the result',
  '클리핑·1X 위치·수렴': 'Clipping · 1X position · convergence',
  '너무 길면 ②·③을 다시': 'If too long, redo ② and ③',
  // 그림 2
  '그림 2. 같은 기계(1X 50 Hz, 맞물림 750 Hz, 축 B 12.5 Hz)를 F_max 2000 Hz, Hann, 파워 평균 8회로 쟀다. 위: 분석기 기본값 400 라인 — Δf 5 Hz라 측대역 간격 12.5 Hz가 2.5 bin밖에 안 되어 맞물림 봉우리에 붙는다. 아래: ③단계에서 계산한 800 라인 — Δf 2.5 Hz, 5 bin이라 Hann으로도 갈라진다 (회색 점선 = 측대역 자리). 측정 시간은 프레임 0.4 s, 평균까지 1.8 s.':
    'Figure 2. The same machine (1X 50 Hz, mesh 750 Hz, shaft B 12.5 Hz) measured with F_max 2000 Hz, Hann, and a power average of 8. Top: the analyzer default of 400 lines — Δf is 5 Hz, so the 12.5 Hz sideband spacing is only 2.5 bins and the sidebands stick to the mesh peak. Bottom: the 800 lines calculated in step ③ — Δf 2.5 Hz, 5 bins, so Hann can separate them (gray dotted lines = sideband positions). The measurement time is 0.4 s per frame and 1.8 s including averaging.',
  '400 라인: Δf 5 Hz → 측대역 간격 12.5 Hz = 2.5 bin (붙음)': '400 lines: Δf 5 Hz → sideband spacing 12.5 Hz = 2.5 bins (merged)',
  '800 라인: Δf 2.5 Hz → 측대역 간격 12.5 Hz = 5 bin (갈라짐)': '800 lines: Δf 2.5 Hz → sideband spacing 12.5 Hz = 5 bins (separated)',
  // 그림 3
  '그림 3. 같은 기계를 F_max 1000 Hz(f_s 2560 Hz)로 쟀다. 이 기계에는 3 kHz 근처에서 울리는 짧은 충격(구름베어링형)이 섞여 있다. 위: AAF를 켜면 F_max 위 성분이 깎여 0 ~ 1000 Hz에는 1X·하모닉·0.45X·맞물림과 그 측대역만 보인다. 아래: AAF가 없으면 2.7 ~ 3.3 kHz의 울림 대역이 f_s를 빼고 140 ~ 740 Hz(가운데 440 Hz)로 접혀 들어와, 그 자리에 없는 성분의 막대 무리가 선다 (P2-3). 측정 장비에 AAF가 있는지, F_max 위에 큰 성분이 없는지 확인해야 하는 이유다.':
    'Figure 3. The same machine measured with F_max 1000 Hz (f_s 2560 Hz). This machine has a short impact (rolling-bearing type) ringing near 3 kHz mixed in. Top: with the AAF on, components above F_max are cut down, so 0 to 1000 Hz shows only 1X, the harmonics, 0.45X, the mesh and its sidebands. Bottom: without an AAF, the ringing band at 2.7 to 3.3 kHz folds in, with f_s subtracted, to 140 to 740 Hz (center 440 Hz), and a cluster of bars appears for components that are not there (P2-3). This is why you must check that the measuring equipment has an AAF and that there are no large components above F_max.',
  'AAF 켬': 'AAF on',
  'AAF 없음': 'No AAF',
  '접혀 들어온 울림 (2.7 ~ 3.3 kHz → 140 ~ 740 Hz)': 'Folded-in ringing (2.7–3.3 kHz → 140–740 Hz)',
  // 그림 4
  '그림 4. 같은 기계를 목적만 바꿔 쟀다 (4절 표의 설정). 위: 밸런싱 전 1X — F_max 500 Hz, Flat top. 1X를 2.83 mm/s RMS로 읽는다 (실제 2.828). 가운데: 0.4 ~ 0.5X 확인 — F_max 200 Hz, 800 라인(Δf 0.25 Hz), dB. 1X보다 22 dB 작은 22.5 Hz 성분이 1X와 또렷이 갈린다. 아래: 구름베어링 충격 — F_max 5000 Hz, dB. 3 kHz 근처의 울림 대역이 바닥보다 17 dB 높게 선다. 한 가지 설정으로는 셋을 모두 잘 보기 어렵다.':
    'Figure 4. The same machine measured with only the purpose changed (the setups of the §4 table). Top: 1X before balancing — F_max 500 Hz, Flat top. 1X reads 2.83 mm/s RMS (actual 2.828). Middle: checking 0.4 to 0.5X — F_max 200 Hz, 800 lines (Δf 0.25 Hz), dB. The 22.5 Hz component, 22 dB below 1X, separates clearly from 1X. Bottom: rolling-element bearing impacts — F_max 5000 Hz, dB. The ringing band near 3 kHz stands 17 dB above the floor. It is hard to see all three well with a single setup.',
  '밸런싱 전 1X (F_max 500 Hz, 400 라인, Flat top)': 'Before balancing, 1X (F_max 500 Hz, 400 lines, Flat top)',
  '0.4 ~ 0.5X 확인 (F_max 200 Hz, 800 라인, Hann, dB)': 'Checking 0.4–0.5X (F_max 200 Hz, 800 lines, Hann, dB)',
  '구름베어링 충격 (F_max 5000 Hz, 1600 라인, Hann, dB)': 'Rolling-element bearing impacts (F_max 5000 Hz, 1600 lines, Hann, dB)',
  '울림 대역': 'Ringing band',
};

export default EN;
