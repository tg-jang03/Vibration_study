/**
 * Fault catalog (src/lib/faults/catalog.ts) in English (D-054). Keyed by fault id; the lib keeps the Korean text.
 * Use faultText / familyLabel / spotLabel to pick the language at render time.
 */
import { FAMILY_LABEL, type FaultFamily, type FaultId, type FaultInfo } from '../../lib/faults/catalog';
import type { Lang } from '../index';
import type { Dict } from '../translate';

export interface FaultTextEn {
  name: string;
  frequency: string;
  amplitude: string;
  phase: string;
  direction: string;
  condition: string;
  confirm: string;
}

export const FAMILY_EN: Record<FaultFamily, string> = {
  shaft: 'Shaft · rotor',
  bearing: 'Rolling-element · journal bearing',
  gear: 'Gear',
  electrical: 'Electrical',
  flow: 'Fluid · aerodynamic',
  structure: 'Structure',
};

export const FAULT_EN: Record<FaultId, FaultTextEn> = {
  unbalance: {
    name: 'Unbalance',
    frequency: 'Mostly 1X; harmonics are small',
    amplitude: 'Below resonance it grows with the square of speed',
    phase: '1X phase is stable. On isotropic supports the horizontal-vertical phase difference is about 90°',
    direction: 'Large in the radial directions (horizontal, vertical), small axially (overhung rotors are an exception)',
    condition: 'Changes with speed; insensitive to load and temperature',
    confirm: '1X vector (polar) and phase; confirm the influence coefficient with a trial weight (P9-2)',
  },
  bow: {
    name: 'Shaft bow · thermal bow',
    frequency: '1X (sometimes 2X axially as well)',
    amplitude: '1X remains even at slow roll and grows dynamically as speed rises',
    phase: '1X phase resembles unbalance, so phase alone cannot separate them',
    direction: 'Radial; axial 1X can also be large',
    condition: 'Varies with standstill time and temperature (turning gear, uneven heating)',
    confirm: 'Change of the slow-roll 1X vector; compare with runout (P3-3, P8-2)',
  },
  crack: {
    name: 'Rotor crack',
    frequency: '1X and 2X',
    amplitude: '1X and 2X vectors drift as a trend; 2X peak at half the critical speed',
    phase: '1X and 2X vectors change even at the same operating condition',
    direction: 'Radial',
    condition: '2X peak during start-up and coast-down; slow-roll vector changes',
    confirm: '1X and 2X vector trends; 2X in the start-up Bode plot (P7-2)',
  },
  resonance: {
    name: 'Structural resonance (response amplification)',
    frequency: 'Same as the force frequency (usually 1X) — large only near the natural frequency',
    amplitude: 'Large only in a certain speed range',
    phase: 'Phase changes sharply (about 180°) when passing the natural frequency',
    direction: 'Large along the resonant mode direction (horizontal and vertical differ a lot)',
    condition: 'Changes strongly with a small speed change. The force itself has a separate cause',
    confirm: 'Run-up Bode and phase; confirm the natural frequency with an impact test (P9-1)',
  },
  misalignment: {
    name: 'Misalignment',
    frequency: '1X, 2X (and 3X). Does not split neatly into angular and parallel',
    amplitude: 'Varies with load and thermal growth',
    phase: 'Axial phase about 180° across the coupling',
    direction: 'Large axial component',
    condition: 'Varies with load and temperature (thermal growth)',
    confirm: 'Phase on both sides of the coupling; orbit (banana, figure-eight); shaft centerline (P7-3)',
  },
  looseness: {
    name: 'Looseness (structural · rotating)',
    frequency: 'Many harmonics (1X to 10X); rotating looseness also gives 0.5X fractional harmonics',
    amplitude: 'Changes strongly with small force changes and is unstable',
    phase: 'Phase wanders from measurement to measurement. Structural looseness shows a phase difference between members',
    direction: 'Biased toward one direction (usually the loose side)',
    condition: 'Sensitive to load and temperature; waveform is asymmetric up and down',
    confirm: 'Waveform asymmetry; phase comparison between members; check bolts and supports (P7-3)',
  },
  rub: {
    name: 'Rub (frictional contact)',
    frequency: '1/2X and 1/3X fractional harmonics plus harmonics. Thermal rub shows 1X',
    amplitude: 'Rises and falls with the degree of contact',
    phase: 'In thermal rub the 1X vector slowly rotates',
    direction: 'On the contact side; a reverse-direction component appears',
    condition: 'During start-up and thermal expansion, when the clearance shrinks',
    confirm: 'Distorted or flattened orbit; reverse component in the full spectrum (P7-3)',
  },
  oilWhirl: {
    name: 'Oil whirl',
    frequency: '0.38 to 0.48X, tracks speed',
    amplitude: 'Grows within the clearance and is unstable',
    phase: 'Forward whirl',
    direction: 'Both X and Y (nearly circular orbit, inner loop)',
    condition: 'Oil temperature and viscosity; when the bearing load is small',
    confirm: 'Tracks speed in the cascade; inner loop in the orbit (P7-4)',
  },
  oilWhip: {
    name: 'Oil whip',
    frequency: 'Subsynchronous, locked to the first critical speed (stays put as speed rises)',
    amplitude: 'Large and dangerous',
    phase: 'Forward whirl',
    direction: 'Both X and Y',
    condition: 'When speed exceeds about twice the first critical',
    confirm: 'Bends vertical and locks in the cascade (P5-2, P7-4)',
  },
  bearingOuter: {
    name: 'Rolling bearing outer race',
    frequency: 'BPFO (≈ 0.4·N_r X, not an integer multiple) and its harmonics — clear in the envelope spectrum',
    amplitude: 'Early on only kHz ringing; as the fault progresses the fault frequency grows',
    phase: 'Unrelated to 1X phase',
    direction: 'Load direction (usually vertical)',
    condition: 'Tracks speed; differs from the calculated value by 1 to 2 % because of slip',
    confirm: 'BPFO harmonics in the envelope spectrum (P5-6, P7-5)',
  },
  bearingInner: {
    name: 'Rolling bearing inner race',
    frequency: 'BPFI (≈ 0.6·N_r X) ± 1X sidebands',
    amplitude: 'Grows only while passing through the load zone (amplitude-modulated by 1X)',
    phase: 'Unrelated to 1X phase',
    direction: 'Load direction',
    condition: 'Tracks speed',
    confirm: 'BPFI and 1X sidebands in the envelope spectrum (P5-6, P7-5)',
  },
  bearingBall: {
    name: 'Rolling bearing ball',
    frequency: '2×BSF ± FTF sidebands (the literature uses BSF as either 1× or 2×, I-008)',
    amplitude: 'Modulated at FTF as the ball enters and leaves the load zone',
    phase: 'Unrelated to 1X phase',
    direction: 'Load direction',
    condition: 'Tracks speed',
    confirm: '2×BSF and FTF sidebands in the envelope spectrum (P7-5)',
  },
  bearingCage: {
    name: 'Rolling bearing cage',
    frequency: 'FTF ≈ 0.4X (subsynchronous)',
    amplitude: 'Appears small and may look like a sideband of other fault frequencies',
    phase: 'Unrelated to 1X phase',
    direction: 'Radial',
    condition: 'Tracks speed',
    confirm: 'FTF in the envelope or low-frequency spectrum (P7-5)',
  },
  gear: {
    name: 'Gear (wear · eccentricity · broken tooth)',
    frequency: 'GMF = teeth × X and its harmonics, ± sidebands spaced at the faulty shaft speed',
    amplitude: 'Wear shows in GMF harmonics, eccentricity in GMF ± 1X, a broken tooth in several sideband pairs',
    phase: 'TSA locates the angle of the faulty tooth',
    direction: 'Radial and axial (helical)',
    condition: 'GMF changes with load',
    confirm: 'Sideband spacing = faulty shaft; TSA and cepstrum (P2-6, P5-7, P7-6)',
  },
  electrical2LF: {
    name: 'Electromagnetic force (stator · static air-gap eccentricity)',
    frequency: 'Twice the line frequency (2×LF) — fixed regardless of speed',
    amplitude: 'Varies with load current',
    phase: 'Unrelated to 1X',
    direction: 'Radial',
    condition: 'Disappears the instant power is cut (mechanical causes decay slowly)',
    confirm: 'Decay at the instant of power cut; separate from 2X by resolution (P2-4, P7-7)',
  },
  rotorBar: {
    name: 'Induction motor rotor bar',
    frequency: '1X ± pole-pass frequency (PPF = poles × slip frequency) sidebands',
    amplitude: 'Sidebands grow as the load increases',
    phase: 'Because of the sidebands, the 1X amplitude rises and falls like beating',
    direction: 'Radial',
    condition: 'Sideband spacing changes with load (slip)',
    confirm: 'Sidebands around 1X at narrow resolution (long record); current spectrum (P7-7)',
  },
  bladePass: {
    name: 'Blade · vane pass',
    frequency: 'Number of blades × X and its harmonics',
    amplitude: 'Varies with flow (operating point), clearance and damage',
    phase: '—',
    direction: 'Radial, casing',
    condition: 'Varies with flow and pressure',
    confirm: 'Compare across operating points; check the blade count (P7-8)',
  },
  rotatingStall: {
    name: 'Rotating stall (compressor · fan)',
    frequency: 'Asynchronous component below 1X (stall cells rotate slower than the rotor; the range differs by source)',
    amplitude: 'Appears suddenly depending on the operating point',
    phase: '—',
    direction: 'Radial, pressure pulsation',
    condition: 'Appears at low-flow operating points',
    confirm: 'Change of operating point; dynamic pressure sensor (P7-8)',
  },
  cavitation: {
    name: 'Cavitation (pump)',
    frequency: 'Broadband high-frequency random (not a line)',
    amplitude: 'Grows as suction pressure drops',
    phase: '—',
    direction: 'Whole casing',
    condition: 'Varies with suction pressure and flow',
    confirm: 'Compare with changed suction conditions; listen to the sound (P7-8)',
  },
};

/** Korean spot label (from FAULTS[].spots) → English. Only labels that contain Hangul. */
export const SPOT_EN: Dict = {
  '1X (공진이 키움)': '1X (amplified by resonance)',
  '1X 아래 고정 (1차 임계)': 'Fixed below 1X (1st critical)',
  '날개 통과': 'Blade pass',
  '1X 둘레': 'Around 1X',
  '1X 아래 비동기': 'Async below 1X',
  '고주파 넓은 대역': 'Broad high-freq. band',
};

/** Fault entry with localized text fields (Korean returns the lib object unchanged). */
export function faultText(f: FaultInfo, lang: Lang): FaultInfo {
  return lang === 'en' ? { ...f, ...FAULT_EN[f.id] } : f;
}

export function familyLabel(fam: FaultFamily, lang: Lang): string {
  return lang === 'en' ? FAMILY_EN[fam] : FAMILY_LABEL[fam];
}

export function spotLabel(label: string, lang: Lang): string {
  return lang === 'en' ? (SPOT_EN[label] ?? label) : label;
}
