import { JSX } from 'solid-js';
import { exportProject, importProject, clearAllPixels, getAllPixels } from '../stores/pixelStore';
import './ProjectActions.css';

const ProjectActions = (): JSX.Element => {
  const handleSave = (): void => {
    const data = exportProject();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-map-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importProject(content)) {
          alert('Project loaded successfully!');
        } else {
          alert('Failed to load project. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClear = (): void => {
    const pixelCount = getAllPixels().length;
    if (pixelCount === 0) {
      alert('Canvas is already empty!');
      return;
    }
    if (confirm(`Are you sure you want to clear all ${pixelCount} pixels? This cannot be undone.`)) {
      clearAllPixels();
    }
  };

  return (
    <div class="project-actions">
      <span class="actions-label">Project</span>
      <div class="actions-buttons">
        <button class="action-btn save" onClick={handleSave} title="Save project">
          💾 Save
        </button>
        <button class="action-btn load" onClick={handleLoad} title="Load project">
          📂 Load
        </button>
        <button class="action-btn clear" onClick={handleClear} title="Clear all pixels">
          🗑️ Clear
        </button>
      </div>
    </div>
  );
};

export default ProjectActions;
