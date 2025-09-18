// CellCircle.tsx
// This file defines the CellCircle component and the Circle utility function for generating discrete circle points on a grid.
// It is used to render circles by displaying individual cells at each calculated point.

import { For, Show } from 'solid-js';
import Cell from './Cell.tsx';
import { Point } from '../../types';
import CellLine from './CellLine.tsx';

/**
 * Generates all points of a discrete circle centered at (cx, cy) with radius r.
 * Uses symmetry to cover all 8 octants, so the full circle is drawn.
 * @param cx - x coordinate of the center
 * @param cy - y coordinate of the center
 * @param r - radius of the circle
 * @param isEvent
 * @returns Array of points (x, y) representing the full circle
 */
function CircleShape(
  cx: number,
  cy: number,
  r: number,
  isEvent: boolean = false
): Point[] {
  const points: Point[] = [];

  const xOffset = isEvent ? 0.5 : 0;

  // Correction : inclure le bord du cercle
  for (let x = xOffset; x < r; x++) {
    const py = r * r - x * x;
    const y = Math.sqrt(py);

    // All 8 octant's arc
    points.push({ x: Math.round(cx + x), y: Math.round(cy - y) });
    points.push({ x: Math.round(cx + y), y: Math.round(cy - x) });

    points.push({ x: Math.round(cx + x), y: Math.round(cy + y) });
    points.push({ x: Math.round(cx + y), y: Math.round(cy + x) });

    points.push({ x: Math.round(cx - x), y: Math.round(cy - y) });
    points.push({ x: Math.round(cx - y), y: Math.round(cy - x) });

    points.push({ x: Math.round(cx - x), y: Math.round(cy + y) });
    points.push({ x: Math.round(cx - y), y: Math.round(cy + x) });
  }

  return points;
}

/**
 * SolidJS component that renders a discrete circle using the Cell component for each calculated point.
 * @param props.x - x coordinate of the center
 * @param props.y - y coordinate of the center
 * @param props.diameter - Diameter of the circle
 */
const CellCircle = (props: {
  x: number;
  y: number;
  diameter: number;
  debug?: {
    xOffset?: number;
    yOffset?: number;
    rOffset?: number;
    showGuide?: boolean;
    showBounds?: boolean;
    showCenter?: boolean;
  };
}) => {
  const isEven = props.diameter % 2 === 0;

  let yOffset = 0;
  let xOffset = 0;

  // Radius is diameter / 2, minus 1 to fit in the grid
  let r = (props.diameter - 1) / 2;

  // 0.1 to avoid gaps on circle edge when diameter is small
  if (r > 2) {
    r -= 0.1;
  }
  // For very small circles, increase radius to avoid gaps
  else {
    r += 0.1;
  }

  // Center the circle on the grid for even diameters
  if (isEven) {
    xOffset += 0.5;
    yOffset += 0.5;
  }

  {
    // Apply debug
    if (props.debug?.rOffset) {
      r += props.debug.rOffset;
    }

    if (props.debug?.yOffset) {
      yOffset += props.debug.yOffset;
    }

    if (props.debug?.xOffset) {
      xOffset += props.debug.xOffset;
    }
  }

  const left = props.x + xOffset - r;
  const right = props.x + xOffset + r;
  const top = props.y + yOffset - r;
  const bottom = props.y + yOffset + r;

  const points = CircleShape(props.x + xOffset, props.y + yOffset, r, isEven);

  return (
    <>
      <Show when={props.debug?.showBounds}>
        <CellLine debug x1={left} y1={top} x2={right} y2={top} />
        <CellLine debug x1={right} y1={top} x2={right} y2={bottom} />
        <CellLine debug x1={right} y1={bottom} x2={left} y2={bottom} />
        <CellLine debug x1={left} y1={bottom} x2={left} y2={top} />
      </Show>
      <Show when={props.debug?.showCenter}>
        <Show when={isEven}>
          <CellLine debug x1={left} y1={1} x2={right} y2={1} />
        </Show>
        <Show when={isEven}>
          <CellLine debug x1={1} y1={top} x2={1} y2={bottom} />
        </Show>
        <CellLine debug x1={0} y1={top} x2={0} y2={bottom} />
        <CellLine debug x1={left} y1={0} x2={right} y2={0} />
      </Show>

      <For each={points}>{(c) => <Cell x={c.x} y={c.y} />}</For>

      {props.debug?.showGuide && (
        <circle
          cx={props.x + xOffset + 0.5}
          cy={props.y + yOffset + 0.5}
          r={r}
          class="draw-guide"
        />
      )}
    </>
  );
};

export default CellCircle;
