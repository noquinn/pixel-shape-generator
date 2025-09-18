import { createSignal, For, Show, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';

const [sides, setSides] = createSignal(5);
const [diameter, setDiameter] = createSignal(25);
const [rotation, setRotation] = createSignal(0);
const [showAngleBisectors, setShowAngleBisectors] = createSignal(false);
const [showPerpendicularBisectors, setShowPerpendicularBisectors] =
  createSignal(false);
const [showDrawGuide, setShowDrawGuide] = createSignal(false);

const calculateVertex = (i: number): { x: number; y: number } => {
  const radius = diameter() / 2;
  const angle = (i * 2 * Math.PI) / sides() + (rotation() * Math.PI) / 180;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
};

const ShapeComponent = (): JSX.Element => {
  const verts = Array.from({ length: sides() }, (_, i) => calculateVertex(i));
  return (
    <>
      <Show when={showAngleBisectors()}>
        <For each={verts}>
          {(v) => <CellLine x1={v.x} y1={v.y} x2={0} y2={0} debug />}
        </For>
      </Show>
      <Show when={showPerpendicularBisectors()}>
        <For each={verts}>
          {(_, i) => (
            <CellLine
              x1={(verts[i()].x + verts[(i() + 1) % sides()].x) / 2}
              y1={(verts[i()].y + verts[(i() + 1) % sides()].y) / 2}
              x2={0}
              y2={0}
              debug
            />
          )}
        </For>
      </Show>
      <For each={verts}>
        {(_, i) => (
          <CellLine
            x1={verts[i()].x}
            y1={verts[i()].y}
            x2={verts[(i() + 1) % sides()].x}
            y2={verts[(i() + 1) % sides()].y}
          />
        )}
      </For>
      <Show when={showDrawGuide()}>
        <polygon
          points={verts.map(({ x, y }) => `${x + 0.5},${y + 0.5}`).join(' ')}
          class="draw-guide"
        />
      </Show>
    </>
  );
};

const SettingsComponent = (): JSX.Element => {
  return (
    <>
      <Slider
        label="Sides"
        min={3}
        max={16}
        currentVal={sides}
        updateVal={setSides}
      />
      <Slider
        label="Diameter"
        min={10}
        max={500}
        currentVal={diameter}
        updateVal={setDiameter}
      />
      <Slider
        label="Rotation"
        min={0}
        max={360}
        currentVal={rotation}
        updateVal={setRotation}
      />
      <Switch
        label="Show Angle Bisectors"
        currentVal={showAngleBisectors}
        updateVal={setShowAngleBisectors}
      />
      <Switch
        label="Show Perpendicular Bisectors"
        currentVal={showPerpendicularBisectors}
        updateVal={setShowPerpendicularBisectors}
      />
      <Switch
        label="Show Draw Guide"
        currentVal={showDrawGuide}
        updateVal={setShowDrawGuide}
      />
    </>
  );
};

const RegularPolygon: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Regular Polygon',
};

export default RegularPolygon;
