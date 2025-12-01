// Minecraft block colors for pixel map planning
// Colors are approximate representations of common building blocks

export interface BlockColor {
  id: string;
  name: string;
  color: string;
  category: 'terrain' | 'wood' | 'stone' | 'decoration' | 'utility' | 'path' | 'water' | 'vegetation';
}

export const minecraftColors: BlockColor[] = [
  // Terrain
  { id: 'grass', name: 'Grass', color: '#5D8C3E', category: 'terrain' },
  { id: 'dirt', name: 'Dirt', color: '#8B5A2B', category: 'terrain' },
  { id: 'sand', name: 'Sand', color: '#E5D9A8', category: 'terrain' },
  { id: 'gravel', name: 'Gravel', color: '#7F7F7F', category: 'terrain' },
  { id: 'clay', name: 'Clay', color: '#9FA4B0', category: 'terrain' },

  // Stone types
  { id: 'stone', name: 'Stone', color: '#6D6D6D', category: 'stone' },
  { id: 'cobblestone', name: 'Cobblestone', color: '#5A5A5A', category: 'stone' },
  { id: 'stone_brick', name: 'Stone Brick', color: '#7A7A7A', category: 'stone' },
  { id: 'deepslate', name: 'Deepslate', color: '#4A4A4A', category: 'stone' },
  { id: 'andesite', name: 'Andesite', color: '#8A8A8A', category: 'stone' },
  { id: 'granite', name: 'Granite', color: '#9A6A5A', category: 'stone' },
  { id: 'diorite', name: 'Diorite', color: '#BFBFBF', category: 'stone' },
  { id: 'blackstone', name: 'Blackstone', color: '#2D2D36', category: 'stone' },

  // Wood types
  { id: 'oak_planks', name: 'Oak Planks', color: '#B8945F', category: 'wood' },
  { id: 'spruce_planks', name: 'Spruce Planks', color: '#6B5034', category: 'wood' },
  { id: 'birch_planks', name: 'Birch Planks', color: '#D5C98C', category: 'wood' },
  { id: 'dark_oak_planks', name: 'Dark Oak Planks', color: '#3E2912', category: 'wood' },
  { id: 'acacia_planks', name: 'Acacia Planks', color: '#C06A3B', category: 'wood' },
  { id: 'jungle_planks', name: 'Jungle Planks', color: '#AB8556', category: 'wood' },
  { id: 'oak_log', name: 'Oak Log', color: '#6B5034', category: 'wood' },

  // Paths and roads
  { id: 'path', name: 'Path', color: '#C9A86C', category: 'path' },
  { id: 'gravel_path', name: 'Gravel Path', color: '#9E9E9E', category: 'path' },
  { id: 'cobblestone_path', name: 'Cobble Path', color: '#696969', category: 'path' },
  { id: 'stone_path', name: 'Stone Path', color: '#808080', category: 'path' },

  // Water and liquids
  { id: 'water', name: 'Water', color: '#3F76E4', category: 'water' },
  { id: 'water_deep', name: 'Deep Water', color: '#2356C4', category: 'water' },
  { id: 'lava', name: 'Lava', color: '#CF5A00', category: 'water' },

  // Vegetation
  { id: 'leaves', name: 'Leaves', color: '#4A7A32', category: 'vegetation' },
  { id: 'flower_red', name: 'Red Flower', color: '#D44', category: 'vegetation' },
  { id: 'flower_yellow', name: 'Yellow Flower', color: '#ED2', category: 'vegetation' },
  { id: 'crops', name: 'Crops/Farm', color: '#A2C052', category: 'vegetation' },

  // Decoration blocks
  { id: 'wool_white', name: 'White Wool', color: '#E9E9E9', category: 'decoration' },
  { id: 'wool_red', name: 'Red Wool', color: '#A12722', category: 'decoration' },
  { id: 'wool_blue', name: 'Blue Wool', color: '#2E388D', category: 'decoration' },
  { id: 'wool_green', name: 'Green Wool', color: '#546D1B', category: 'decoration' },
  { id: 'wool_yellow', name: 'Yellow Wool', color: '#F9C627', category: 'decoration' },
  { id: 'wool_black', name: 'Black Wool', color: '#1D1D21', category: 'decoration' },
  { id: 'terracotta', name: 'Terracotta', color: '#985F45', category: 'decoration' },
  { id: 'brick', name: 'Brick', color: '#96614A', category: 'decoration' },

  // Utility/markers
  { id: 'marker_red', name: 'Marker (Red)', color: '#FF0000', category: 'utility' },
  { id: 'marker_blue', name: 'Marker (Blue)', color: '#0066FF', category: 'utility' },
  { id: 'marker_green', name: 'Marker (Green)', color: '#00CC00', category: 'utility' },
  { id: 'marker_yellow', name: 'Marker (Yellow)', color: '#FFFF00', category: 'utility' },
  { id: 'door', name: 'Door/Entrance', color: '#8B4513', category: 'utility' },
  { id: 'fence', name: 'Fence', color: '#C49A6C', category: 'utility' },
  { id: 'torch', name: 'Torch/Light', color: '#FFCC00', category: 'utility' },
];

export const colorCategories = [
  { id: 'terrain', name: 'Terrain' },
  { id: 'stone', name: 'Stone' },
  { id: 'wood', name: 'Wood' },
  { id: 'path', name: 'Paths' },
  { id: 'water', name: 'Water' },
  { id: 'vegetation', name: 'Plants' },
  { id: 'decoration', name: 'Decoration' },
  { id: 'utility', name: 'Markers' },
] as const;

export const getColorById = (id: string): BlockColor | undefined =>
  minecraftColors.find(c => c.id === id);

export const getColorsByCategory = (category: string): BlockColor[] =>
  minecraftColors.filter(c => c.category === category);
