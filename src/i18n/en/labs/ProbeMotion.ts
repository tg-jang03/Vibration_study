import type { Dict } from '../../translate';

const EN: Dict = {
  "근접 프로브 앞으로 축이 돈다. 지금 gap {0} mm, 출력 {1} V. 오른쪽에 출력 전압이 그려진다.": "A shaft rotates past a proximity probe. Current gap {0} mm, output {1} V. The output voltage is plotted on the right.",
  "근접 프로브": "Proximity probe",
  "흠집": "Scratch",
  "축 ↺ (움직임·굴곡은 크게 과장)": "Shaft ↺ (motion and shape greatly exaggerated)",
  "출력 전압 [V] (두 바퀴) — gap이 커지면 더 음으로": "Output [V] (two revolutions) — larger gap gives more negative voltage",
  "V (평균 gap)": "V (mean gap)",
  "1바퀴": "1 revolution",
  "2바퀴": "2 revolutions",
  "프로브는 바로 앞 축 표면까지의 거리(gap)를 전압으로 바꿉니다. 축이 센서 쪽으로 오면(진동) gap이 줄어 전압이 덜 음으로,": "The probe converts the distance (gap) to the shaft surface directly ahead into voltage. When the shaft moves toward the sensor (vibration), the gap shrinks and voltage becomes less negative;",
  " 멀어지면 더 음으로 갑니다.": " as it moves away, voltage becomes more negative.",
  " 표면이 깎인 곳(흠집·타원 — 기계적 런아웃)이나 재질이 다른 곳(보라 무늬 — 전기적 런아웃)이 지나가면 축이 흔들리지 않아도 전압이 바뀝니다. 그래서 저속에서도 이 무늬가 남습니다.": " When a recessed surface (scratch or ovality — mechanical runout) or a different material region (purple pattern — electrical runout) passes, voltage changes even without shaft vibration. This pattern therefore remains at low speed.",
  "지금 진동": "Current vibration"
};

export default EN;
