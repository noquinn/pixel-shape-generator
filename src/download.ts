const SVGNS = 'http://www.w3.org/2000/svg';

const downloadSVG = (): void => {
  const cellSize = 10;
  const svg = document
    .querySelector('svg[data-layer-name="cells"]')!
    .cloneNode(true) as SVGSVGElement;
  svg.removeAttribute('data-layer-name');

  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
  const cells = svg.querySelectorAll('rect');
  for (const cell of cells) {
    const x = Number(cell.getAttribute('x'));
    const y = Number(cell.getAttribute('y'));
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  svg.setAttribute('width', `${width * cellSize}`);
  svg.setAttribute('height', `${height * cellSize}`);
  svg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);

  const addGridLine = (x1: number, y1: number, x2: number, y2: number) => {
    const gridLine = document.createElementNS(SVGNS, 'line');
    gridLine.setAttribute('x1', `${x1}`);
    gridLine.setAttribute('y1', `${y1}`);
    gridLine.setAttribute('x2', `${x2}`);
    gridLine.setAttribute('y2', `${y2}`);
    gridLine.setAttribute('class', 'grid-line');
    gridLine.setAttribute('stroke', 'black');
    gridLine.setAttribute('stroke-width', '0.05');
    svg.appendChild(gridLine);
  };
  for (let i = minX; i <= maxX + 1; i++) addGridLine(i, minY, i, maxY + 1);
  for (let i = minY; i <= maxY + 1; i++) addGridLine(minX, i, maxX + 1, i);

  const fileName = [...document.querySelectorAll('input, select')]
    .map((elem) => (elem as HTMLInputElement | HTMLSelectElement).value)
    .join('-')
    .replace(/\s/g, '')
    .replace(/\./g, '_');

  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

export { downloadSVG };
