import { JSX, For, Show } from 'solid-js';
import { getUsedColors } from '../stores/pixelStore';
import { setCurrentColor } from '../stores/drawingState';
import { getColorById } from '../data/minecraftColors';
import './Legend.css';

const Legend = (): JSX.Element => {
  const usedColors = getUsedColors;

  const handleColorClick = (blockId: string): void => {
    const color = getColorById(blockId);
    if (color) {
      setCurrentColor(color);
    }
  };

  return (
    <div class="legend">
      <span class="legend-label">Legend</span>

      <Show
        when={usedColors().length > 0}
        fallback={<p class="legend-empty">No blocks placed yet</p>}
      >
        <div class="legend-items">
          <For each={usedColors()}>
            {(item) => (
              <button
                class="legend-item"
                onClick={() => handleColorClick(item.blockId)}
                title={`Click to select ${item.blockName}`}
              >
                <div
                  class="legend-color"
                  style={{ 'background-color': item.color }}
                />
                <span class="legend-name">{item.blockName}</span>
                <span class="legend-count">{item.count}</span>
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default Legend;
