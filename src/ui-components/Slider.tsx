import {
  JSX,
  Accessor,
  Setter,
  createEffect,
  onMount,
  onCleanup,
} from 'solid-js';
import './Slider.css';
import permaLink from '../permaLink.ts';

const Slider = ({
  label,
  min,
  max,
  step = 1,
  currentVal,
  updateVal,
  description,
}: {
  label: string;
  description?: string;
  min: number;
  max: number;
  step?: number;
  currentVal: Accessor<number>;
  updateVal: Setter<number>;
}) => {
  const id = `${label.toLowerCase().replace(/\s+/g, '-')}-input`;

  onMount(() => {
    const paramVal = permaLink.getParamNumber(id);
    if (paramVal !== null) {
      updateVal(paramVal);
    }

    createEffect(() => {
      permaLink.setParam(id, currentVal().toString());
    });
  });

  onCleanup(() => {
    permaLink.clearParam(id);
  });

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (event) =>
    updateVal(Number(event.currentTarget.value));

  const percent = () => ((currentVal() - min) / (max - min)) * 100;
  return (
    <div class="slider-container">
      <div>
        <label for={id}>{label}</label>
        <span class="slider-val">{currentVal()}</span>
      </div>
      <div>
        <input
          style={{
            background: `linear-gradient(to right, var(--cell-color) ${percent()}%, var(--ui-void-color) ${percent()}%)`,
          }}
          type="range"
          id={id}
          class="slider"
          min={min}
          max={max}
          step={step}
          value={currentVal()}
          onInput={handleInput}
        />
      </div>
      {description && <span class="slider-description">{description}</span>}
    </div>
  );
};

export default Slider;
