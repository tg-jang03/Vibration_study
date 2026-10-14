import { useEffect, useState, type ReactNode } from 'react';
import { LABS } from '../../data/labs';
import { withBase } from '../../lib/site';
import type { Lang } from '../../i18n';
import { EN_LAB_COMPONENTS } from '../../i18n/labsReady';
import { UI } from '../../i18n/ui';
import { LangContext } from './lang';

export interface LabTask {
  /** 예측해 볼 질문 */
  question: ReactNode;
  /** 확인(정답·해설). 펼치기 전에는 숨긴다 */
  answer?: ReactNode;
}

interface LabFrameProps {
  /** 랩 ID (Contents.md §5), 예: 'LAB-SMP-01' */
  id?: string;
  title: string;
  /** 조작: ParamSlider / ParamSelect / ParamToggle 묶음 */
  controls?: ReactNode;
  /** 플롯 영역 */
  children: ReactNode;
  /** 살아있는 수식 (Formula 묶음) */
  formulas?: ReactNode;
  /** 읽음값 표 (ReadoutTable) */
  readouts?: ReactNode;
  /** 실험 과제: 예측 → 조작 → 확인 */
  tasks?: readonly LabTask[];
  footer?: ReactNode;
  /** 화면 언어 (D-054). 안의 공용 UI가 LangContext로 따른다. 기본 한국어 */
  lang?: Lang;
  /** 랩 모음 주소를 직접 줄 때 (한 ID를 여러 랩이 나눠 쓰고 영어 제목이라 제목으로 못 고를 때) */
  slug?: string;
}

/**
 * 모든 랩의 공통 틀 (AGENTS.md §6): 조작 → 플롯 → 수식·읽음값 → 실험 과제.
 * MDX 본문 안에 있어도 컨테이너 폭까지 넓게 쓴다 (I-016).
 */
/** 랩 모음의 단독 페이지 주소 (D-037). 한 ID를 여러 랩이 나눠 쓰면 제목으로 고른다 */
function standaloneHref(id: string | undefined, title: string, lang: Lang, slug?: string): string | undefined {
  if (!id && !slug) return undefined;
  const same = LABS.filter((l) => l.id === id);
  const lab = slug ? LABS.find((l) => l.slug === slug) : same.length === 1 ? same[0] : same.find((l) => title.startsWith(l.title));
  if (!lab) return undefined;
  const en = lang === 'en' && EN_LAB_COMPONENTS.has(lab.component);
  return withBase(`${en ? '/en' : ''}/lab/${lab.slug}/`);
}

export default function LabFrame({ id, title, controls, children, formulas, readouts, tasks, footer, lang = 'ko', slug }: LabFrameProps) {
  const open = standaloneHref(id, title, lang, slug);
  const t = UI[lang];
  // React가 붙기 전(서버 HTML만 보일 때) 바꾼 선택은 붙는 순간 무시된다 → 그동안은 조작을 잠근다. 첫 렌더는 서버와 같게 false
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <LangContext.Provider value={lang}>
    <section className="lab-frame" aria-label={id ? `${id} ${title}` : title}>
      <header className="lab-header">
        {id && <span className="lab-id">{id}</span>}
        <h3>{title}</h3>
        {open && <a className="lab-open" href={open}>{t.labOpen}</a>}
      </header>

      {controls && <fieldset className="lab-controls" disabled={!ready} aria-busy={!ready}>{controls}</fieldset>}

      <div className="lab-plots">{children}</div>

      {(formulas || readouts) && (
        <div className="lab-results">
          {formulas && <div className="lab-formulas">{formulas}</div>}
          {readouts && <div className="lab-readouts">{readouts}</div>}
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div className="lab-tasks">
          <h4>{t.labTasks}</h4>
          <ol>
            {tasks.map((task, i) => (
              <li key={i}>
                <div className="lab-task-question">{task.question}</div>
                {task.answer && (
                  <details>
                    <summary>{t.labCheck}</summary>
                    <div className="lab-task-answer">{task.answer}</div>
                  </details>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {footer && <footer className="lab-footer">{footer}</footer>}
    </section>
    </LangContext.Provider>
  );
}
