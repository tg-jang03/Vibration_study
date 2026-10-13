import type { Dict } from '../../translate';

const EN: Dict = {
  '주파수 영역 (÷ j2πf)': 'Frequency domain (÷ j2πf)',
  '시간 영역 (샘플 누적합)': 'Time domain (cumulative sum of samples)',
  '속도 (한 번 적분)': 'Velocity (integrate once)',
  '변위 (두 번 적분)': 'Displacement (integrate twice)',
  '없음': 'None',
  '켠 직후 저주파 흔들림 (0.01 g)': 'Low-frequency wobble just after startup (0.01 g)',
  '직류 오프셋 (0.0005 g)': 'DC offset (0.0005 g)',
  '둘 다': 'Both',
  '없음 (기계 성분만)': 'None (machine components only)',
  '실제': 'True',
  '적분 결과': 'Integration result',
  '적분 결과 스펙트럼': 'Integration result spectrum',
  '적분 & ski-slope: 가속도 → 속도 → 변위': 'Integration & ski slope: acceleration → velocity → displacement',
  '센서 쪽 문제': 'Sensor-side problem',
  '적분 방식': 'Integration method',
  '결과': 'Result',
  '하한 컷오프 (2차 고역 통과)': 'Low cutoff (2nd-order high-pass)',
  '1X는 25 Hz': '1X is 25 Hz',
  '1X에서 고역 통과 크기': 'High-pass magnitude at 1X',
  '하한 컷오프 없음: ': 'no low cutoff: ',
  '에서 ': ' gives ',
  '1X 진폭 ({0} pk)': '1X amplitude ({0} pk)',
  '5 Hz 아래 최대 ({0} pk)': 'Max below 5 Hz ({0} pk)',
  '1 ~ 2 s 파형 최대 ({0})': 'Waveform max over 1 to 2 s ({0})',
  '처음 상태(주파수 영역, 속도, 컷오프 없음, 낮은 주파수 흔들림)에서 5 Hz 아래 최대와 1X를 비교해 보세요. 컷오프를 5 Hz로 올리면?':
    'In the initial state (frequency domain, velocity, no cutoff, low-frequency wobble), compare the max below 5 Hz with 1X. What happens when you raise the cutoff to 5 Hz?',
  '컷오프가 없으면 5 Hz 아래가 18.2 mm/s로 1X(3.99 mm/s)보다 큽니다 — ski-slope입니다. 5 Hz면 0.71 mm/s로 내려가고 1X는 3.98 mm/s로 거의 그대로입니다.':
    'With no cutoff, below 5 Hz is 18.2 mm/s, larger than 1X (3.99 mm/s) — that is the ski slope. With 5 Hz it drops to 0.71 mm/s and 1X stays almost the same at 3.98 mm/s.',
  '컷오프를 20 Hz로 올려 보세요. 1X 진폭은 몇 % 깎이나요? 1X가 5 Hz인 느린 기계라면?':
    'Raise the cutoff to 20 Hz. By how many percent is the 1X amplitude cut? What if it were a slow machine with 1X at 5 Hz?',
  '1X가 3.36 mm/s로 약 16 % 깎입니다(1/√(1 + 0.8⁴) = 0.84). 1X가 5 Hz(300 rpm)인 기계에 5 Hz 컷오프를 걸면 1X가 0.71배가 되므로, 이런 기계는 컷오프를 훨씬 낮추거나 변위·속도를 직접 재는 센서(P3-1)를 씁니다.':
    '1X drops to 3.36 mm/s, about 16 % lower (1/√(1 + 0.8⁴) = 0.84). On a machine with 1X at 5 Hz (300 rpm), a 5 Hz cutoff makes 1X 0.71 times, so for such a machine you lower the cutoff much further or use a sensor that measures displacement or velocity directly (P3-1).',
  '센서 쪽 문제를 "직류 오프셋", 방식을 "시간 영역", 컷오프 없음으로 두고 속도와 변위를 차례로 보세요. 그다음 컷오프 5 Hz를 걸어 보세요.':
    'Set the sensor-side problem to "DC offset", the method to "time domain" and no cutoff, and look at velocity and then displacement. Then apply a 5 Hz cutoff.',
  '속도는 1초에 4.9 mm/s씩 떠내려가 2초에 9.8 mm/s, 변위는 mm 단위까지 벌어집니다(실제 변위는 30 µm Peak 남짓, 약 61 µm p-p). 5 Hz 고역 통과를 먼저 걸면 둘 다 실제 값 근처에 머뭅니다. 주파수 영역 적분은 DC bin을 0으로 두므로 오프셋에 끌려가지 않습니다.':
    'The velocity drifts by 4.9 mm/s every second, reaching 9.8 mm/s at 2 seconds, and the displacement strays to the mm level (the real displacement is a little over 30 µm peak, about 61 µm p-p). With a 5 Hz high-pass applied first, both stay near the real values. Frequency-domain integration sets the DC bin to 0, so it is not pulled by the offset.',
  '시간 [s]': 'Time [s]',
  '속도 [mm/s]': 'Velocity [mm/s]',
  '변위 [µm]': 'Displacement [µm]',
  '적분 결과 시간파형': 'Integration result time waveform',
  '주파수 [Hz]': 'Frequency [Hz]',
  '속도 [mm/s pk]': 'Velocity [mm/s pk]',
  '변위 [µm pk]': 'Displacement [µm pk]',
};

export default EN;
