/**
 * LAB-CASE-01 case text (src/lib/cases/*) in English (D-054). Keyed by case id / Korean machine name / diagnosis id;
 * the lib keeps the Korean text. Use caseText / machineText / diagText / diagGroupTitle / viewLabel / levelLabel / markLabel
 * to pick the language at render time ('ko' returns the lib objects unchanged).
 */
import { LEVEL_LABEL as LEVEL_KO, VIEW_LABEL as VIEW_KO, type CaseDef, type ViewId } from '../../lib/cases/cases';
import type { DiagGroup, DiagId, DiagInfo } from '../../lib/cases/diagnoses';
import type { CaseMachine } from '../../lib/cases/engine';
import type { Lang } from '../index';

export const VIEW_EN: Record<ViewId, string> = {
  spectrum: 'Spectrum',
  waveform: 'Time waveform',
  envelope: 'Envelope',
  phase: '1X · 2X phase table',
  orbit: 'Orbit',
  bode: 'Coastdown Bode',
  cascade: 'Startup cascade',
  trend: 'Trend',
  trip: 'Power · field trip test',
  impact: 'Bump test at standstill',
};

export const LEVEL_EN: Record<CaseDef['level'], string> = {
  1: 'Level 1 · Single fault',
  2: 'Level 2 · Telling look-alikes apart',
  3: 'Level 3 · Combined faults',
  4: 'Level 4 · Measurement problems',
};

export interface CaseTextEn {
  title: string;
  report: string;
  evidence: string[];
  traps: Partial<Record<DiagId, string>>;
  next: string;
}

