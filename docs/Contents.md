# Contents — 사이트 콘텐츠 목록 & 사양

> 사이트에 실제로 들어가는 페이지, 랩, 기호·수식, 검증값, 참고자료의 **단일 목록**이다. 구현하기 전에 여기에 사양을 먼저 쓰고, 진행에 따라 상태를 갱신한다.
> Part 1 ~ 11 구축이 끝나 무엇을 가르치나(옛 `Curriculum.md`)와 개념 척추·기준값은 `archive/`에 있다 (D-055). 지금 기준은 페이지·코드·테스트다.
> 원본 커리큘럼: `source/curriculum.md` (읽기 전용). 원본과 달라진 내용은 `Issues.md`(유형: 콘텐츠)에 근거와 함께 기록한다.
> **읽는 법 (D-030)**: 통째로 읽지 않는다. `grep -n "^##" docs/Contents.md`로 목차를 보고 필요한 절만 읽는다 — 기호·식 §3, 페이지 상태 §4, 랩 §5(`grep -n "LAB-XXX"`).

## 0. 상태 표기

`계획`(개요만 있음) → `사양`(이 문서에 구현 사양 작성) → `구현중` → `검토` → `완료`

## 1. 페이지 작성 기준

작성 방법(톤, 뼈대, 그림, 강조 상자, 랩 배치, 수식, 체크리스트)은 **`docs/PageGuide.md`** (D-028). 개념 순서는 `Glossary.md`의 "처음 나오는 곳"으로 확인한다. 구축 때 쓴 Part별 개념 척추(옛 §1-2)는 `archive/ContentsBuild.md` (D-055).

## 2. 랩 사양 템플릿

```
#### LAB-XXX-00 이름
- 페이지 · 마일스톤 · 상태
- 목적: 이 랩으로 무엇을 체감하나 (1문장)
- 신호: SignalSpec 기본값
- 조작: 컨트롤 (범위, 기본값)
- 출력: 플롯, 읽음값
- 수식: 살아있는 수식 (§3 기호)
- 실험 과제: 예측 → 확인
- 검증: 단위테스트로 확인할 값 (해석해·문헌값, 출처는 테스트 머리 주석)
```

구현할 때는 `LabFrame`의 칸에 그대로 대응시킨다: 조작 → `controls`, 출력(플롯) → children, 수식 → `formulas`, 읽음값 → `readouts`(`ReadoutTable`), 실험 과제 → `tasks`(질문 + 접힌 확인).

## 3. 공통 기호·수식 표기 (단일 기준)

| 기호 | 의미 | 단위 | 비고 |
|---|---|---|---|
| f_s | 샘플링 주파수 | Hz | f_s = 2.56 F_max |
| F_max | 분석 최대 주파수 | Hz | |
| f_N | 나이퀴스트 주파수 | Hz | f_N = f_s / 2 |
| LOR | 분해능 라인 수 (Lines of Resolution) | — | 100, 200, 400, 800, 1600, 3200, 6400 |
| N | 프레임 샘플 수 | — | 패딩이 없으면 FFT 크기와 같음. N = 2.56 LOR (LOR 400 → N 1024) |
| N_FFT | 제로패딩 후 FFT 크기 | — | N_FFT ≥ N, 2의 거듭제곱. 패딩이 없으면 N_FFT = N |
| T | 프레임 길이 (측정 시간) | s | T = N / f_s = 1 / Δf |
| Δf | 주파수 분해능 (bin 간격) | Hz | Δf = f_s / N = F_max / LOR |
| n, k | 시간 샘플 / 주파수 bin 인덱스 | — | |
| δ | 톤의 bin 오프셋 | bin | f = (k₀ + δ) Δf |
| x(t) | 참(연속) 신호 — 정현파 성분은 A·cos(2π f t + φ) | SI | A: 피크 진폭, φ: 위상 [rad]. 모든 랩 공통 (M1.1, `lib/dsp/signal.ts`) |
| 도는 화살표 (위상자, Phasor) | 길이 A, 각도 θ = 2πft + φ로 반시계로 도는 화살표. 끝의 높이 = x(t) | — | 그림에서 신호 축은 위(0°), φ = 출발 각도(반시계 +). 꼬리-머리로 이으면 끝 = 성분의 합. 오빗만 x 오른쪽·y 위 (D-044, `lib/dsp/phasor.ts`·`ui/PhasorView`) |
| x[n] | 샘플된 신호 | SI | |
| w[n] | 윈도우 (주기형, DFT-even) | — | n = 0 … N−1 |
| X[k] | 윈도우를 적용한 DFT | | X[k] = Σ w[n] x[n] e^(−j2πkn/N) |
| S₁, S₂ | 윈도우 합 / 제곱합 | — | S₁ = Σ w[n], S₂ = Σ w[n]² (R-05 표기) |
| CG | 코히어런트 이득 (Coherent Gain) | — | S₁ / N |
| ACF | 진폭 보정계수 | — | N / S₁ = 1 / CG |
| ECF | 에너지(잡음) 보정계수 | — | √(N / S₂) |
| ENBW | 등가잡음대역폭 | bin | N·S₂ / S₁² (Hz 단위는 × Δf) |
| b | ADC 비트 수 | bit | |
| M | 평균 횟수 | — | |
| r | 오버랩 비율 | — | 0, 0.5, 0.75 |
| α | 지수 평균 가중치 | — | α = 1 / M |
| f_c, f_m | 반송파 / 변조 주파수 | Hz | |
| m, β | AM 변조 지수 / FM 변조 지수 | — | |
| N_rpm, T_r | 회전수 / 한 바퀴 시간 | rpm / s | T_r = 60/N_rpm (P6-1), 프레임 표본 수 N과 구별 |
| n_e, Δt_e | 한 바퀴 사건 수 / 사건 간격 | — / s | 등간격 회전 동기 사건에서 Δt_e = T_r/n_e (P6-1) |
| f_r, 1X | 회전 주파수 | Hz | f_r = rpm / 60 |
| z | 기어 잇수 | — | 맞물림 f_GM = z f_r (P1-8) |
| N_b | 날개 수 | — | 날개 통과 f_BP = N_b f_r |
| N_r, d, D | 구름베어링 볼(구름요소) 수 / 볼 지름 / 피치 지름 | —, m, m | 접촉각 α는 P7-5 (지수 평균 계수 α(P2-6)와 같은 글자 — 본문에서 "접촉각 α"로 밝혀 쓴다) |
| f_L | 전원 주파수 | Hz | 60 Hz. 전자기력 2 f_L |
| f_sync, f_slip, PPF | 동기속도 / 슬립 주파수 / 극통과 주파수 | Hz | f_sync = 2f_L/P (P 극수), f_slip = f_sync − f_r, PPF = P f_slip = 2f_L − P f_r (P7-7) |
| θ | 축 회전 각도 | rad | 키페이저 기준 |
| N_c, N_n | 임계속도(피크 회전수) / 고유 회전수 | rpm | |
| S | 비접촉 변위 센서 감도 | V/m (표시 V/mm) | 예 7.87 V/mm = 200 mV/mil (P3-2) |
| z | 복소 변위 x + jy | m | Jeffcott·안정성 (P4-2, P4-4) |
| A_f, A_b | 정방향 / 역방향 선회 성분 | m | z = A_f e^{jΩt} + A_b e^{−jΩt} (P4-2) |
| C_r, ε, φ | 반경 간극 / 편심률 e/C_r / 하중 방향 기준 자세각 | m / — / rad | P4-3, 직경 간극은 2C_r |
| μ, W, h_min | 점성계수 / 하중 / 최소 유막 두께 | Pa·s / N / m | P4-3 짧은 베어링 예제 |
| k_ij, c_ij | 평형점 근처 유막 강성 / 감쇠 계수 | N/m / N·s/m | 첫 첨자=힘 방향, 둘째=변위/속도 방향(P4-3) |
| q = k_xy = −k_yx | 예제의 반대칭 교차연성 강성 크기 | N/m | q ≥ 0, Fx = −qy·Fy = +qx. 전체 베어링의 일반 관계가 아님(P4-4) |
| λ = σ ± jω_d | 복소 고유치 | 1/s | σ > 0이면 불안정 (P4-4) |
| ζ | 감쇠비 | — | |
| k_eq, k_sh, k_br, k_sup | 직렬 예제의 등가 / 축 / 베어링 / 지지 강성 | N/m | P1-6 한 방향·무질량 연결 예제. k_br은 한 경로의 등가 값, 실제 두 베어링 일반식이 아님 |
| AF | 증폭계수 (Amplification Factor) | — | |
| G_xy | 교차 스펙트럼 | | |
| γ² | 코히어런스 | — | 0~1 |

