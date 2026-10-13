import type { Dict } from '../../translate';

/** src/figures/p1-9.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  // 그림 1
  '그림 1. 3000 rpm·날개 12장의 예시. 50 Hz(40 µm)·100 Hz(20 µm)·600 Hz(10 µm)를 더하면 맨 아래 한 줄이 된다. 세 응답과 합은 같은 시간·변위 축이다.':
    'Figure 1. An example with 3000 rpm and 12 blades. Adding 50 Hz (40 µm), 100 Hz (20 µm) and 600 Hz (10 µm) gives the single line at the bottom. The three responses and the sum share the same time and displacement axes.',
  '1X 응답: 50 Hz': '1X response: 50 Hz',
  '2X 응답: 100 Hz': '2X response: 100 Hz',
  '날개 통과 응답: 600 Hz': 'Blade-pass response: 600 Hz',
  '센서 신호 = 세 응답의 합': 'Sensor signal = sum of the three responses',
  // 그림 2
  '그림 2. 순문제는 힘과 기계의 성질을 주고 응답을 계산한다. 역문제는 응답을 주고 힘과 기계의 성질을 추정한다. 미지수가 여러 개라 추가 증거가 필요하다.':
    'Figure 2. In the forward problem, the force and the machine properties are given and the response is calculated. In the inverse problem, the response is given and the force and machine properties are estimated. There are several unknowns, so additional evidence is needed.',
  '순문제: 알고 시작': 'Forward: start from knowns',
  '힘 + 질량·감쇠·강성': 'Force + mass·damping·stiffness',
  '응답 예측': 'Predict response',
  '역문제: 측정에서 시작': 'Inverse: start from measurement',
  '측정 응답 + 추가 증거': 'Measured response + evidence',
  '원인 후보 비교': 'Compare candidate causes',
  // 그림 3
  '그림 3. 같은 강성 10⁶ N/m·감쇠비 0.05의 두 계. 고유진동수 100 Hz에는 30.1 N, 50 Hz에는 4 N을 가하면 둘 다 50 Hz·40 µm가 된다. 힘 기준의 위상 지연은 각각 3.81°·90°로 다르다.':
    'Figure 3. Two systems with the same stiffness 10⁶ N/m and damping ratio 0.05. Applying 30.1 N to the one with a 100 Hz natural frequency and 4 N to the one with 50 Hz gives 50 Hz and 40 µm in both. The phase lags relative to the force differ: 3.81° and 90°.',
  '응답 진폭은 같지만 필요한 힘과 기계의 성질은 다르다': 'Same response amplitude, but different force and machine properties',
  // 그림 4
  '그림 4. 50 Hz·40 µm와 100 Hz·20 µm는 그대로 두고 2X의 시작 위상만 0° → 180°로 바꿨다. t = 0의 합은 60 → 20 µm, 파형 모양도 달라진다. 성분 크기를 바꾸지 않아도 합은 변한다.':
    'Figure 4. 50 Hz·40 µm and 100 Hz·20 µm are kept, and only the starting phase of 2X is changed from 0° to 180°. The sum at t = 0 goes from 60 to 20 µm, and the waveform shape changes too. The sum changes even though no component size changed.',
  '2X 시작 위상 0°': '2X starting phase 0°',
  '2X 시작 위상 180°': '2X starting phase 180°',
  // 그림 7
  '그림 7. 100 ms마다 충격을 받고 85 Hz로 울리는 구조 응답 예시. 포락선의 감쇠 시정수는 25 ms다. 한 응답도 여러 주파수 막대를 만들므로 막대 수가 원인 수는 아니다.':
    'Figure 7. An example of a structural response hit by an impact every 100 ms and ringing at 85 Hz. The decay time constant of the envelope is 25 ms. A single response also creates several frequency bars, so the number of bars is not the number of causes.',
  '충격 뒤 감쇠하는 울림이 되풀이된다': 'The decaying ring after an impact repeats',
  '같은 응답을 주파수별 크기로 보면': 'The same response by size at each frequency',
  '성분 진폭 [µm]': 'Component amplitude [µm]',
  // 그림 5
  '그림 5. 2X는 회전수와 함께 80 → 140 Hz로 움직이지만, 60 Hz 전원의 2 f_L은 120 Hz 그대로다. 3600 rpm에서는 둘이 겹친다. 운전조건을 바꿔 보면 후보를 비교하기 쉬워진다(P1-8의 주파수 지도).':
    'Figure 5. 2X moves from 80 to 140 Hz with the speed, but 2 f_L of the 60 Hz supply stays at 120 Hz. At 3600 rpm the two overlap. Changing the operating condition makes the candidates easier to compare (the frequency map of P1-8).',
  '회전 관련 2X': 'Rotation-related 2X',
  '전원 관련 2 f_L': 'Supply-related 2 f_L',
  '같은 120 Hz': 'Same 120 Hz',
  // 그림 6
  '그림 6. 그림 1의 합 신호에서 계산한 세 중심 주파수의 크기. 50·100·600 Hz에 40·20·10 µm가 있다. P1-8 지도와 달리 막대의 높이에도 뜻이 있다. 여기서는 중심 막대만 표시했다.':
    'Figure 6. The sizes at the three center frequencies calculated from the summed signal of Figure 1. There are 40, 20 and 10 µm at 50, 100 and 600 Hz. Unlike the P1-8 map, the height of a bar also means something. Only the central bars are shown here.',
};

export default EN;