export const CASE_EN: Record<string, CaseTextEn> = {
  c01: {
    title: 'Boiler fan — vibration has grown over several weeks',
    report:
      'Operator report: a month ago the fan drive-end horizontal vibration was around 2.5 mm/s; today it is 5.2 mm/s. The sound is unchanged, and so are the speed and the airflow.',
    evidence: [
      '1X (29.75 Hz) is H 5.2 · V 4.3 · A 0.5 mm/s: large radially, small axially. Vertical lags horizontal by 88° — the pattern of a force that rotates with the shaft.',
      'Apart from 1X, no line exceeds 0.4 mm/s. 2X at 0.25 mm/s and blade pass (10X, 297.5 Hz) at 0.35 mm/s are at healthy levels.',
      'In the 30-day trend, 1X grew steadily from 2.5 to 5.2 mm/s. This is the pattern you get when dust builds up on the blades or wear slowly changes the mass distribution.',
      'In the coastdown, 1X rises smoothly with speed, with no peak and no sharp phase change — there is no resonance in the operating range.',
    ],
    traps: {
      misalignment: 'Axial 1X is small at 0.5 mm/s and 2X is small too. The phase difference across the coupling and between radial directions is also 12 to 15°, on the same side.',
      resonance: 'Horizontal and vertical are similar (5.2 · 4.3 mm/s), and the coastdown has no peak.',
      looseness: 'There is no harmonic family and no line at the ½X position.',
      bow: 'A bow changes with standstill time and temperature. Here the vibration grew slowly in the same direction over 30 days, and the phase is unchanged.',
    },
    next: 'Run a trial weight under the same operating conditions to measure the influence coefficient and balance (P9-2). If blade fouling is the cause, clean the blades and measure again.',
  },
  c02: {
    title: 'Cooling-water pump — a high-pitched sound has increased',
    report:
      'Inspector report: a high-pitched "hissing" sound comes from the pump. The routine measurement (velocity overall, 10 to 1000 Hz) has stayed at 1.0 mm/s for three months.',
    evidence: [
      'In the velocity spectrum (f_max 1 kHz), nothing stands out except 1X at 0.84 and vane pass (7X, 417 Hz) at 0.42 mm/s, and the BPFO (213.6 Hz) position is at the floor level of 0.04 mm/s.',
      'Raising f_max to 5 kHz and viewing acceleration, a broad hump appears at 3 to 3.6 kHz. This is where the housing resonance rings from impacts.',
      'The envelope of the 2.5 to 4.5 kHz band shows 212.5 Hz (BPFO 213.6 Hz) and its 2nd, 3rd and 4th multiples. There are no sidebands at 1X spacing — it is a fault on the stationary outer race.',
      'The acceleration waveform shows an impact every 4.7 ms (1/BPFO), and the kurtosis is 5.5 (3 for Gaussian noise).',
    ],
    traps: {
      bearingInner: 'The envelope lines are at the BPFO position, not BPFI (322.7 Hz), and there are no sidebands at 1X spacing.',
      cavitation: 'The broadband noise of cavitation does not produce distinct lines in the envelope. Here BPFO and its harmonics are sharp.',
      normal: 'The velocity overall is unchanged, but a BPFO line stands in the envelope. An early bearing fault hardly shows in the velocity overall.',
      flow: 'Vane pass (417 Hz) is at a healthy 0.42 mm/s and has nothing to do with the impacts that cause the high-pitched sound.',
    },
    next: 'Trend the envelope value at short intervals (P5-7, P7-5), check the lubrication, and plan the replacement time. This is the stage before a fault line appears in the velocity spectrum.',
  },
  c03: {
    title: 'Conveyor gearbox — a ticking sound',
    report: 'Field report: the gearbox makes a "tick" at regular intervals, roughly 9 to 10 times per second.',
    evidence: [
      'Around GMF 569.25 Hz (23 × 24.75 Hz) there are 7 sidebands on each side at 9.33 Hz spacing. 9.33 Hz is the output-shaft speed (24.75 × 23/61).',
      'The acceleration waveform shows an impact every 107 ms (1/9.33 Hz) — it occurs each time the same tooth meshes, once per revolution of the output shaft.',
      'In the envelope of the 1 to 2.5 kHz band, the largest line is at 9.38 Hz (output shaft), followed by its harmonics.',
    ],
    traps: {
      gearWear: 'Wear makes 2×GMF grow and leaves the sidebands broadly and evenly low. Here the once-per-revolution impact is sharp.',
      gearEccentric: 'Eccentricity gives one or two pairs of sidebands. Here seven pairs follow one another and the waveform has impacts.',
      bearingOuter: 'The impact interval of 107 ms differs from BPFO (88.7 Hz → 11.3 ms). 9.33 Hz is the output-shaft speed.',
      looseness: 'These are not a harmonic family of 1X (24.75 Hz) but sidebands at output-shaft spacing around GMF.',
    },
    next: 'Use output-shaft TSA (P7-6) to find which tooth it is, then stop the machine and inspect the output gear visually.',
  },
  c04: {
    title: 'Process compressor A — after the rated speed was raised',
    report:
      'After the rated speed was raised last week from 9,000 to 10,500 rpm, the direct shaft vibration (X probe) grew to 72 µm p-p. It used to be about half that.',
    evidence: [
      '52 µm p-p at 70.0 Hz — larger than the 19 µm at 1X (175 Hz). 70 / 175 = 0.40X, a subsynchronous component.',
      'Startup cascade: from 6,600 rpm a 0.45X line follows the speed upward; at about 9,330 rpm it reaches 70 Hz, and from there it stays at 70 Hz and grows as speed rises (locked).',
      'The coastdown 1X peak is at about 4,300 rpm (near 72 Hz) — the 1st critical speed. The locked position of 70 Hz is the natural frequency of this mode.',
      'The direct orbit is much larger than the 1X-filtered orbit, and its shape changes from turn to turn. The keyphasor dot does not stay in one place — the component is not tied to 1X.',
    ],
    traps: {
      oilWhirl: 'As long as it follows the speed at 0.45X, it is oil whirl. Now it is locked at 70 Hz (the 1st natural frequency) regardless of speed, so it is whip. Whip is more dangerous: lower the speed or change the bearings.',
      rub: 'Rub would show an exact ½X (87.5 Hz), harmonics and a clipped orbit. 70 Hz is not ½X.',
      looseness: 'It is not at the ½X position, and there is no family of 1X harmonics.',
      unbalance: '1X is 19 µm, similar to before. The part that grew is the 70 Hz component below 1X.',
    },
    next: 'Lower the speed below 9,000 rpm and check whether it disappears (on the way down it may persist to a lower speed), look at the effect of oil temperature and bearing load, then consider a change of bearing type (tilting pad, etc.) (P4-4, P7-4).',
  },
  c05: {
    title: 'Exhaust fan — even after balancing, only horizontal is large again',
    report:
      'Of two machines of the same model, only this fan, on a second-floor steel frame, has 9.7 mm/s horizontal vibration. Vertical is about 1.5 mm/s. After balancing it drops for a moment, then grows again a few weeks later.',
    evidence: [
      '1X is H 9.7 · V 1.5 mm/s, a 6.5-fold difference. Vertical lags horizontal by 299° (= 61° leading), which differs from the roughly 90° that a rotating unbalance force produces on a rigid support.',
      'Coastdown H: an 18.8 mm/s peak at 1,710 rpm (28.5 Hz), and the phase changes by 156°, from 28° to 184°, across it. V is smooth with no peak.',
      'Bump test at standstill, H: a peak at 28.3 Hz — 5 % away from 1X at 29.67 Hz. The first peak in V is at 75 Hz.',
    ],
    traps: {
      unbalance: 'Unbalance is indeed the source of excitation, but the vibration is large because the frame horizontal mode (28.3 Hz) sits just below 1X. Balancing alone lets it grow again with a small change in unbalance.',
      looseness: 'There is no harmonic family and no line at the ½X position.',
      misalignment: 'Axial is small at 0.3 mm/s and 2X is small too.',
    },
    next: 'Stiffen the frame horizontally or add mass to move the natural frequency well away from 1X, then check again with a bump test after the reinforcement (P9-1). Until then, keep the unbalance very small.',
  },
  c06: {
    title: 'Generator — the stator frame is shaking',
    report: 'Stator frame vertical vibration has slowly grown to 3.9 mm/s. Shaft vibration (probe) is the same as before, 26 µm p-p.',
    evidence: [
      '120 Hz at 3.9 mm/s is the largest line. On a 2-pole synchronous generator, 120 Hz = 2X = 2×LF coincide exactly, so it does not split into two however much you raise the resolution.',
      'The shaft probe shows only 4.5 µm p-p at 120 Hz while 1X at 26 µm is large — the shaft does not vibrate strongly at 2X.',
      'With speed held and the field cut, 120 Hz falls to 2.2 mm/s after 0.5 s and 0.58 mm/s after 2 s, leaving only 0.3 mm/s (the mechanical 2X share). 1X is unchanged.',
      'The horizontal and vertical phases of 120 Hz (2X filter) are almost equal (3° apart) — it is a force pushing the frame in one direction.',
    ],
    traps: {
      misalignment: 'Shaft 2X is small, and the frame 120 Hz vanished when the field was cut. A mechanical 2X would remain, since the speed is unchanged.',
      looseness: 'There is no harmonic family and no line at the ½X position.',
      unbalance: '1X (0.8 mm/s, shaft 26 µm) is the same as before.',
    },
    next: 'Check the tightness of the stator core and the natural frequency of the frame (whether it is near 120 Hz). Change the field current in steps and see whether 120 Hz follows the square of the current (P7-7, P8-5).',
  },
  c07: {
    title: 'Overhung compressor — 1X rises and falls at constant speed',
    report: 'Speed, load and oil temperature are all constant, yet shaft vibration 1X (X) rises and falls between 12 and 46 µm p-p with a period of several hours.',
    evidence: [
      '12-hour trend: the 1X magnitude rises and falls between 12 and 46 µm with a period of about 2.4 hours, and the phase keeps rotating in one direction. In the polar plot, the 1X vector draws a circle of radius about 16 µm around the 30 µm position.',
      'Apart from 1X, there is only 2X at 1.9 µm, with no ½X, no harmonic family and no subsynchronous component — no sign of contact (rub).',
      'The orbit is a clean ellipse (1X), with no clipped or pointed places.',
      'In the 30-day trend, the one point per day is widely scattered, so a period of a few hours cannot be seen at daily intervals. This is why a short-interval trend is needed.',
    ],
    traps: {
      unbalance: 'With unbalance alone, the 1X vector stays in one place when speed and load are constant.',
      rub: 'Newkirk (rub friction heating) also makes the 1X vector rotate, but signs of contact (harmonics, ½X, a clipped orbit, gap change) appear with it. Here there are none.',
      bow: 'A thermal bow after a standstill and startup relaxes and shrinks in one direction as the machine runs. Here it keeps rotating at constant speed.',
    },
    next: 'See whether the period and magnitude change when the bearing oil temperature and load are changed, and consider countermeasures on the overhung mass and bearing design side (P8-2).',
  },
  c08: {
    title: 'Feed-water pump — large axially and hot bearing after reassembly',
    report: 'The bearing housing was opened and reassembled 3 weeks ago. Since then the drive-end axial vibration is 5.6 mm/s and the bearing temperature is 12 °C higher.',
    evidence: [
      'Axial 1X 4.1 · 2X 3.8 mm/s, larger than radial. The axial phase difference across the coupling is 179° (1X) · 182° (2X).',
      'The axial spectrum shows 1X, 2X and 3X in a row (3X at 0.9 mm/s), with no line at the ½X position.',
      'In the envelope of the 2.5 to 4.5 kHz band stand BPFI at 160.9 Hz and its 2nd multiple, sidebands at 1X spacing on both sides (131.3 · 190.6 Hz), and a 1X (29.7 Hz) line — an inner-race fault.',
    ],
    traps: {
      bearingOuter: 'The envelope lines are at the BPFI (160.6 Hz) position, not BPFO (106.4 Hz), and there are sidebands at 1X spacing.',
      looseness: 'Harmonics go only up to 3X, and there is no line at the ½X position.',
      unbalance: '1X is larger axially than radially, and it is 180° across the coupling.',
    },
    next: 'Measure the alignment again and correct it (P9-3), and plan to replace the bearing with the inner-race fault. Misalignment very likely raised the bearing load and brought the fault forward.',
  },
  c09: {
    title: 'Exhaust fan B — large near 120 Hz after the motor was replaced',
    report: 'The motor was replaced two weeks ago with a new one of the same type. Since then the line near 120 Hz in the vertical spectrum is 2.2 mm/s (it used to be 0.3 mm/s or less).',
    evidence: [
      'At f_max 200 Hz · 1600 lines (Δf 0.125 Hz), the region near 120 Hz splits into two lines: 119.33 Hz (2X) at 1.3 mm/s and 120.00 Hz (2×LF) at 2.7 mm/s. At 400 lines (Δf 2.5 Hz) it looked like one line.',
      'Axially, 2X is large at 2.7 mm/s and 2×LF is small at 0.35 mm/s.',
      'The phase difference of 2X across the coupling is about 180° (H 176° · V 182° · A 178°).',
      'When power is cut, the 120.00 Hz line vanishes within 0.1 s, from 2.7 to 0.37 mm/s, while 119.33 Hz (2X) decays slowly with the speed.',
    ],
    traps: {
      rotorBar: 'There are no pole-pass sidebands around 1X. 120.00 Hz is the 2×LF position, independent of speed.',
      looseness: 'There is no harmonic family and no line at the ½X position.',
      unbalance: '1X is not large, at around 1.8 mm/s, and the problem line is near 120 Hz.',
    },
    next: 'Check for soft foot first (P7-7, P9-1) and realign (P9-3). Soft foot twists the stator and makes the air gap uneven (2×LF up), and it also disturbs the alignment.',
  },
  c10: {
    title: 'Process compressor B — only the monitoring channel is high',
    report: 'Started after an overhaul. The direct value of the shaft vibration monitoring channel (X probe) is 38 µm p-p, near the alarm value, while the bearing housing vibration is small at 0.86 mm/s.',
    evidence: [
      'The coastdown 1X is already 30 µm∠115° at 490 rpm (slow roll). A response to unbalance should be nearly zero at such a low speed.',
      'Subtracting the slow roll vector, the operating-point 1X is 15 µm p-p, and near the critical speed (about 3,900 rpm) it is 44 µm — a normal unbalance response.',
      'The probe spectrum has 2X at 9 µm and 3X at 5 µm, but the housing has almost no 2X or 3X. A flaw on the shaft surface (the track the probe sees) is read in the same shape every revolution.',
      'Housing 1X is 0.79 mm/s and there are almost no other lines.',
    ],
    traps: {
      unbalance: 'The compensated 1X of 15 µm is at a normal level. What raised the monitored value is the 30 µm of runout, which is added regardless of speed.',
      bow: 'With a bow, housing 1X would also grow, and the slow roll vector would change with the standstill and heating history. Runout is the same vector regardless of speed and temperature.',
      rub: 'There is no ½X, harmonic family or clipped orbit. 2X and 3X are present at the same size even at low speed.',
    },
    next: 'Enter the slow roll vector as the compensation value for the monitoring channel (P3-3), and at the next maintenance measure and treat the mechanical and electrical runout of the probe track (journal) surface (P3-2).',
  },
  c11: {
    title: 'Blower speed increaser — a line never seen on the new equipment',
    report: 'A record taken with the newly purchased general-purpose DAQ shows a line at 357.5 Hz, 6.6 mm/s. It was not in the records from the handheld analyzer up to last month.',
    evidence: [
      '357.5 Hz is 14.4X — not an integer multiple of 1X (24.75 Hz), the pinion shaft 1X (95.8 Hz) or any bearing frequency.',
      'With the same settings, simply turning the AAF on makes the 357.5 Hz line disappear.',
      'Changing f_max to 200 Hz (f_s 512 Hz) moves the line to 154.75 Hz. A real machine component does not move with the measurement settings.',
      'The real line is at 2202.75 Hz — the bull-gear mesh GMF (89 × 24.75 Hz) at 1.06 mm/s with small sidebands. It folded in as 2560 − 2202.75 = 357.25 Hz.',
    ],
    traps: {
      gearWear: 'The mesh itself is at a healthy level (1.06 mm/s, small sidebands).',
      gearEccentric: 'The lines at 24.75 Hz spacing around 357.5 Hz are the GMF sidebands folded along with it.',
      flow: 'It is not an integer multiple of the blower shaft 1X (95.8 Hz).',
    },
    next: 'Put an AAF at the DAQ input or use equipment that has one, and set f_s comfortably higher than the highest component you want to see (P2-3, P2-9).',
  },
};

