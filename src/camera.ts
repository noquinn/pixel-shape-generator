import { createSignal } from 'solid-js';
import { Position } from './types';
import { outputSize } from './App';

const MIN_CELL_SIZE = 10;
const MIN_ZOOM = 16 / MIN_CELL_SIZE;
const MAX_ZOOM = 0.1 / MIN_CELL_SIZE;

interface CameraState {
  position: Position;
  zoom: number;
  dragStartPosition: Position | null;
  dragStartZoom: number | null;
}

const [camera, setCamera] = createSignal<CameraState>({
  position: {
    x: 0,
    y: 0,
  },
  zoom: 0.1,
  dragStartPosition: null,
  dragStartZoom: null,
});

const centerCamera = (): void => {
  setCamera({
    ...camera(),
    position: {
      x: -outputSize().width / 2,
      y: -outputSize().height / 2,
    },
  });
};

const panCamera = (dx: number, dy: number): void => {
  setCamera({
    ...camera(),
    position: {
      x: camera().position.x + dx,
      y: camera().position.y + dy,
    },
  });
};

const changeZoom = (
  factor: number,
  x = outputSize().width / 2,
  y = outputSize().height / 2
): void => {
  if (camera().zoom * factor < MAX_ZOOM) factor = MAX_ZOOM / camera().zoom;
  if (camera().zoom * factor > MIN_ZOOM) factor = MIN_ZOOM / camera().zoom;
  const newCoords = {
    x: (camera().position.x + x) / factor - x,
    y: (camera().position.y + y) / factor - y,
  };
  setCamera({
    ...camera(),
    zoom: camera().zoom * factor,
    position: newCoords,
  });
};

export {
  camera,
  setCamera,
  centerCamera,
  panCamera,
  changeZoom,
  MIN_CELL_SIZE,
  MIN_ZOOM,
  MAX_ZOOM,
};