**신호 성분** (`SignalSpec`, `src/lib/dsp/signal.ts`): `sine`(f, A, φ), `harmonics`(f₀, 차수별 A·φ), `noise`(백색 가우시안, rms, seed) — M1.1, `chirp`(선형 처프, 런업·코스트다운) — M1.7, `impulses`(감쇠 임펄스열: 반복 주파수, 울림 주파수, 시정수, 첫 충격 시각 — 기어 이빨 결함 충격) — M1.12. `modulated`(반송파·변조 주파수·AM 지수 m·FM 지수 β·둘 사이 위상차 — AM, FM, AM + FM) — M1.14.

**핵심 식 (KaTeX 원문)** — 페이지와 랩은 이 표기를 그대로 쓴다.

- 나이퀴스트: `f_N = \dfrac{f_s}{2}`
- 에일리어스 주파수: `f_a = \left| f - k f_s \right|,\quad k = \operatorname{round}(f / f_s)`
- ADC 양자화 SNR (풀스케일 정현파): `SNR \approx 6.02\,b + 1.76\ \mathrm{dB}`
- 분해능 3식: `\Delta f = \dfrac{F_{max}}{\mathrm{LOR}},\quad T = \dfrac{1}{\Delta f},\quad N = 2.56\,\mathrm{LOR}`
- DFT: `X[k] = \sum_{n=0}^{N-1} w[n]\,x[n]\,e^{-j 2\pi k n / N}`
- 단일측 피크 진폭: `A_k = \dfrac{2\,|X[k]|}{S_1}` (0 < k < N/2. k = 0과 N/2에는 2를 곱하지 않음)
- 파워 스펙트럼 (rms²): `PS_k = \dfrac{2\,|X[k]|^2}{S_1^2}`
- PSD: `PSD_k = \dfrac{2\,|X[k]|^2}{f_s\,S_2} = \dfrac{PS_k}{\mathrm{ENBW}\cdot\Delta f}`
- 윈도우 계수: `CG = \dfrac{S_1}{N},\; ACF = \dfrac{N}{S_1},\; ECF = \sqrt{\dfrac{N}{S_2}},\; \mathrm{ENBW} = \dfrac{N S_2}{S_1^2}`
- 지수 평균: `\bar S_m = (1-\alpha)\,\bar S_{m-1} + \alpha\, S_m`
- 오버랩 총 측정시간: `T_{tot} = T\,[\,1 + (M-1)(1-r)\,]`
- ASD: `ASD_k = \sqrt{PSD_k}` (단위 mm/s/√Hz)
- 대역 RMS (overall): `\sqrt{\dfrac{\sum_k PS_k}{\mathrm{ENBW}}} = \sqrt{\sum_k PSD_k\,\Delta f}` (k는 대역 안의 bin, ENBW는 bin 단위)
- derived peak: `\sqrt 2\,A_{rms}` (정현파 하나일 때만 true peak와 같다)
- 파워 평균 흔들림 (dB, 경험칙): `\approx 4.34/\sqrt{M}`
- TSA: `\bar x(\theta) = \dfrac{1}{M}\sum_{m=0}^{M-1} x(\theta + 2\pi m)`
- TSA 비동기 성분 이득: `|H(f)| = \left| \dfrac{\sin(\pi M f / f_r)}{M \sin(\pi f / f_r)} \right|`
- dB: `L = 20\log_{10}(A / A_{ref})`
- 정현파 진폭 관계 (정현파일 때만 성립): `A_{rms} = \dfrac{A_{pk}}{\sqrt 2},\quad A_{pp} = 2 A_{pk}`
- Crest factor: `CF = \dfrac{A_{pk}}{A_{rms}}`
- 변위·속도·가속도 (정현파): `v = 2\pi f\, d,\quad a = (2\pi f)^2 d`
- AM: `(1 + m\cos 2\pi f_m t)\cos 2\pi f_c t` → 측대역 f_c ± f_m, 진폭 m/2
- FM: `\cos(2\pi f_c t + \beta\sin 2\pi f_m t) = \sum_n J_n(\beta)\cos 2\pi(f_c + n f_m)t`
- 맥놀이: `\cos 2\pi f_1 t + \cos 2\pi f_2 t = 2\cos\pi(f_1 - f_2)t\,\cos\pi(f_1 + f_2)t`
- 증폭계수 (Half-power): `AF = \dfrac{N_c}{N_2 - N_1} \approx \dfrac{1}{2\zeta}` (N₁, N₂: 피크 진폭의 0.707배 지점, I-004)
- 1자유도 불평형 응답: `\dfrac{X}{m_u e / M} = \dfrac{r^2}{\sqrt{(1-r^2)^2 + (2\zeta r)^2}},\quad \phi = \operatorname{atan2}(2\zeta r,\ 1-r^2),\quad r = \dfrac{N}{N_n}`
- Log decrement: `\delta = -\dfrac{2\pi\sigma}{\omega_d} \approx 2\pi\zeta`
- 지지 강성 직렬 예제(P1-6): `\dfrac{1}{k_{eq}} = \dfrac{1}{k_{sh}} + \dfrac{1}{k_{br}} + \dfrac{1}{k_{sup}}`, `f_n = \dfrac{1}{2\pi}\sqrt{\dfrac{k_{eq}}{m}}` (연결부 질량 무시, 같은 힘, 각 변형 합의 가정)
- 1X 벡터와 Slow roll 보상: `\vec V = A\,e^{-j\phi}`, `\vec V_c = \vec V - \vec V_{sr}`
- 여러 모드 1X (P8-1): X_j=Σ_m Φ_jm [e_m r_m² exp(−iθ_m)+b_m exp(−iβ_m)]/[1−r_m²+i2ζ_m r_m], r_m=N/N_m. Φ_jm는 고정된 실수 모드 형상·e_m/b_m는 같은 정규화의 등가 변위 Peak [m]. 표시 2|X_j|=p-p·φ_j=−arg X_j. i=√(−1), j는 센서 첨자. 고정 모드·대각 모드 감쇠·속도별 정상상태 가정.
- 벡터 트렌드 (P6-4): `\Delta\vec V = \vec V(t)-\vec V_{\rm ref}`, 동일 진폭이면 `\lvert\Delta\vec V\rvert = 2A\lvert\sin(\Delta\varphi/2)\rvert`. 진폭차와 구별하며 단위·Peak/Pk-Pk·기준을 명시한다.
- 학습용 허용 영역 (P6-4): `\lvert A/A_{\rm ref}-1\rvert\le\epsilon_A`, `\lvert\operatorname{wrap}_{[-\pi,\pi]}(\varphi-\varphi_{\rm ref})\rvert\le\epsilon_\varphi`. 두 조건·경계 포함, 작은 진폭이면 위상·판정 보류. 임의 학습값이며 보호 설정이 아니다.
- **위상 관례 (P3-3·P4-1·P8-1 공통, D-034)**: 위상 φ는 **지연각**(0° ≤ φ < 360°) — 키페이저 펄스에서 1X 신호의 다음 양의 피크까지의 회전각. 1X 벡터 = A∠φ (A의 단위·Peak/Pk-Pk를 함께 적는다), 복소수로는 `A\,e^{-j\phi}`. Polar 플롯은 0°를 위쪽(센서 방향)에 두고 지연이 커지는 쪽을 **회전 반대 방향**으로 그린다(기본 회전은 반시계 → 지연은 시계 방향). 시간에서 각도로: `arphi = 360^circ 	imes Delta t / T`. 장비마다 다른 관례(P3-3 §3): 앞섬각(cos 기준, FFT 위상) `psi = -arphi`, 영점 기준 `arphi - 90^circ`. Polar 플롯 랩은 `components/ui/PolarPlot`(D-035)
- 비접촉 변위 센서: `d = -V_{gap} / S` (S: 감도 크기, 양수. I-029), AC `d_{pp} = \Delta V_{pp} / S` (출력은 음전압, gap이 클수록 더 음)
- Jeffcott (P4-2): `m\ddot z + c\dot z + k z = m e \Omega^2 e^{j\Omega t}` (등방). 비등방이면 x·y를 따로 풀고 `A_f = (\tilde X + j\tilde Y)/2`, `A_b = (\tilde X^* + j\tilde Y^*)/2` (x = Re(X̃ e^{jΩt}), y = Re(Ỹ e^{jΩt}))
- 분리여유 (P4-1): SM = |N_op − N_c|/N_op × 100 %, 이 페이지의 운전 속도 기준 정의이며 규격 합격식이 아니다.
- 안정성 (P4-4): `m\ddot z + c\dot z + (k - j k_{xy}) z = 0` → `m\lambda^2 + c\lambda + k - j k_{xy} = 0`, `\delta = -2\pi\sigma/\omega_d`. 한계: `k_{xy} = c\,\omega_n = 2\zeta k`. 모델 `k_{xy} = c\Omega/2`이면 한계 `\Omega = 2\omega_n`
- Cascade 판독 (P6-2): `f_r=N/60`, `o=f/f_r`. 별도 정속 기록별 FFT(2 s·Hann·Δf=0.5 Hz); 쌓은 그림의 세로축은 시각/회전수 기준선에 진폭 표시 높이를 더한 좌표.
- 학습용 추종·잠김 (P4-4·P6-2): `f_{\rm sub}=\min(q f_r,f_n)`, 모델 교차 `N=60f_n/q`. 실제 불안정 발생 한계·진폭 예측 식이 아니다. Full spectrum은 원 반지름, +f=반시계·−f=시계(정/역 이름은 축 회전 방향과 함께).
- 오빗 점 (P6-3): `z=x+jy`, `t_k=k/f_r`, 단독 qX의 바퀴당 위상 `Δψ=±2πq`. 안정·비퇴화 단독 `q=p/n`(기약분수)은 n바퀴 뒤 점 반복. 표시 창의 펄스 수·서로 다른 자리 수·차수를 구별.
- 트래킹 필터 (lock-in): `\vec V_{nX}(t) = 2\,\mathrm{LPF}\{x(t)\,e^{-jn\theta(t)}\}`
- FRF 추정, 코히어런스: `H_1 = \dfrac{G_{xy}}{G_{xx}},\; H_2 = \dfrac{G_{yy}}{G_{yx}},\; \gamma^2 = \dfrac{|G_{xy}|^2}{G_{xx}G_{yy}}`
- 영향계수 밸런싱: `H = \dfrac{\vec V_1 - \vec V_0}{\vec W_t},\quad \vec W_c = -\dfrac{\vec V_0}{H}`
- 요소 주파수 (P1-8, D-032): `f_{GM} = z\,f_r`, `f_{BP} = N_b\,f_r`, `f_{FTF} = \dfrac{f_r}{2}\left(1 - \dfrac{d}{D}\cos\alpha\right)`, `f_{BPFO} = N_r f_{FTF}`, `f_{BPFI} = N_r (f_r - f_{FTF})`, `f_{BSF} = \dfrac{D}{2d} f_r \left(1 - \left(\dfrac{d}{D}\cos\alpha\right)^2\right)`, `f_{belt} = \pi D_p f_r / L` (D_p 풀리 지름, L 벨트 길이). P1-8은 α = 0과 근사(FTF ≈ 0.4 f_r)만 쓴다
- 응답 합성 (P1-9): `x(t) = \sum_i A_i\cos(2\pi f_i t + \phi_i) + n(t)` (정현파 + 잡음). φ_i는 시간 원점의 **시작 위상**, 키페이저 지연각과 구분한다. 감쇠 울림은 고정 A_i 정현파 하나가 아니라 별도 시간 응답으로 더한다.
- 베어링 결함 주파수: 원본 4-2 식 사용 (BSF 관례는 I-008). 위 요소 주파수 식과 같다

