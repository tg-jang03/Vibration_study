import type { Dict } from '../../translate';

const EN: Dict = {
  "모드 1: 동상 [10, 10] mm": 'Mode 1: in-phase [10, 10] mm',
  "모드 2: 역상 [10, −10] mm": 'Mode 2: anti-phase [10, −10] mm',
  "왼쪽만 당김 [10, 0] mm (중첩/맥놀이)": 'Left mass only [10, 0] mm (superposition/beating)',
  "비대칭 임의 [10, 4] mm": 'Asymmetric arbitrary [10, 4] mm',
  "질량 1 변위 x₁(t)": 'Mass 1 displacement x₁(t)',
  "질량 2 변위 x₂(t)": 'Mass 2 displacement x₂(t)',
  "x₁ 모드 1 성분 ({0} Hz)": 'x₁ mode 1 component ({0} Hz)',
  "x₁ 모드 2 성분 ({0} Hz)": 'x₁ mode 2 component ({0} Hz)',
  "현재 시점 t": 'Current time t',
  "가운데 연성 스프링 강성 kc": 'Middle coupling spring stiffness kc',
  "초기 변위 [x₁(0), x₂(0)]": 'Initial displacement [x₁(0), x₂(0)]',
  "질량 1 모드 성분 분해 표시": 'Show modal decomposition of mass 1',
  "슬로우 모션 (0.35x)": 'Slow motion (0.35x)',
  "약한 결합 (kc = 0.1k, 맥놀이)": 'Weak coupling (kc = 0.1k, beating)',
  "표준 결합 (kc = k)": 'Standard coupling (kc = k)',
  "1차 고유진동수 f₁": '1st natural frequency f₁',
  "2차 고유진동수 f₂": '2nd natural frequency f₂',
  "진동수 비 f₂ / f₁": 'Frequency ratio f₂ / f₁',
  "모드 1 형상 비 x₂ / x₁": 'Mode 1 shape ratio x₂ / x₁',
  "모드 2 형상 비 x₂ / x₁": 'Mode 2 shape ratio x₂ / x₁',
  "처음 변위 중 모드 1 몫": 'Mode 1 share of the initial displacement',
  "처음 변위 중 모드 2 몫": 'Mode 2 share of the initial displacement',
  "맥놀이 주기 1 / (f₂ − f₁)": 'Beat period 1 / (f₂ − f₁)',
  "초기 조건을 \"모드 1: 동상 [10, 10] mm\"으로 두고 재생해 보세요. 두 질량의 변위 파형이 완전히 포개지며, 주파수는 f₁ 하나뿐인가요? 가운데 스프링의 길이는 어떻게 되나요?":
    'Set the initial condition to "Mode 1: in-phase [10, 10] mm" and play. Do the displacement waveforms of the two masses overlap exactly, with only one frequency, f₁? What happens to the length of the middle spring?',
  "두 질량이 같은 방향으로 정확히 같이 움직이므로 x₁(t) = x₂(t)가 되어 두 파형이 완전히 포개집니다. 두 질량 사이의 상대 거리가 일정하므로 가운데 스프링은 늘어나지도 줄어들지도 않습니다.":
    'The two masses move together in exactly the same direction, so x₁(t) = x₂(t) and the two waveforms overlap exactly. The distance between the masses is constant, so the middle spring is neither stretched nor compressed.',
  "초기 조건을 \"모드 2: 역상 [10, −10] mm\"으로 바꾸어 보세요. 두 질량이 서로 반대로 마주보며 움직이고 주파수가 f₂로 높아집니다. kc = 1000 N/m일 때 f₂/f₁ 비율은 얼마인가요?":
    'Change the initial condition to "Mode 2: anti-phase [10, −10] mm". The two masses move toward and away from each other and the frequency rises to f₂. What is the ratio f₂/f₁ when kc = 1000 N/m?',
  "두 질량이 반대 위상으로 마주보며 움직이므로 가운데 스프링이 2배로 강하게 압축/인장되어 유효 강성이 k + 2kc가 됩니다. kc = k일 때 f₂/f₁ 비율은 정확히 √3 ≈ 1.732배입니다.":
    'The two masses move in opposite phase, so the middle spring is compressed and stretched twice as much and the effective stiffness becomes k + 2kc. When kc = k, the ratio f₂/f₁ is exactly √3 ≈ 1.732.',
  "초기 조건을 \"왼쪽만 당김 [10, 0] mm\"으로 두고, \"질량 1 모드 성분 분해 표시\"를 켜보세요. 질량 1의 울렁거리는 복잡한 파형은 모드 1과 모드 2 성분으로 어떻게 분해되나요?":
    'Set the initial condition to "Left mass only [10, 0] mm" and turn on "Show modal decomposition of mass 1". How does the complicated, wobbling waveform of mass 1 split into mode 1 and mode 2 components?',
  "초기 변위 [10, 0] mm는 모드 1 성분 5 mm와 모드 2 성분 5 mm의 정확한 1:1 합입니다. 따라서 x₁(t)는 5.03 Hz 정현파와 8.72 Hz 정현파가 더해져 울렁거리는 모양을 만듭니다.":
    'The initial displacement [10, 0] mm is an exact 1:1 sum of a 5 mm mode 1 component and a 5 mm mode 2 component. So x₁(t) is a 5.03 Hz sinusoid plus an 8.72 Hz sinusoid, which makes the wobbling shape.',
  "약한 결합 (kc = 0.1k) 버튼을 누르고 \"왼쪽만 당김\" 상태로 재생해 보세요. 에너지가 질량 1에서 질량 2로 갔다가 다시 돌아오는 맥놀이 주기는 얼마인가요?":
    'Press the "Weak coupling (kc = 0.1k)" button and play with "Left mass only". What is the beat period at which energy goes from mass 1 to mass 2 and back?',
  "kc = 100 N/m일 때 f₁ ≈ 5.033 Hz, f₂ ≈ 5.513 Hz로 주파수 차이가 0.480 Hz에 불과합니다. 따라서 에너지가 두 질량 사이를 오가는 맥놀이 주기는 T_beat = 1/Δf ≈ 2.08초입니다.":
    'With kc = 100 N/m, f₁ ≈ 5.033 Hz and f₂ ≈ 5.513 Hz, a frequency difference of only 0.480 Hz. So the beat period at which energy swings between the two masses is T_beat = 1/Δf ≈ 2.08 s.',
  "2자유도 모드와 에너지 교환": '2-DOF modes and energy exchange',
  "일시정지": 'Pause',
  "다시 재생": 'Replay',
  "재생": 'Play',
  "처음으로 (t=0)": 'Back to start (t=0)',
  "진행 시간:": 'Elapsed time:',
  "시간 t [s]": 'Time t [s]',
  "변위 [mm]": 'Displacement [mm]',
};

export default EN;
