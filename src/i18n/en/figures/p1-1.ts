import type { Dict } from '../../translate';

/** src/figures/p1-1.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 — 빠진 것은 src/i18n/figures.test.ts가 보여 준다 */
const EN: Dict = {
  // 그림 1
  '그림 1. 책상 끝에 눌러 둔 자를 아래로 당긴 순간. 왼쪽 빗금은 자를 붙잡아 둔 곳(책상 끝과 누르는 손)이다. 회색 점선은 힘이 균형을 이루는 원래 자리이고, 파랑 선은 당겨진 자다. 손을 놓으면 자는 원래 자리 쪽으로 움직이지만 거기서 바로 멈추지 않는다.':
    'Figure 1. The moment a ruler pressed against a desk edge is pulled down. The hatching on the left is where the ruler is held (the desk edge and the pressing hand). The gray dashed line is the original position where the forces balance, and the blue line is the pulled ruler. When you let go, the ruler moves toward its original position but does not stop there.',
  '당겼다가 손을 놓기 직전': 'Just before letting go',
  '당김': 'Pulled',
  '평형 위치': 'Equilibrium position',
  // 그림 2
  '그림 2. 위: 질량이 평형 위치에 있으면 스프링이 되돌리려는 힘은 0이다. 아래: 질량을 오른쪽으로 x만큼 옮기면 스프링은 왼쪽으로 F = −kx의 복원력을 낸다. 마이너스 부호는 힘이 변위와 반대 방향이라는 뜻이다.':
    'Figure 2. Top: when the mass is at the equilibrium position, the spring exerts no restoring force. Bottom: move the mass to the right by x and the spring produces a restoring force F = −kx to the left. The minus sign means the force points opposite to the displacement.',
  '평형: x = 0, 복원력 = 0': 'Equilibrium: x = 0, force = 0',
  '평형': 'Equilibrium',
  '오른쪽으로 당김: x > 0, 복원력은 왼쪽': 'Pulled right: x > 0, force to the left',
  '늘어난 스프링 k': 'Stretched spring k',
  '변위 x': 'Displacement x',
  '복원력 F = −kx': 'Restoring force F = −kx',
  // 그림 3
  '그림 3. 질량 1 kg, 강성 1000 N/m인 계를 10 mm 당겼다 놓은 한 주기. 끝점(+10 mm, −10 mm)에서는 방향을 바꾸느라 잠깐 멈추고, 평형점(x = 0)을 지날 때 가장 빠르다. 같은 상태로 돌아오는 데 걸린 시간 T는 0.1987 s다.':
    'Figure 3. One cycle of a system with a 1 kg mass and a stiffness of 1000 N/m, pulled 10 mm and released. At the end points (+10 mm, −10 mm) it stops for a moment to reverse direction, and it is fastest when passing the equilibrium point (x = 0). The time T it takes to return to the same state is 0.1987 s.',
  '끝점: 멈춤': 'End point: stopped',
  '평형점: 가장 빠름': 'Equilibrium: fastest',
  '반대쪽 끝점': 'Opposite end point',
  '주기 T = 0.1987 s': 'Period T = 0.1987 s',
  '시간 t [s]': 'Time t [s]',
  '변위 x [mm]': 'Displacement x [mm]',
  // 그림 4
  '그림 4. 감쇠가 없는 한 주기 동안 에너지가 머무는 곳. 끝점에서는 움직임이 멈춰 스프링에 에너지가 모두 저장되고, 평형점에서는 스프링이 원래 길이로 돌아와 질량의 움직임에 에너지가 모두 있다. 두 에너지의 합(회색 점선)은 일정하다.':
    'Figure 4. Where the energy sits during one undamped cycle. At the end points the motion stops and all the energy is stored in the spring; at the equilibrium point the spring is back at its natural length and all the energy is in the motion of the mass. The sum of the two energies (gray dashed line) is constant.',
  '스프링에 저장': 'Stored in spring',
  '질량의 움직임': 'Motion of mass',
  '합계': 'Total',
  '끝점': 'End point',
  '평형점': 'Equilibrium',
  '한 주기 안의 시간 [s]': 'Time within one cycle [s]',
  '전체 에너지에 대한 비율': 'Fraction of total energy',
  // 그림 5
  '그림 5. 책상 끝의 자, 그네, 기초 위의 기계는 생김새가 다르지만 같은 두 질문으로 단순화할 수 있다. 무엇이 움직이는 질량인가? 무엇이 원래 자리로 되돌리는 힘을 만드는가? 오른쪽 끝은 기초 위 기계를 예로 그 답을 질량 m과 스프링 k로 바꿔 그린 모델이다. 세 물체 각각에서 무엇이 m과 k인지는 아래 표에 정리했다.':
    'Figure 5. A ruler on a desk edge, a swing and a machine on a foundation look different, but the same two questions simplify them: what is the moving mass, and what creates the force that pulls it back to its original place? The right end redraws the answer for the machine on a foundation as a model with a mass m and a spring k. What plays m and k in each of the three objects is summarized in the table below.',
  '책상 끝의 자': 'Ruler on desk edge',
  '그네': 'Swing',
  '기초 위 기계': 'Machine on foundation',
  '모양은 달라도: 관성 m + 복원력 k': 'Different shapes: inertia m + restoring force k',
};

export default EN;
