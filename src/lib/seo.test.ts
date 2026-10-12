import { describe, expect, it } from 'vitest';
import { breadcrumbLd, canonicalUrl, documentTitle, jsonLdText, learningResourceLd, sectionTitle } from './seo';

describe('sectionTitle — 주제어를 앞으로, 절 ID는 뒤로', () => {
  it('앞의 ID를 뒤로 보낸다', () => {
    expect(sectionTitle('P2-3 샘플링 · 에일리어싱 · AAF · ADC', 'P2-3')).toBe('샘플링 · 에일리어싱 · AAF · ADC (P2-3)');
  });
  it('ID가 없는 제목에도 뒤에 붙이고, sectionId가 없으면 그대로', () => {
    expect(sectionTitle('오빗: 모양·방향·점의 시간 순서', 'P6-3')).toBe('오빗: 모양·방향·점의 시간 순서 (P6-3)');
    expect(sectionTitle(' 그림 갤러리 ')).toBe('그림 갤러리');
  });
  it('P1-1과 P1-10처럼 앞부분이 같은 ID를 잘못 자르지 않는다', () => {
    expect(sectionTitle('P1-10 가상', 'P1-1')).toBe('P1-10 가상 (P1-1)');
  });
});

describe('documentTitle', () => {
  it('제목 | 사이트, 홈은 사이트 | 소개', () => {
    expect(documentTitle('기계 진동 분석', '소개', '윈도우 (P2-5)')).toBe('윈도우 (P2-5) | 기계 진동 분석');
    expect(documentTitle('기계 진동 분석', '소개')).toBe('기계 진동 분석 | 소개');
  });
});

describe('canonicalUrl', () => {
  const site = 'https://tg-jang03.github.io';
  it('디렉터리형 주소는 끝을 /로', () => {
    expect(canonicalUrl('/Vibration_study/p2-3', site)).toBe('https://tg-jang03.github.io/Vibration_study/p2-3/');
    expect(canonicalUrl('/Vibration_study/p2-3/', site)).toBe('https://tg-jang03.github.io/Vibration_study/p2-3/');
    expect(canonicalUrl('/Vibration_study/', site)).toBe('https://tg-jang03.github.io/Vibration_study/');
  });
  it('파일 주소는 그대로', () => {
    expect(canonicalUrl('/Vibration_study/og.png', site)).toBe('https://tg-jang03.github.io/Vibration_study/og.png');
  });
});

describe('JSON-LD', () => {
  it('경로 표시는 1부터 차례로', () => {
    const ld = breadcrumbLd([
      { name: '홈', url: 'https://a/' },
      { name: 'Part 2', url: 'https://a/parts/2/' },
    ]);
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(ld.itemListElement.map((x) => x.position)).toEqual([1, 2]);
    expect(ld.itemListElement[1]).toMatchObject({ name: 'Part 2', item: 'https://a/parts/2/' });
  });
  it('학습 자료는 사이트의 일부, 설명이 없으면 칸을 두지 않는다', () => {
    const ld = learningResourceLd({ name: '윈도우', url: 'https://a/p2-5/', lang: 'ko', kind: 'lesson', site: { name: 'S', url: 'https://a/' } });
    expect(ld).not.toHaveProperty('description');
    expect(ld.isPartOf).toEqual({ '@type': 'WebSite', name: 'S', url: 'https://a/' });
  });
  it('<script> 안에서 닫히지 않게 <를 이스케이프', () => {
    const text = jsonLdText({ name: 'a</script><b>' });
    expect(text).not.toContain('<');
    expect(JSON.parse(text)).toEqual({ name: 'a</script><b>' });
  });
});