- P8-2 열 기여: V=U+Q, Q=B₀ exp(−t/τ) exp(−iβ) 또는 B₀(1+g t/t_end) exp[−i(β+2πt/P)]. U·Q는 센서의1X 복소 응답[m Peak], B₀[m Peak], β[rad], τ·P·t_end[s], g[—]. t_end=3600 s, Q는 Q factor와 구별. α_T[K⁻¹]는 열팽창계수. 저속 eccentricity 기하 예제는 고속 응답과 별개.

- P8-3 지정 법칙: ℓ[—]=부하율0~1, q=q₀+q_Lℓ[N/m], q는 P4-4 k_xy와 같은 교차연성. qcrit/k=2ζ, ℓ*=(2ζ−q₀/k)/(q_L/k), q_L>0·0≤ℓ*≤1일 때 유일한 구간 경계. 정적 ε에서 q·ζ를 계산하지 않는다. 자유팽창 ΔL=α_T LΔT[m], 공통 기준 타깃 예제 DE=ΔL_r+u_T−ΔL_c; u_T[m]는 전체 축 이동, 실제 센서 배치는 별도 확인.

- P8-4 동압: p′[Pa]=평균 압력에서의 변동, A_p[Pa Peak], θ[rad]=원주각, m[—]=공간 모드/셀 차수(축 차수와 구별), x/L[—]=축방향 위치. 진행 p′=A_p cos(2πft−mθ), 정재 p′=A_p cos(mθ)cos(2πft), 닫힌 관1차 p′=A_p cos(πx/L)cos(2πft). 랩의 A는 A_p. 표시 B−A 위상은 cos의 위상차·키페이저 지연각과 별도.

