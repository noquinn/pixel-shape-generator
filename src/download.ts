const SVGNS = 'http://www.w3.org/2000/svg';

type CellParsed = {
  x: number;
  y: number;
};

type SvgData = {
  svg: SVGSVGElement;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  cellsParsed: CellParsed[];
  cellsPositive: CellParsed[];
  fileName: string;
};

const getSvgData = (): SvgData => {
  const svg = document
    .querySelector('svg[data-layer-name="cells"]')!
    .cloneNode(true) as SVGSVGElement;
  svg.removeAttribute('data-layer-name');

  const cellsParsed = [...svg.querySelectorAll('rect')].map((cell) => ({
    x: Number(cell.getAttribute('x')),
    y: Number(cell.getAttribute('y')),
  }));

  const minX = Math.min(...cellsParsed.map((cell) => cell.x));
  const minY = Math.min(...cellsParsed.map((cell) => cell.y));
  const maxX = Math.max(...cellsParsed.map((cell) => cell.x));
  const maxY = Math.max(...cellsParsed.map((cell) => cell.y));

  const cellsPositive = cellsParsed.map((cell) => ({
    x: cell.x + Math.abs(minX),
    y: cell.y + Math.abs(minY),
  }));

  const fileName = [...document.querySelectorAll('input, select')]
    .map((elem) => (elem as HTMLInputElement | HTMLSelectElement).value)
    .join('-')
    .replace(/\s/g, '')
    .replace(/\./g, '_');

  return {
    svg,
    cellsPositive,
    minX,
    minY,
    maxX,
    maxY,
    height: maxY - minY + 1,
    width: maxX - minX + 1,
    fileName,
  };
};

const downloadBlob = (blob: Blob, fileName: string): void => {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadSVG = (): void => {
  const { svg, minX, minY, maxX, maxY, width, height, fileName } = getSvgData();
  const cellSize = 10;

  svg.setAttribute('width', `${width * cellSize}`);
  svg.setAttribute('height', `${height * cellSize}`);
  svg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);

  const addGridLine = (x1: number, y1: number, x2: number, y2: number) => {
    const gridLine = document.createElementNS(SVGNS, 'line');
    gridLine.setAttribute('x1', String(x1));
    gridLine.setAttribute('y1', String(y1));
    gridLine.setAttribute('x2', String(x2));
    gridLine.setAttribute('y2', String(y2));
    gridLine.setAttribute('class', 'grid-line');
    gridLine.setAttribute('stroke', 'black');
    gridLine.setAttribute('stroke-width', '0.05');
    svg.appendChild(gridLine);
  };
  for (let i = minX; i <= maxX + 1; i++) addGridLine(i, minY, i, maxY + 1);
  for (let i = minY; i <= maxY + 1; i++) addGridLine(minX, i, maxX + 1, i);

  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  downloadBlob(blob, fileName);
};

const downloadPNG = (): void => {
  const { cellsPositive, width, height, fileName } = getSvgData();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    console.error('Could not create canvas context');
    return;
  }

  ctx.fillStyle = 'black';
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  for (const cell of cellsPositive) {
    ctx.fillRect(cell.x, cell.y, 1, 1);
  }

  canvas.toBlob((blob) => {
    if (!blob) {
      console.error('Could not generate blob from canvas');
      return;
    }

    downloadBlob(blob, fileName);
  });
};

export { downloadSVG, downloadPNG };
