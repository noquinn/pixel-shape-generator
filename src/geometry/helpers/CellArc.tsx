import { For } from 'solid-js';
import Cell from './Cell.tsx';

const CellArc = (props: {
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
}) => {
  let coords: { x: number; y: number }[] = [];

  for (let i = props.startAngle; i < props.endAngle; i += 1 / props.radius) {
    coords.push({
      x: Math.round(props.x + props.radius * Math.cos(i)),
      y: Math.round(props.y + props.radius * Math.sin(i)),
    });
  }
  return <For each={coords}>{(c) => <Cell x={c.x} y={c.y} />}</For>;
};

export default CellArc;
