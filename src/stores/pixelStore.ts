import { createSignal, createMemo } from 'solid-js';
import { Layer } from './drawingState';
import { BlockColor } from '../data/minecraftColors';

export interface Pixel {
  x: number;
  y: number;
  color: string;
  blockId: string;
  blockName: string;
  layer: Layer;
}

// Key generator for pixel map
const pixelKey = (x: number, y: number): string => `${x},${y}`;

// Main pixel storage
const [pixels, setPixels] = createSignal<Map<string, Pixel>>(new Map());

// Add or update a pixel
const setPixel = (x: number, y: number, color: BlockColor, layer: Layer): void => {
  const newPixels = new Map(pixels());
  newPixels.set(pixelKey(x, y), {
    x,
    y,
    color: color.color,
    blockId: color.id,
    blockName: color.name,
    layer,
  });
  setPixels(newPixels);
};

// Set multiple pixels at once (for line/rectangle tools)
const setMultiplePixels = (
  coords: { x: number; y: number }[],
  color: BlockColor,
  layer: Layer
): void => {
  const newPixels = new Map(pixels());
  for (const coord of coords) {
    newPixels.set(pixelKey(coord.x, coord.y), {
      x: coord.x,
      y: coord.y,
      color: color.color,
      blockId: color.id,
      blockName: color.name,
      layer,
    });
  }
  setPixels(newPixels);
};

// Remove a pixel
const removePixel = (x: number, y: number): void => {
  const newPixels = new Map(pixels());
  newPixels.delete(pixelKey(x, y));
  setPixels(newPixels);
};

// Remove multiple pixels
const removeMultiplePixels = (coords: { x: number; y: number }[]): void => {
  const newPixels = new Map(pixels());
  for (const coord of coords) {
    newPixels.delete(pixelKey(coord.x, coord.y));
  }
  setPixels(newPixels);
};

// Get a pixel at coordinates
const getPixel = (x: number, y: number): Pixel | undefined => {
  return pixels().get(pixelKey(x, y));
};

// Check if pixel exists
const hasPixel = (x: number, y: number): boolean => {
  return pixels().has(pixelKey(x, y));
};

// Get all pixels as array
const getAllPixels = (): Pixel[] => Array.from(pixels().values());

// Get pixels by layer
const getPixelsByLayer = (layer: Layer): Pixel[] => {
  return getAllPixels().filter((p) => p.layer === layer);
};

// Clear all pixels
const clearAllPixels = (): void => {
  setPixels(new Map());
};

// Clear pixels in a specific layer
const clearLayer = (layer: Layer): void => {
  const newPixels = new Map(pixels());
  for (const [key, pixel] of newPixels) {
    if (pixel.layer === layer) {
      newPixels.delete(key);
    }
  }
  setPixels(newPixels);
};

// Get unique colors used in the map
const getUsedColors = createMemo(() => {
  const colorMap = new Map<string, { color: string; blockId: string; blockName: string; count: number }>();
  for (const pixel of pixels().values()) {
    const existing = colorMap.get(pixel.blockId);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(pixel.blockId, {
        color: pixel.color,
        blockId: pixel.blockId,
        blockName: pixel.blockName,
        count: 1,
      });
    }
  }
  return Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
});

// Flood fill algorithm
const floodFill = (
  startX: number,
  startY: number,
  newColor: BlockColor,
  layer: Layer,
  maxIterations: number = 10000
): void => {
  const targetPixel = getPixel(startX, startY);
  const targetColor = targetPixel?.color ?? null;

  // Don't fill if clicking on same color
  if (targetColor === newColor.color) return;

  const visited = new Set<string>();
  const queue: { x: number; y: number }[] = [{ x: startX, y: startY }];
  const toFill: { x: number; y: number }[] = [];

  let iterations = 0;

  while (queue.length > 0 && iterations < maxIterations) {
    const { x, y } = queue.shift()!;
    const key = pixelKey(x, y);

    if (visited.has(key)) continue;
    visited.add(key);

    const pixel = getPixel(x, y);
    const pixelColor = pixel?.color ?? null;

    // Check if this pixel matches the target color
    if (pixelColor === targetColor) {
      toFill.push({ x, y });
      // Add neighbors
      queue.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
    }

    iterations++;
  }

  // Apply all fills at once
  if (toFill.length > 0) {
    setMultiplePixels(toFill, newColor, layer);
  }
};

// Export/Import functionality
interface ProjectData {
  version: number;
  pixels: Pixel[];
  timestamp: string;
}

const exportProject = (): string => {
  const data: ProjectData = {
    version: 1,
    pixels: getAllPixels(),
    timestamp: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

const importProject = (jsonString: string): boolean => {
  try {
    const data: ProjectData = JSON.parse(jsonString);
    if (data.version !== 1) {
      console.error('Unsupported project version');
      return false;
    }
    const newPixels = new Map<string, Pixel>();
    for (const pixel of data.pixels) {
      newPixels.set(pixelKey(pixel.x, pixel.y), pixel);
    }
    setPixels(newPixels);
    return true;
  } catch (e) {
    console.error('Failed to import project:', e);
    return false;
  }
};

export {
  pixels,
  setPixel,
  setMultiplePixels,
  removePixel,
  removeMultiplePixels,
  getPixel,
  hasPixel,
  getAllPixels,
  getPixelsByLayer,
  clearAllPixels,
  clearLayer,
  getUsedColors,
  floodFill,
  exportProject,
  importProject,
};
