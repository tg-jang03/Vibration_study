/**
 * 목차·랩 모음 데이터를 언어에 맞춰 꺼낸다 (D-054). 한국어는 원본 그대로, 영어는 src/i18n/en/* 에서.
 */
import type { Part, Section, SectionStatus, Stage } from '../data/curriculum';
import type { LabEntry } from '../data/labs';
import type { Lang } from './index';
import { PARTS_EN, SECTIONS_EN, STAGES_EN } from './en/curriculum';
import { LABS_EN } from './en/labs';
import { ui } from './ui';

export const partTitle = (part: Pick<Part, 'num' | 'title'>, lang: Lang): string =>
  lang === 'en' ? (PARTS_EN[part.num]?.title ?? part.title) : part.title;

export const partQuestion = (part: Pick<Part, 'num' | 'question'>, lang: Lang): string =>
  lang === 'en' ? (PARTS_EN[part.num]?.question ?? part.question) : part.question;

export const sectionTitle = (section: Pick<Section, 'id' | 'title'>, lang: Lang): string =>
  lang === 'en' ? (SECTIONS_EN[section.id] ?? section.title) : section.title;

export const stageText = (stage: Pick<Stage, 'num' | 'title' | 'summary'>, lang: Lang): { title: string; summary: string } =>
  lang === 'en' ? (STAGES_EN[stage.num] ?? stage) : { title: stage.title, summary: stage.summary };

export const labText = (lab: Pick<LabEntry, 'slug' | 'title' | 'summary'>, lang: Lang): { title: string; summary: string } =>
  lang === 'en' ? (LABS_EN[lab.slug] ?? lab) : { title: lab.title, summary: lab.summary };

export const statusLabel = (status: SectionStatus, lang: Lang): string => ui(lang).status[status];

/** 제목의 짧은 앞부분 ("감쇠: 흔들림은 …" → "감쇠") */
export const shortTitle = (title: string): string => title.split(':')[0];
