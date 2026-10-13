import type { Dict } from '../../translate';

const EN: Dict = {
  '전동기-펌프 (불평형 + 정렬 불량 + 전기 + 베인)': 'Motor-pump (unbalance + misalignment + electrical + vanes)',
  '감속기 입력축 (기어 결함)': 'Gearbox input shaft (gear fault)',
  '벨트 구동 팬 (풀림)': 'Belt-driven fan (looseness)',
  '하모닉 무리': 'Harmonic cluster',
  '켑스트럼': 'Cepstrum',
  '자기상관': 'Autocorrelation',
  '추정한 1X의 정수배': 'Integer multiples of estimated 1X',
  '참 1X': 'True 1X',
  '하모닉 무리 점수': 'Harmonic cluster score',
  '후보 f₀ [Hz]': 'Candidate f₀ [Hz]',
  '지연 [ms]': 'Lag [ms]',
  '회전수 추정: 회전수를 모를 때 1X 찾기': 'Speed estimation: finding 1X when the speed is unknown',
  '기록': 'Record',
  '방법 (그래프)': 'Method (graph)',
  '정답(참 회전수) 보기': 'Show the answer (true speed)',
  '세 방법의 추정 (후보 5 ~ 100 Hz)': 'Estimates of the three methods (candidates 5 to 100 Hz)',
  '펌프 기록에서 세 방법이 같은 답을 내나요? 다르다면 어느 쪽이 의심스러운가요?':
    'In the pump record, do the three methods give the same answer? If not, which one is suspect?',
  '하모닉 무리(약 3573 rpm)와 자기상관(약 3576 rpm)은 맞고, 켑스트럼은 약 1792 rpm으로 절반을 고릅니다. 2극 전동기(동기 3600 rpm)라는 명판 정보와 맞는 쪽이 3575 rpm 근처입니다.':
    'The harmonic cluster (about 3573 rpm) and autocorrelation (about 3576 rpm) are right, while the cepstrum picks half, about 1792 rpm. The nameplate information of a 2-pole motor (synchronous 3600 rpm) agrees with the values near 3575 rpm.',
  '감속기 기록에서 자기상관은 왜 틀리나요?': 'In the gearbox record, why is the autocorrelation wrong?',
  '맞물림 571 Hz가 신호의 대부분이라 자기상관이 그 짧은 주기에 덮여, 5 ~ 100 Hz 후보에서 엉뚱한 봉우리를 고릅니다 (P5-7). 하모닉 무리와 켑스트럼(측대역 간격)은 입력축 1490 rpm 근처를 찾습니다.':
    'The 571 Hz mesh makes up most of the signal, so the autocorrelation is buried by its short period and picks a wrong peak among the 5 to 100 Hz candidates (P5-7). The harmonic cluster and the cepstrum (sideband spacing) find values near the input shaft speed of 1490 rpm.',
  '풀림 팬 기록에서 하모닉 무리와 켑스트럼은 몇 rpm을 고르나요? 왜 그럴까요?':
    'In the loose-fan record, what rpm do the harmonic cluster and the cepstrum pick? Why?',
  '둘 다 약 590 rpm, 참값(1180 rpm)의 절반을 고릅니다. 풀림의 ½X 분수 하모닉 때문에 ½X 간격의 무리가 생겼기 때문입니다. 이번에는 자기상관이 맞습니다. 방법 하나로 정하지 말고, 키페이저·명판·운전 조건 변화로 확인합니다.':
    'Both pick about 590 rpm, half of the true value (1180 rpm), because the ½X fractional harmonics of looseness create a cluster with ½X spacing. This time the autocorrelation is right. Do not settle on one method; confirm with a keyphasor, the nameplate and a change of operating condition.',
  '설명용 합성 신호의 수평 가속도를 속도로 바꿔 썼습니다 (f_s 16384 Hz, 2초, 하모닉 무리·켑스트럼은 0 ~ 2048 Hz 속도 스펙트럼, 자기상관은 속도 파형). 그래프 위 스펙트럼의 주황 점선은 고른 방법이 찾은 1X의 정수배입니다.':
    'The horizontal acceleration of an illustrative synthetic signal was converted to velocity (f_s 16384 Hz, 2 s; the harmonic cluster and cepstrum use the 0 to 2048 Hz velocity spectrum, the autocorrelation the velocity waveform). The orange dotted lines on the spectrum above the graph are integer multiples of the 1X found by the chosen method.',
  '수평 속도 스펙트럼 (주황 점선 = {0}이 찾은 {1} Hz의 정수배)': 'Horizontal velocity spectrum (orange dotted = integer multiples of the {1} Hz found by {0})',
  '속도': 'Velocity',
  '주파수 [Hz]': 'Frequency [Hz]',
  '속도 스펙트럼과 추정한 1X': 'Velocity spectrum and estimated 1X',
};

export default EN;