export interface MachineTextEn {
  name: string;
  table: [string, string][];
}

const BRG_EN = 'Rolling-element bearing (same dimension ratios as a 6205, 9 balls)';

export const MACHINE_EN: Record<string, MachineTextEn> = {
  '보일러 송풍기': {
    name: 'Boiler fan',
    table: [
      ['Drive', '4-pole induction motor, 60 Hz, nameplate 1780 rpm (now 1785 rpm)'],
      ['Connection', 'Direct, flexible coupling'],
      ['Rotor', 'Fan with 10 blades, between the two bearings'],
      ['Bearings', BRG_EN],
      ['Sensors', 'Accelerometers H·V·A on the fan drive-end bearing housing (across the coupling = motor load side)'],
    ],
  },
  '냉각수 펌프': {
    name: 'Cooling-water pump',
    table: [
      ['Drive', '2-pole induction motor, 60 Hz, nameplate 3560 rpm (now 3575 rpm)'],
      ['Connection', 'Direct, flexible coupling'],
      ['Rotor', 'Centrifugal impeller with 7 vanes'],
      ['Bearings', BRG_EN],
      ['Sensors', 'Accelerometers H·V·A on the pump drive-end bearing housing'],
    ],
  },
  '컨베이어 감속기': {
    name: 'Conveyor gearbox',
    table: [
      ['Drive', '4-pole induction motor, 50 Hz, 1485 rpm'],
      ['Gearbox', 'Single-stage spur gear: input pinion 23 teeth → output gear 61 teeth'],
      ['Bearings', `Input shaft: ${BRG_EN}`],
      ['Sensors', 'Accelerometers H·V·A on the gearbox input-shaft bearing housing'],
    ],
  },
  '공정 압축기 A': {
    name: 'Process compressor A',
    table: [
      ['Drive', 'Steam turbine (no motor), rated 10,500 rpm'],
      ['Rotor', 'Centrifugal impeller, 4 stages, between the two bearings. Design 1st critical speed about 4,200 rpm'],
      ['Bearings', 'Cylindrical journal bearing (lightly loaded)'],
      ['Sensors', 'Proximity probes X·Y (drive-end bearing) + accelerometers H·V·A on the bearing housing'],
      ['History', 'Last week the rating was raised from 9,000 to 10,500 rpm'],
    ],
  },
  '배기 팬 (철골 가대 위)': {
    name: 'Exhaust fan (on a steel frame)',
    table: [
      ['Drive', '4-pole induction motor, 60 Hz, 1780 rpm'],
      ['Connection', 'Direct, flexible coupling'],
      ['Rotor', 'Fan with 8 blades, between the two bearings'],
      ['Bearings', BRG_EN],
      ['Installation', 'On a second-floor steel frame (another machine of the same model on a first-floor concrete foundation runs at around 1.5 mm/s)'],
      ['Sensors', 'Accelerometers H·V·A on the fan drive-end bearing housing'],
      ['History', 'Two field balancing jobs last year — vibration dropped for a moment, then grew again a few weeks later'],
    ],
  },
  '발전기': {
    name: 'Generator',
    table: [
      ['Type', '2-pole synchronous generator, 60 Hz, 3600 rpm (gas-turbine driven)'],
      ['Bearings', 'Two fluid-film bearings'],
      ['Sensors', 'Proximity probes X·Y (turbine-side bearing) + accelerometers H·V·A on the stator frame'],
      ['History', 'The stator core fastening was retightened during a scheduled outage. Operators then reported that frame vibration slowly increased'],
    ],
  },
  '오버행 압축기': {
    name: 'Overhung compressor',
    table: [
      ['Drive', 'Steam turbine (no motor), constant speed 11,200 rpm'],
      ['Rotor', 'Rotor with a single impeller stage hanging outboard of the bearing (overhung). 1st critical speed about 5,700 rpm'],
      ['Bearings', 'Tilting-pad fluid-film bearing'],
      ['Sensors', 'Proximity probes X·Y (impeller-side bearing) + accelerometers H·V·A on the bearing housing'],
      ['Operation', 'Speed, load and oil temperature all constant'],
    ],
  },
  '급수 펌프': {
    name: 'Feed-water pump',
    table: [
      ['Drive', '4-pole induction motor, 60 Hz, 1780 rpm'],
      ['Connection', 'Gear-type coupling'],
      ['Rotor', 'Centrifugal impeller with 6 vanes'],
      ['Bearings', BRG_EN],
      ['Sensors', 'Accelerometers H·V·A on the pump drive-end (coupling-side) bearing housing (across = motor load side)'],
      ['History', '3 weeks ago the bearing housing was opened and reassembled. Since then the drive-end bearing temperature is 12 °C higher'],
    ],
  },
  '배기 송풍기 B': {
    name: 'Exhaust fan B',
    table: [
      ['Drive', '2-pole induction motor, 60 Hz, 3580 rpm (replaced 2 weeks ago with a new motor of the same type)'],
      ['Connection', 'Direct, flexible coupling'],
      ['Rotor', 'Fan with 8 blades'],
      ['Bearings', BRG_EN],
      ['Sensors', 'Accelerometers H·V·A on the motor load-side (coupling-side) bearing housing (across = fan drive side)'],
    ],
  },
  '공정 압축기 B': {
    name: 'Process compressor B',
    table: [
      ['Drive', 'Steam turbine (no motor), 9,800 rpm'],
      ['Rotor', 'Centrifugal impeller, 5 stages, 1st critical speed about 3,700 rpm'],
      ['Bearings', 'Tilting-pad fluid-film bearing'],
      ['Sensors', 'Proximity probes X·Y (drive-end bearing, monitoring channel) + accelerometers H·V·A on the bearing housing'],
      ['History', 'The journal was reground and a new rotor installed during the overhaul'],
    ],
  },
  '송풍기 증속기': {
    name: 'Blower speed increaser',
    table: [
      ['Drive', '4-pole induction motor, 50 Hz, 1485 rpm'],
      ['Speed increaser', 'Bull gear 89 teeth (motor shaft) → pinion 23 teeth (blower shaft)'],
      ['Bearings', `Bull-gear shaft: ${BRG_EN}`],
      ['Sensors', 'Accelerometers H·V·A on the speed-increaser bull-gear shaft bearing housing'],
      ['Test equipment', 'The reported record was taken with a newly purchased general-purpose DAQ (no AAF at the input). Until last month a handheld vibration analyzer was used'],
    ],
  },
};