- P7-9 각변동·펄스: θ=Ωt+δθ, Δθ=δθB−δθA[rad], δω=dδθ/dt[rad/s]; 등각도 z표식의 구간 평균 ω̄=(2π/z)/Δt, N̄=60/(zΔt)[rpm]. IAS의 한 시각 값과 구간 평균을 구별.
- P7-9 지정 Campbell: fn,m²=f0,m²+c_m fr², fexc=o fr, fr=N/60; f0[Hz], c·o[—]. o²>c일 때 Ncross=60f0/√(o²−c). R=1/√((1−r²)²+(2ζr)²), r=fexc/fn. 고정 가진·속도별 정상상태·각 모드 정적 응답 기준, 실기 응력 아님.
- P7-9 BTT 작은 접선 변위: Δt=t실측−t기준[s], δs≈−RbΩΔt[m], Rb[m], Ω[rad/s]; 회전 방향이 양·기준 각도/회전수 정확·접선 운동 가정.

### 3-1. 공통 DSP 코어 구현 사양

코드와 테스트가 기준이다. 랩·그림을 만들 때 알아야 할 규약만 적는다 (끝난 코어의 설계 메모는 `archive/Milestones.md`, D-030).

- `singleSidedSpectrum` (`lib/dsp/spectrum.ts`): 진폭은 **Pk**(입력 SI 단위), 위상은 첫 샘플 기준(atan2), 정확히 0인 bin의 위상은 `NaN`. DC·나이퀴스트는 두 배 하지 않는다. 제로패딩 후에도 진폭 분모는 원래 N, 분해능·측정 시간은 패딩 전과 같다.
- `lib/dsp/average.ts`: 입력·반환은 **파워**(제곱근은 UI에서). 벡터 평균은 이미 위상 정렬된 복소 스펙트럼을 받는다(정렬은 수집 쪽 책임). 오버랩은 `frameLayout`·`splitOverlappingFrames`로 실제 샘플을 겹쳐 자른다.
- 모든 코어 함수는 입력을 바꾸지 않고, 잘못된 입력은 `RangeError`. 기준값은 테스트 (옛 표 `archive/ContentsBuild.md` §6).

- 계자 열 응답 (P8-5): i=If/기준전류 [—], h [—], τ [s], G [m Peak], β [rad]; τ h′+h=i², V=U+Gh exp(−jβ). h는 실제 온도 아님, 표시 µm Peak/RMS·지연각°.
- 자유2관성 비틀림 (P8-5): J1·J2 [kg·m²], Kt [N·m/rad], θ [rad]; ft=sqrt(Kt(1/J1+1/J2))/(2π). 강체0Hz·탄성모드, 전기/감쇠/SSR 경계 없음.

## 4. 페이지 목록

페이지 ID = 절 번호 (`P{Part}-{절}`, 옛 절 구성은 `archive/Curriculum.md`). M 열은 세부 마일스톤 (끝난 것은 `archive/Milestones.md`). 상태를 바꾸면 사이트 목차 `src/data/curriculum.ts`도 함께 고친다.

페이지 파일: `src/pages/p{Part}-{절}.mdx` (예: `p2-2.mdx` → `/p2-2/`). frontmatter에 `layout: ../layouts/MdxLayout.astro`, `sectionId: P2-2`을 넣으면 경로 표시와 이전/다음 절 이동이 붙는다. 목차 `src/data/curriculum.ts`의 `href`·`status`도 함께 고친다 (D-023).

