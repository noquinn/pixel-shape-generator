import {
  createSignal,
  createMemo,
  onCleanup,
  onMount,
  For,
  Show,
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

import { downloadSVG, downloadPNG, downloadPBM } from './download.ts';
import {
  camera,
  setCamera,
  panCamera,
  centerCamera,
  changeZoom,
  MIN_ZOOM,
  MAX_ZOOM,
  MIN_CELL_SIZE,
} from './camera.ts';
import {
  pointer,
  setPointer,
} from './pointer.ts';
import Select from './ui-components/Select.tsx';

// New imports for pixel map generator
import Toolbar from './components/Toolbar.tsx';
import ColorPalette from './components/ColorPalette.tsx';
import LayerPanel from './components/LayerPanel.tsx';
import Legend from './components/Legend.tsx';
import ProjectActions from './components/ProjectActions.tsx';
import PixelCanvas from './components/PixelCanvas.tsx';
import {
  currentTool,
  showShapeTools,
} from './stores/drawingState.ts';
import {
  handleDrawStart,
  handleDrawMove,
  handleDrawEnd,
  handleDrawCancel,
  isDrawingMode,
} from './tools/drawingHandlers.ts';
import { getAllPixels } from './stores/pixelStore.ts';

import './App.css';

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

let outputContainer: HTMLDivElement | undefined;
const [outputSize, setOutputSize] = createSignal({ width: 0, height: 0 });

// Panning state for the canvas
const [isPanning, setIsPanning] = createSignal(false);
const [panStart, setPanStart] = createSignal<{ x: number; y: number } | null>(null);

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

  const [selectedShape, setSelectedShape] = createSignal<Shape>(shapes[0]);

  const [cellCount, setCellCount] = createSignal(0);
  const [isCountingCells, setIsCountingCells] = createSignal(false);

  // Track both shape cells and drawn pixels
  const totalPixelCount = createMemo(() => {
    return cellCount() + getAllPixels().length;
  });

  // debounced cell counting on shape renders
  onMount(() => {
    const getNumberUniqueCells = (): number => {
      const cells = document.getElementsByClassName('cell');
      const uniqueCells = new Set<string>();
      for (const cell of cells) {
        const x = cell.getAttribute('x');
        const y = cell.getAttribute('y');
        uniqueCells.add(`${x},${y}`);
      }
      return uniqueCells.size;
    };

    const updateCellCount = debounce(() => {
      setCellCount(getNumberUniqueCells());
      setIsCountingCells(false);
    }, 500);

    const observer = new MutationObserver((mutations) => {
      const includesCellNode = (nodes: NodeList): boolean => {
        for (const node of nodes) {
          if (node instanceof SVGRectElement) return true;
        }
        return false;
      };

      for (const mutation of mutations) {
        if (
          mutation.type === 'childList' &&
          (includesCellNode(mutation.addedNodes) ||
            includesCellNode(mutation.removedNodes))
        ) {
          setIsCountingCells(true);
          updateCellCount();
          break;
        }
      }
    });

    const cellsContainer = document.querySelector(
      'svg[data-layer-name="cells"]'
    );
    if (cellsContainer) {
      observer.observe(cellsContainer, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }

    setCellCount(getNumberUniqueCells());
    onCleanup(() => observer.disconnect());
  });

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

  // Helper function to get cell coordinates from mouse position
  const getCellFromEvent = (event: MouseEvent): { x: number; y: number } | null => {
    if (!outputContainer) return null;
    const rect = outputContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {
      x: Math.floor((x + camera().position.x) * camera().zoom),
      y: -Math.floor((y + camera().position.y) * camera().zoom) - 1,
    };
  };

  // Combined mouse event handlers
  const handleMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
    const coords = getCellFromEvent(event);

    if (!outputContainer) return;
    const rect = outputContainer.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    if (isDrawingMode() && coords) {
      // Drawing mode - start drawing
      handleDrawStart(coords.x, coords.y);
      // Also allow panning with middle mouse button
      if (event.button === 1) {
        setIsPanning(true);
        setPanStart({ x: screenX, y: screenY });
        setCamera({
          ...camera(),
          dragStartPosition: camera().position,
          dragStartZoom: camera().zoom,
        });
      }
    } else {
      // Pan mode or middle mouse
      setIsPanning(true);
      setPanStart({ x: screenX, y: screenY });
      setCamera({
        ...camera(),
        dragStartPosition: camera().position,
        dragStartZoom: camera().zoom,
      });
    }

    setPointer({
      ...pointer(),
      position: { x: screenX, y: screenY },
      cell: coords,
    });
  };

  const handleMouseMove = (event: MouseEvent): void => {
    event.preventDefault();
    if (!outputContainer) return;

    const rect = outputContainer.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const coords = getCellFromEvent(event);

    // Update pointer position
    setPointer({
      ...pointer(),
      position: { x: screenX, y: screenY },
      cell: coords,
    });

    // Handle panning
    if (isPanning() && panStart() && camera().dragStartPosition) {
      outputContainer.style.setProperty('cursor', 'grabbing');
      setCamera({
        ...camera(),
        position: {
          x:
            ((panStart()!.x + camera().dragStartPosition!.x) *
              camera().dragStartZoom!) /
              camera().zoom -
            screenX,
          y:
            ((panStart()!.y + camera().dragStartPosition!.y) *
              camera().dragStartZoom!) /
              camera().zoom -
            screenY,
        },
      });
    }

    // Handle drawing
    if (isDrawingMode() && coords && event.buttons === 1 && !isPanning()) {
      handleDrawMove(coords.x, coords.y);
    }
  };

  const handleMouseUp = (event: MouseEvent): void => {
    const coords = getCellFromEvent(event);

    if (isDrawingMode() && coords && !isPanning()) {
      handleDrawEnd(coords.x, coords.y);
    }

    outputContainer?.style.setProperty('cursor', null);
    setIsPanning(false);
    setPanStart(null);
    setCamera({
      ...camera(),
      dragStartPosition: null,
      dragStartZoom: null,
    });
  };

  const handleMouseLeave = (): void => {
    handleDrawCancel();
    outputContainer?.style.setProperty('cursor', null);
    setIsPanning(false);
    setPanStart(null);
    setPointer({
      ...pointer(),
      position: null,
      cell: null,
    });
    setCamera({
      ...camera(),
      dragStartPosition: null,
      dragStartZoom: null,
    });
  };

  const handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    if (!outputContainer) return;
    const rect = outputContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const delta = 1 + 0.001 * event.deltaY;
    changeZoom(delta, x, y);
  };

  // Touch handlers for mobile support
  const handleTouchStart = (event: TouchEvent): void => {
    const { touches } = event;
    if (!outputContainer) return;
    const rect = outputContainer.getBoundingClientRect();

    let coords: { x: number; y: number };
    let pinchDelta = null;

    if (touches.length === 2) {
      const t1 = {
        x: touches[0].clientX - rect.left,
        y: touches[0].clientY - rect.top,
      };
      const t2 = {
        x: touches[1].clientX - rect.left,
        y: touches[1].clientY - rect.top,
      };
      pinchDelta = Math.hypot(t2.x - t1.x, t2.y - t1.y);
      coords = {
        x: (t1.x + t2.x) / 2,
        y: (t1.y + t2.y) / 2,
      };
      // Always pan with two fingers
      setIsPanning(true);
    } else {
      coords = {
        x: touches[0].clientX - rect.left,
        y: touches[0].clientY - rect.top,
      };

      // Single finger - check if drawing mode
      if (isDrawingMode()) {
        const cellCoords = {
          x: Math.floor((coords.x + camera().position.x) * camera().zoom),
          y: -Math.floor((coords.y + camera().position.y) * camera().zoom) - 1,
        };
        handleDrawStart(cellCoords.x, cellCoords.y);
      } else {
        setIsPanning(true);
      }
    }

    setPanStart(coords);
    setPointer({
      ...pointer(),
      position: coords,
      pinchDelta: pinchDelta,
    });
    setCamera({
      ...camera(),
      dragStartPosition: camera().position,
      dragStartZoom: camera().zoom,
    });
  };

  const handleTouchMove = (event: TouchEvent): void => {
    const { touches } = event;
    if (!outputContainer) return;
    const rect = outputContainer.getBoundingClientRect();

    let coords: { x: number; y: number };
    let pinchDelta = null;

    if (touches.length === 2) {
      const t1 = {
        x: touches[0].clientX - rect.left,
        y: touches[0].clientY - rect.top,
      };
      const t2 = {
        x: touches[1].clientX - rect.left,
        y: touches[1].clientY - rect.top,
      };
      pinchDelta = Math.hypot(t2.x - t1.x, t2.y - t1.y);
      coords = {
        x: (t1.x + t2.x) / 2,
        y: (t1.y + t2.y) / 2,
      };
      if (pointer().pinchDelta !== null) {
        const factor = pointer().pinchDelta! / pinchDelta;
        changeZoom(factor, coords.x, coords.y);
      }
    } else {
      coords = {
        x: touches[0].clientX - rect.left,
        y: touches[0].clientY - rect.top,
      };
    }

    setPointer({
      ...pointer(),
      position: coords,
      pinchDelta: pinchDelta,
    });

    // Handle panning
    if (isPanning() && panStart() && camera().dragStartPosition) {
      setCamera({
        ...camera(),
        position: {
          x:
            ((panStart()!.x + camera().dragStartPosition!.x) *
              camera().dragStartZoom!) /
              camera().zoom -
            coords.x,
          y:
            ((panStart()!.y + camera().dragStartPosition!.y) *
              camera().dragStartZoom!) /
              camera().zoom -
            coords.y,
        },
      });
    }

    // Handle drawing
    if (isDrawingMode() && !isPanning() && touches.length === 1) {
      const cellCoords = {
        x: Math.floor((coords.x + camera().position.x) * camera().zoom),
        y: -Math.floor((coords.y + camera().position.y) * camera().zoom) - 1,
      };
      handleDrawMove(cellCoords.x, cellCoords.y);
    }
  };

  const handleTouchEnd = (event: TouchEvent): void => {
    const { touches } = event;

    if (touches.length === 0) {
      // All fingers lifted
      if (isDrawingMode() && pointer().position) {
        const cellCoords = {
          x: Math.floor((pointer().position!.x + camera().position.x) * camera().zoom),
          y: -Math.floor((pointer().position!.y + camera().position.y) * camera().zoom) - 1,
        };
        handleDrawEnd(cellCoords.x, cellCoords.y);
      }

      setIsPanning(false);
      setPanStart(null);
      setPointer({
        ...pointer(),
        position: null,
        pinchDelta: null,
      });
      return;
    }

    // Reset drag start for remaining fingers
    if (!outputContainer) return;
    const rect = outputContainer.getBoundingClientRect();
    let coords: { x: number; y: number };

    if (touches.length === 2) {
      const t1 = {
        x: touches[0].clientX - rect.left,
        y: touches[0].clientY - rect.top,
      };
      const t2 = {
        x: touches[1].clientX - rect.left,
        y: touches[1].clientY - rect.top,
      };
      coords = {
        x: (t1.x + t2.x) / 2,
        y: (t1.y + t2.y) / 2,
      };
    } else {
      coords = {
        x: touches[0].clientX - rect.left,
        y: touches[0].clientY - rect.top,
      };
    }

    setPanStart(coords);
    setPointer({
      ...pointer(),
      position: coords,
    });
    setCamera({
      ...camera(),
      dragStartPosition: camera().position,
      dragStartZoom: camera().zoom,
    });
  };

  // Cursor based on current tool
  const getCursor = (): string => {
    switch (currentTool()) {
      case 'select':
        return isPanning() ? 'grabbing' : 'grab';
      case 'pencil':
        return 'crosshair';
      case 'eraser':
        return 'crosshair';
      case 'line':
        return 'crosshair';
      case 'rectangle':
        return 'crosshair';
      case 'fill':
        return 'crosshair';
      default:
        return 'default';
    }
  };

  return (
    <>
      <div
        id="output-container"
        ref={outputContainer}
        style={{ cursor: getCursor() }}
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
          {/* User-drawn pixels */}
          <PixelCanvas />
          {/* Shape generator output (when enabled) */}
          <Show when={showShapeTools()}>
            {selectedShape().shapeComponent({})}
          </Show>
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
            aria-label="Zoom in"
            disabled={camera().zoom === MAX_ZOOM}
            onClick={() => changeZoom(0.8)}
          >
            +
          </button>
          <button
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
        <span id="cell-count" style={{ opacity: isCountingCells() ? 0.2 : 1 }}>
          {totalPixelCount()} block{totalPixelCount() === 1 ? '' : 's'}
        </span>
        <span id="scale" style={{ opacity: scale() > 1 ? 1 : 0 }}>
          1∶{scale()}
        </span>
        <span id="current-tool-indicator">
          {currentTool().charAt(0).toUpperCase() + currentTool().slice(1)}
        </span>
      </div>
      <div id="settings-container" aria-label="Map Settings">
        <h2 class="app-title">Pixel Map Generator</h2>
        <p class="app-subtitle">Minecraft Building Planner</p>

        <Toolbar />
        <ColorPalette />
        <LayerPanel />
        <Legend />

        <Show when={showShapeTools()}>
          <div class="shape-tools-section">
            <span class="section-label">Shape Generator</span>
            <Select
              label="Shape"
              selectedOption={selectedShape}
              updateSelectedOption={setSelectedShape}
              options={shapes.sort((a, b) => a.name.localeCompare(b.name))}
              extractOptionValue={(shape) => shape.name}
              extractOptionLabel={(shape) => shape.name}
            />
            {selectedShape().settingsComponent({})}
          </div>
        </Show>

        <ProjectActions />

        <div id="download-buttons">
          <button onClick={downloadSVG}>Download SVG</button>
          <button onClick={downloadPNG}>Download PNG</button>
          <button onClick={downloadPBM}>Download PBM</button>
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
