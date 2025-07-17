import { createSignal, For, JSX } from 'solid-js';
import type { Shape } from '../types.d.ts';
import Slider from '../ui-components/Slider.tsx';
import CellLine from './helpers/CellLine.tsx';

const [width, setWidth] = createSignal(15);
const [height, setHeight] = createSignal(25);
const [rotation, setRotation] = createSignal(30);

const ShapeComponent = (): JSX.Element => {
  const a = () => width() / 2;
  const b = () => height() / 2;
  //const radius = Math.hypot(a(), b());
  const rotationRadians = () => (rotation() * Math.PI) / 180;

  const rotate = (x: number, y: number): { x: number; y: number } => {
    const cos = Math.cos(rotationRadians());
    const sin = Math.sin(rotationRadians());
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    };
  };

  const corners = [
    rotate(-a(), -b()),
    rotate(a(), -b()),
    rotate(a(), b()),
    rotate(-a(), b()),
  ];

  return (
    <For each={corners}>
      {(corner, i) => {
        const nextCorner = corners[(i() + 1) % corners.length];
        return (
          <CellLine
            x1={corner.x}
            y1={corner.y}
            x2={nextCorner.x}
            y2={nextCorner.y}
          />
        );
      }}
    </For>
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
        label="Rotation"
        min={0}
        max={360}
        currentVal={rotation}
        updateVal={setRotation}
      />
    </>
  );
};

const Rectangle: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Rectangle',
};

export default Rectangle;
