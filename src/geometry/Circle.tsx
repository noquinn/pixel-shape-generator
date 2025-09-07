import { createSignal, JSX, Show } from 'solid-js';
import type { Shape } from '../types.d.ts';
import CellCircle from './helpers/CellCircle.tsx';
import Slider from '../ui-components/Slider.tsx';
import Switch from '../ui-components/Switch.tsx';

const [diameter, setDiameter] = createSignal(11);
const [thickness, setThickness] = createSignal(1);

const [showAdvanced, setShowAdvanced] = createSignal(false);

const [offsetRayon, setOffsetRayon] = createSignal(0);
const [showGuide, setShowGuide] = createSignal(false);
const [showBounds, setShowBounds] = createSignal(false);
const [showCenter, setShowCenter] = createSignal(false);

const ShapeComponent = (): JSX.Element => {
  const d1 = diameter();
  const rOffset = offsetRayon();
  const t = thickness();

  return (
    <CellCircle
      x={0}
      y={0}
      diameter={d1}
      thickness={t}
      debug={{
        rOffset: rOffset,
        showGuide: showGuide(),
        showBounds: showBounds(),
        showCenter: showCenter(),
      }}
    />
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
      <Slider
        label="Thickness"
        min={1}
        max={10}
        currentVal={thickness}
        updateVal={setThickness}
        description={'High thickness with high diameter can cause long render'}
      />
      <Switch
        label="Show Advanced Settings"
        currentVal={showAdvanced}
        updateVal={setShowAdvanced}
      />
      <Show when={showAdvanced()}>
        <Slider
          label="Offset Rayon"
          min={-0.5}
          max={0.5}
          step={0.05}
          currentVal={offsetRayon}
          updateVal={setOffsetRayon}
          description={'Low or high values may change the diameter'}
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
          label="Show Circle Draw Guide"
          currentVal={showGuide}
          updateVal={setShowGuide}
        />
      </Show>
    </>
  );
};

const Circle: Shape = {
  shapeComponent: ShapeComponent,
  settingsComponent: SettingsComponent,
  name: 'Circle',
};

export default Circle;
