import { For } from 'solid-js';
import Cell from './Cell.tsx';
import { Point } from '../../types';

const CellCircle = (props: {
  x: number;
  y: number;
  diameter: number;
  debug?: boolean;
}) => {
  let r = (props.diameter - 1) / 2;
  r += 0.1 * (r > 2 ? -1 : 1);

  const isEven = props.diameter % 2 === 0;
  const offset = isEven ? 0.5 : 0;
  const cx = props.x + offset;
  const cy = props.y + offset;

  const points: Point[] = [];
  for (let x = offset; x < r; x++) {
    const py = r * r - x * x;
    const y = Math.sqrt(py);

    points.push({ x: Math.round(cx + x), y: Math.round(cy - y) });
    points.push({ x: Math.round(cx + y), y: Math.round(cy - x) });

    points.push({ x: Math.round(cx + x), y: Math.round(cy + y) });
    points.push({ x: Math.round(cx + y), y: Math.round(cy + x) });

    points.push({ x: Math.round(cx - x), y: Math.round(cy - y) });
    points.push({ x: Math.round(cx - y), y: Math.round(cy - x) });

    points.push({ x: Math.round(cx - x), y: Math.round(cy + y) });
    points.push({ x: Math.round(cx - y), y: Math.round(cy + x) });
  }

  return (
    <For each={points}>
      {(c) => <Cell x={c.x} y={c.y} debug={props.debug} />}
    </For>
  );
};

export default CellCircle;
