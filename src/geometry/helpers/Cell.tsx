import { createSignal, JSX } from 'solid-js';

const Cell = (props: {
  x: number;
  y: number;
  debug?: boolean;
}): JSX.Element => {
  const [isHighlighted, setIsHighlighted] = createSignal(false);
  return (
    <rect
      onClick={() => setIsHighlighted(!isHighlighted())}
      x={props.x}
      y={props.y}
      width="1"
      height="1"
      classList={{
        cell: true,
        debug: props.debug,
        highlighted: isHighlighted(),
      }}
    />
  );
};

export default Cell;
