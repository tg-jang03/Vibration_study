import { describe, expect, it } from 'vitest';
import { cwruLabel, datasetLabel, datasetSetup, paderbornLabel, readDataFile, CWRU_DE, CWRU_FE, PADERBORN_6203, type DataSet } from '../../lib/datafile/index';
import { defectLines } from '../../lib/datafile/analysis';
import { EXAMPLE_KINDS, EXAMPLE_LABEL } from '../../lib/datafile/example';
import { bearingName, channelName, dataMessage, datasetLabelText, defectLabel, EXAMPLE_LABEL_EN } from './datafile';
import { hasHangul } from '../translate';

const bytes = (s: string) => new TextEncoder().encode(s);
async function errorOf(name: string, data: Uint8Array): Promise<string> {
  try {
    await readDataFile(name, data);
  } catch (e) {
    return (e as Error).message;
  }
  throw new Error('expected an error');
}
const csv = (head: string, rows: number, f: (i: number) => string) => [head, ...Array.from({ length: rows }, (_, i) => f(i))].join('\n');

function wav(bits: 16 | 32, float: boolean, n = 300): Uint8Array {
  const bps = bits / 8;
  const out = new Uint8Array(44 + n * bps);
  const v = new DataView(out.buffer);
  const tag = (o: number, s: string) => [...s].forEach((c, i) => (out[o + i] = c.charCodeAt(0)));
  tag(0, 'RIFF');
  v.setUint32(4, 36 + n * bps, true);
  tag(8, 'WAVE');
  tag(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, float ? 3 : 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true);
  v.setUint32(28, 8000 * bps, true);
  v.setUint16(32, bps, true);
  v.setUint16(34, bits, true);
  tag(36, 'data');
  v.setUint32(40, n * bps, true);
  return out;
}

describe('dataMessage', () => {
  it("'ko' returns the text unchanged and unknown text passes through", () => {
    expect(dataMessage('읽을 줄이 없습니다', 'ko')).toBe('읽을 줄이 없습니다');
    expect(dataMessage('something else', 'en')).toBe('something else');
  });

  it('real errors from the lib', async () => {
    const msgs = [
      await errorOf('a.csv', bytes('')),
      await errorOf('a.csv', bytes('a,b\nx,y\n')),
      await errorOf('a.csv', bytes(csv('time', 300, (i) => String(i / 100)))),
      await errorOf('a.wav', new Uint8Array(20)),
      await errorOf('a.mat', bytes('MATLAB 7.3 MAT-file'.padEnd(128, ' '))),
      await errorOf('a.mat', new Uint8Array(200)),
    ];
    for (const m of msgs) {
      expect(hasHangul(m)).toBe(true);
      const en = dataMessage(m, 'en');
      expect(hasHangul(en), m).toBe(false);
      expect(dataMessage(m, 'ko')).toBe(m);
    }
  });

  it('lib error templates', () => {
    const msgs = [
      'MAT 파일에서 길이 256 이상인 숫자 벡터를 찾지 못했습니다',
      '이 브라우저는 압축된 MAT 파일을 풀 수 없습니다 (DecompressionStream 없음). MATLAB에서 save -v6으로 다시 저장해 주세요.',
      '지원하지 않는 숫자 형식 14',
      'MAT 파일 형식을 알아보지 못했습니다',
      "MAT v7.3(HDF5) 파일은 읽지 못합니다. MATLAB에서 save(…, '-v7')로 다시 저장해 주세요.",
      'MAT 파일 머리의 바이트 순서 표시를 읽지 못했습니다',
      'WAV(RIFF) 파일이 아닙니다',
      'WAV의 fmt 덩어리가 없습니다',
      'WAV의 data 덩어리가 없습니다',
      '지원하지 않는 WAV 형식(2) — PCM 정수 또는 실수만 읽습니다',
      '지원하지 않는 비트 수 12',
    ];
    for (const m of msgs) expect(hasHangul(dataMessage(m, 'en')), m).toBe(false);
    expect(dataMessage('지원하지 않는 비트 수 12', 'en')).toContain('12');
  });

  it('real notes: csv without / with a time column, wav, MAT without f_s', async () => {
    const noTime = await readDataFile('a.csv', bytes(csv('x,y', 300, (i) => `${i},${i * 2}`)));
    const withTime = await readDataFile('a.csv', bytes(csv('time [s],acc', 300, (i) => `${i / 1000},${Math.sin(i)}`)));
    const w16 = await readDataFile('a.wav', wav(16, false));
    const w32 = await readDataFile('a.wav', wav(32, true));
    const notes = [...noTime.notes, ...withTime.notes, ...w16.notes, ...w32.notes];
    expect(notes.length).toBeGreaterThanOrEqual(4);
    for (const n of notes) {
      expect(hasHangul(n)).toBe(true);
      expect(hasHangul(dataMessage(n, 'en')), n).toBe(false);
      expect(dataMessage(n, 'ko')).toBe(n);
    }
    expect(dataMessage(withTime.notes[0], 'en')).toContain('time [s]');
    expect(dataMessage(w16.notes[0], 'en')).toContain('integer 16-bit');
    expect(dataMessage(w32.notes[0], 'en')).toContain('floating-point 32-bit');
    const matNote = 'MAT 파일에 샘플링 주파수가 없습니다. 데이터를 받은 곳의 설명대로 f_s를 고르세요 (CWRU는 목록마다 12 kHz 또는 48 kHz).';
    expect(hasHangul(dataMessage(matNote, 'en'))).toBe(false);
  });

  it('datasetSetup notes (CWRU de / fe / normal, Paderborn)', () => {
    const mk = (fileName: string): DataSet => ({ fileName, format: 'mat', channels: [], fs: null, rpm: null, notes: [] });
    for (const f of ['130.mat', 'X105.mat', '282.mat', '97.mat', 'N15_M07_F10_KA04_1.mat']) {
      const s = datasetSetup(mk(f));
      expect(s, f).not.toBeNull();
      const en = dataMessage(s!.note, 'en');
      expect(hasHangul(en), f).toBe(false);
      expect(dataMessage(s!.note, 'ko')).toBe(s!.note);
    }
    expect(dataMessage(datasetSetup(mk('282.mat'))!.note, 'en')).toContain('fan-end');
    expect(dataMessage(datasetSetup(mk('97.mat'))!.note, 'en')).toContain('48 kHz');
    expect(dataMessage(datasetSetup(mk('N09_M01_F04_KI01_3.mat'))!.note, 'en')).toContain('900 rpm');
  });
});

