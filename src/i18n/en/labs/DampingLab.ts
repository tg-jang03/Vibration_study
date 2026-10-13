import type { Dict } from '../../translate';

const EN: Dict = {
  '감쇠 없음': 'Undamped',
  '부족감쇠: 진동하며 복귀': 'Underdamped: returns while oscillating',
  '임계감쇠: 진동 없이 가장 빠르게 복귀': 'Critically damped: returns fastest without oscillating',
  '과감쇠: 진동 없이 천천히 복귀': 'Overdamped: returns slowly without oscillating',
  '변위 x(t)': 'Displacement x(t)',
  '평형 위치': 'Equilibrium',
  '위쪽 포락선': 'Upper envelope',
  '아래쪽 포락선': 'Lower envelope',
  '같은 방향의 피크': 'Same-direction peaks',
  '감쇠는 몇 주기 동안 진동을 남길까?': 'For how many cycles does damping leave the vibration?',
  '감쇠비 ζ': 'Damping ratio ζ',
  '고유진동수 fₙ': 'Natural frequency fₙ',
  '처음 변위 x₀': 'Initial displacement x₀',
  '포락선 표시': 'Show envelope',
  '같은 방향 피크 표시': 'Show same-direction peaks',
  '진동하지 않고 평형으로 복귀': 'returns to equilibrium without oscillating',
  '현재 상태:': 'Current state:',
  '전체 2초 파형에서 읽은 박자와 줄어드는 속도': 'Rhythm and decay rate read from the full 2 s waveform',
  '감쇠 주파수비 ωd/ωₙ': 'Damped frequency ratio ωd/ωₙ',
  '다음/이전 양의 피크 (파형)': 'Next/previous positive peak (waveform)',
  '대수감쇠율 δ (파형)': 'Logarithmic decrement δ (waveform)',
  'δ로 추정한 ζ': 'ζ estimated from δ',
  '진폭 반감까지': 'Until amplitude halves',
  '주기': 'cycles',
  'ζ = 0.05에서 첫 양의 피크 1.00에 대한 다음 양의 피크의 비와 반감 주기 수는 얼마인가요?':
    'At ζ = 0.05, with the first positive peak at 1.00, what are the ratio of the next positive peak and the number of cycles to half amplitude?',
  '다음/이전 피크는 약 0.730, 대수감쇠율은 0.3146, 반감까지는 약 2.20주기입니다.':
    'The next/previous peak ratio is about 0.730, the logarithmic decrement is 0.3146, and half amplitude takes about 2.20 cycles.',
  'ζ를 0.05에서 0.20으로 올리면 박자와 진폭 감소 중 무엇이 더 크게 달라지나요?':
    'When you raise ζ from 0.05 to 0.20, which changes more: the rhythm or the amplitude decay?',
  '진폭 감소가 훨씬 크게 달라집니다. ωd/ωₙ은 약 0.999에서 0.980으로 조금 줄지만, 진폭은 매 주기 훨씬 빠르게 감소합니다.':
    'The amplitude decay changes much more. ωd/ωₙ drops only slightly, from about 0.999 to 0.980, but the amplitude falls far faster every cycle.',
  'fₙ을 5 Hz에서 10 Hz로 올리면 반감 주기 수와 반감 시간은 각각 어떻게 되나요?':
    'When you raise fₙ from 5 Hz to 10 Hz, what happens to the number of cycles to half amplitude and to the half-amplitude time?',
  'ζ가 같으면 반감 주기 수는 같습니다. 하지만 한 주기가 절반으로 짧아지므로 초 단위 반감 시간도 절반이 됩니다.':
    'With the same ζ, the number of cycles to half amplitude is the same. But one cycle becomes half as long, so the half-amplitude time in seconds is also halved.',
  'ζ를 1.00과 1.50으로 올리면 평형을 지나 반대쪽으로 넘어가나요?':
    'When you raise ζ to 1.00 and 1.50, does the mass pass through equilibrium to the other side?',
  '넘어가지 않습니다. 임계감쇠와 과감쇠 모두 진동 없이 같은 쪽에서 평형으로 돌아옵니다.':
    'No. Both critical damping and overdamping return to equilibrium from the same side without oscillating.',
  'm = 1 kg, v₀ = 0인 점성 감쇠 1자유도계. 피크 비·δ는 그려진 파형의 첫 두 양의 피크에서 재고, 이론은 δ = 2πζ/√(1−ζ²)입니다. ζ ≥ 1이거나 2초 안에 같은 방향 피크가 둘 없으면 읽음값을 —로 표시합니다.':
    'A viscously damped single-degree-of-freedom system with m = 1 kg and v₀ = 0. The peak ratio and δ are measured from the first two positive peaks of the drawn waveform; the theory is δ = 2πζ/√(1−ζ²). If ζ ≥ 1, or there are not two same-direction peaks within 2 s, the readouts show —.',
  '아래는 전체 2초 파형입니다. 피크 비·대수감쇠율은 재생 시각과 관계없이 이 전체 구간의 첫 두 양의 피크에서 계산합니다.':
    'Below is the full 2 s waveform. The peak ratio and logarithmic decrement are computed from the first two positive peaks of this whole interval, regardless of the playback time.',
  '시간 t [s]': 'Time t [s]',
  '변위 x [mm]': 'Displacement x [mm]',
  '감쇠비에 따라 줄어드는 자유진동 변위와 포락선, 같은 방향의 연속 피크':
    'Free-vibration displacement that shrinks with the damping ratio, with the envelope and successive same-direction peaks',
};

export default EN;
