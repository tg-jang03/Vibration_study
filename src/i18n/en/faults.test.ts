import { describe, expect, it } from 'vitest';
import { FAULTS, FAMILY_LABEL, type MachineInfo } from '../../lib/faults/catalog';
import { FAULT_EN, FAMILY_EN, SPOT_EN, faultText, familyLabel, spotLabel } from './faults';
import { hasHangul } from '../translate';

const MACHINES: MachineInfo[] = [
  { fr: 29.5, lineHz: 60, blades: 7, teeth: 31, balls: 9, poles: 4 },
  { fr: 25, lineHz: 50, blades: 0, teeth: 0, balls: 0, poles: 0 },
  { fr: 29.5, lineHz: 60, blades: 0, teeth: 0, balls: 0, poles: 2 },
];
const FIELDS = ['name', 'frequency', 'amplitude', 'phase', 'direction', 'condition', 'confirm'] as const;

describe('fault catalog English', () => {
  it('every fault has every English field without Hangul', () => {
    for (const f of FAULTS) {
      const en = FAULT_EN[f.id];
      expect(en, f.id).toBeDefined();
      for (const key of FIELDS) {
        expect(en[key]?.length, `${f.id}.${key}`).toBeGreaterThan(0);
        expect(hasHangul(en[key]), `${f.id}.${key}`).toBe(false);
      }
    }
    expect(Object.keys(FAULT_EN).length).toBe(FAULTS.length);
  });
  it('families and spots are translated', () => {
    for (const fam of Object.keys(FAMILY_LABEL) as (keyof typeof FAMILY_LABEL)[]) {
      expect(hasHangul(FAMILY_EN[fam])).toBe(false);
      expect(familyLabel(fam, 'ko')).toBe(FAMILY_LABEL[fam]);
    }
    for (const v of Object.values(SPOT_EN)) expect(hasHangul(v)).toBe(false);
    for (const m of MACHINES)
      for (const f of FAULTS)
        for (const s of f.spots(m)) {
          if (hasHangul(s.label)) expect(SPOT_EN[s.label], s.label).toBeDefined();
          expect(hasHangul(spotLabel(s.label, 'en')), s.label).toBe(false);
        }
  });
  it('faultText keeps Korean unchanged', () => {
    expect(faultText(FAULTS[0], 'ko')).toBe(FAULTS[0]);
    expect(faultText(FAULTS[0], 'en').name).toBe('Unbalance');
  });
});
