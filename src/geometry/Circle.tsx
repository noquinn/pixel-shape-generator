import { createSignal, JSX, Show } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import CellCircle from './helpers/CellCircle.tsx';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';

const [diameter, setDiameter] = createSignal(25);

const [showGuide, setShowGuide] = createSignal(false);
const [showBounds, setShowBounds] = createSignal(false);
const [showCenter, setShowCenter] = createSignal(false);

const ShapeComponent = (): JSX.Element => {
  const d = diameter();
  let r = (d - 1) / 2;
  r += 0.1 * (r > 2 ? -1 : 1);

  const isEven = d % 2 === 0;
  const offset = isEven ? 0.5 : 0;

  const left = offset - r;
  const right = offset + r;
  const top = offset - r;
  const bottom = offset + r;

  return (
    <>
      <Show when={showBounds()}>
        <CellLine debug x1={left} y1={top} x2={right} y2={top} />
        <CellLine debug x1={right} y1={top} x2={right} y2={bottom} />
        <CellLine debug x1={right} y1={bottom} x2={left} y2={bottom} />
        <CellLine debug x1={left} y1={bottom} x2={left} y2={top} />
      </Show>
      <Show when={showCenter()}>
        <CellLine debug x1={0} y1={top} x2={0} y2={bottom} />
        <CellLine debug x1={left} y1={0} x2={right} y2={0} />
        <Show when={isEven}>
          <CellLine debug x1={left} y1={1} x2={right} y2={1} />
          <CellLine debug x1={1} y1={top} x2={1} y2={bottom} />
        </Show>
      </Show>
      <CellCircle x={0} y={0} diameter={d} />
      <Show when={showGuide()}>
        <circle cx={offset + 0.5} cy={offset + 0.5} r={r} class="draw-guide" />
      </Show>
    </>
  );
};

const SettingsComponent = (): JSX.Element => {
  return (
    <>
      <Slider
        label="Diameter"
        min={1}
        max={500}
        currentVal={diameter}
        updateVal={setDiameter}
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
      <Switch
        label="Show Draw Guide"
        currentVal={showGuide}
        updateVal={setShowGuide}
      />
    </>
  );
};

const Circle: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Circle',
};

export default Circle;
