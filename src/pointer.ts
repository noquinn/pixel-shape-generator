import { createSignal } from 'solid-js';
import { Position } from './types';
import { camera, setCamera, changeZoom } from './camera';
import { outputContainer } from './App';

// mouse and touch event handlers for panning/zooming

interface PointerState {
  position: Position | null;
  dragging: boolean;
  dragStartPosition: Position | null;
  pinchDelta: number | null;
  cell: Position | null;
}

const [pointer, setPointer] = createSignal<PointerState>({
  position: null,
  dragging: false,
  dragStartPosition: null,
  pinchDelta: null,
  cell: null,
});

const getPointerEventCoords = (event: MouseEvent | Touch): Position => {
  if (outputContainer === undefined) return { x: 0, y: 0 };
  const rect = outputContainer.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const handleMouseMove = (event: MouseEvent): void => {
  event.preventDefault();
  setPointer({
    ...pointer(),
    position: getPointerEventCoords(event),
  });
  if (pointer().dragging) {
    outputContainer?.style.setProperty('cursor', 'grabbing');
    setCamera({
      ...camera(),
      position: {
        x:
          ((pointer().dragStartPosition!.x + camera().dragStartPosition!.x) *
            camera().dragStartZoom!) /
            camera().zoom -
          pointer().position!.x,
        y:
          ((pointer().dragStartPosition!.y + camera().dragStartPosition!.y) *
            camera().dragStartZoom!) /
            camera().zoom -
          pointer().position!.y,
      },
    });
  }
  setPointer({
    ...pointer(),
    cell: {
      x: Math.floor(
        (pointer().position!.x + camera().position.x) * camera().zoom
      ),
      y: Math.floor(
        (pointer().position!.y + camera().position.y) * camera().zoom
      ),
    },
  });
};

const handleMouseDown = (event: MouseEvent): void => {
  const coords = getPointerEventCoords(event);
  setPointer({
    ...pointer(),
    position: coords,
    dragStartPosition: coords,
    dragging: true,
  });
  setCamera({
    ...camera(),
    dragStartPosition: camera().position,
    dragStartZoom: camera().zoom,
  });
};

const handleMouseUp = (): void => {
  outputContainer?.style.setProperty('cursor', null);
  setPointer({
    ...pointer(),
    dragStartPosition: null,
    dragging: false,
  });
  setCamera({
    ...camera(),
    dragStartPosition: null,
    dragStartZoom: null,
  });
};

const handleMouseLeave = (): void => {
  outputContainer?.style.setProperty('cursor', null);
  setPointer({
    ...pointer(),
    position: null,
    cell: null,
    dragStartPosition: null,
    dragging: false,
  });
  setCamera({
    ...camera(),
    dragStartPosition: null,
    dragStartZoom: null,
  });
};

const handleWheel = (event: WheelEvent): void => {
  event.preventDefault();
  const delta = 1 + 0.05 * Math.sign(event.deltaY);
  changeZoom(delta, pointer().position?.x, pointer().position?.y);
};

const handleTouchStart = (event: TouchEvent): void => {
  const { touches } = event;
  let coords: Position;
  let pinchDelta = null;
  if (touches.length === 2) {
    const t1 = getPointerEventCoords(touches[0]);
    const t2 = getPointerEventCoords(touches[1]);
    pinchDelta = Math.hypot(t2.x - t1.x, t2.y - t1.y);
    coords = {
      x: (t1.x + t2.x) / 2,
      y: (t1.y + t2.y) / 2,
    };
  } else {
    coords = getPointerEventCoords(touches[0]);
  }
  setPointer({
    ...pointer(),
    position: coords,
    dragStartPosition: coords,
    pinchDelta: pinchDelta,
    dragging: true,
  });
  setCamera({
    ...camera(),
    dragStartPosition: camera().position,
    dragStartZoom: camera().zoom,
  });
};

const handleTouchMove = (event: TouchEvent): void => {
  const { touches } = event;
  let coords: Position;
  let pinchDelta = null;
  if (touches.length === 2) {
    const t1 = getPointerEventCoords(touches[0]);
    const t2 = getPointerEventCoords(touches[1]);
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
    coords = getPointerEventCoords(touches[0]);
  }
  setPointer({
    ...pointer(),
    position: coords,
    pinchDelta: pinchDelta,
  });
  setCamera({
    ...camera(),
    position: {
      x:
        ((pointer().dragStartPosition!.x + camera().dragStartPosition!.x) *
          camera().dragStartZoom!) /
          camera().zoom -
        pointer().position!.x,
      y:
        ((pointer().dragStartPosition!.y + camera().dragStartPosition!.y) *
          camera().dragStartZoom!) /
          camera().zoom -
        pointer().position!.y,
    },
  });
};

const handleTouchEnd = (event: TouchEvent): void => {
  const { touches } = event;
  if (touches.length === 0) {
    setPointer({
      ...pointer(),
      position: null,
      dragStartPosition: null,
      dragging: false,
      pinchDelta: null,
    });
    return;
  }
  let coords: Position;
  if (touches.length === 2) {
    const t1 = getPointerEventCoords(touches[0]);
    const t2 = getPointerEventCoords(touches[1]);
    coords = {
      x: (t1.x + t2.x) / 2,
      y: (t1.y + t2.y) / 2,
    };
  } else {
    coords = getPointerEventCoords(touches[0]);
  }
  setPointer({
    ...pointer(),
    position: coords,
    dragStartPosition: coords,
    dragging: true,
  });
  setCamera({
    ...camera(),
    dragStartPosition: camera().position,
    dragStartZoom: camera().zoom,
  });
};

export {
  pointer,
  setPointer,
  handleMouseMove,
  handleMouseDown,
  handleMouseUp,
  handleMouseLeave,
  handleWheel,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
};