| ID | 제목 | 랩 | M | 상태 |
|---|---|---|---|---|
| HOME | 홈 · 학습 지도 | — | M0.3 골격, M1.15, M0.6 개편 | 검토 (4단계 학습 지도·히어로, D-037) |
| LAB | Signal Lab 랩 모음 · 랩별 단독 페이지 | 모든 랩 | M0.6 | 검토 (/lab/ + /lab/{slug}/, 원문 링크 자동, D-037) |
| P1-1 | 진동이란: 평형 · 복원력 · 관성 | LAB-MCK-01 | M2.1 | 검토 (본문·그림 5·LAB-MCK-01 기본) |
| P1-2 | 고유진동수: 물체마다 정해진 박자 | LAB-MCK-01, LAB-BAS-01 (P2-1에서 이동) | M2.2 | 검토 (본문·그림 7·LAB-MCK-01 확장·LAB-BAS-01 이동) |
| P1-3 | 감쇠: 흔들림은 왜 잦아드나 | LAB-DAMP-01 | M2.3 | 검토 (본문·그림 6·감쇠 장치/파형 동기 재생, 2026-10-08) |
| P1-4 | 강제진동과 공진 | LAB-FRC-01 | M2.4 | 검토 (본문·그림7·강제진동 장치/파형 동기 재생, 2026-10-08) |
| P1-5 | 여러 질량과 모드 | LAB-2DOF-01 | M2.5 | 검토 (본문·그림 7·2자유도 모드 랩) |
| P1-6 | 회전기계의 구성: 무엇이 돌고, 무엇이 받치나? | LAB-SUP-01 | M5.0 | 검토 (구성·지지계 본문, 그림 7, 지지 강성 랩) |
| P1-7 | 회전기계의 진동: 불평형과 1X | LAB-UNB-01 | M2.6 | 검토 (본문·그림 7·불평형 런업 랩) |
| P1-8 | 기계 요소가 만드는 주파수: 한 바퀴에 몇 번? | LAB-FMAP-01 | M2.7 | 검토 (그림 10, LAB-FMAP-01 1곳, D-032·D-033) |
| P1-9 | 응답에서 원인으로: 진단은 거꾸로 푸는 문제 | LAB-SRC-01 | M2.8 | 검토 (그림 7, LAB-SRC-01 1곳) |
| P2-1 | 신호와 스펙트럼의 기본 | LAB-BAS-02 (LAB-BAS-01은 P1-2) | M1.0, M1.T, M1.T2, M2.9 | 검토 (측정 관점으로 정리, 기존 그림 7 재사용·LAB-BAS-02 1곳·Part 1 되짚기 링크) |
| P2-2 | 푸리에 기초 | LAB-FOU-01 | M1.4, M1.T, M1.T2 | 검토 (그림 9) |
| P2-3 | 샘플링 · 에일리어싱 · AAF · ADC | LAB-SMP-01, 02, 03 | M1.5~M1.6, M1.T, M1.T2 | 검토 (그림 8) |
| P2-4 | 분해능 · 측정 시간 · Zoom FFT | LAB-RES-01, 02, LAB-ZOOM-01 | M1.7~M1.8, M1.T, M1.T2 | 검토 (그림 5) |
| P2-5 | 윈도우 | LAB-WIN-01, 02, 03 | M1.9~M1.10, M1.T, M1.T2 | 검토 (그림 8) |
| P2-6 | 평균화와 TSA | LAB-AVG-01, 02 | M1.11~M1.12, M1.T2 | 검토 (D-026 개편: 평균화 그림 8 + TSA 그림 4, LAB-AVG-01 4곳·LAB-AVG-02 2곳 연결) |
| P2-7 | 스펙트럼 스케일링과 진동 단위 | LAB-SPC-01, 02, LAB-UNIT-01 | M1.13 | 검토 (그림 7, LAB-SPC-01·LAB-UNIT-01 각 1곳, LAB-SPC-02 2곳) |
| P2-8 | 변조 · 측대역 · 맥놀이 | LAB-MOD-01 | M1.14 | 검토 (그림 8, LAB-MOD-01 4곳) |
| P2-9 | 측정 설정 종합 | LAB-SBX-01 | M1.15 | 검토 (그림 4, LAB-SBX-01, Signal Lab 페이지 `/lab/`) |
| P3-1 | 센서 원리와 선택 | LAB-SNS-01 | M3.1 | 검토 (그림 7, LAB-SNS-01 3곳, 영어판 M12.7) |
| P3-2 | 프록시미티 프로브 시스템 | LAB-PROX-01 | M3.2 | 검토 (그림 6, LAB-PROX-01 3곳, 영어판 M12.7) |
| P3-3 | 키페이저 · 위상 · 1X 벡터 | LAB-PHS-01, LAB-SRO-01 | M3.3 | 검토 (그림 10, LAB-PHS-01 2곳, LAB-SRO-01 2곳, 영어판 M12.7) |
| P3-4 | 측정 체인 함정 | LAB-CHAIN-01 (판정 퀴즈) | M3.4 | 검토 (그림 7, LAB-CHAIN-01 3곳: 살펴보기 2 + 퀴즈 1, 영어판 M12.7) |
| P3-5 | 과도 데이터 수집과 보호 시스템 | LAB-ALM-01 | M3.5 | 검토 (그림 6, LAB-ALM-01 3곳, 영어판 M12.7) |
| P4-1 | 1자유도 불평형 응답을 Bode/Polar로 | LAB-AF-01 | M5.1 | 검토 (본문 8절, 그림 7, LAB-AF-01) |
| P4-2 | Jeffcott 로터 | LAB-JEF-01 | M5.2 | 검토 |
| P4-3 | 유막 베어링과 Shaft centerline | LAB-SCL-01 | M5.3 | 검토 |
| P4-4 | 안정성: 교차연성 · Whirl/Whip · Log decrement | LAB-STB-01 | M5.4 | 검토 |
| P5-1 | 디지털 필터와 적분 | LAB-FLT-01, LAB-INT-01 | M4.1 | 검토 (그림 10, LAB-FLT-01·LAB-INT-01 각 1곳, 2026-10-07) |
| P5-2 | 시간-주파수 분석 | LAB-STFT-01 | M4.3 | 검토 (그림 6, LAB-STFT-01 1곳, 2026-10-07) |
| P5-3 | 2채널 분석 · Full spectrum | LAB-XCH-01, LAB-FULL-01 | M4.4 | 검토 (그림 6, LAB-XCH-01·LAB-FULL-01 각 1곳, 2026-10-07) |
| P5-4 | 차수추적 | LAB-ORD-01 | M4.5 | 검토 (그림 5, LAB-ORD-01 3곳, 2026-10-07) |
| P5-5 | 트래킹 · 노치 필터 | LAB-FLT-02 | M4.6 | 검토 (그림 7, LAB-FLT-02 2곳, 2026-10-07) |
| P5-6 | 엔벨로프 · Spectral Kurtosis | LAB-ENV-01, LAB-SK-01 | M4.7 | 검토 (그림 8, LAB-ENV-01·LAB-SK-01 각 1곳, 2026-10-07) |
| P5-7 | 켑스트럼 · 특징량 | LAB-CEP-01, LAB-FEAT-01 | M4.8 | 검토 (그림 7, LAB-CEP-01·LAB-FEAT-01 각 1곳, 2026-10-07) |
| P6-1 | 시간파형 | LAB-TWF-01 | M6.1 | 검토 |
| P6-2 | 스펙트럼 · Waterfall · Cascade | LAB-WF-01 | M6.2 | 검토 |
| P6-3 | 오빗 | LAB-ORB-01 | M6.3 | 검토 |
| P6-4 | 트렌드 · 벡터 트렌드 · APHT | LAB-TRND-01 | M6.6 | 검토 |
| P7-1 | 진단 주파수 지도 · 회전수 추정 | LAB-MAP-01, LAB-FAULT-01, LAB-RPM-01 | M7.1 | 검토 (그림 6, 랩 3종 각 1곳, 2026-10-07) |
| P7-2 | 1X 계열 | LAB-1X-01 | M7.2 | 검토 (그림 8, LAB-1X-01 1곳, 2026-10-08) |
| P7-3 | 미스얼라인먼트 · 풀림 · 러브 | LAB-NL-01 | M7.2 | 검토 (그림 9, LAB-NL-01 1곳, 2026-10-08) |
| P7-4 | 유체막 · 유체력 불안정 | LAB-SUB-01 | M7.3 | 검토 (그림 5, LAB-SUB-01 1곳, 2026-10-08) |
| P7-5 | 구름베어링 | LAB-BRG-01, LAB-BRG-02 | M7.4 | 검토 (그림 7, LAB-BRG-01 1곳·LAB-BRG-02 2곳, 2026-10-07) |
| P7-6 | 기어 | LAB-GEAR-01, LAB-GEAR-02 | M7.5 | 검토 (그림 8, LAB-GEAR-01·LAB-GEAR-02 각 1곳, 2026-10-08) |
| P7-7 | 전기적 원인 | LAB-ELEC-01 | M7.6 | 검토 (그림 6, LAB-ELEC-01 1곳, 2026-10-08) |
| P7-8 | 유체 · 공력 원인 | LAB-FLOW-01 | M7.6 | 검토 (그림 6, LAB-FLOW-01 1곳, 2026-10-08) |
| P7-9 | 비틀림 · 블레이드 진동 | LAB-CAMP-01 | M7.7 | 검토 (그림 8, LAB-CAMP-01 1곳, 2026-10-08) |
| P8-1 | 기동·정지와 임계속도 통과 (여러 모드 Bode/Polar 판독) | LAB-BODE-01 | M8.1 | 검토 |
| P8-2 | 열 휨 · 터닝 기어 · Morton | LAB-TRND-01 프리셋 | M8.5 (D-043) | 검토 |
| P8-3 | ST 특화 | LAB-ST-01 | M8.2 | 검토 (그림8·문제6·본문2랩, 2026-10-08) |
| P8-4 | GT 특화 | LAB-GT-01·LAB-GEAR-02 프리셋 | M8.3 | 검토 |
| P8-5 | 발전기와 축계 | LAB-GEN-01 (본문2곳) | M8.4 | 검토 (그림8·문제6, 2026-10-08) |
| P9-1 | 구조 공진 판별과 임팩트 시험 | LAB-HPB-01 | M9.1 | 검토 (그림 9, LAB-HPB-01 1곳, 2026-10-12) |
| P9-2 | 밸런싱 | LAB-BAL-01 | M9.2 | 검토 (그림 7, LAB-BAL-01 1곳, 2026-10-12) |
| P9-3 | 정렬 | LAB-ALN-01 | M9.3 | 검토 (그림 6, LAB-ALN-01 1곳, 2026-10-12) |
| P10-1 | 진동 판정 규격 | LAB-ISO-01 | M10.1 | 검토 (2026-10-12 Claude 재작성 I-032: 그림 7, LAB-ISO-01 1곳) |
| P10-2 | API 규격 요점 | LAB-SM-01 | M10.2 | 검토 (2026-10-12 Claude 재작성 I-032: 그림 7, LAB-SM-01 1곳) |
| P10-3 | 진단 절차와 보고 | LAB-DIAG-01 | M10.2 | 검토 (2026-10-12 Claude 재작성 I-032: 그림 7, LAB-DIAG-01 1곳) |
| P11-1 | 가상 기계 케이스 | LAB-CASE-01 | M11.1 | 검토 (그림 8, LAB-CASE-01 1곳, 2026-10-12) |
| P11-2 | 공개 데이터셋 실습 | LAB-DATA-01 | M11.2 | 검토 (그림 7, LAB-DATA-01 1곳, 2026-10-12) |
| P11-3 | 현장 데이터 복기 가이드 | LAB-REV-01 | M11.3 | 검토 (그림 6, LAB-REV-01 1곳, 2026-10-12) |
| REF-1 | 공식 모음 (`/reference/formulas/`) | — | 세부 M마다 누적, M11.3 정리 | 검토 (2026-10-12: Part 9 ~ 11 공식 카드 8개 추가) |
| REF-2 | 용어집 (`/reference/glossary/`, Glossary.md를 읽음) | — | 세부 M마다 누적, M11.3 정리 | 검토 (2026-10-12: Part 11 용어 포함) |
| REF-3 | 참고자료 · 데이터셋 (`/reference/sources/`) | — | M11.3 | 검토 (2026-10-12: 데이터셋 묶음에 이용 안내, 바로 가기 P11 셋) |

