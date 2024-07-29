import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';

const [vertices, setVertices] = createSignal(5);
const [diameter1, setDiameter1] = createSignal(20);
const [diameter2, setDiameter2] = createSignal(40);
const [rotation, setRotation] = createSignal(72);

const calculateVertex = (i: number): { x: number; y: number } => {
  const radius = (i % 2 == 0 ? diameter1() : diameter2()) / 2;
  const angle =
    (i * 2 * Math.PI) / vertices() / 2 + (rotation() * Math.PI) / 180;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
};

const ShapeComponent = (): JSX.Element => {
  const verts = Array.from({ length: vertices() * 2 }, (_, i) =>
    calculateVertex(i)
  );
  return (
    <For each={verts}>
      {(_, i) => (
        <CellLine
          x1={verts[i()].x}
          y1={verts[i()].y}
          x2={verts[(i() + 1) % (vertices() * 2)].x}
          y2={verts[(i() + 1) % (vertices() * 2)].y}
        />
      )}
    </For>
  );
};

const SettingsComponent = (): JSX.Element => {
  return (
    <>
      <Slider
        label="Vertices"
        min={3}
        max={16}
        currentVal={vertices}
        updateVal={setVertices}
      />
      <Slider
        label="Diameter 1"
        min={0}
        max={200}
        currentVal={diameter1}
        updateVal={setDiameter1}
      />
      <Slider
        label="Diameter 2"
        min={0}
        max={200}
        currentVal={diameter2}
        updateVal={setDiameter2}
      />
      <Slider
        label="Rotation"
        min={0}
        max={360}
        currentVal={rotation}
        updateVal={setRotation}
      />
    </>
  );
};

const Star: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Star',
};

export default Star;
