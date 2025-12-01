import { JSX, For } from 'solid-js';
import {
  Layer,
  layers,
  activeLayer,
  setActiveLayer,
  layerVisibility,
  toggleLayerVisibility,
} from '../stores/drawingState';
import { clearLayer, getPixelsByLayer } from '../stores/pixelStore';
import './LayerPanel.css';

const LayerPanel = (): JSX.Element => {
  const getLayerPixelCount = (layerId: Layer): number => {
    return getPixelsByLayer(layerId).length;
  };

  return (
    <div class="layer-panel">
      <span class="layer-label">Layers</span>

      <div class="layer-list">
        <For each={layers}>
          {(layer) => (
            <div
              class="layer-item"
              classList={{ active: activeLayer() === layer.id }}
            >
              <button
                class="layer-visibility"
                classList={{ hidden: !layerVisibility()[layer.id] }}
                onClick={() => toggleLayerVisibility(layer.id)}
                title={layerVisibility()[layer.id] ? 'Hide layer' : 'Show layer'}
              >
                {layerVisibility()[layer.id] ? '👁️' : '👁️‍🗨️'}
              </button>

              <button
                class="layer-select"
                onClick={() => setActiveLayer(layer.id)}
              >
                <span class="layer-name">{layer.name}</span>
                <span class="layer-count">{getLayerPixelCount(layer.id)}</span>
              </button>

              <button
                class="layer-clear"
                onClick={() => {
                  if (confirm(`Clear all pixels in "${layer.name}" layer?`)) {
                    clearLayer(layer.id);
                  }
                }}
                title="Clear layer"
              >
                🗑️
              </button>
            </div>
          )}
        </For>
      </div>

      <div class="layer-info">
        <small>Drawing to: <strong>{layers.find(l => l.id === activeLayer())?.name}</strong></small>
      </div>
    </div>
  );
};

export default LayerPanel;
