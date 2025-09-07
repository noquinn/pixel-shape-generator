import { Accessor, createSignal } from 'solid-js';

const CopyLink = (props: {
  href: Accessor<string>;
  label: string;
  labelWhenClicked: string;
  width?: string;
}) => {
  const onClick = (e: MouseEvent) => {
    // Only handle left click (usually button 0) to open the link with middle click or right click context menu
    if (e.button !== 0) return;
    e.preventDefault();
    const anchor = e.currentTarget as HTMLAnchorElement | null;
    if (!anchor?.href) return;

    navigator.clipboard.writeText(anchor.href).then(() => {
      setClicked(true);
      setTimeout(() => setClicked(false), 1000);
    });
  };

  const [clicked, setClicked] = createSignal(false);

  return (
    <a
      style={{
        'padding-top': '12px',
        width: props.width ?? 'auto',
        'text-align': 'center',
      }}
      class="button"
      onClick={onClick}
      href={props.href()}
    >
      {clicked() ? props.labelWhenClicked : props.label}
    </a>
  );
};

export default CopyLink;
