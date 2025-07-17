import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellLine from './helpers/CellLine.tsx';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';

const [sides, setSides] = createSignal(4);
const [diameter, setDiameter] = createSignal(50);
const [loops, setLoops] = createSignal(4);
const [rotation, setRotation] = createSignal(30);
const [invert, setInvert] = createSignal(false);

const ShapeComponent = (): JSX.Element => {
  let k = 0;
  const radius = diameter() / 2;
  const radiusStep = radius / sides() / loops();
  let verts: { x: number; y: number }[] = [];
  for (let i = 0; i < loops(); i++) {
    for (let j = 0; j < sides(); j++) {
      const angle = (j * 2 * Math.PI) / sides() + (rotation() * Math.PI) / 180;
      verts.push({
        x: (invert() ? -1 : 1) * radiusStep * k * Math.cos(angle),
        y: radiusStep * k * Math.sin(angle),
      });
      k++;
    }
  }

  return (
    <For each={Array.from({ length: verts.length - 1 })}>
      {(_, i) => (
        <CellLine
          x1={verts[i()].x}
          y1={verts[i()].y}
          x2={verts[i() + 1].x}
          y2={verts[i() + 1].y}
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
        max={10}
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
        label="Loops"
        min={2}
        max={10}
        currentVal={loops}
        updateVal={setLoops}
      />
      <Slider
        label="Rotation"
        min={0}
        max={360}
        currentVal={rotation}
        updateVal={setRotation}
      />
      <Switch label="Invert" currentVal={invert} updateVal={setInvert} />
    </>
  );
};

const Spirangle: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Spirangle',
};

export default Spirangle;
