import type { Dict } from '../../translate';

const EN: Dict = {
  "느리게": "Slow",
  "보통": "Normal",
  "빠르게": "Fast",
  "{0} — 1초에 {1}번 왕복 ({2})": "{0} — {1} cycles per second ({2})",
  "속도계": "Velocity pickup",
  "가속도계": "Accelerometer",
  "질량이 바닥보다 크게(바닥의 {0}배) 흔들립니다": "The mass moves more than the base ({0} times the base motion)",
  "질량은 공간에서 거의 멈춰 있고(바닥의 {0}배) 케이스만 그 둘레를 오갑니다": "The mass barely moves in space ({0} times the base motion), while the case moves around it",
  "질량이 케이스와 거의 함께 움직입니다(바닥의 {0}배)": "The mass moves almost with the case ({0} times the base motion)",
  "질량은 바닥의 {0}배로 움직입니다": "The mass moves {0} times as much as the base",
  "코일은 이 상대 운동의 빠르기를 읽습니다": "The coil reads the speed of this relative motion",
  "압전 소자는 이 늘어남(r이 작을 때 바닥 가속도에 비례)을 읽습니다": "The piezoelectric element reads this extension (proportional to base acceleration when r is small)",
  "평탄 대역(±10 %) 안입니다": "Within the flat band (±10 %)",
  "실제보다 크게 읽습니다": "Reads above the actual value",
  "실제보다 작게 읽습니다": "Reads below the actual value",
  "r = {0}: {1}. 스프링 늘어남 z는 바닥 움직임의 {2}배이고, {3}. 그래서 {4}는 실제의 {5}배로 읽습니다 — {6}.": "r = {0}: {1}. Spring extension z is {2} times the base motion, and {3}. So the {4} reads {5} times the actual value — {6}.",
  "보기": "View",
  "고유진동수 아래 (r = 0.2)": "Below natural frequency (r = 0.2)",
  "고유진동수 근처 (r = 1)": "Near natural frequency (r = 1)",
  "고유진동수 위 (r = 5)": "Above natural frequency (r = 5)",
  "랩의 시험 주파수 (": "Lab test frequency (",
  "{0} 케이스 안의 질량과 스프링. {1}": "Mass and spring inside the {0} case. {1}",
  "질량의 제자리": "Mass rest position",
  "기계 표면": "Machine surface",
  "케이스": "Case",
  "바닥(케이스) ━": "Base (case) ━",
  "질량 ━": "Mass ━",
  "(공간에서 본 높이)": "(height in space)",
  "스프링 늘어남 z = 센서가 읽는 것": "Spring extension z = sensor input",
  "z의 크기 = 바닥의 ": "z amplitude = ",
  "배 (그림은 크기를 따로 맞춤)": " × base motion (sizes scaled separately)",
  " 그림은 상자 안에 들어가게 크기를 맞췄고 재생 속도는 위 선택(실제 대비 배율)대로입니다 (센서 고유진동수 ": " The drawing is scaled to fit the box; playback follows the selected speed (relative to real time) above (sensor natural frequency "
};

export default EN;
