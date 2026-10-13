import type { Dict } from '../../translate';

/** src/figures/p7-6.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. P7-1의 감속기: 입력 피니언(23이빨, 1490 rpm)이 출력 기어(61이빨)를 돌린다. 이빨 한 쌍이 맞물렸다가 다음 쌍에 넘겨줄 때마다 힘이 한 번 출렁인다. 피니언이 한 바퀴 돌 때 23번이므로 맞물림 주파수는 23 × 24.83 = 571.2 Hz이고, 같은 시간에 기어 쪽에서도 같은 이빨들이 61 × 9.363 = 571.2 Hz로 맞물린다. 두 축은 회전수가 다르지만 맞물림 줄은 하나다.':
    'Figure 1. The P7-1 reducer: the input pinion (23 teeth, 1490 rpm) drives the output gear (61 teeth). Each time one pair of teeth engages and hands over to the next pair, the force surges once. That happens 23 times per pinion turn, so the mesh frequency is 23 × 24.83 = 571.2 Hz, and on the gear side the same engagements occur at 61 × 9.363 = 571.2 Hz. The two shafts turn at different speeds, but there is only one mesh line.',
  '기어 z₂ = 61': 'Gear z₂ = 61',
  '피니언 z₁ = 23': 'Pinion z₁ = 23',
  '맞물림 점': 'Mesh point',
  '피니언 한 바퀴 = 맞물림 23번': 'One pinion turn = 23 engagements',
  '회전수비 f₁ / f₂ = z₂ / z₁ = 2.652': 'Speed ratio f₁ / f₂ = z₂ / z₁ = 2.652',
  '그림 2. 맞물림 둘레 확대 (GMF ± 125 Hz, 기록 8 s, Δf = 0.125 Hz). 위: 피니언이 편심이면 맞물림이 피니언 한 바퀴에 한 번 세졌다 약해져 측대역이 f₁ = 24.83 Hz 간격으로 선다 (첫 쌍 19 % · 19 %). 아래: 기어가 편심이면 같은 맞물림 줄 옆에 f₂ = 9.363 Hz 간격으로 선다. 측대역 간격이 어느 축이 결함인지 알려 준다.':
    'Figure 2. Zoom around the mesh (GMF ± 125 Hz, 8 s record, Δf = 0.125 Hz). Top: if the pinion is eccentric, the mesh strengthens and weakens once per pinion turn, so sidebands stand at a spacing of f₁ = 24.83 Hz (first pair 19 % · 19 %). Bottom: if the gear is eccentric, they stand beside the same mesh line at a spacing of f₂ = 9.363 Hz. The sideband spacing tells which shaft is faulty.',
  '피니언 편심': 'Pinion eccentric',
  '기어 편심': 'Gear eccentric',
  '그림 3. 위: 피니언 6번 이빨과 기어 18번 이빨이 함께 상한 감속기의 8초 기록 (포락선(P5-6)의 짧은 구간마다 가장 큰 값). 두 이빨은 LCM(23, 61) = 1403번 맞물림마다 한 번 만나 2.456 s(피니언 61바퀴 = 기어 23바퀴)마다 큰 충격을 낸다 (헌팅 투스 주파수 0.4071 Hz). 아래: 같은 이빨 쌍이 다시 만나기까지의 맞물림 수 LCM(z₁, z₂). 23·61, 24·37처럼 공약수가 없으면 길고, 24·36(공약수 12)이나 20·60처럼 공약수가 크면 같은 쌍이 자주 만난다.':
    'Figure 3. Top: an 8 s record of a reducer in which pinion tooth 6 and gear tooth 18 are both damaged (the largest envelope (P5-6) value in each short interval). The two teeth meet once every LCM(23, 61) = 1403 engagements and make a large impact every 2.456 s (61 pinion turns = 23 gear turns) (hunting tooth frequency 0.4071 Hz). Bottom: the number of engagements until the same tooth pair meets again, LCM(z₁, z₂). It is long when there is no common divisor, as with 23·61 or 24·37, and the same pair meets often when the common divisor is large, as with 24·36 (common divisor 12) or 20·60.',
  '포락선 최댓값 [g]': 'Envelope maximum [g]',
  '잇수 z₁ · z₂': 'Teeth z₁ · z₂',
  '맞물림 수': 'Engagements',
  '그림 4. 결함마다의 가속도 스펙트럼 (dB re 1 g, 0 ~ 3.5 kHz, 초록 띠 = 맞물림 공진 대역 2.2 ~ 3 kHz). 건전: GMF 0.86 g, 2×GMF ÷ GMF = 0.35. 마모: 2×·3×GMF가 커지고(0.79 · 0.46) 공진 대역이 3.6배로 오른다. 편심: 줄 무리는 그대로이고 GMF 옆에 측대역 한 쌍(그림 2). 깨진 이: 측대역이 넓게 많이 선다(기어 간격으로 GMF의 1 %를 넘는 줄 30개). 백래시(부하 30 %): 맞물림마다 크기가 제각각인 충격이 공진 대역 전체를 9.2배로 올린다. 설명용 모델이며 크기는 판정 기준이 아니다.':
    'Figure 4. Acceleration spectrum for each fault (dB re 1 g, 0 to 3.5 kHz, green band = mesh resonance band 2.2 to 3 kHz). Healthy: GMF 0.86 g, 2×GMF ÷ GMF = 0.35. Wear: 2× and 3×GMF grow (0.79 · 0.46) and the resonance band rises 3.6 times. Eccentricity: the group of lines is unchanged, with one pair of sidebands beside the GMF (Figure 2). Broken tooth: sidebands stand wide and many (30 lines above 1 % of the GMF at the gear spacing). Backlash (load 30 %): impacts of varying size at each engagement raise the whole resonance band 9.2 times. This is an illustrative model, and the sizes are not criteria.',
  '건전 (부하 80 %)': 'Healthy (load 80 %)',
  '마모 (기어)': 'Wear (gear)',
  '편심 (기어)': 'Eccentric (gear)',
  '깨진 이 (기어 18번)': 'Broken tooth (gear 18)',
  '백래시 과다 (부하 30 %)': 'Excess backlash (load 30 %)',
  '그림 5. 같은 결함들의 가속도 파형 (처음 250 ms). 편심은 맞물림 파형의 크기가 기어 한 바퀴(106.8 ms)마다 한 번 커졌다 작아진다. 깨진 이는 그 이빨이 맞물릴 때(점선)마다 한 번 크게 친다(봉우리 약 2.5 g, 맞물림 물결은 약 1.3 g) — 간격이 기어 한 바퀴다. 백래시는 맞물림마다 작은 충격이 제각각의 크기로 섞여 파형이 거칠어진다.':
    'Figure 5. Acceleration waveforms of the same faults (first 250 ms). With eccentricity, the size of the mesh waveform grows and shrinks once per gear turn (106.8 ms). With a broken tooth, a large hit occurs once each time that tooth engages (dotted lines) (peak about 2.5 g, mesh ripple about 1.3 g) — the spacing is one gear turn. With backlash, small impacts of varying size mix in at each engagement and the waveform becomes rough.',
  '건전': 'Healthy',
  '그림 6. 부하를 바꾸며 본 숫자. 위: GMF 줄은 건전·백래시 모두 부하와 함께 커진다 (0.44 → 1 g) — GMF가 크다고 바로 결함은 아니다. 아래: 맞물림 공진 대역의 RMS는 건전하면 부하와 거의 상관없지만(0.015 ~ 0.02 g), 백래시가 크면 부하가 가벼울수록 커진다 (부하 20 %에서 0.16 g, 100 %에서 0.02 g). 이가 서로 떨어졌다 부딪히는 일은 부하가 이를 눌러 줄 때 줄어든다.':
    'Figure 6. Numbers seen while changing the load. Top: the GMF line grows with load for both healthy and backlash (0.44 → 1 g) — a large GMF is not by itself a fault. Bottom: the RMS of the mesh resonance band is almost independent of load when healthy (0.015 to 0.02 g), but with large backlash it grows the lighter the load (0.16 g at 20 % load, 0.02 g at 100 %). Teeth separating and striking each other decreases when the load presses them together.',
  '부하 [%]': 'Load [%]',
  '백래시 과다': 'Excess backlash',
  '공진 대역 RMS [g]': 'Resonance band RMS [g]',
  '그림 7. 기어 18번 이빨이 깨진 감속기를 축마다 TSA한 뒤 Residual(맞물림 하모닉과 1X·2X를 뺀 것)을 본다. 위: 기어 축 기준 15바퀴 평균 — 102°(18번 이빨 자리)에 충격 하나가 선다 (FM4 = 100). 아래: 피니언 축 기준 40바퀴 평균 — 기어의 충격은 피니언 각도로는 매번 다른 자리에 와서 평균에서 사라진다 (FM4 = 3.5, 건전한 감속기를 같은 방법으로 보면 3.6).':
    'Figure 7. A reducer with gear tooth 18 broken, TSA-averaged per shaft, then the Residual (with the mesh harmonics and 1X·2X removed) is examined. Top: average of 15 turns on the gear shaft — one impact stands at 102° (the position of tooth 18) (FM4 = 100). Bottom: average of 40 turns on the pinion shaft — the gear impact falls at a different pinion angle each time and vanishes in the average (FM4 = 3.5; 3.6 for a healthy reducer seen the same way).',
  '기어 축 TSA (15바퀴) → Residual': 'Gear shaft TSA (15 turns) → Residual',
  '그 축의 각도 [°] (키페이저 = 0°)': 'Angle of that shaft [°] (keyphasor = 0°)',
  '18번 이빨': 'Tooth 18',
  '피니언 축 TSA (40바퀴) → Residual': 'Pinion shaft TSA (40 turns) → Residual',
  '그림 8. 켑스트럼 (5 ~ 250 ms). 주황 점선은 피니언 한 바퀴(1/f₁ = 40.27 ms)의 정수배, 초록 점선은 기어 한 바퀴(1/f₂ = 106.8 ms)의 정수배다. 위: 피니언 이빨이 깨지면 1/f₁ 자리에 0.11 (건전 0.0092). 아래: 기어 이빨이 깨지면 1/f₂ 자리에 0.17 (건전 0.0064). 측대역 무리 전체의 간격이 봉우리 하나로 모인다 (P5-7).':
    'Figure 8. Cepstrum (5 to 250 ms). The orange dotted lines are integer multiples of one pinion turn (1/f₁ = 40.27 ms), the green dotted lines of one gear turn (1/f₂ = 106.8 ms). Top: with a broken pinion tooth, 0.11 at 1/f₁ (healthy 0.0092). Bottom: with a broken gear tooth, 0.17 at 1/f₂ (healthy 0.0064). The spacing of the whole group of sidebands gathers into one peak (P5-7).',
  '깨진 이 (피니언 6번)': 'Broken tooth (pinion 6)',
};

export default EN;
