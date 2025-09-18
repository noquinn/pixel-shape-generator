import { createSignal, createMemo, For, Show, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellArc from './helpers/CellArc.tsx';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';

type Arc = {
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
};

const [sides, setSides] = createSignal(3);
const [diameter, setDiameter] = createSignal(30);
const [rotation, setRotation] = createSignal(0);
const [showDrawGuide, setShowDrawGuide] = createSignal(false);

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
    <>
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
      <Show when={showDrawGuide()}>
        <path d={getReuleauxPath(arcs())} class="draw-guide" />
      </Show>
    </>
  );
};

function getReuleauxPath(arcs: Arc[]): string {
  const getArcEnd = (arc: Arc) => {
    return {
      x: arc.x + arc.radius * Math.cos(arc.endAngle) + 0.5,
      y: arc.y + arc.radius * Math.sin(arc.endAngle) + 0.5,
    };
  };

  const start = getArcEnd(arcs[arcs.length - 1]);
  let path = `M ${start.x} ${start.y}`;
  arcs.forEach((arc) => {
    const end = getArcEnd(arc);
    path += ` A ${arc.radius} ${arc.radius} 0 0 1 ${end.x} ${end.y}`;
  });
  path += ' Z';
  return path;
}

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
      <Switch
        label="Show Draw Guide"
        currentVal={showDrawGuide}
        updateVal={setShowDrawGuide}
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
