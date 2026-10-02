import katex from 'katex';
import { useMemo } from 'react';

interface FormulaProps {
  /** KaTeX(LaTeX) 원문. 기호 표기는 docs/Contents.md §3을 따른다. */
  tex: string;
  /** true면 블록 수식 */
  display?: boolean;
  className?: string;
}

/** 랩의 "살아있는 수식": 파라미터가 바뀌면 tex 문자열만 다시 만들어 넘기면 된다. */
export default function Formula({ tex, display = false, className }: FormulaProps) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false }),
    [tex, display],
  );
  const Tag = display ? 'div' : 'span';
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
