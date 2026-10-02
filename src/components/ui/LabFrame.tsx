import type { ReactNode } from 'react';

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
}

/**
 * 모든 랩의 공통 틀 (AGENTS.md §6): 조작 → 플롯 → 수식·읽음값 → 실험 과제.
 * MDX 본문 안에 있어도 컨테이너 폭까지 넓게 쓴다 (I-016).
 */
export default function LabFrame({ id, title, controls, children, formulas, readouts, tasks, footer }: LabFrameProps) {
  return (
    <section className="lab-frame" aria-label={id ? `${id} ${title}` : title}>
      <header className="lab-header">
        {id && <span className="lab-id">{id}</span>}
        <h3>{title}</h3>
      </header>

      {controls && <div className="lab-controls">{controls}</div>}

      <div className="lab-plots">{children}</div>

      {(formulas || readouts) && (
        <div className="lab-results">
          {formulas && <div className="lab-formulas">{formulas}</div>}
          {readouts && <div className="lab-readouts">{readouts}</div>}
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div className="lab-tasks">
          <h4>실험 과제 — 먼저 예측하고 조작해서 확인하세요</h4>
          <ol>
            {tasks.map((task, i) => (
              <li key={i}>
                <div className="lab-task-question">{task.question}</div>
                {task.answer && (
                  <details>
                    <summary>확인</summary>
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
  );
}
