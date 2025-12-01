import { JSX, For } from 'solid-js';
import { Tool, currentTool, setCurrentTool, showShapeTools, setShowShapeTools } from '../stores/drawingState';
import './Toolbar.css';

interface ToolConfig {
  id: Tool;
  name: string;
  icon: string;
  description: string;
}

const tools: ToolConfig[] = [
  { id: 'select', name: 'Pan', icon: '✋', description: 'Pan and zoom the canvas' },
  { id: 'pencil', name: 'Pencil', icon: '✏️', description: 'Draw single pixels' },
  { id: 'eraser', name: 'Eraser', icon: '🧹', description: 'Remove pixels' },
  { id: 'line', name: 'Line', icon: '📏', description: 'Draw straight lines (paths)' },
  { id: 'rectangle', name: 'Rectangle', icon: '⬜', description: 'Fill rectangular areas' },
  { id: 'fill', name: 'Fill', icon: '🪣', description: 'Flood fill area' },
];

const Toolbar = (): JSX.Element => {
  return (
    <div class="toolbar">
      <div class="toolbar-section">
        <span class="toolbar-label">Tools</span>
        <div class="tool-buttons">
          <For each={tools}>
            {(tool) => (
              <button
                class="tool-button"
                classList={{ active: currentTool() === tool.id }}
                onClick={() => setCurrentTool(tool.id)}
                title={tool.description}
                aria-label={tool.name}
              >
                <span class="tool-icon">{tool.icon}</span>
                <span class="tool-name">{tool.name}</span>
              </button>
            )}
          </For>
        </div>
      </div>
      <div class="toolbar-section">
        <button
          class="shape-tools-toggle"
          classList={{ active: showShapeTools() }}
          onClick={() => setShowShapeTools(!showShapeTools())}
        >
          {showShapeTools() ? 'Hide Shapes' : 'Shape Generator'}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
