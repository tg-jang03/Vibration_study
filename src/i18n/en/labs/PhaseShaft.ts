import type { Dict } from '../../translate';

const EN: Dict = {
  "축이 {0} rpm으로 반시계로 돈다. 홈이 키페이저 앞을 지날 때 펄스, high spot이 진동 센서 앞에 올 때 봉우리. 그 사이 {1} ms = 위상 {2}°.": "The shaft turns counterclockwise at {0} rpm. The notch passing the Keyphasor produces a pulse; the high spot reaching the vibration sensor produces a peak. The interval is {1} ms = phase {2}°.",
  "키페이저 자리": "Keyphasor section",
  "진동 센서 자리": "Vibration section",
  "같은 축 · 회전 ↺": "Same shaft · rotation ↺",
  "키페이저": "Keyphasor",
  "펄스": "Pulse",
  "진동 센서": "Vibration sensor",
  "가장 가까움": "Closest",
  "키페이저 출력 [V]": "Keyphasor output [V]",
  "진동 센서 [µm] (센서 쪽 +)": "Vibration [µm] (+ toward sensor)",
  "Δt (지연각) = {0} ms": "Δt (lag angle) = {0} ms",
  "같은 축의 두 단면입니다. 왼쪽 단면의 홈이 키페이저 프로브 앞을 지나는 순간 펄스가 뜨고(0°), 오른쪽 단면의 ": "These are two sections of the same shaft. A pulse occurs (0°) when the notch in the left section passes the Keyphasor probe. In the right section, the ",
  "(주황 점 — 축이 센서 쪽으로 가장 많이 나온 쪽, 움직임은 확대)이 진동 센서 앞에 오면 신호가 봉우리입니다. 그 사이 축이 돈 각도가 위상 φ = ": "(orange dot — the part protruding farthest toward the sensor, with motion exaggerated) produces a signal peak when it reaches the vibration sensor. The angle turned between these events is phase φ = ",
  "°이고, 축 위에 그린 주황 호(점선 = 홈 방향)와 같습니다. \"처음으로\"(펄스 순간)에서 high spot은 위에서 시계 방향으로 φ인 자리에 있습니다 — 아래 Polar 화살표가 가리키는 쪽입니다. 이 그림의 Δt는 위상 관례와 상관없이 지연각(펄스 → 양의 봉우리)입니다.": "°, shown by the orange arc on the shaft (dashed line = notch direction). At \"Reset\" (the pulse), the high spot is φ clockwise from the top — the direction of the Polar arrow below. In this figure Δt always represents lag (pulse → positive peak), regardless of the phase convention."
};

export default EN;
