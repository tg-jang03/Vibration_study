import { useId, type SVGProps } from 'react';
import { useMobileLayout } from './hooks';

type SvgPanel = readonly [x: number, y: number, width: number, height: number];
interface Props extends SVGProps<SVGSVGElement> {
  /** 모바일에서 위아래로 배치할 원본 SVG 영역. 좌표와 종횡비를 유지한다. */
  mobilePanels: readonly SvgPanel[];
  /** 두 원판은 나란히, 세 번째 파형은 아래에 넓게 표시한다. */
  mobileLayout?: 'stack' | 'disks';
}

/** PC에서는 기존 SVG를 그대로 렌더한다. 모바일은 같은 도형을 영역별로 나누어 읽는다. */
export default function ResponsiveSvg({ mobilePanels, mobileLayout = 'stack', children, ...svgProps }: Props) {
  const mobile = useMobileLayout();
  const sourceId = useId().replaceAll(':', '') + '-svg-content';
  if (!mobile) return <svg {...svgProps}>{children}</svg>;
  return (
    <div className="mobile-svg-panels" data-layout={mobileLayout} role="img" aria-label={svgProps['aria-label']}>
      {mobilePanels.map((panel, i) => (
        <svg key={i} viewBox={panel.join(' ')} width="100%" aria-hidden="true">
          {i === 0 && <defs><g id={sourceId}>{children}</g></defs>}
          <use href={'#' + sourceId} />
        </svg>
      ))}
    </div>
  );
}
