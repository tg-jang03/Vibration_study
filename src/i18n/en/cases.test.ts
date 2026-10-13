import { describe, expect, it } from 'vitest';
import { CASES, LEVEL_LABEL, VIEWS, VIEW_LABEL } from '../../lib/cases/cases';
import { ALL_DIAGS, DIAG_BY_ID, DIAG_GROUPS } from '../../lib/cases/diagnoses';
import { frequencyMarks } from '../../lib/cases/engine';
import * as M from '../../lib/cases/machines';
import { CASE_EN, DIAG_EN, DIAG_GROUP_EN, LEVEL_EN, MACHINE_EN, VIEW_EN, caseText, diagGroupTitle, diagText, levelLabel, markLabel, viewLabel } from './cases';
import { hasHangul } from '../translate';

const ok = (s: string, what: string) => {
  expect(s?.length, what).toBeGreaterThan(0);
  expect(hasHangul(s), what).toBe(false);
};

describe('case lab English', () => {
  it('every case is translated with matching shape', () => {
    for (const c of CASES) {
      const en = CASE_EN[c.id];
      expect(en, c.id).toBeDefined();
      ok(en.title, `${c.id}.title`);
      ok(en.report, `${c.id}.report`);
      ok(en.next, `${c.id}.next`);
      expect(en.evidence.length, c.id).toBe(c.evidence.length);
      en.evidence.forEach((t, i) => ok(t, `${c.id}.evidence[${i}]`));
      expect(Object.keys(en.traps).sort(), c.id).toEqual(Object.keys(c.traps).sort());
      for (const [k, v] of Object.entries(en.traps)) ok(v as string, `${c.id}.traps.${k}`);
    }
    expect(Object.keys(CASE_EN).length).toBe(CASES.length);
  });
  it('machines are translated', () => {
    for (const c of CASES) {
      const en = MACHINE_EN[c.machine.name];
      expect(en, c.machine.name).toBeDefined();
      expect(en.table.length, c.machine.name).toBe(c.machine.table.length);
      ok(en.name, c.machine.name);
      for (const [a, b] of en.table) {
        ok(a, c.machine.name);
        ok(b, c.machine.name);
      }
    }
    for (const m of Object.values(M)) {
      if (m && typeof m === 'object' && 'table' in m) expect(MACHINE_EN[(m as { name: string }).name], (m as { name: string }).name).toBeDefined();
    }
  });
  it('caseText en has no Hangul, ko is identity', () => {
    for (const c of CASES) {
      expect(caseText(c, 'ko')).toBe(c);
      const e = caseText(c, 'en');
      ok(e.title, c.id);
      ok(e.report, c.id);
      ok(e.next, c.id);
      ok(e.machine.name, c.id);
      e.machine.table.forEach(([a, b]) => (ok(a, c.id), ok(b, c.id)));
      e.evidence.forEach((x) => ok(x.text, c.id));
      Object.values(e.traps).forEach((x) => ok(x as string, c.id));
      expect(e.evidence.map((x) => x.view)).toEqual(c.evidence.map((x) => x.view));
      expect(e.id).toBe(c.id);
    }
  });
  it('diagnoses, groups, views, levels', () => {
    for (const id of ALL_DIAGS) {
      ok(DIAG_EN[id].label, id);
      ok(DIAG_EN[id].sign, id);
      const d = DIAG_BY_ID[id];
      expect(diagText(d, 'ko')).toBe(d);
      const e = diagText(d, 'en');
      expect(e.id).toBe(d.id);
      expect(e.page).toBe(d.page);
      expect(e.fault).toBe(d.fault);
    }
    expect(Object.keys(DIAG_EN).length).toBe(ALL_DIAGS.length);
    for (const g of DIAG_GROUPS) {
      ok(DIAG_GROUP_EN[g.title], g.title);
      expect(diagGroupTitle(g, 'ko')).toBe(g.title);
      expect(diagGroupTitle(g, 'en')).toBe(DIAG_GROUP_EN[g.title]);
    }
    for (const v of VIEWS) {
      ok(VIEW_EN[v], v);
      expect(viewLabel(v, 'ko')).toBe(VIEW_LABEL[v]);
    }
    for (const l of [1, 2, 3, 4] as const) {
      ok(LEVEL_EN[l], String(l));
      expect(levelLabel(l, 'ko')).toBe(LEVEL_LABEL[l]);
      expect(levelLabel(l, 'en')).toBe(LEVEL_EN[l]);
    }
  });
  it('frequency mark labels translate', () => {
    for (const c of CASES)
      for (const m of frequencyMarks(c.machine)) {
        expect(hasHangul(markLabel(m.label, 'en')), m.label).toBe(false);
        expect(markLabel(m.label, 'ko')).toBe(m.label);
      }
    expect(markLabel('날개 통과 10X', 'en')).toBe('Blade pass 10X');
    for (const l of ['휩', '휠', 'GMF 측대역', '2×GMF 측대역', '상대 축 1X', 'GMF']) expect(hasHangul(markLabel(l, 'en')), l).toBe(false);
  });
});
