import { createSignal, createMemo, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellArc from './helpers/CellArc.tsx';
import Slider from '../ui-components/Slider.tsx';

const [sides, setSides] = createSignal(3);
const [diameter, setDiameter] = createSignal(30);
const [rotation, setRotation] = createSignal(0);

const ShapeComponent = () => {
  const theta = createMemo(() => (2 * Math.PI) / sides());
  const radius = createMemo(() => diameter() / 2);
  const arcRadius = createMemo(() =>
    Math.sqrt(
      2 * radius() ** 2 * (1 - Math.cos(theta() * Math.floor(sides() / 2)))
    )
  );
  const rotationRadians = createMemo(() => (rotation() * Math.PI) / 180);

  const arcs = () =>
    Array.from({ length: sides() }).map((_, i) => {
      const angle = i * theta() + rotationRadians();
      const cx = radius() * Math.cos(angle);
      const cy = radius() * Math.sin(angle);
      const baseAngle = theta() * i + Math.PI + rotationRadians();
      return {
        x: cx,
        y: cy,
        radius: arcRadius(),
        startAngle: baseAngle - theta() / 4,
        endAngle: baseAngle + theta() / 4,
      };
    });

  return (
    <For each={arcs()}>
      {(arc) => (
        <CellArc
          x={arc.x}
          y={arc.y}
          radius={arc.radius}
          startAngle={arc.startAngle}
          endAngle={arc.endAngle}
        />
      )}
    </For>
  );
};

const SettingsComponent = (): JSX.Element => {
  return (
    <>
      <Slider
        label="Sides"
        min={3}
        max={11}
        step={2}
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
    </>
  );
};

const ReuleauxPolygon: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Reuleaux Polygon',
};

export default ReuleauxPolygon;
