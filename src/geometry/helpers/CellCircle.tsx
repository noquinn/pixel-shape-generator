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
 * @param thick - thickness of the circle (number of layers)
 * @param isEvent - whether the diameter is even, to adjust for pixel grid alignment
 * @returns Array of points (x, y) representing the full circle
 */
function CircleShape(
  cx: number,
  cy: number,
  r: number,
  thick: number = 1,
  isEvent: boolean = false,
): Point[] {
  const points: Point[] = [];

  // Ensure minimum for small circles
  if (r < 2) {
    r += 0.2;
  } else {
    // Slightly reduce radius to better fit the grid magic number
    r -= 0.1;
  }

  if (thick > r) {
    thick = r;
  }

  if (thick < 1) {
    thick = 1;
  }

  const xOffset = isEvent ? 0.5 : 0;

  // Draw each circle layer for thickness
  for (let t = 0; t < thick-0.5; t += 0.5) {
    const rt = r - t;

    for (let x = xOffset; x < rt; x++) {
      const py = rt * rt - x * x;
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
  }

  return points;
}

/**
 * SolidJS component that renders a discrete circle with thickness using the Cell component for each calculated point.
 * @param props.x - x coordinate of the center
 * @param props.y - y coordinate of the center
 * @param props.diameter - Diameter of the circle
 * @param props.thickness - Thickness of the circle (number of cells)
 */
const CellCircle = (props: {
  x: number;
  y: number;
  diameter: number;
  thickness?: number;
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

  const points = CircleShape(props.x + xOffset, props.y + yOffset, r, props.thickness, isEven);

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

      <Show when={props.debug?.showGuide}>
        <circle
          cx={props.x + xOffset + 0.5}
          cy={props.y + yOffset + 0.5}
          r={r}
          stroke="red"
          stroke-width="0.1"
          fill="none"
        />
      </Show>
    </>
  );
};

export default CellCircle;
