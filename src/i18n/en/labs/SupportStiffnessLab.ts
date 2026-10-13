import type { Dict } from '../../translate';

const EN: Dict = {
  '직렬 예제의 고유진동수': 'Natural frequency of the series example',
  '지지 강성 무한대 극한': 'Infinite-support-stiffness limit',
  '현재 값': 'Current value',
  '받침대를 단단하게 하면 어디까지 바뀔까?': 'How far does stiffening the support change things?',
  '지지 강성 k_sup': 'Support stiffness k_sup',
  '질량 m': 'Mass m',
  '처음 값': 'Reset',
  '한 방향 직렬 예제 (축 1, 베어링 2 MN/m 고정)': 'One-direction series example (shaft 1, bearing 2 MN/m fixed)',
  '등가 강성 k_eq': 'Equivalent stiffness k_eq',
  '고유진동수 fₙ': 'Natural frequency fₙ',
  '지지 강성 무한대 fₙ': 'fₙ at infinite support stiffness',
  'm = 100 kg에서 지지 강성을 1 → 0.25 MN/m로 낮추면?': 'At m = 100 kg, what if you lower the support stiffness from 1 to 0.25 MN/m?',
  '고유진동수가 약 10.07 → 6.786 Hz로 내려갑니다. 로터 질량과 축의 강성을 바꾸지 않아도 지지의 변형이 영향을 줍니다.': 'The natural frequency drops from about 10.07 to 6.786 Hz. Even without changing the rotor mass or the shaft stiffness, the deformation of the support has an effect.',
  '지지를 4 MN/m로 키우면 1 MN/m 때의 fₙ이 두 배가 되나요?': 'If you raise the support to 4 MN/m, does fₙ double compared with 1 MN/m?',
  '아닙니다. 약 12.03 Hz입니다. 축과 베어링에도 변형이 남아 있어, 이 모델의 극한은 약 12.99 Hz입니다.': 'No. It is about 12.03 Hz. The shaft and bearing still deform, so the limit of this model is about 12.99 Hz.',
  '초기화하고 질량만 200 kg으로 바꾸면?': 'Reset, then change only the mass to 200 kg?',
  '등가 강성은 같고 fₙ은 1/√2배인 약 7.118 Hz가 됩니다.': 'The equivalent stiffness is the same and fₙ becomes 1/√2 times as much, about 7.118 Hz.',
  '같은 힘을 받는 무질량 직렬 스프링 3개와 질량 1개의 교육용 모델입니다. 실제 축계의 베어링 배치·방향·분포 질량·감쇠·회전 효과는 계산하지 않습니다.': 'An educational model of three massless springs in series, carrying the same force, and one mass. Bearing layout, direction, distributed mass, damping and rotating effects of a real shaft train are not calculated.',
  '지지 강성 k_sup [MN/m]': 'Support stiffness k_sup [MN/m]',
  '고유진동수 fₙ [Hz]': 'Natural frequency fₙ [Hz]',
  '지지 강성이 커지면 고유진동수가 증가하지만 축과 베어링의 변형 때문에 극한에 가까워지는 곡선': 'Curve in which the natural frequency rises as the support stiffness grows but approaches a limit because of shaft and bearing deformation',
};

export default EN;
