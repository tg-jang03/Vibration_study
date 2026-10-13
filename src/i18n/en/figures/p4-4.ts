import type { Dict } from '../../translate';

/** src/figures/p4-4.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 같은 반시계 원 운동을 놓고 접선 방향 힘을 비교한다. 오른쪽 점에서 교차 힘은 위로, 감쇠 힘은 아래로 작용한다. 벡터 길이는 ζ=0.05, ω=ωn에서 cωnA를 1로 정규화했다. 복원력은 중심을 향하며 화살표 길이는 방향 설명용이다(ω=ωn에서 감쇠력의 10배). 선회가 얻는 에너지가 감쇠 손실보다 크면 작은 흔들림이 커질 수 있다.':
    'Figure 1. Tangential forces compared for the same counterclockwise circular motion. At the point on the right, the cross force acts upward and the damping force acts downward. Vector lengths are normalized so that cωnA = 1 at ζ=0.05, ω=ωn. The restoring force points toward the center, and its arrow length only shows direction (10 times the damping force at ω=ωn). If the energy the whirl gains exceeds the damping loss, a small disturbance can grow.',
  'q/k=0.05: 감쇠 쪽이 더 큽니다': 'q/k=0.05: damping is larger',
  '축 중심': 'Shaft center',
  '교차 힘 +qA': 'Cross force +qA',
  '감쇠 힘 −cωA': 'Damping force −cωA',
  '정방향 선회 ↺': 'Forward whirl ↺',
  '직접 복원력': 'Restoring',
  'q/k=0.15: 접선 공급 쪽이 더 큽니다': 'q/k=0.15: cross force is larger',
  // 그림 2
  '그림 2. ζ=0.05에서 정방향 모드만 80 ms 그렸다. q/k=0.05는 수렴, 0.10은 경계, 0.15는 발산이다. 모든 초기 변위는 20 µm이며 초기 속도 λfA가 포함된다. 경계의 원은 여러 번 겹쳐 그려졌다. 각 패널의 X·Y 축척은 같다.':
    'Figure 2. The forward mode only, drawn for 80 ms at ζ=0.05. q/k=0.05 converges, 0.10 is the boundary, and 0.15 diverges. All initial displacements are 20 µm and include the initial velocity λfA. The circle at the boundary is drawn over itself many times. The X and Y scales are the same in each panel.',
  'σf < 0: 진폭 감소': 'σf < 0: amplitude decays',
  시작: 'Start',
  'σf = 0: 경계': 'σf = 0: boundary',
  'σf > 0: 진폭 증가': 'σf > 0: amplitude grows',
  // 그림 3
  '그림 3. q/k를 0에서 0.5까지 올린 실수 상태계의 네 고유치 궤적이다. 파란 정방향 쌍이 σ=0을 넘어 오른쪽으로 간다. 주황 역방향 쌍은 더 왼쪽으로 간다. 초록 점은 q/k=0.10의 경계이며, q=0에서는 두 모드의 고유치가 같은 두 위치에 겹친다.':
    'Figure 3. Paths of the four eigenvalues of the real state system as q/k is raised from 0 to 0.5. The blue forward pair crosses σ=0 and moves right. The orange backward pair moves further left. The green dots mark the boundary at q/k=0.10, and at q=0 the eigenvalues of the two modes coincide at the same two locations.',
  '정방향 +Im': 'Forward +Im',
  '정방향 −Im': 'Forward −Im',
  '역방향 +Im': 'Backward +Im',
  '역방향 −Im': 'Backward −Im',
  'q = 0 (두 모드가 겹침)': 'q = 0 (modes coincide)',
  // 그림 4
  '그림 4. 직접 q를 입력할 때 ζ를 0.05에서 0.10으로 키우면 경계 q/k가 0.10에서 0.20으로 옮겨진다. 속도 연동 q=cΩ/2에서는 c와 q가 함께 커지므로 경계 r=2는 그대로다. δ=0에서 교차하며, δ가 음수이면 모드 진폭이 한 주기마다 커진다.':
    'Figure 4. When q is set directly, raising ζ from 0.05 to 0.10 moves the boundary q/k from 0.10 to 0.20. With speed-coupled q=cΩ/2, c and q grow together, so the boundary r=2 stays where it is. The curves cross at δ=0, and when δ is negative the mode amplitude grows every period.',
  'q 직접 입력': 'q set directly',
  'q=cΩ/2 속도 연동': 'Speed-coupled q=cΩ/2',
  '모델 한계 r=2': 'Model limit r=2',
  // 그림 5
  '그림 5. 가상 봉우리를 min(0.45×회전 주파수, 50 Hz)에 놓았다. 위: 가상 발생 회전수 4000 rpm 아래에는 봉우리가 없다(실제 발생점은 유막·하중 조건에 따라 다르다). 4800 rpm에서는 36 Hz(0.45X), 9000 rpm에서는 50 Hz(0.3333X)이고 가상 전환점은 6667 rpm이다. q=cΩ/2의 한계는 6000 rpm이며 작은 감쇠에서는 한계 위 모드 주파수도 50 Hz 근처에 머물지만 정확히 일정하지 않다. 아래: 4500 ~ 9000 rpm에서 동일 높이로 정규화한 가상 스펙트럼을 회전수별로 쌓은 미리보기로, 실제 FFT나 비선형 유막 해가 아니다.':
    'Figure 5. The hypothetical peak is placed at min(0.45 × rotation frequency, 50 Hz). Top: below the hypothetical onset speed of 4000 rpm there is no peak (the real onset depends on oil-film and load conditions). At 4800 rpm it is 36 Hz (0.45X), at 9000 rpm it is 50 Hz (0.3333X), and the hypothetical transition point is 6667 rpm. The q=cΩ/2 threshold is 6000 rpm, and with small damping the mode frequency above the threshold also stays near 50 Hz, though not exactly constant. Bottom: a preview stacking hypothetical spectra, normalized to the same height, by speed from 4500 to 9000 rpm. It is not a real FFT or a nonlinear oil-film solution.',
  '회전수 추종 → 모드 근처 주파수 고정': 'Following speed → frequency fixed near mode',
  '회전수 [rpm]': 'Speed [rpm]',
  '주파수 [Hz]': 'Frequency [Hz]',
  '가상 서브싱크로너스 봉우리': 'Hypothetical sub-sync peak',
  '가상 발생': 'Hypothetical onset',
  '가상 캐스케이드: 봉우리의 위치를 비교하세요': 'Hypothetical cascade: compare the peak positions',
  // 그림 6
  '그림 6. Campbell 선도는 회전수별 모드 주파수와 차수선을 겹친다. 이 그림의 가상 자이로 모드선은 f/fn=√(1+0.01r²)±0.1r, fn=50 Hz, r=N/3000이다. 파랑은 정방향, 주황은 역방향, 회색 점선은 1X·2X 차수선이다. 초록 점의 1X·정방향 교차는 3354 rpm이다. 1X와 역방향 모드선의 교차(약 2739 rpm)는 정방향인 불평형 가진과 방향이 맞지 않아 표시하지 않았다. 교차점은 가진 조건을 더 확인할 잠재 공진이지, 불안정 판정이나 실제 축계 임계속도 예측이 아니다.':
    'Figure 6. A Campbell diagram overlays the mode frequencies by speed and the order lines. The hypothetical gyroscopic mode lines in this figure are f/fn=√(1+0.01r²)±0.1r, fn=50 Hz, r=N/3000. Blue is forward, orange is backward, and the gray dashed lines are the 1X and 2X order lines. The green dot, the 1X–forward crossing, is at 3354 rpm. The crossing of 1X with the backward mode line (about 2739 rpm) is not marked, because its direction does not match the forward unbalance excitation. A crossing is a potential resonance whose excitation conditions need further checking, not an instability verdict or a prediction of the real shaft-system critical speed.',
  '가상 FW 모드': 'Hypothetical FW mode',
  '가상 BW 모드': 'Hypothetical BW mode',
  // 그림 7
  '그림 7. q=0.15k를 고정한 q 직접 입력 방식에서 감쇠를 두 배로 하면 한계 qcrit가 0.10k에서 0.20k로 바뀌어 안정 쪽으로 간다. 실제 베어링·씰 변경은 q만 또는 c만 바꾸지 않을 수 있으므로 새 계수와 모드를 함께 검토한다. 막대는 이 학습 모델의 정규화 강성이다.':
    'Figure 7. With q fixed at 0.15k in the direct-q model, doubling the damping changes the threshold qcrit from 0.10k to 0.20k, moving toward stability. A real bearing or seal change may not alter only q or only c, so review the new coefficients and the modes together. The bars are normalized stiffness in this teaching model.',
  '현재 q': 'Current q',
  '현재 qcrit': 'Current qcrit',
  'c2배 qcrit': 'qcrit, 2× c',
  '강성 / k': 'Stiffness / k',
  'q = 0.15k 고정': 'q = 0.15k fixed',
};
export default EN;