## 5. 랩 사양

### 5-1. 구현된 랩 (한 줄 요약) — 원래 사양·검증 기준은 `archive/LabSpecs.md` (D-038)

구현이 끝난 랩은 코드와 테스트가 기준이다. 여기에는 찾아가는 길만 둔다. 랩 단독 페이지는 `/lab/{slug}/` (D-037).

| 랩 | 이름 | 처음 쓰인 곳 | 컴포넌트 (단독 페이지) · 계산 모듈 |
|---|---|---|---|
| LAB-BAS-01 | 정현파의 세 숫자 (진폭 · 주파수 · 위상) + 도는 화살표와 그 높이 (D-044) | P1-2 | `SineBasicsLab` (/lab/bas-01/) · `PhasorView` |
| LAB-BAS-02 | 진폭을 숫자 하나로 (Peak · Pk-Pk · RMS · Crest factor) | P2-1 | `AmplitudeMeasuresLab` (/lab/bas-02/) |
| LAB-FOU-01 | 푸리에 기초 (하모닉 쌓기는 화살표 사슬 끝이 파형을 그림, D-044) | P2-2 | `FourierHarmonicsLab` (/lab/fou-01/), `DftCorrelationLab` (/lab/fou-01-dft/), `ZeroPaddingLab` (/lab/fou-01-zeropad/) |
| LAB-SMP-01 | 샘플링 & 에일리어싱 + 스트로브로 본 회전 원판(마차 바퀴 효과, D-044) | P2-3 | `SamplingLab` (/lab/smp-01/) · `StrobeDisk` |
| LAB-SMP-02 | AAF와 f_s = 2.56 F_max | P2-3 | `AafLab` (/lab/smp-02/) |
| LAB-SMP-03 | ADC & 입력 레인지 | P2-3 | `AdcLab` (/lab/smp-03/) |
| LAB-RES-01 | 분해능: 두 성분 분리 | P2-4 | `ResolutionLab` (/lab/res-01/) |
| LAB-RES-02 | Smearing: 변하는 회전수 | P2-4 | `SmearingLab` (/lab/res-02/) |
| LAB-ZOOM-01 | Zoom FFT | P2-4 | `ZoomLab` (/lab/zoom-01/) |
| LAB-WIN-01 | 누설과 가리비 손실 | P2-5 | `WindowLeakageLab` (/lab/win-01/) |
| LAB-WIN-02 | 윈도우 비교: 메인로브와 사이드로브 | P2-5 | `WindowComparisonLab` (/lab/win-02/) |
| LAB-WIN-03 | 보정계수 & ENBW | P2-5 | `WindowCorrectionLab` (/lab/win-03/) |
| LAB-AVG-01 | 평균화 | P2-6 | `AveragingLab` (/lab/avg-01/) |
| LAB-AVG-02 | TSA (시간 동기 평균) | P2-6 | `TsaLab` (/lab/avg-02/) |
| LAB-SPC-01 | 스펙트럼의 세로축: 진폭 · 파워 · PSD | P2-7 §3 | `SpectrumScalingLab` (/lab/spc-01/) · lib/dsp/scaling.ts, lib/scalingDemo.ts |
| LAB-SPC-02 | 진폭 표기와 dB | P2-7 §5 | `AmplitudeScaleLab` (/lab/spc-02/) |
| LAB-UNIT-01 | 진동 단위 환산기 | P2-7 §6 | `UnitConverterLab` (/lab/unit-01/) · lib/units.ts |
| LAB-MOD-01 | 변조 · 측대역 · 맥놀이 + 도는 화살표(반송파와 같이 도는 틀: 합의 길이 = 포락선, D-044) | P2-8 §2 | `ModulationLab` (/lab/mod-01/) · lib/dsp/modulation.ts (modulationLines 복소 계수), lib/modulationDemo.ts |
| LAB-SBX-01 | Signal Lab 샌드박스 + 설정 도우미 | P2-9 §6 | `SandboxLab` (/lab/sbx-01/) · lib/sandbox.ts |
| LAB-SNS-01 | 센서 = 질량-스프링 계 + 케이스 안 질량의 움직임(r 아래·근처·위, D-044) | P3-1 §3· | `SensorLab` (/lab/sns-01/) · `SensorMotion` · lib/sensor.ts (seismicMotion) |
| LAB-PROX-01 | 비접촉 변위 센서: gap 전압과 런아웃 + 프로브 앞을 지나는 축(흠집·재질 얼룩·진동 → 전압, D-044) | P3-2 §3· | `ProximityLab` (/lab/prox-01/) · `ProbeMotion` · lib/proximity.ts |
| LAB-PHS-01 | 위상 측정: 키페이저 펄스와 1X 위상 + 두 단면이 도는 축(홈 → 펄스, high spot → 봉우리, D-044) | P3-3 §2· | `PhaseLab` (/lab/phs-01/) · `PhaseShaft` · lib/phase.ts |
| LAB-SRO-01 | Slow roll 보상: 런아웃을 벡터로 빼기 | P3-3 §5· | `SlowRollLab` (/lab/sro-01/) · lib/phase.ts |
| LAB-CHAIN-01 | 센서 문제인가, 기계 문제인가 (측정 체인 판정 퀴즈) | P3-4 §4· | `ChainQuizLab` (/lab/chain-01/) · lib/measurementChain.ts |
| LAB-ALM-01 | 보호 시스템 알람 논리: 레벨 · 지연 · 보팅 · 트립 배율 | P3-5 §4· | `AlarmLab` (/lab/alm-01/) · lib/protection.ts, lib/transient.ts |
| LAB-MCK-01 | 질량-스프링 자유진동 | P1-1 | `MassSpringLab` (/lab/mck-01/) |
| LAB-DAMP-01 | 감쇠 자유진동·장치/파형 동기 재생·다음 양의 피크 | P1-3 | `DampingLab` (/lab/damp-01/) |
| LAB-FRC-01 | 강제진동·공진, 장치/파형 동기 재생·T/4 | P1-4 | `ForcedVibrationLab` (/lab/frc-01/) |
| LAB-2DOF-01 | 2자유도 모드 | P1-5 | `TwoDofModeLab` (/lab/2dof-01/) |
| LAB-UNB-01 | 불평형 런업 입문 | P1-7 | `UnbalanceLab` (/lab/unb-01/) |
| LAB-FMAP-01 | 주파수 지도: 기계 요소별 관심 구간 | P1-8 | `FrequencyMapLab` (/lab/fmap-01/) · lib/machine/frequencies.ts |
| LAB-SRC-01 | 원인 합성: 파형 한 줄에 섞인 원인들 | P1-9 | `SourceSynthesisLab` (/lab/src-01/) |
| LAB-SUP-01 | 지지 강성과 고유진동수 (D-036) | P1-6 | `SupportStiffnessLab` (/lab/sup-01/) · lib/machine/supportModel.ts |
| LAB-AF-01 | Run-up Bode & 증폭계수 | P4-1 | `RunUpBodeLab` (/lab/af-01/) · lib/rotor/runup.ts |
| LAB-JEF-01 | Jeffcott 로터: 선회와 오빗 | P4-2 | `JeffcottLab` (/lab/jef-01/) · lib/rotor/jeffcott.ts |
| LAB-SCL-01 | 유막 지지와 Shaft centerline | P4-3 | `ShaftCenterlineLab` (/lab/scl-01/) · lib/rotor/journalBearing.ts |
| LAB-STB-01 | 교차연성과 Log decrement | P4-4 | `StabilityLab` (/lab/stb-01/) · lib/rotor/stability.ts |
| LAB-FLT-01 | 필터 설계: 크기 · 군지연 · 시간파형 | P5-1 | `FilterLab` (/lab/flt-01/) · lib/dsp/filter.ts, lib/filterDemo.ts |
| LAB-INT-01 | 적분 & ski-slope | P5-1 | `IntegrationLab` (/lab/int-01/) · lib/dsp/filter.ts (integrateSpectral·integrateCumulative), lib/filterDemo.ts |
| LAB-STFT-01 | 스펙트로그램 · 워터폴 · 캐스케이드 | P5-2 | `StftLab` (/lab/stft-01/) · lib/dsp/stft.ts, lib/stftDemo.ts |
| LAB-XCH-01 | FRF 추정과 코히어런스 | P5-3 | `FrfLab` (/lab/xch-01/) · lib/dsp/twoChannel.ts, lib/xchDemo.ts |
| LAB-FULL-01 | Full spectrum: 오빗과 정방향·역방향 + 반대로 도는 두 화살표가 오빗을 그림 (D-044) | P5-3 | `FullSpectrumLab` (/lab/full-01/) · lib/dsp/twoChannel.ts (fullSpectrum, forwardBackwardPhasors), lib/xchDemo.ts (orbitPhasors) |
| LAB-ORD-01 | 차수추적: 시간 FFT vs 차수 스펙트럼 | P5-4 | `OrderTrackingLab` (/lab/ord-01/) · lib/dsp/order.ts, lib/orderDemo.ts |
| LAB-FLT-02 | 트래킹 필터와 노치: 런업에서 1X 벡터 뽑기 | P5-5 | `TrackingLab` (/lab/flt-02/) · lib/dsp/tracking.ts, lib/trackingDemo.ts |
| LAB-ENV-01 | 엔벨로프 분석: 대역 고르기 → 포락선 → 엔벨로프 스펙트럼 | P5-6 | `EnvelopeLab` (/lab/env-01/) · lib/dsp/envelope.ts, lib/envelopeDemo.ts |
| LAB-SK-01 | Spectral Kurtosis · Kurtogram: 충격 대역 자동으로 찾기 | P5-6 | `KurtogramLab` (/lab/sk-01/) · lib/dsp/envelope.ts, lib/envelopeDemo.ts |
| LAB-CEP-01 | 켑스트럼: 줄 무리의 간격 → quefrency 봉우리, 리프터링 | P5-7 | `CepstrumLab` (/lab/cep-01/) · lib/dsp/cepstrum.ts, lib/cepstrumDemo.ts |
| LAB-FEAT-01 | 시간영역 특징량: 결함이 진행하는 동안의 추세 | P5-7 | `FeatureLab` (/lab/feat-01/) · lib/dsp/stats.ts, lib/cepstrumDemo.ts |
| LAB-TWF-01 | 시간파형 패턴 갤러리·퀴즈·회전당 사건 수 | P6-1 | `TimeWaveformLab` (/lab/twf-01/) · lib/plots/waveform.ts |
| LAB-TRND-01 | 스칼라·APHT·벡터 변화·허용 영역·열 휨/Morton형 | P6-4·P8-2 | `TrendLab` (/lab/trnd-01/) · lib/plots/trend.ts·thermal.ts |
| LAB-WF-01 | 스펙트럼 판독·추종/잠김·정속 유지·정/역 cascade | P6-2 | `WaterfallLab` (/lab/wf-01/) · lib/plots/cascade.ts |
| LAB-ORB-01 | 직접/실제1X 오빗·blank/dot 시간 순서·고정/이동 점 | P6-3 | `OrbitLab` (/lab/orb-01/) · lib/plots/orbit.ts |
| LAB-MAP-01 | 진단 주파수 지도: 주파수 → 원인 후보 | P7-1 | `FaultMapLab` (/lab/map-01/) · lib/faults/catalog.ts |
| LAB-FAULT-01 | 결함 신호 합성기: 원인마다의 지문 (Part 11 케이스 엔진) | P7-1 | `FaultSynthLab` (/lab/fault-01/) · lib/faults/synth.ts, catalog.ts |
| LAB-RPM-01 | 회전수 추정: 회전수를 모를 때 1X 찾기 | P7-1 | `RpmLab` (/lab/rpm-01/) · lib/faults/rpm.ts, synth.ts |
| LAB-1X-01 | 1X 감별: 1X가 크면 무엇일까 (원인 8종·숨은 케이스 7개, 코스트다운 Bode·2X·두 베어링 벡터·오빗) + 옆에서 본 로터(원통형·원추형, D-044) | P7-2 | `OneXLab` (/lab/1x-01/) · `OneXRotor` · lib/faults/oneX.ts (diskUnbalance) |
| LAB-NL-01 | 비선형의 지문: 미스얼라인 · 풀림 · 러브 (시간 적분 Jeffcott, 오빗·파형·Full spectrum) | P7-3 | `NonlinearLab` (/lab/nl-01/) · lib/faults/contact.ts |
| LAB-SUB-01 | 1X 아래 성분 감별 (원인 6종·숨은 케이스 7개, 런업 캐스케이드·Full spectrum·키페이저 점·운전조건 시험) | P7-4 | `SubsyncLab` (/lab/sub-01/) · lib/faults/subsync.ts |
| LAB-BRG-01 | 베어링 결함 주파수 계산기 (접촉각·미끄럼·BSF 1배/2배) | P7-5 | `BearingCalcLab` (/lab/brg-01/) · lib/machine/frequencies.ts, lib/faults/bearing.ts |
| LAB-BRG-02 | 결함 위치와 고장 단계: 어디에 먼저 보이나 + 도는 베어링(볼이 결함에 닿을 때 충격, 하중대 가중, D-044) | P7-5 | `BearingStageLab` (/lab/brg-02/) · `BearingSpin` · lib/faults/bearing.ts, bearingMotion.ts |
| LAB-GEAR-01 | 기어 결함의 스펙트럼 지문 (GMF 하모닉·측대역 간격과 개수·공진 대역·부하·헌팅 투스) + 맞물려 도는 기어(상한 이빨 충격·헌팅 투스 주기, D-044) | P7-6 | `GearSpectrumLab` (/lab/gear-01/) · `GearMesh` · lib/faults/gear.ts, gearMotion.ts |
| LAB-GEAR-02 | TSA와 켑스트럼: 어느 축의 몇 번 이빨인가 | P7-6 | `GearTsaLab` (/lab/gear-02/) · lib/faults/gear.ts |
| LAB-ELEC-01 | 전기냐 기계냐: 2×LF · 극통과 측대역 · 전원(계자) 차단 시험 (유도전동기 2극·4극, 2극 동기 발전기, 원인 6종·숨은 케이스 7개) | P7-7 | `ElectricLab` (/lab/elec-01/) · lib/faults/electric.ts |
| LAB-FLOW-01 | 운전점을 바꿔 원인 가리기: 날개 통과 · 재순환 · 수력 불평형 · 캐비테이션 · Rotating stall · 서지 (펌프 상태 5종, 압축기 서지 방지, 숨은 케이스 7개) | P7-8 | `FlowLab` (/lab/flow-01/) · lib/faults/flow.ts, synth.ts |
| LAB-CAMP-01 | 회전 강성화·차수 교차·감쇠별 모드 응답·교차 없음/범위 밖 | P7-9 | CampbellLab (/lab/camp-01/) · lib/machine/campbell.ts |
| LAB-HPB-01 | 해머 팁·프레임 길이·지수/Force 윈도우·평균·더블 히트 → 측정 FRF·코히어런스·Half-power ζ(보정) | P9-1 | ImpactLab (/lab/hpb-01/) · lib/fieldwork/impact.ts |
| LAB-BAL-01 | 1면·2면 영향계수, 숨은 불평형 3종, 시험추 크기·각, 측정 흔들림, 분할추(구멍 12개), slow roll 보상 안 함 → 런 기록·Polar·보정 뒤 센서 값/실제 움직임 | P9-2 | BalanceLab (/lab/bal-01/) · lib/fieldwork/balance.ts |
| LAB-ALN-01 | rim-face·reverse 읽음값(예시 기계 3종 또는 직접 입력), 브래킷 처짐·보정, 열성장 → δ·α·냉간 목표·앞발·뒷발 이동 | P9-3 | AlignmentLab (/lab/aln-01/) · lib/fieldwork/alignment.ts |
| LAB-BODE-01 | 여러 모드 Bode/Polar·센서 마디·열간 bow·slow roll | P8-1 | `MultiModeBodeLab` (/lab/bode-01/) · lib/rotor/multimode.ts |
| LAB-GT-01 | GT 동압의 실속/서지·종방향·원주 진행/정재 공간 모드·절점 | P8-4 | GasPressureLab (/lab/gt-01/) · lib/machine/gt.ts |
| LAB-ST-01 | ST 부하 경계·부분 분사 합력·정적 중심 위치 (독립 모델) | P8-3 | `SteamLoadLab` (/lab/st-01/) · lib/rotor/steam.ts, journalBearing.ts, stability.ts |
| LAB-GEN-01 | 계자 전류 변경·복귀와 열 지연, 1X 벡터 합성·상쇄 | P8-5 §3·§4 | GeneratorFieldLab (/lab/gen-01/) · lib/machine/generator.ts |

