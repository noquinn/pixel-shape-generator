import { For } from 'solid-js';
import type { Accessor, Setter } from 'solid-js';
import './Select.css';
import permaLink from '../permaLink.ts';

const Select = (props: {
  label: string;
  selectedOption: Accessor<any>;
  updateSelectedOption: Setter<any>;
  options: any[];
  extractOptionValue: (option: any) => string;
  extractOptionLabel: (option: any) => string;
}) => {
  const handleInput = (event: Event) => {
    const selectedOptionVal = (event.currentTarget as HTMLSelectElement).value;

    // update permaLink shape
    permaLink.setShape(selectedOptionVal);

    props.updateSelectedOption(
      props.options.find(
        (option) => props.extractOptionValue(option) === selectedOptionVal
      )
    );
  };
  const id = `${props.label.replace(/\s+/, '-')}-select`;
  return (
    <div class="select-container">
      <label for={id}>{props.label}</label>
      <select
        id={id}
        value={props.extractOptionValue(props.selectedOption())}
        onChange={handleInput}
      >
        <For each={props.options}>
          {(option) => (
            <option value={props.extractOptionValue(option)}>
              {props.extractOptionLabel(option)}
            </option>
          )}
        </For>
      </select>
    </div>
  );
};

export default Select;
