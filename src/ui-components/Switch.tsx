import {
  JSX,
  Accessor,
  Setter,
  onMount,
  createEffect,
  onCleanup,
} from 'solid-js';
import './Switch.css';
import permaLink from '../permaLink.ts';

const Switch = (props: {
  label: string;
  currentVal: Accessor<boolean>;
  updateVal: Setter<boolean>;
}) => {
  const id = `${props.label.toLowerCase().replace(/\s+/g, '-')}-toggle`;

  onMount(() => {
    const paramVal = permaLink.getParamBoolean(id)
    if (paramVal !== null) {
      props.updateVal(paramVal)
    }

    createEffect(() => {
      permaLink.setParamBoolean(id, props.currentVal())
    })
  })

  onCleanup(() => {
    permaLink.clearParam(id)
  })

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (
    event
  ) => {
    props.updateVal(event.currentTarget.checked);
  };

  return (
    <div class="switch-container">
      <input
        id={id}
        class="switch"
        type="checkbox"
        checked={props.currentVal()}
        value={Number(props.currentVal())}
        onInput={handleInput}
      />
      <label class="switch-label" for={id}>{props.label}</label>
    </div>
  );
};

export default Switch;
