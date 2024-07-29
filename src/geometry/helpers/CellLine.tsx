import { For } from 'solid-js';
import Cell from './Cell.tsx';

const CellLine = (props: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) => {
  const dx = props.x2 - props.x1;
  const dy = props.y2 - props.y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const sx = dx / steps;
  const sy = dy / steps;
  return (
    <For each={Array.from({ length: steps + 1 })}>
      {(_, i) => (
        <Cell
          x={Math.round(props.x1 + sx * i())}
          y={Math.round(props.y1 + sy * i())}
        />
      )}
    </For>
  );
};

export default CellLine;