describe('datasetLabelText', () => {
  const cwruFiles = [97, 105, 118, 130, 144, 156, 169, 185, 197, 209, 222, 234, 246, 258, 3001, 3005, 109, 122, 135, 148, 161, 174, 189, 201, 213, 226, 238, 250, 262, 278, 282, 294, 298, 302, 274, 286, 313, 310, 270, 290, 315, 316];
  it('CWRU: every table row has an English label without Hangul', () => {
    for (const n of cwruFiles) {
      const f = `${n}.mat`;
      expect(cwruLabel(f), f).not.toBeNull();
      const en = datasetLabelText(f, 'en');
      expect(en, f).not.toBeNull();
      expect(hasHangul(en!), f).toBe(false);
      expect(datasetLabelText(f, 'ko')).toBe(datasetLabel(f));
    }
    expect(datasetLabelText('130.mat', 'en')).toBe("Drive-end Outer-race fault 0.007″ (6 o'clock = center of the load zone), load 0 hp, about 1797 rpm · 12 kHz drive-end fault list (12 kHz)");
    expect(datasetLabelText('97.mat', 'en')).toContain('Normal, load 0 hp');
  });
  it('Paderborn names', () => {
    for (const f of ['N15_M07_F10_KA04_1.mat', 'N09_M01_F04_KI01_20.mat', 'N15_M01_F10_K001_2.mat', 'N15_M07_F04_KB23_5.mat', 'N15_M07_F04_KX99_5.mat', 'dir/N15_M07_F10_KA04_1.mat']) {
      expect(paderbornLabel(f), f).not.toBeNull();
      const en = datasetLabelText(f, 'en');
      expect(hasHangul(en!), f).toBe(false);
      expect(datasetLabelText(f, 'ko')).toBe(datasetLabel(f));
    }
    expect(datasetLabelText('N15_M07_F10_KA04_1.mat', 'en')).toContain('outer-race damage');
    expect(datasetLabelText('N15_M07_F10_KA04_1.mat', 'en')).toContain('0.7 Nm');
  });
  it('unknown files give null', () => {
    expect(datasetLabelText('mydata.csv', 'en')).toBeNull();
    expect(datasetLabelText('mydata.csv', 'ko')).toBeNull();
  });
});

describe('names and labels', () => {
  it('channel names', () => {
    expect(channelName('열 3', 'en')).toBe('Column 3');
    expect(channelName('채널 2', 'en')).toBe('Channel 2');
    expect(channelName('X105_DE_time', 'en')).toBe('X105_DE_time');
    expect(channelName('열 3', 'ko')).toBe('열 3');
  });
  it('bearing names', () => {
    for (const b of [CWRU_DE, CWRU_FE, PADERBORN_6203]) {
      expect(hasHangul(bearingName(b.name, 'en')), b.name).toBe(false);
      expect(bearingName(b.name, 'ko')).toBe(b.name);
    }
  });
  it('defect-line labels', () => {
    for (const l of defectLines(CWRU_DE, 30)) {
      expect(hasHangul(defectLabel(l.label, 'en')), l.label).toBe(false);
      expect(defectLabel(l.label, 'ko')).toBe(l.label);
    }
  });
  it('example labels', () => {
    for (const k of EXAMPLE_KINDS) {
      expect(hasHangul(EXAMPLE_LABEL_EN[k])).toBe(false);
      expect(hasHangul(EXAMPLE_LABEL[k])).toBe(true);
    }
  });
});
