import { useMemo, useRef, useState } from 'react';
import { formatNumber } from '../../lib/format';
import { keyphasorThreshold, keyphasorVoltage, KEY_NOTCH, shaftDisplacement, toRad, wrapPi } from '../../lib/phase';
import { usePlayClock } from '../ui/hooks';
import PlayControls, { turnSpeeds } from '../ui/PlayControls';

/**
 * LAB-PHS-01의 움직이는 그림 (D-044): 같은 축의 두 단면이 반시계로 돈다.
 * 왼쪽 = 키페이저 자리(홈 + 키페이저 프로브), 오른쪽 = 진동 센서 자리(high spot + 진동 센서, 같은 각도 0° = 위).
 * 홈이 프로브 앞을 지나면 펄스(θ = 0), high spot이 센서 앞에 오면 1X 봉우리(θ = φ) → 그 사이 Δt가 위상.
 * 신호는 src/lib/phase.ts 그대로(x = A/2 cos(θ − φ) + 2X). 축 중심의 움직임은 1X·2X를 정방향 원으로 그린 설명용 확대.
 */

interface PhaseShaftProps {
  lagDeg: number;
  rpm: number;
  /** 1X [m pp] */
  oneXpp: number;
  /** 2X [m pp] · 2X 지연각 [rad] */
  twoXpp: number;
  twoXLag: number;
}

const W = 720;
const H = 262;
const R = 46;
const A = { x: 78, y: 158 }; // 키페이저 단면
const B = { x: 214, y: 158 }; // 진동 센서 단면
const KP_TIP = A.y - R - 13;
const VIB_TIP = B.y - R - 22;
const KD = 0.5; // 축 변위 확대 [px/µm]
const NOTCH_DEPTH = 9;
const X0 = 322;
const X1 = W - 14;
const KP_Y = (v: number) => 34 + ((-7 - v) / 12) * 46; // −7 V → 34, −19 V → 80
const VIB_Y0 = 182;
const VIB_K = 1.35; // [px/µm]
const N = 480;
const TWO_PI = 2 * Math.PI;

/** 0° = 위, 반시계 각 → 화면 점 */
const rim = (c: { x: number; y: number }, ang: number, r: number): [number, number] => [c.x - r * Math.sin(ang), c.y - r * Math.cos(ang)];
const pt = ([x, y]: [number, number]) => `${x.toFixed(1)},${y.toFixed(1)}`;

function Probe({ x, tip, lit, label }: { x: number; tip: number; lit: boolean; label: string }) {
  return (
    <g>
      <rect x={x - 9} y={tip - 34} width={18} height={34} rx={3} fill={lit ? 'var(--status-wip)' : 'var(--surface)'} stroke="var(--text-muted)" strokeWidth="1.5" />
      <line x1={x} y1={tip - 34} x2={x} y2={tip - 44} stroke="var(--text-muted)" strokeWidth="2" />
      <text x={x} y={tip - 50} textAnchor="middle" fontSize="12.5" fill="var(--text-muted)">{label}</text>
    </g>
  );
}

