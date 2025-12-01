import { JSX, For, createMemo } from 'solid-js';
import { pixels, Pixel } from '../stores/pixelStore';
import { layerVisibility, drawPreview, currentColor } from '../stores/drawingState';

// Component to render a single drawn pixel
const DrawnPixel = (props: { pixel: Pixel }): JSX.Element => {
  return (
    <rect
      x={props.pixel.x}
      y={-props.pixel.y - 1}
      width="1"
      height="1"
      fill={props.pixel.color}
      class="drawn-pixel"
      data-block-id={props.pixel.blockId}
      data-layer={props.pixel.layer}
    />
  );
};

// Component to render preview pixels (for line/rectangle tools)
const PreviewPixel = (props: { x: number; y: number; color: string }): JSX.Element => {
  return (
    <rect
      x={props.x}
      y={-props.y - 1}
      width="1"
      height="1"
      fill={props.color}
      class="preview-pixel"
      opacity="0.6"
    />
  );
};

// Main component to render all drawn pixels
const PixelCanvas = (): JSX.Element => {
  // Filter pixels based on layer visibility
  const visiblePixels = createMemo(() => {
    const visibility = layerVisibility();
    return Array.from(pixels().values()).filter(
      (pixel) => visibility[pixel.layer]
    );
  });

  const previewPixels = drawPreview;
  const previewColor = () => currentColor().color;

  return (
    <g class="pixel-canvas">
      {/* Render all visible drawn pixels */}
      <For each={visiblePixels()}>
        {(pixel) => <DrawnPixel pixel={pixel} />}
      </For>

      {/* Render preview pixels for line/rectangle tools */}
      <For each={previewPixels()}>
        {(pos) => (
          <PreviewPixel x={pos.x} y={pos.y} color={previewColor()} />
        )}
      </For>
    </g>
  );
};

export default PixelCanvas;
