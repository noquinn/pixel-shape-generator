import type { JSX, Accessor, Setter } from 'solid-js';
import './Slider.css';

const Slider = ({
  label,
  min,
  max,
  step = 1,
  currentVal,
  updateVal,
  description
}: {
  label: string;
  description?: string;
  min: number;
  max: number;
  step?: number;
  currentVal: Accessor<number>;
  updateVal: Setter<number>;
}) => {
  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (event) =>
    updateVal(Number(event.currentTarget.value));
  const id = `${label.replace(/\s+/, '-')}-input`;
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
      {description && <div class="slider-description">{description}</div>}
    </div>
  );
};

export default Slider;
