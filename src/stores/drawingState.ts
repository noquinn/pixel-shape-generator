import { createSignal } from 'solid-js';
import { minecraftColors, BlockColor } from '../data/minecraftColors';

export type Tool = 'select' | 'pencil' | 'eraser' | 'line' | 'rectangle' | 'fill';

export type Layer = 'terrain' | 'structures' | 'paths' | 'markers';

export const layers: { id: Layer; name: string; visible: boolean }[] = [
  { id: 'terrain', name: 'Terrain', visible: true },
  { id: 'structures', name: 'Structures', visible: true },
  { id: 'paths', name: 'Paths/Roads', visible: true },
  { id: 'markers', name: 'Markers', visible: true },
];

// Current tool selection
const [currentTool, setCurrentTool] = createSignal<Tool>('pencil');

// Current selected color
const [currentColor, setCurrentColor] = createSignal<BlockColor>(minecraftColors[0]);

// Current active layer
const [activeLayer, setActiveLayer] = createSignal<Layer>('structures');

// Layer visibility states
const [layerVisibility, setLayerVisibility] = createSignal<Record<Layer, boolean>>({
  terrain: true,
  structures: true,
  paths: true,
  markers: true,
});

// Drawing state (for line/rectangle tools)
const [isDrawing, setIsDrawing] = createSignal(false);
const [drawStart, setDrawStart] = createSignal<{ x: number; y: number } | null>(null);
const [drawPreview, setDrawPreview] = createSignal<{ x: number; y: number }[]>([]);

// Shape tool integration mode
const [showShapeTools, setShowShapeTools] = createSignal(false);

// Toggle a specific layer's visibility
const toggleLayerVisibility = (layer: Layer): void => {
  setLayerVisibility({
    ...layerVisibility(),
    [layer]: !layerVisibility()[layer],
  });
};

// Check if a layer is visible
const isLayerVisible = (layer: Layer): boolean => layerVisibility()[layer];

export {
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  activeLayer,
  setActiveLayer,
  layerVisibility,
  setLayerVisibility,
  toggleLayerVisibility,
  isLayerVisible,
  isDrawing,
  setIsDrawing,
  drawStart,
  setDrawStart,
  drawPreview,
  setDrawPreview,
  showShapeTools,
  setShowShapeTools,
};