export const DIAG_EN: Record<DiagId, { label: string; sign: string }> = {
  unbalance: { label: 'Unbalance', sign: 'Mostly 1X, radial, horizontal-vertical phase difference about 90°, proportional to speed squared' },
  bow: { label: 'Shaft bow', sign: '1X remains even at slow roll, and the 1X vector changes with standstill time and temperature' },
  misalignment: { label: 'Misalignment', sign: 'Axial 1X and 2X are large, and about 180° across the coupling' },
  looseness: { label: 'Mechanical looseness', sign: 'Harmonic family, a line at the ½X position, a pointed waveform, one direction unusually large' },
  rub: { label: 'Rub (contact)', sign: 'Exact ½X and ⅓X with harmonics, a clipped orbit, a reverse-direction component' },
  resonance: { label: 'Structural resonance', sign: 'Large in one direction only, a peak and a 180° phase change over a narrow speed range, and the natural frequency from the bump test is near the exciting frequency' },
  oilWhirl: { label: 'Oil whirl', sign: '0.38 to 0.48X follows the speed' },
  oilWhip: { label: 'Oil whip', sign: 'A subsynchronous component locked to the rotor natural frequency, staying there as speed is raised' },
  bearingOuter: { label: 'Outer-race fault', sign: 'BPFO and harmonics in the envelope, no 1X sidebands' },
  bearingInner: { label: 'Inner-race fault', sign: 'BPFI in the envelope with sidebands at 1X spacing' },
  bearingBall: { label: 'Ball fault', sign: '2×BSF with sidebands at FTF spacing' },
  bearingCage: { label: 'Cage fault', sign: 'FTF (about 0.4 times 1X) and its harmonics' },
  gearWear: { label: 'Gear wear', sign: '2× and 3×GMF grow, and the sidebands are broadly and evenly low' },
  gearEccentric: { label: 'Gear eccentricity', sign: 'One or two pairs of sidebands around GMF at that shaft spacing, amplitude that swells once per revolution' },
  gearBroken: { label: 'Broken tooth', sign: 'Many small sidebands around GMF at the faulty-shaft spacing, and one impact per revolution in the waveform' },
  stator2LF: { label: 'Stator · air-gap magnetic force (2×LF)', sign: 'A fixed 2×LF position that vanishes the moment power or field is cut' },
  rotorBar: { label: 'Rotor bar', sign: 'Sidebands at 1X ± pole-pass frequency that change with load' },
  flow: { label: 'Blade pass · flow', sign: 'Blade-pass frequency and its 2nd multiple change with the operating point (flow)' },
  cavitation: { label: 'Cavitation', sign: 'Broadband noise in the kHz range, no distinct lines in the envelope, responds to suction pressure' },
  morton: { label: 'Morton effect', sign: 'At constant speed the 1X vector rotates and rises and falls with a period of tens of minutes to a few hours (a loop in the polar plot), no sign of contact' },
  runout: { label: 'Runout (slow roll not compensated)', sign: 'Only the proximity probe is high while the housing is small, and the same 1X and 2X vectors at low speed (slow roll)' },
  aliasing: { label: 'Aliasing (false line)', sign: 'Present only in records taken without an AAF, fits no multiple of a machine frequency, and moves or disappears when f_s is changed' },
  mount: { label: 'Poor sensor mounting', sign: 'The high-frequency range is abnormally large or small, and it differs when the same spot is remounted and measured again' },
  normal: { label: 'No machine fault', sign: 'All lines at the small levels of a healthy machine' },
};

