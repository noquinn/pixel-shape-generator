import { createSignal, For, Show, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';
import CellLine from './helpers/CellLine.tsx';
import Cell from './helpers/Cell.tsx';

const [width, setWidth] = createSignal(31);
const [height, setHeight] = createSignal(31);
const [exponent, setExponent] = createSignal(4);
const [showBounds, setShowBounds] = createSignal(false);
const [showCenter, setShowCenter] = createSignal(false);

const ShapeComponent = (): JSX.Element => {
  const n = exponent();
  const a = width() / 2;
  const b = height() / 2;

  let cx = width() % 2 === 0 ? 0.5 : 0;
  let cy = height() % 2 === 0 ? 0.5 : 0;

  const left = Math.trunc(cx - a);
  const right = Math.trunc(cx + a);
  const top = Math.trunc(cy - b);
  const bottom = Math.trunc(cy + b);

  let points = [];

  for (let x = cx + 1; x < right; x++) {
    let y = Math.round(b * (1 - (Math.abs(x) / a) ** n) ** (1 / n)) - cy;
    y = Math.max(cy, Math.min(y, bottom));
    points.push({ x, y });
  }
  points.push({ x: cx, y: bottom - cy });

  for (let y = cy + 1; y < bottom; y++) {
    let x = Math.round(a * (1 - (Math.abs(y) / b) ** n) ** (1 / n)) - cx;
    x = Math.max(cx, Math.min(x, right));
    points.push({ x, y });
  }
  points.push({ x: right - cx, y: cy });

  //if (showCenter()) points.push({ x: cx, y: cy });

  return (
    <>
      <Show when={showBounds()}>
        <CellLine x1={left} y1={top} x2={right} y2={top} debug />
        <CellLine x1={right} y1={top} x2={right} y2={bottom} debug />
        <CellLine x1={right} y1={bottom} x2={left} y2={bottom} debug />
        <CellLine x1={left} y1={bottom} x2={left} y2={top} debug />
      </Show>
      <Show when={showCenter()}>
        <Show when={height() % 2 === 0}>
          <CellLine x1={left} y1={1} x2={right} y2={1} debug />
        </Show>
        <Show when={width() % 2 === 0}>
          <CellLine x1={1} y1={top} x2={1} y2={bottom} debug />
        </Show>
        <CellLine x1={0} y1={top} x2={0} y2={bottom} debug />
        <CellLine x1={left} y1={0} x2={right} y2={0} debug />
      </Show>
      <For each={points}>
        {(p) => (
          <>
            <Cell x={cx + p.x} y={cy + p.y} />
            <Cell x={cx - p.x} y={cy + p.y} />
            <Cell x={cx + p.x} y={cy - p.y} />
            <Cell x={cx - p.x} y={cy - p.y} />
          </>
        )}
      </For>
    </>
  );
};

const SettingsComponent = (): JSX.Element => {
  return (
    <>
      <Slider
        label="Width"
        min={4}
        max={500}
        currentVal={width}
        updateVal={setWidth}
      />
      <Slider
        label="Height"
        min={4}
        max={500}
        currentVal={height}
        updateVal={setHeight}
      />
      <Slider
        label="Exponent"
        min={0.1}
        max={10}
        step={0.01}
        currentVal={exponent}
        updateVal={setExponent}
      />
      <Switch
        label="Show Bounds"
        currentVal={showBounds}
        updateVal={setShowBounds}
      />
      <Switch
        label="Show Center"
        currentVal={showCenter}
        updateVal={setShowCenter}
      />
    </>
  );
};

const Superellipse: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Superellipse',
};

export default Superellipse;
