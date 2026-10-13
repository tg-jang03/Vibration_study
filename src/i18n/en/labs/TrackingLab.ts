import type { Dict } from '../../translate';

/** LAB-FLT-02 TrackingLab 영어 (D-054). 키 = 소스의 한국어 원문 — 뼈대는 node scripts/i18n/scan-lab.mjs TrackingLab */
const EN: Dict = {
  "올림 (런업 600 → 3600 rpm)": 'Up (run-up 600 → 3600 rpm)',
  "내림 (코스트다운 3600 → 600 rpm)": 'Down (coastdown 3600 → 600 rpm)',
  "실시간 (한 방향)": 'Real-time (one direction)',
  "저장된 기록 (두 번 거르기)": 'Stored record (filter twice)',
  "참값 (그 회전수의 정상 응답)": 'True value (steady response at that speed)',
  "트래킹 필터": 'Tracking filter',
  "읽은 봉우리": 'Peak read',
  "참값": 'True value',
  "직접 (거르지 않음)": 'Direct (unfiltered)',
  "참 Not-1X (2X + 0.45X + 잡음)": 'True Not-1X (2X + 0.45X + noise)',
  "Not-1X (노치 뒤)": 'Not-1X (after notch)',
  "봉우리 회전수": 'Peak speed',
  "봉우리 크기": 'Peak amplitude',
  "위상 90° 회전수": 'Speed at 90° phase',
  "3600 rpm에서 크기 흔들림 (표준편차)": 'Amplitude ripple at 3600 rpm (standard deviation)',
  "3600 rpm: 직접 RMS": '3600 rpm: direct RMS',
  "노치가 남긴 1X (런업 중 가장 큰 RMS)": '1X left by the notch (largest RMS during the run-up)',
  "트래킹 필터와 노치: 런업에서 1X 벡터 뽑기": 'Tracking filter and notch: extracting the 1X vector in a run-up',
  "회전수 변화": 'Speed change',
  "가속률": 'Acceleration rate',
  "트래킹 필터 폭 B": 'Tracking filter bandwidth B',
  "1X를 가운데 둔 −3 dB 폭 (저역 통과 차단 = B/2)": '−3 dB width centered on 1X (low-pass cutoff = B/2)',
  "거르기": 'Filtering',
  "넓은 대역 잡음 σ": 'Wide-band noise σ',
  "노치로 1X 지우기 (Not-1X 보기)": 'Remove 1X with a notch (show Not-1X)',
  "두 번 거르기: 지연": 'Filtering twice: lag',
  "크기 응답": 'amplitude response',
  "저역 통과는 2차 Butterworth(P5-1)입니다. 실시간 필터는 τ_g만큼 늦게 읽으므로, 그동안 회전수가 ΔN만큼 지나갑니다.":
    'The low-pass is a 2nd-order Butterworth (P5-1). A real-time filter reads late by τ_g, so the speed passes by ΔN in the meantime.',
  "읽음값 (이론 = 참 응답에서 같은 방법으로 읽은 값)": 'Readings (theory = value read the same way from the true response)',
  "올림·200 rpm/s·B = 0.5 Hz·실시간에서 B를 2 Hz로 넓히면 봉우리와 AF는 어떻게 되나요? 대신 무엇을 잃나요?":
    'With Up, 200 rpm/s, B = 0.5 Hz and real-time, what happens to the peak and the AF if you widen B to 2 Hz? What do you lose in return?',
  "봉우리가 3197 rpm·76.5 µm pp에서 3066 rpm·98.9 µm pp로, AF가 5.9에서 10.0으로 참값(3008 rpm·100 µm pp·AF 9.9)에 가까워집니다. 대신 3600 rpm에서 크기 흔들림이 약 0.5에서 0.9 µm pp로 커집니다.":
    'The peak goes from 3197 rpm, 76.5 µm pp to 3066 rpm, 98.9 µm pp, and the AF from 5.9 to 10.0, closer to the true values (3008 rpm, 100 µm pp, AF 9.9). In return, the amplitude ripple at 3600 rpm grows from about 0.5 to 0.9 µm pp.',
  "올림·실시간에서 50 rpm/s·B = 0.5 Hz로 두면? 200 rpm/s·B = 2 Hz와 비교해 보세요.":
    'With Up and real-time, what if you set 50 rpm/s and B = 0.5 Hz? Compare with 200 rpm/s and B = 2 Hz.',
  "둘 다 봉우리가 약 3065 rpm·99 µm pp로 거의 같습니다. 지연 동안 지나가는 회전수 R·τ_g가 50 × 0.9 = 200 × 0.225 = 45 rpm으로 같기 때문입니다. 결과를 정하는 것은 B 하나가 아니라 가속률과의 짝입니다.":
    'Both give almost the same peak, about 3065 rpm and 99 µm pp. This is because the speed passed during the lag, R·τ_g, is the same: 50 × 0.9 = 200 × 0.225 = 45 rpm. What decides the result is not B alone but B together with the acceleration rate.',
  "200 rpm/s·B = 0.5 Hz·실시간에서 회전수 변화를 \"내림\"으로 바꾸면 봉우리는 어느 쪽으로 밀리나요?":
    'With 200 rpm/s, B = 0.5 Hz and real-time, if you switch the speed change to "Down", which way is the peak pushed?',
  "아래로, 2864 rpm으로 밀립니다. 실시간 필터는 늘 지나온 회전수를 보여 주므로, 런업(3197 rpm)과 코스트다운의 봉우리가 333 rpm 벌어집니다. 둘을 같은 B로 비교할 때 이 차이를 기계의 변화로 읽지 않도록 합니다.":
    'Downward, to 2864 rpm. A real-time filter always shows the speed it has already passed, so the run-up peak (3197 rpm) and the coastdown peak end up 333 rpm apart. When comparing the two with the same B, do not read this difference as a change in the machine.',
  "올림·200 rpm/s·B = 0.5 Hz에서 거르기를 \"저장된 기록 (두 번 거르기)\"로 바꾸면 봉우리 회전수와 크기는?":
    'With Up, 200 rpm/s and B = 0.5 Hz, if you switch filtering to "Stored record (filter twice)", what are the peak speed and amplitude?',
  "지연이 없어져 봉우리가 3038 rpm, 위상 90°가 2997 rpm으로 거의 제자리에 옵니다. 그러나 크기는 69.0 µm pp로 더 깎입니다. 두 번 거르면 크기 응답이 |H|²라 더 좁은 필터가 되기 때문입니다. B를 2 Hz로 넓히면 97.6 µm pp까지 돌아옵니다.":
    'The lag disappears, so the peak is at 3038 rpm and the 90° phase at 2997 rpm, almost back in place. But the amplitude is shaved more, to 69.0 µm pp, because filtering twice makes the amplitude response |H|², which is a narrower filter. Widening B to 2 Hz brings it back to 97.6 µm pp.',
  "노치를 켜고(50 rpm/s, B = 2 Hz, 잡음 1 µm) 3300 rpm 위에서 직접과 Not-1X를 비교하세요. B를 0.5 Hz로 좁히면 임계속도 근처의 Not-1X는?":
    'Turn the notch on (50 rpm/s, B = 2 Hz, noise 1 µm) and compare Direct and Not-1X above 3300 rpm. If you narrow B to 0.5 Hz, what happens to the Not-1X near the critical speed?',
  "0.45X가 생기면 Not-1X는 약 2.3에서 4.9 µm로 두 배가 넘게 커지지만, 직접 RMS는 1X에 가려 거의 그대로입니다. B를 0.5 Hz로 좁히면 임계속도 근처에서 1X가 빨리 변하는 것을 노치가 따라가지 못해, 남은 1X가 최대 약 10.5 µm로 Not-1X를 크게 부풀립니다.":
    'When 0.45X appears, Not-1X more than doubles from about 2.3 to 4.9 µm, while the direct RMS is hidden by 1X and barely changes. Narrowing B to 0.5 Hz means the notch cannot follow the quick change of 1X near the critical speed, and the leftover 1X, up to about 10.5 µm, greatly inflates the Not-1X.',
  "신호는 설명용 예시입니다: P4-1의 예시 로터(고유 회전수 {0} rpm, ζ {1}, 편심 {2} µm)의 1X 정상 응답 + 2X {3} µm pp + 0.45X({4} → {5} rpm에서 0 → {6} µm pp) + 넓은 대역 잡음, f_s {7} Hz. 회전체가 공진에 자리 잡는 시간(약 64 ms)이 짧아 1X는 그 회전수의 정상 응답으로 두었으므로, 이 랩에서 참값과의 어긋남은 모두 필터 때문입니다. 실제 회전체는 빨리 지나가면 자체 과도 응답으로도 봉우리가 같은 방향으로 조금 밀립니다(이 로터를 200 rpm/s로 지나면 약 30 rpm, 800 rpm/s면 약 90 rpm). 양 끝 회전수에서 {8}초씩 머문 기록이며, 1X가 2 µm pp보다 작은 곳은 위상을 그리지 않습니다.":
    'The signal is an illustrative example: the steady 1X response of the P4-1 example rotor (natural speed {0} rpm, ζ {1}, eccentricity {2} µm) + 2X {3} µm pp + 0.45X (0 → {6} µm pp from {4} → {5} rpm) + wide-band noise, f_s {7} Hz. The time for the rotor to settle at resonance (about 64 ms) is short, so 1X is taken as the steady response at that speed, and every deviation from the true value in this lab is therefore due to the filter. A real rotor passing quickly also has its peak pushed a little in the same direction by its own transient response (about 30 rpm for this rotor at 200 rpm/s, about 90 rpm at 800 rpm/s). The record dwells {8} s at each end speed, and phase is not drawn where 1X is smaller than 2 µm pp.',
  "1X 크기 (Bode)": '1X amplitude (Bode)',
  "회전수 [rpm]": 'Speed [rpm]',
  "1X 크기 Bode": '1X amplitude Bode',
  "1X 위상 (지연각)": '1X phase (lag angle)',
  "1X 위상 Bode": '1X phase Bode',
  "직접 RMS (0.25초마다)": 'Direct RMS (every 0.25 s)',
  "직접 RMS": 'Direct RMS',
  "Not-1X RMS (노치 뒤, 세로 눈금이 다르다)": 'Not-1X RMS (after notch, note the different vertical scale)',
};

export default EN;
