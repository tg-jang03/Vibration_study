import type { Dict } from '../../translate';

/** src/figures/p6-3.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 공통
  'X [µm] (좌우를 옮겨 표시)': 'X [µm] (shifted sideways)',
  '변위 [µm]': 'Displacement [µm]',
  'AC 변위 [µm]': 'AC displacement [µm]',
  '왼쪽: 직접 · 오른쪽: 실제 1X 필터': 'Left: direct · Right: real 1X filter',
  // 그림 1
  '그림 1. 3000 rpm·1X 20 µm Peak의 X/Y를 같은 시각끼리 짝지으면 반지름 20 µm 원이 됩니다. X/Y는 각각 40 µm p-p입니다. 키페이저는 20 ms마다 찍히지만 같은 자리에서 겹칩니다. 평균 축 위치(DC)는 넣지 않았습니다.':
    'Figure 1. Pairing X and Y (3000 rpm, 1X 20 µm Peak) at the same instants gives a circle of radius 20 µm. X and Y are each 40 µm p-p. The Keyphasor dot is placed every 20 ms, but it lands on the same spot each time. The average shaft position (DC) is not included.',
  '한 바퀴의 X/Y · 점선은 키페이저 시각': 'X/Y over one rev · dashed = Keyphasor',
  '같은 시각의 짝 (동일 축척)': 'Same-instant pairs (equal scale)',
  // 그림 2
  '그림 2. 같은 바나나 예제: X 1X 20, Y 1X 12 + 2X 12 µm Peak. 왼쪽 직접 오빗에는 2X가 섞이고, 오른쪽 실제 1X 트래킹 필터에는 X/Y 약 20/12 µm Peak의 타원이 남습니다. 4초 준비 후·띠 폭 4 Hz이며 작은 필터 잔여는 남습니다. 좌우는 비교를 위해 옮겨 그렸습니다.':
    'Figure 2. The same banana example: X 1X 20, Y 1X 12 + 2X 12 µm Peak. The direct orbit on the left contains 2X; the real 1X tracking filter on the right leaves an ellipse of about 20/12 µm Peak in X/Y. It uses a 4 s settling time and a 4 Hz bandwidth, and a small filter residue remains. The two orbits are shifted sideways for comparison.',
  // 그림 3
  '그림 3. blank→dot 관례를 지정했습니다. 시간은 빈 구간에서 검은 점으로 들어와 화살표 쪽으로 이어집니다. 왼쪽 반시계는 반시계 자전과 같은 정방향, 오른쪽 시계는 역방향입니다. 두 경우 크기와 점 자리는 같아, 점 위치 하나만으로 방향을 알 수 없습니다.':
    'Figure 3. The blank→dot convention is used. Time runs from the gap into the black dot and continues toward the arrow. The counterclockwise orbit on the left is forward, in the same direction as the counterclockwise shaft rotation; the clockwise one on the right is reverse. Both have the same size and dot position, so the dot position alone cannot tell you the direction.',
  '시간 순서: 왼쪽 반시계 · 오른쪽 시계': 'Time order: left CCW · right CW',
  점: 'dot',
  // 그림 4
  '그림 4. 위: 원(X/Y 1X 20/20)과 타원(20/10 µm Peak). 아래: Y의 2X 12를 더한 바나나, Y를 2X 20만으로 만든 8자. 원·타원은 1X만으로 만들 수 있고, 이 8자는 Y 1X가 0입니다. 2X가 섞여도 매 축 한 바퀴마다 같은 점이 찍힙니다. 형태는 성분·위상 예제이며 결함을 지정하지 않았습니다.':
    'Figure 4. Top: a circle (X/Y 1X 20/20) and an ellipse (20/10 µm Peak). Bottom: a banana with 2X 12 added to Y, and a figure-eight with Y made of 2X 20 only. Circles and ellipses can be made with 1X alone, and this figure-eight has a Y 1X of 0. Even with 2X mixed in, the dot lands on the same spot every shaft revolution. The shapes are examples of components and phase; no fault is assigned to them.',
  '왼쪽: 원 · 오른쪽: 타원': 'Left: circle · Right: ellipse',
  '왼쪽: 바나나 · 오른쪽: 8자': 'Left: banana · Right: figure-eight',
  // 그림 5
  '그림 5. 왼쪽: 정방향 1X 20 + 1/2X 12 µm의 합은 두 축 바퀴 동안 내부 루프를 만듭니다. 오른쪽: 1X 20 + 3X 8 µm의 합은 꽃잎처럼 찌그러지고, 정방향 3X가 커서 안쪽에 작은 내부 루프 두 개도 생깁니다. 여기서 루프/꽃잎은 합성식의 결과입니다. 접촉이나 유막 불안정의 발생·힘을 계산한 결과가 아닙니다.':
    'Figure 5. Left: the sum of forward 1X 20 + 1/2X 12 µm makes an inner loop over two shaft revolutions. Right: the sum of 1X 20 + 3X 8 µm is distorted into petals, and because the forward 3X is large, two small inner loops also appear inside. Here the loops and petals are the result of a synthetic formula. They are not a calculation of the onset or forces of contact or fluid-film instability.',
  '왼쪽: 내부 루프 (두 바퀴) · 오른쪽: 꽃잎': 'Left: inner loop (2 revs) · Right: petals',
  // 그림 6
  '그림 6. 각 패널은 축 8바퀴·펄스 8번입니다. 위 1/2X·1/3X는 각각 2·3자리, 아래 0.43X는 8자리(k = 0과 k = 7은 3.6° 차이로 거의 겹쳐 보임)이고 2X는 1자리입니다. 끝 시각의 중복 펄스는 세지 않았습니다. 0.43X는 매 바퀴 154.8° 이동하며 정확히 43/100X라면 100바퀴 뒤 반복합니다. 점 개수는 표시 구간·성분 구성에 달려 차수 자체가 아닙니다.':
    'Figure 6. Each panel has 8 shaft revolutions and 8 pulses. At the top, 1/2X and 1/3X give 2 and 3 positions; at the bottom, 0.43X gives 8 positions (k = 0 and k = 7 differ by 3.6° and look almost on top of each other) and 2X gives 1 position. The duplicate pulse at the end time is not counted. 0.43X moves 154.8° every revolution and, if it is exactly 43/100X, repeats after 100 revolutions. The number of dots depends on the displayed span and the components, so it is not the order itself.',
  '왼쪽: 1/2X (2자리) · 오른쪽: 1/3X (3자리)': 'Left: 1/2X (2 spots) · Right: 1/3X (3 spots)',
  '왼쪽: 0.43X (8자리) · 오른쪽: 2X (1자리)': 'Left: 0.43X (8 spots) · Right: 2X (1 spot)',
  // 그림 7
  '그림 7. 원래 X의 상단을 12 µm에서 자르고 평균을 뺐습니다. 위 파형의 평평한 면이 아래 직접 오빗에도 나타납니다. 직접 X는 32 µm p-p, 실제 1X 필터는 17.15 µm Peak(= 34.3 µm p-p)입니다. 1X 타원이 매끈해져도 원 신호 왜곡은 남습니다. 같은 절단은 접촉과 측정 포화의 원인을 구별해 주지 않습니다.':
    'Figure 7. The top of the original X was clipped at 12 µm and the mean was removed. The flat side of the waveform above also appears in the direct orbit below. The direct X is 32 µm p-p, and the real 1X filter gives 17.15 µm Peak (= 34.3 µm p-p). Even if the 1X ellipse becomes smooth, the distortion of the raw signal remains. The same clipping does not tell contact apart from measurement saturation as the cause.',
  'X 직접 파형: 상단 절단 후 AC': 'Direct X waveform: AC after top clip',
};

export default EN;
