import type { Dict } from '../../translate';

/** src/figures/p5-7.ts 그림의 영어 (D-054). 키 = 그림 데이터의 한국어 원문 */
const EN: Dict = {
  '그림 1. 기어 상자 가속도의 스펙트럼 (설명용: 피니언 24이빨 1500 rpm = 25 Hz, 기어 37이빨 16.22 Hz, 맞물림 600 Hz). 위: 맞물림 1·2·3배가 솟아 있고, 측대역은 이 축척에서는 잡음 바닥과 잘 구별되지 않는다. 아래: 600 Hz 둘레를 확대했다. 피니언의 결함은 25 Hz 간격(파랑 점), 기어의 결함은 16.22 Hz 간격(초록 점)의 측대역을 세우는데, 두 무리가 섞여 눈으로 간격을 세기 어렵다.':
    'Figure 1. Spectrum of gearbox acceleration (illustrative: pinion 24 teeth, 1500 rpm = 25 Hz; gear 37 teeth, 16.22 Hz; mesh 600 Hz). Top: 1×, 2× and 3× the mesh frequency stand out, and at this scale the sidebands are hard to tell from the noise floor. Bottom: zoomed around 600 Hz. A pinion fault raises sidebands spaced 25 Hz apart (blue dots) and a gear fault raises sidebands spaced 16.22 Hz apart (green dots), but the two families are mixed and the spacing is hard to count by eye.',
  '② 600 Hz 둘레 확대': '② Zoom around 600 Hz',
  '그림 2. 같은 신호의 켑스트럼 — 스펙트럼의 로그를 한 번 더 푸리에 변환한 것으로, 가로축은 시간 단위의 quefrency다. 25 Hz 간격의 무리는 1/25 = 40 ms에 봉우리(0.071)를 세우고 그 정수배(80, 120 … ms, 라모닉)에도 선다 — 이 예시에서는 200·240 ms가 40 ms와 거의 같은 높이다. 16.22 Hz 간격의 무리는 61.7 ms(0.033)에 선다. 스펙트럼에서 섞여 있던 두 간격이 서로 다른 자리로 나뉜다.':
    'Figure 2. Cepstrum of the same signal — the Fourier transform of the log spectrum, with quefrency, which has units of time, on the horizontal axis. The family spaced 25 Hz apart puts a peak (0.071) at 1/25 = 40 ms and also at its integer multiples (80, 120 … ms, rahmonics) — in this example, 200 and 240 ms are almost as tall as 40 ms. The family spaced 16.22 Hz apart stands at 61.7 ms (0.033). The two spacings that were mixed in the spectrum are separated into different places.',
  '그림 5. 같은 기어 신호의 자기상관(신호를 지연시켜 자기 자신과 곱해 평균한 것). 맞물림 600 Hz가 신호의 대부분이라 1.67 ms마다 거의 1로 되돌아오며, 40 ms(0.952)가 20 ms(0.974)보다 두드러지지 않는다. 자기상관은 크기가 큰 성분의 주기를 보이고, 켑스트럼은 로그로 크기 차이를 눌러 작은 측대역 무리의 간격까지 보인다.':
    'Figure 5. Autocorrelation of the same gear signal (the signal delayed, multiplied by itself and averaged). The 600 Hz mesh is most of the signal, so it returns to nearly 1 every 1.67 ms, and 40 ms (0.952) does not stand out over 20 ms (0.974). Autocorrelation shows the period of the large components, while the cepstrum compresses size differences with the logarithm and so shows even the spacing of small sideband families.',
  '지연 τ [ms]': 'Lag τ [ms]',
  '그림 3. 리프터링: 켑스트럼의 일부를 지우고 스펙트럼으로 되돌린다. 위: 40 ms와 그 정수배를 지운 스펙트럼 — 그림 1 아래와 비교하면 피니언 무리(파랑 점 자리)의 측대역이 사라졌다(625 Hz에서 15 dB 낮아짐). 기어 무리(초록 점 자리)는 남는다. 아래: 5 ms보다 짧은 quefrency만 남기면(초록) 줄이 모두 사라지고 매끈한 바닥 모양만 남는다. 이 예시에는 구조 공진을 넣지 않아 거의 평평하지만, 실제 기계에서는 전달 경로·공진이 키우는 대역이 이 모양으로 드러난다 — 줄의 간격(원인)과 스펙트럼의 모양(전달 경로)을 나누는 생각이다.':
    'Figure 3. Liftering: erase part of the cepstrum and transform back to a spectrum. Top: the spectrum with 40 ms and its integer multiples erased — compared with the bottom of Figure 1, the sidebands of the pinion family (at the blue dots) are gone (15 dB lower at 625 Hz), while the gear family (at the green dots) remains. Bottom: keeping only quefrencies shorter than 5 ms (green) removes all the lines and leaves only the smooth underlying shape. This example has no structural resonance, so it is nearly flat, but in a real machine the bands boosted by the transmission path and resonances show up in this shape — the idea is to separate the line spacing (the cause) from the shape of the spectrum (the transmission path).',
  '① 40 ms와 그 정수배를 지운 뒤 (600 Hz 둘레)': '① After erasing 40 ms and its multiples (around 600 Hz)',
  '② 낮은 quefrency(< 5 ms)만 남기기 (0 ~ 2 kHz)': '② Keeping only low quefrency (< 5 ms) (0 – 2 kHz)',
  '원래': 'Original',
  '매끈한 모양': 'Smooth shape',
  '그림 4. 회전수를 모를 때: P5-6의 베어링 신호를 2800 ~ 3800 Hz만 남겨 구한 포락선의 자기상관. 지연 5.55 ms에 첫 봉우리(0.94)가 서고 그 정수배마다 되풀이된다. 1/5.55 ms = 180 Hz로, BPFO 179.2 Hz와 맞는다. 봉우리가 1보다 조금 낮은 것은 충격 크기·박자의 흔들림과 잡음 때문이다.':
    'Figure 4. When the rotating speed is unknown: autocorrelation of the envelope of the P5-6 bearing signal, obtained by keeping only 2800 – 3800 Hz. The first peak (0.94) stands at a lag of 5.55 ms and repeats at each integer multiple. 1/5.55 ms = 180 Hz, which matches the BPFO of 179.2 Hz. The peak is slightly below 1 because of variation in impact size and timing, and because of noise.',
  '그림 6. RMS가 모두 1인 네 신호의 시간영역 특징량. Crest factor(Peak/RMS)와 첨도는 드문 큰 값에 민감하고(드문 충격: CF 6.42, K 17.9), 왜도는 위아래가 다를 때만 0에서 벗어난다(위쪽이 눌린 정현파: S −0.42). 정현파는 CF 1.41·K 1.5, 정규 잡음은 K 3.02다.':
    'Figure 6. Time-domain features of four signals that all have RMS 1. Crest factor (Peak/RMS) and kurtosis are sensitive to rare large values (rare impacts: CF 6.42, K 17.9), and skewness departs from 0 only when the top and bottom differ (sine with flattened top: S −0.42). The sine has CF 1.41 and K 1.5, and normal noise has K 3.02.',
  '정현파 — CF 1.41, K 1.5, S 0': 'Sine — CF 1.41, K 1.5, S 0',
  '정규분포 잡음 — CF 3.39, K 3.02, S 0.016': 'Normal noise — CF 3.39, K 3.02, S 0.016',
  '드문 충격 — CF 6.42, K 17.9, S 0.83': 'Rare impacts — CF 6.42, K 17.9, S 0.83',
  '위쪽이 눌린 정현파 — CF 1.62, K 1.51, S −0.42': 'Flattened-top sine — CF 1.62, K 1.51, S −0.42',
  '그림 7. 외륜 결함이 진행하는 동안의 특징량 추세 (설명용 모델). 처음에는 드문 충격이 커져 첨도가 2.36에서 약 15까지(진행 55 % 근처), CF가 3.07에서 약 7까지 먼저 오른다. RMS는 그동안 0.087 → 0.31 g로 천천히 오른다. 손상이 넓어져 충격이 여기저기서 자주 생기면 RMS는 0.82 g까지 계속 오르지만, 첨도는 3.43로 정규 잡음 근처까지 내려온다. 첨도만 보면 말기를 "좋아졌다"고 오해할 수 있다.':
    'Figure 7. Trend of the features while an outer-race fault progresses (illustrative model). At first the rare impacts grow, so kurtosis rises first from 2.36 to about 15 (near 55 % progression) and CF from 3.07 to about 7. Over the same span RMS rises slowly, 0.087 → 0.31 g. When the damage spreads and impacts occur often in many places, RMS keeps rising to 0.82 g, but kurtosis comes down to 3.43, near normal noise. Looking only at kurtosis, one could mistake the late stage for "improved".',
  '충격이 커짐': 'Impacts grow',
  '손상이 넓어짐': 'Damage spreads',
  '첨도 K': 'Kurtosis K',
  '정규 잡음 3': 'Normal noise = 3',
  '결함 진행 [%] (설명용)': 'Fault progression [%] (illustrative)',
};

export default EN;
