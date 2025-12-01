import { JSX, For, createSignal } from 'solid-js';
import { minecraftColors, colorCategories, BlockColor } from '../data/minecraftColors';
import { currentColor, setCurrentColor } from '../stores/drawingState';
import './ColorPalette.css';

const ColorPalette = (): JSX.Element => {
  const [expandedCategory, setExpandedCategory] = createSignal<string | null>('stone');

  const toggleCategory = (categoryId: string): void => {
    setExpandedCategory(expandedCategory() === categoryId ? null : categoryId);
  };

  const getColorsByCategory = (categoryId: string): BlockColor[] =>
    minecraftColors.filter((c) => c.category === categoryId);

  return (
    <div class="color-palette">
      <div class="palette-header">
        <span class="palette-label">Block Colors</span>
        <div
          class="current-color-preview"
          style={{ 'background-color': currentColor().color }}
          title={currentColor().name}
        />
      </div>

      <div class="current-color-info">
        <span class="current-color-name">{currentColor().name}</span>
      </div>

      <div class="color-categories">
        <For each={colorCategories}>
          {(category) => (
            <div class="color-category">
              <button
                class="category-header"
                classList={{ expanded: expandedCategory() === category.id }}
                onClick={() => toggleCategory(category.id)}
              >
                <span class="category-name">{category.name}</span>
                <span class="category-arrow">{expandedCategory() === category.id ? '▼' : '▶'}</span>
              </button>

              {expandedCategory() === category.id && (
                <div class="category-colors">
                  <For each={getColorsByCategory(category.id)}>
                    {(color) => (
                      <button
                        class="color-swatch"
                        classList={{ selected: currentColor().id === color.id }}
                        style={{ 'background-color': color.color }}
                        onClick={() => setCurrentColor(color)}
                        title={color.name}
                        aria-label={color.name}
                      />
                    )}
                  </For>
                </div>
              )}
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default ColorPalette;
