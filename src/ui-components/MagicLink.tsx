import permaLink from '../permaLink.ts';
import { Accessor, createSignal } from 'solid-js';

const MagicLink = (props: {
  href: Accessor<string>;
  label: string;
  labelWhenClicked: string;
  width?: string;
}) => {
  const onClick = (e: PointerEvent) => {
    // Only handle left click (usually button 0) to open the link with middle click or right click context menu
    if (e.button === 0) {
      e.preventDefault();
      navigator.clipboard.writeText(e.currentTarget.href).then(() => {
        setClicked(true);
        setTimeout(() => setClicked(false), 1000);
      });
    }
  };

  const [clicked, setClicked] = createSignal(false);

  return (
    <a
      style={{ 'padding-top': '12px', width: props.width ?? 'auto', 'text-align': 'center' }}
      className="button"
      onClick={onClick}
      href={props.href()}
    >
      {clicked() ? props.labelWhenClicked : props.label}
    </a>
  );
};

export default MagicLink;
