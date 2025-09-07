import {
  createSignal,
  createMemo,
  onCleanup,
  onMount,
  For,
  Show,
  createEffect,
} from 'solid-js';

import type { Shape } from './types';

import Rectangle from './geometry/Rectangle.tsx';
import RegularPolygon from './geometry/RegularPolygon.tsx';
import ReuleauxPolygon from './geometry/ReuleauxPolygon.tsx';
import Superellipse from './geometry/Superellipse.tsx';
import ArchimedianSpiral from './geometry/ArchimedianSpiral.tsx';
import Star from './geometry/Star.tsx';
import Spirangle from './geometry/Spirangle.tsx';
import Circle from './geometry/Circle.tsx';

import { downloadSVG, downloadPNG } from './download.ts';
import {
  camera,
  panCamera,
  centerCamera,
  changeZoom,
  MIN_ZOOM,
  MAX_ZOOM,
  MIN_CELL_SIZE,
} from './camera.ts';
import {
  pointer,
  handleMouseDown,
  handleMouseLeave,
  handleMouseMove,
  handleMouseUp,
  handleTouchEnd,
  handleTouchMove,
  handleTouchStart,
  handleWheel,
} from './pointer.ts';
import Select from './ui-components/Select.tsx';
import './App.css';
import permaLink from './permaLink.ts';
import CopyLink from './ui-components/CopyLink.tsx';

let outputContainer: HTMLDivElement | undefined;
const [outputSize, setOutputSize] = createSignal({ width: 0, height: 0 });

function App() {
  const shapes: Shape[] = [
    RegularPolygon,
    ReuleauxPolygon,
    Superellipse,
    ArchimedianSpiral,
    Star,
    Spirangle,
    Rectangle,
    Circle,
  ];

  const [selectedShape, setSelectedShape] = createSignal<Shape|null>(null);

  onMount(() => {
    const mountStartTime = performance.now();
    const updateOutputSize = (): void => {
      if (!outputContainer) return;

      // preserve camera center on resize
      panCamera(
        (outputSize().width - outputContainer.offsetWidth) / 2,
        (outputSize().height - outputContainer.offsetHeight) / 2
      );

      setOutputSize({
        width: outputContainer.offsetWidth,
        height: outputContainer.offsetHeight,
      });

      const delta = performance.now() - mountStartTime;
      if (delta < 500) centerCamera();
    };
    updateOutputSize();
    const resizeObserver = new ResizeObserver(updateOutputSize);
    resizeObserver.observe(outputContainer!);
    onCleanup(() => {
      resizeObserver.disconnect();
    });
  });

  const scale = createMemo(
    () => 2 ** Math.ceil(Math.log2(Math.max(camera().zoom * MIN_CELL_SIZE, 1)))
  ); // number of cells per grid line
  const numVerticalGridLines = () =>
    Math.ceil((outputSize().width * camera().zoom) / scale()) + 1;
  const numHorizontalGridLines = () =>
    Math.ceil((outputSize().height * camera().zoom) / scale()) + 1;

  onMount(() => {
    const preventDefault = (event: TouchEvent): void => {
      if (event.cancelable) event.preventDefault();
    };
    outputContainer!.addEventListener('touchmove', preventDefault);
    onCleanup(() => {
      outputContainer!.removeEventListener('touchmove', preventDefault);
    });
  });

  // on mount, load state from URL and set default shape
  onMount(() => {
    // load state from URL
    permaLink.loadFromUrl();

    const defaultShape = permaLink.getShape();
    if (!defaultShape) {
      setSelectedShape(shapes[0]);
    }

    // find shape by name and set as selected
    const shape = shapes.find((s) => s.name === defaultShape);
    if (shape) {
      setSelectedShape(shape);
      return;
    }

    setSelectedShape(shapes[0]);
  });

  // set up effect to save state to URL on change
  createEffect(permaLink.saveToUrl);

  return (
    <>
      <div
        id="output-container"
        ref={outputContainer}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onScroll={() => {}} // prevent scroll event propagation
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          data-layer-name="cells"
          width={outputSize().width}
          height={outputSize().height}
          viewBox={`${camera().position.x * camera().zoom} ${camera().position.y * camera().zoom} ${camera().zoom * outputSize().width} ${camera().zoom * outputSize().height}`}
        >
          {selectedShape()?.shapeComponent({})}
        </svg>
        <svg
          data-layer-name="grid"
          width={outputSize().width}
          height={outputSize().height}
          viewBox={`${camera().position.x % (outputSize().width / ((outputSize().width * camera().zoom) / scale()))} ${camera().position.y % (outputSize().height / ((outputSize().height * camera().zoom) / scale()))} ${outputSize().width} ${outputSize().height}`}
        >
          <For each={Array.from({ length: numVerticalGridLines() })}>
            {(_, i) => (
              <line
                class="grid-line"
                x1={(i() / camera().zoom) * scale()}
                y1={-scale() / camera().zoom}
                x2={(i() / camera().zoom) * scale()}
                y2={outputSize().height + scale() / camera().zoom}
              />
            )}
          </For>
          <For each={Array.from({ length: numHorizontalGridLines() })}>
            {(_, i) => (
              <line
                class="grid-line"
                x1={-scale() / camera().zoom}
                y1={(i() / camera().zoom) * scale()}
                x2={outputSize().width + scale() / camera().zoom}
                y2={(i() / camera().zoom) * scale()}
              />
            )}
          </For>
        </svg>
        <div id="zoom-controls">
          <button
            class="button"
            aria-label="Zoom in"
            disabled={camera().zoom === MAX_ZOOM}
            onClick={() => changeZoom(0.8)}
          >
            +
          </button>
          <button
            class="button"
            aria-label="Zoom out"
            disabled={camera().zoom === MIN_ZOOM}
            onClick={() => changeZoom(1.2)}
          >
            −
          </button>
        </div>
        <Show when={pointer().cell !== null}>
          <span id="pointer-coords">
            ({pointer().cell!.x}, {pointer().cell!.y})
          </span>
        </Show>
        <span id="scale" style={{ opacity: scale() > 1 ? 1 : 0 }}>
          1∶{scale()}
        </span>
      </div>
      <div id="settings-container" aria-label="Shape Settings">
        <div class="main-settings">
          <Select
            label="Shape"
            selectedOption={selectedShape}
            updateSelectedOption={setSelectedShape}
            options={shapes.sort((a, b) => a.name.localeCompare(b.name))}
            extractOptionValue={(shape) => shape?.name}
            extractOptionLabel={(shape) => shape?.name}
          />
          <CopyLink
            href={permaLink.rawUrl}
            label="Permalink" labelWhenClicked="Copied"
            width="70px"
          />

        </div>
        {selectedShape()?.settingsComponent({})}
        <div id="download-buttons">
          <button class="button" onClick={downloadSVG}>
            Download SVG
          </button>
          <button class="button" onClick={downloadPNG}>
            Download PNG
          </button>
        </div>
        <a
          aria-label="View GitHub repository"
          id="repo-link"
          href="https://github.com/noquinn/pixel-shape-generator"
          target="_blank"
        >
          Repository
        </a>
      </div>
    </>
  );
}

export { outputContainer, outputSize, setOutputSize };

export default App;
