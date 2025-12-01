// Drawing tool handlers for the pixel map generator

import {
  currentTool,
  currentColor,
  activeLayer,
  isDrawing,
  setIsDrawing,
  drawStart,
  setDrawStart,
  setDrawPreview,
} from '../stores/drawingState';

import {
  setPixel,
  setMultiplePixels,
  removePixel,
  floodFill,
} from '../stores/pixelStore';

// Bresenham line algorithm to get all points between two coordinates
export const getLinePoints = (
  x0: number,
  y0: number,
  x1: number,
  y1: number
): { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  while (true) {
    points.push({ x, y });

    if (x === x1 && y === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return points;
};

// Get all points in a rectangle
export const getRectanglePoints = (
  x0: number,
  y0: number,
  x1: number,
  y1: number
): { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      points.push({ x, y });
    }
  }

  return points;
};

// Handle drawing start (mouse down)
export const handleDrawStart = (cellX: number, cellY: number): void => {
  const tool = currentTool();

  if (tool === 'select') {
    // Pan mode - don't handle drawing
    return;
  }

  if (tool === 'pencil') {
    setPixel(cellX, cellY, currentColor(), activeLayer());
  } else if (tool === 'eraser') {
    removePixel(cellX, cellY);
  } else if (tool === 'fill') {
    floodFill(cellX, cellY, currentColor(), activeLayer());
  } else if (tool === 'line' || tool === 'rectangle') {
    setIsDrawing(true);
    setDrawStart({ x: cellX, y: cellY });
    setDrawPreview([{ x: cellX, y: cellY }]);
  }
};

// Handle drawing move (mouse move while drawing)
export const handleDrawMove = (cellX: number, cellY: number): void => {
  const tool = currentTool();

  if (tool === 'select') {
    return;
  }

  if (!isDrawing()) {
    // Not in a drag operation
    if (tool === 'pencil') {
      setPixel(cellX, cellY, currentColor(), activeLayer());
    } else if (tool === 'eraser') {
      removePixel(cellX, cellY);
    }
    return;
  }

  // In drag operation for line/rectangle
  const start = drawStart();
  if (!start) return;

  if (tool === 'line') {
    const points = getLinePoints(start.x, start.y, cellX, cellY);
    setDrawPreview(points);
  } else if (tool === 'rectangle') {
    const points = getRectanglePoints(start.x, start.y, cellX, cellY);
    setDrawPreview(points);
  }
};

// Handle drawing end (mouse up)
export const handleDrawEnd = (cellX: number, cellY: number): void => {
  const tool = currentTool();

  if (tool === 'select') {
    return;
  }

  if (!isDrawing()) return;

  const start = drawStart();
  if (!start) {
    setIsDrawing(false);
    setDrawPreview([]);
    return;
  }

  if (tool === 'line') {
    const points = getLinePoints(start.x, start.y, cellX, cellY);
    setMultiplePixels(points, currentColor(), activeLayer());
  } else if (tool === 'rectangle') {
    const points = getRectanglePoints(start.x, start.y, cellX, cellY);
    setMultiplePixels(points, currentColor(), activeLayer());
  }

  setIsDrawing(false);
  setDrawStart(null);
  setDrawPreview([]);
};

// Handle drawing cancel (mouse leave while drawing)
export const handleDrawCancel = (): void => {
  setIsDrawing(false);
  setDrawStart(null);
  setDrawPreview([]);
};

// Check if we should be in drawing mode (not panning)
export const isDrawingMode = (): boolean => {
  return currentTool() !== 'select';
};