| LAB-ISO-01 | 구간 색 띠 위 가상 60일 추세(계단·서서히·감소·없음), 변화 비교 띠·비교율, 구간 판정 vs 변화 판정의 첫날, 보유 규격 경계 입력 | P10-1 §4 | SeverityLab (/lab/iso-01/) · lib/assessment/severity.ts |
| LAB-SM-01 | AF·SM·임계속도 위치·예측 오차 → 운전점 응답 예측/실제와 배수 | P10-2 §4 | SeparationMarginLab (/lab/sm-01/) · lib/assessment/margin.ts |
| LAB-DIAG-01 | 숨은 원인(가진 증가·고유진동수 이동·둘 다) × 보여 줄 자료(3000 rpm 한 점·코스트다운 진폭·+위상) → 가설별 오차와 기록 흩어짐 | P10-3 §4 | DiagnosisLab (/lab/diag-01/) · lib/assessment/diagnosis.ts |
| LAB-CASE-01 | 가상 기계 11대(단일·닮은꼴·복합·측정 문제) × 측정 설정(센서·f_max·라인·AAF·단위) × 자료 10종 → 진단 제출(2개까지) → 정답·결정적 증거·오답 반증·다음 확인 | P11-1 §5 | CaseLab (/lab/case-01/) · lib/cases/ |
| LAB-DATA-01 | 내 파일(MAT v4·v5 구조체·셀·압축, WAV, CSV)을 브라우저 안에서만 열기 → CWRU 번호·Paderborn 이름이면 f_s·채널·베어링 자동 → 파형·평균 스펙트럼 → Kurtogram(빈 칸 제외) → 엔벨로프(대역 자동/직접) → 결함 자리 ±2 % 대조 → 라벨. 합성 예시 A ~ E | P11-2 §4 | FileLab (/lab/data-01/) · lib/datafile/ |
| LAB-REV-01 | 기록 두 개(합성 정지 기록 A·B 또는 내 파일, 브라우저 안에서만) × 펄스 고치기·slow roll 보상·1X/2X·평균 바퀴·칸 → 키페이저 회전수·Bode·Polar·캐스케이드·읽음값(slow roll·봉우리·AF·위상 90°) · 복기 메모 | P11-3 §7 | ReviewLab (/lab/rev-01/) · lib/review/ |

