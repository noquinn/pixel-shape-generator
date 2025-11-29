import type { JSX, Accessor, Setter } from 'solid-js';
import { createSignal } from 'solid-js';
import './Slider.css';

const Slider = ({
  label,
  min,
  max,
  step = 1,
  currentVal,
  updateVal,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  currentVal: Accessor<number>;
  updateVal: Setter<number>;
}) => {
  const [isInvalid, setIsInvalid] = createSignal(false);

  const isValidStep = (val: number) => {
    // check whether input is valid, given the step size
    const stepsFromMin = (val - min) / step;
    return Math.abs(stepsFromMin - Math.round(stepsFromMin)) < 1e-10;
  };

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (
    event
  ) => {
    const val = Number(event.currentTarget.value);
    const invalid = isNaN(val) || val < min || val > max || !isValidStep(val);
    setIsInvalid(invalid);
    if (invalid) return;
    updateVal(val);
  };

  const handleBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = (
    event
  ) => {
    const val = Number(event.currentTarget.value);
    if (val < min) {
      updateVal(min);
    } else if (val > max) {
      updateVal(max);
    } else if (!isValidStep(val)) {
      const stepsFromMin = Math.round((val - min) / step);
      updateVal(min + stepsFromMin * step);
    }
    event.currentTarget.value = String(currentVal());
    setIsInvalid(false);
  };

  const id = `${label.replace(/\s+/, '-')}`;
  const percent = () => ((currentVal() - min) / (max - min)) * 100;
  return (
    <div class="slider-container">
      <div>
        <label for={`${id}-number`} id={`${id}-label`}>
          {label}
        </label>
        <input
          type="number"
          id={`${id}-number`}
          inputmode={step % 1 === 0 ? 'numeric' : 'decimal'}
          step={step}
          min={min}
          max={max}
          value={currentVal()}
          onInput={handleInput}
          onBlur={handleBlur}
          aria-labelledby={`${id}-label`}
          classList={{ invalid: isInvalid() }}
        />
      </div>
      <div>
        <input
          style={{
            background: `linear-gradient(to right, var(--cell-color) ${percent()}%, var(--ui-void-color) ${percent()}%)`,
          }}
          type="range"
          id={`${id}-range`}
          aria-labelledby={`${id}-label`}
          class="slider"
          min={min}
          max={max}
          step={step}
          value={currentVal()}
          onInput={handleInput}
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

export default Slider;