export const DIAG_GROUP_EN: Record<string, string> = {
  '축 · 회전체': 'Shaft · rotor',
  '구조': 'Structure',
  '유체막 베어링': 'Fluid-film bearing',
  '구름베어링': 'Rolling-element bearing',
  '기어': 'Gear',
  '전기': 'Electrical',
  '유체 · 공력 · 열': 'Fluid · aerodynamic · thermal',
  '측정 문제': 'Measurement problems',
  '이상 없음': 'No fault',
};

/** Frequency-mark and spectrum-line labels made in engine.ts (frequencyMarks, linesAt). Only labels that contain Hangul. */
const MARK_EN: Record<string, string> = {
  '상대 축 1X': 'Mating shaft 1X',
  '휩': 'Whip',
  '휠': 'Whirl',
  'GMF 측대역': 'GMF sideband',
  '2×GMF 측대역': '2×GMF sideband',
};

export function machineText(m: CaseMachine, lang: Lang): CaseMachine {
  if (lang !== 'en') return m;
  const en = MACHINE_EN[m.name];
  return en ? { ...m, name: en.name, table: en.table } : m;
}

export function caseText(c: CaseDef, lang: Lang): CaseDef {
  if (lang !== 'en') return c;
  const en = CASE_EN[c.id];
  if (!en) return c;
  return {
    ...c,
    title: en.title,
    report: en.report,
    evidence: c.evidence.map((e, i) => ({ ...e, text: en.evidence[i] ?? e.text })),
    traps: en.traps,
    next: en.next,
    machine: machineText(c.machine, 'en'),
  };
}

export function diagText(d: DiagInfo, lang: Lang): DiagInfo {
  return lang === 'en' && DIAG_EN[d.id] ? { ...d, ...DIAG_EN[d.id] } : d;
}

export function diagGroupTitle(g: DiagGroup, lang: Lang): string {
  return lang === 'en' ? (DIAG_GROUP_EN[g.title] ?? g.title) : g.title;
}

export function viewLabel(v: ViewId, lang: Lang): string {
  return lang === 'en' ? VIEW_EN[v] : (VIEW_KO[v] ?? v);
}

export function levelLabel(l: CaseDef['level'], lang: Lang): string {
  return lang === 'en' ? LEVEL_EN[l] : LEVEL_KO[l];
}

export function markLabel(label: string, lang: Lang): string {
  if (lang !== 'en') return label;
  const blade = /^날개 통과 (.+)$/.exec(label);
  if (blade) return `Blade pass ${blade[1]}`;
  return MARK_EN[label] ?? label;
}