### 5-1b. 상세 사양 — 아직 구현하지 않은 랩

새 랩은 여기에 사양을 먼저 쓰고 구현한다 (템플릿 §2). 구현이 끝나면 사양을 `archive/LabSpecs.md`로 옮기고 위 표에 한 줄을 더한다.

### 5-2. 그 밖의 랩 (개요 — 해당 마일스톤 시작 시 상세화)

지금 계획된 랩은 없다 (Part 1 ~ 11의 랩은 모두 §5-1). 새 랩을 계획하면 이 표 형식으로 한 줄씩 둔다: ID · 이름 · 핵심 조작 → 보이는 것 · 페이지 · M.

## 6. 검증 기준값

구현된 계산은 **테스트가 기준**이다 (`src/lib/**/*.test.ts`, `src/figures/figures-p*.test.ts`). 구축 때의 기준값 표(윈도우 계수·Part별 값)는 `archive/ContentsBuild.md` §6 (D-055). 새 계산의 해석해·문헌값은 그 테스트 파일 머리 주석에 출처와 함께 적는다.

## 7. 참고자료

참고자료의 **단일 기준은 `src/data/references.ts`** (D-046). 사이트의 레퍼런스 > 참고 문헌(`/reference/sources/`)이 종류별 목록과 "인용한 페이지"를 보여 준다. 2026-10-08까지의 옛 표는 `archive/References.md`.

- 새 자료: `references.ts` 머리의 "다음 번호"로 한 줄(종류·저자·제목·출처·연도·확인한 url·쓰임·이용 범위) → 페이지 `## 참고자료`의 `<References items={[['R-xx', '이 페이지에서 쓴 곳']]} />`, 본문 인용은 `<Cite ids={['R-xx']} />`.
- 유료 규격(ISO·API)은 note에 "개념만 요약" — 본문·표·경계값은 옮기지 않는다 (I-009).
- 데이터셋: CWRU(R-10)·Paderborn(R-92·R-93)·IMS(R-94·R-95)는 M11.2에서 이용 조건·용량을 확인해 추가했다(파일은 다시 배포하지 않음). MFPT·PRONOSTIA/FEMTO·PHM09는 확인 전 — url을 확인하지 못하면 넣지 않는다.

## 8. 추가 콘텐츠 후보 (백로그)

- 원본 말미의 심화 제안 ①~④는 Curriculum에 반영됨 (① → P2-9, ② → P7-4 감별표, ③ → P5-6, ④ → P6-3·P4-3)
- 학습 진도 체크 (브라우저에 저장)
- 페이지별 자가 점검 퀴즈
- 사이트 랩과 같은 결과를 numpy로 재현하는 교차검증 스크립트 (`scripts/verify/`, 원본 실습 1)
- 피크 보간(P2-5 심화)을 별도 미니 랩으로