export default function PhaseShaft({ lagDeg, rpm, oneXpp, twoXpp, twoXLag }: PhaseShaftProps) {
  const box = useRef<HTMLDivElement>(null);
  const fr = rpm / 60;
  const T = 1 / fr;
  const speeds = useMemo(() => turnSpeeds(fr), [fr]);
  const [speed, setSpeed] = useState(0);
  const clock = usePlayClock(speeds[speed].rate, 2 * T, box);
  const lag = toRad(lagDeg);
  const theta = TWO_PI * fr * clock.t; // 0 ~ 4π (두 바퀴)
  const sig = useMemo(
    () => ({ oneX: { amp: oneXpp, lag }, ...(twoXpp > 0 ? { twoX: { amp: twoXpp, lag: twoXLag } } : {}) }),
    [oneXpp, twoXpp, twoXLag, lag],
  );

  // 오른쪽 두 띠: 두 바퀴(θ = 0 ~ 4π)를 N점으로. 회전수와 상관없이 같은 모양이고 시간 눈금만 바뀐다
  const strips = useMemo(() => {
    const xs: number[] = [];
    const kp: number[] = [];
    const raw: number[] = [];
    const one: number[] = [];
    for (let i = 0; i < N; i++) {
      const th = (2 * TWO_PI * i) / (N - 1);
      xs.push(X0 + ((X1 - X0) * i) / (N - 1));
      kp.push(KP_Y(keyphasorVoltage(th)));
      raw.push(VIB_Y0 - shaftDisplacement(th, sig) * 1e6 * VIB_K);
      one.push(VIB_Y0 - shaftDisplacement(th, { oneX: sig.oneX }) * 1e6 * VIB_K);
    }
    const path = (ys: number[], upto = ys.length) => ys.slice(0, upto).map((y, i) => `${i === 0 ? 'M' : 'L'}${xs[i].toFixed(1)},${y.toFixed(1)}`).join('');
    return { kp, raw, one, path };
  }, [sig]);

  const closest = useMemo(() => {
    if (!(twoXpp > 0)) return lag;
    let best = 0;
    let bestV = -Infinity;
    for (let i = 0; i < 3600; i++) {
      const th = (TWO_PI * i) / 3600;
      const v = shaftDisplacement(th, sig);
      if (v > bestV) { bestV = v; best = th; }
    }
    return best;
  }, [sig, twoXpp, lag]);
  const upto = Math.max(1, Math.floor((theta / (2 * TWO_PI)) * (N - 1)) + 1);
  const xAt = (th: number) => X0 + ((X1 - X0) * th) / (2 * TWO_PI);
  const cursor = xAt(theta);
  const hasTwoX = twoXpp > 0;
  const a1 = (oneXpp / 2) * 1e6;
  const a2 = (twoXpp / 2) * 1e6;

  // 오른쪽 단면: 축 중심이 high spot 쪽으로 밀려 있다 (1X 정방향 원 + 2X)
  const b1 = theta - lag;
  const b2 = 2 * theta - twoXLag;
  const center = {
    x: B.x - (a1 * Math.sin(b1) + (hasTwoX ? a2 * Math.sin(b2) : 0)) * KD,
    y: B.y - (a1 * Math.cos(b1) + (hasTwoX ? a2 * Math.cos(b2) : 0)) * KD,
  };
  const high = rim(center, b1, R);
  // 펄스 표시는 홈이 프로브 앞에 있는 동안(θ = 0 포함 — '처음으로'가 펄스 순간)
  const pulse = theta % TWO_PI < KEY_NOTCH.width || keyphasorVoltage(theta) < keyphasorThreshold();
  // '가장 가까움'은 실제로 그린 축(1X + 2X)이 센서에 가장 가까운 각도에서 켠다 (2X가 있으면 1X 봉우리와 다르다)
  const nearPeak = Math.abs(wrapPi(theta - closest)) < toRad(7);
  const notch = [rim(A, theta - KEY_NOTCH.width, R), rim(A, theta - KEY_NOTCH.width, R - NOTCH_DEPTH), rim(A, theta, R - NOTCH_DEPTH), rim(A, theta, R)];
  // 축에 그린 φ: high spot에서 홈 방향까지 반시계로 φ
  const arcR = R - 14;
  const [hx, hy] = rim(center, b1, arcR);
  const [nx, ny] = rim(center, theta, arcR);
  const [lx, ly] = rim(center, theta - lag / 2, arcR - 13);

  const dtMs = (lag / (TWO_PI * fr)) * 1e3;
  const peaks = [lag, lag + TWO_PI];

  return (
    <div className="anim-panel" ref={box}>
      <PlayControls clock={clock} speeds={speeds} speed={speed} onSpeed={setSpeed}
        status={`θ = ${Math.round(((theta * 180) / Math.PI) % 360)}° · t = ${(clock.t * 1e3).toFixed(1)} ms`} />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }}
        aria-label={`축이 ${rpm} rpm으로 반시계로 돈다. 홈이 키페이저 앞을 지날 때 펄스, high spot이 진동 센서 앞에 올 때 봉우리. 그 사이 ${formatNumber(dtMs, 3)} ms = 위상 ${lagDeg}°.`}>
        <text x={A.x} y={H - 6} textAnchor="middle" fontSize="12.5" fill="var(--text-muted)">키페이저 자리</text>
        <text x={B.x} y={H - 6} textAnchor="middle" fontSize="12.5" fill="var(--text-muted)">진동 센서 자리</text>
        <text x={(A.x + B.x) / 2} y={16} textAnchor="middle" fontSize="12.5" fill="var(--text-muted)">같은 축 · 회전 ↺</text>

        {/* 왼쪽: 홈이 있는 단면 */}
        <circle cx={A.x} cy={A.y} r={R} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="2" />
        <polygon points={notch.map(pt).join(' ')} fill="var(--surface-2)" stroke="var(--text-muted)" strokeWidth="1.5" />
        <line x1={A.x} y1={A.y} x2={rim(A, theta - KEY_NOTCH.width / 2, R - NOTCH_DEPTH)[0]} y2={rim(A, theta - KEY_NOTCH.width / 2, R - NOTCH_DEPTH)[1]} stroke="var(--text-muted)" strokeDasharray="3 3" opacity="0.8" />
        <circle cx={A.x} cy={A.y} r={3} fill="var(--text-muted)" />
        <Probe x={A.x} tip={KP_TIP} lit={pulse} label="키페이저" />
        {pulse && <text x={A.x + 14} y={KP_TIP - 6} fontSize="12.5" fontWeight="700" fill="var(--status-wip)">펄스</text>}

        {/* 오른쪽: high spot이 있는 단면 (축 중심의 움직임은 확대) */}
        <circle cx={B.x} cy={B.y} r={a1 * KD} fill="none" stroke="var(--border)" strokeDasharray="3 3" />
        <circle cx={center.x} cy={center.y} r={R} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth="2" />
        <path d={`M${hx.toFixed(1)},${hy.toFixed(1)} A${arcR},${arcR} 0 ${lag > Math.PI ? 1 : 0} 0 ${nx.toFixed(1)},${ny.toFixed(1)}`} fill="none" stroke="var(--status-wip)" strokeWidth="1.6" />
        <line x1={center.x} y1={center.y} x2={rim(center, theta, R)[0]} y2={rim(center, theta, R)[1]} stroke="var(--text-muted)" strokeDasharray="3 3" opacity="0.8" />
        <line x1={center.x} y1={center.y} x2={high[0]} y2={high[1]} stroke="var(--status-wip)" strokeWidth="1.2" />
        <text x={lx} y={ly + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--status-wip)">φ</text>
        <circle cx={high[0]} cy={high[1]} r={6} fill="var(--status-wip)" />
        <circle cx={center.x} cy={center.y} r={3} fill="var(--text-muted)" />
        <Probe x={B.x} tip={VIB_TIP} lit={nearPeak} label="진동 센서" />
        {nearPeak && <text x={B.x + 14} y={VIB_TIP - 6} fontSize="12.5" fontWeight="700" fill="var(--status-wip)">가장 가까움</text>}

        {/* 오른쪽 띠: 키페이저 출력 · 축 진동 */}
        <text x={X0} y={22} fontSize="12.5" fill="var(--text-muted)">키페이저 출력 [V]</text>
        <text x={X0} y={VIB_Y0 - 76} fontSize="12.5" fill="var(--text-muted)">진동 센서 [µm] (센서 쪽 +)</text>
        <line x1={X0} y1={VIB_Y0} x2={X1} y2={VIB_Y0} stroke="var(--border)" />
        {[0, TWO_PI, 2 * TWO_PI].map((th) => (
          <line key={th} x1={xAt(th)} y1={28} x2={xAt(th)} y2={VIB_Y0 + 58} stroke="var(--text-muted)" strokeDasharray="4 4" opacity="0.6" />
        ))}
        <path d={strips.path(strips.kp)} fill="none" stroke="var(--plot-1)" strokeWidth="1.2" opacity="0.2" />
        <path d={strips.path(strips.kp, upto)} fill="none" stroke="var(--plot-1)" strokeWidth="2" />
        <path d={strips.path(strips.raw)} fill="none" stroke="var(--plot-1)" strokeWidth="1.2" opacity="0.2" />
        {hasTwoX && <path d={strips.path(strips.one, upto)} fill="none" stroke="var(--plot-2)" strokeWidth="1.8" strokeDasharray="6 4" />}
        <path d={strips.path(strips.raw, upto)} fill="none" stroke="var(--plot-1)" strokeWidth="2.2" />
        {peaks.map((p, i) => theta >= i * TWO_PI && (
          <g key={p}>
            <line x1={xAt(i * TWO_PI)} y1={VIB_Y0 - 50} x2={Math.min(cursor, xAt(p))} y2={VIB_Y0 - 50} stroke="var(--status-wip)" strokeWidth="3" />
            {theta >= p && (
              <>
                <circle cx={xAt(p)} cy={VIB_Y0 - a1 * VIB_K} r={5} fill="var(--status-wip)" />
                <line x1={xAt(p)} y1={VIB_Y0 - 50} x2={xAt(p)} y2={VIB_Y0 - a1 * VIB_K} stroke="var(--status-wip)" strokeDasharray="2 3" />
                {i === 0 && <text x={(xAt(0) + xAt(p)) / 2} y={VIB_Y0 - 55} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--status-wip)">Δt (지연각) = {formatNumber(dtMs, 3)} ms</text>}
              </>
            )}
          </g>
        ))}
        <line x1={cursor} y1={28} x2={cursor} y2={VIB_Y0 + 58} stroke="var(--text-muted)" opacity="0.5" />
        <circle cx={cursor} cy={strips.raw[upto - 1]} r={4.5} fill="var(--plot-1)" />
        <text x={X0} y={H - 6} fontSize="12" fill="var(--text-muted)">0</text>
        <text x={xAt(TWO_PI)} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--text-muted)">{formatNumber(T * 1e3, 3)} ms</text>
        <text x={X1} y={H - 6} textAnchor="end" fontSize="12" fill="var(--text-muted)">{formatNumber(2 * T * 1e3, 3)} ms</text>
      </svg>
      <p className="anim-caption">
        같은 축의 두 단면입니다. 왼쪽 단면의 홈이 키페이저 프로브 앞을 지나는 순간 펄스가 뜨고(0°), 오른쪽 단면의 <strong>high spot</strong>(주황 점 — 축이 센서 쪽으로 가장 많이 나온 쪽,
        움직임은 확대)이 진동 센서 앞에 오면 신호가 봉우리입니다. 그 사이 축이 돈 각도가 위상 φ = {lagDeg}°이고, 축 위에 그린 주황 호(점선 = 홈 방향)와 같습니다.
        "처음으로"(펄스 순간)에서 high spot은 위에서 시계 방향으로 φ인 자리에 있습니다 — 아래 Polar 화살표가 가리키는 쪽입니다. 이 그림의 Δt는 위상 관례와 상관없이 지연각(펄스 → 양의 봉우리)입니다.
      </p>
    </div>
  );
}
