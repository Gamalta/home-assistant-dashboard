import {hsv2rgb, rgb2hex, rgb2hs, temperature2rgb} from '@hakit/core';

export function drawColorWheel(ctx: CanvasRenderingContext2D) {
  const colorBrightness = 255;
  const radius = ctx.canvas.width / 2;
  const cX = ctx.canvas.width / 2;
  const cY = ctx.canvas.width / 2;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.beginPath();

  for (let angle = 0; angle < 360; angle += 1) {
    const startAngle = degToRad(angle - 0.5);
    const endAngle = degToRad(angle + 1.5);

    ctx.beginPath();
    ctx.moveTo(cX, cY);
    ctx.arc(cX, cY, radius, startAngle, endAngle);
    ctx.closePath();

    const gradient = ctx.createRadialGradient(cX, cY, 0, cX, cY, radius);

    const createGradientColor = (saturation: number) =>
      rgb2hex(hsv2rgb([angle, saturation, colorBrightness]));
    const start = createGradientColor(0);
    const end = createGradientColor(1);

    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

export function drawColorTempWheel(
  ctx: CanvasRenderingContext2D,
  minKelvin: number,
  maxKelvin: number
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const radius = ctx.canvas.width / 2;

  for (let y = -radius; y < radius; y += 1) {
    const x = radius * Math.sqrt(1 - (y / radius) ** 2);

    const fraction = (y / (radius * 0.9) + 1) / 2;

    const temperature = Math.max(
      Math.min(minKelvin + fraction * (maxKelvin - minKelvin), maxKelvin),
      minKelvin
    );

    const color = rgb2hex(temperature2rgb(temperature));

    ctx.fillStyle = color;
    ctx.fillRect(radius - x, radius + y - 0.5, 2 * x, 2);
    ctx.fill();
  }
}

export function degToRad(deg: number) {
  return (deg / 360) * 2 * Math.PI;
}

export const getRelativePosition = (
  canvas: HTMLCanvasElement | null,
  x: number,
  y: number
) => {
  if (!canvas) return {x: 0, y: 0};
  const {x: canvasX, y: canvasY} = canvas.getBoundingClientRect();
  const xRel = (2 * (x - canvasX)) / canvas.clientWidth - 1;
  const yRel = (2 * (y - canvasY)) / canvas.clientHeight - 1;
  return {x: xRel, y: yRel};
};

export const getWheelPosition = (
  canvas: HTMLCanvasElement | null,
  x: number,
  y: number
) => {
  if (!canvas) return {x: 0, y: 0};
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const percentX = x / width;
  const percentY = y / height;
  return {x: percentX * 2 - 1, y: percentY * 2 - 1};
};

export const getContainerPosition = (
  canvas: HTMLCanvasElement | null,
  x: number,
  y: number
) => {
  if (!canvas) return {x: 0, y: 0};
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const xRel = ((x + 1) / 2) * width;
  const yRel = ((y + 1) / 2) * height;
  return {x: xRel, y: yRel};
};

export const getCoordFromColor = (
  canvas: HTMLCanvasElement | null,
  color: [number, number, number]
) => {
  if (!canvas) return {x: 0, y: 0};
  const diameter = canvas.clientWidth;
  const [hue, saturation] = rgb2hs(color);
  const phi = (hue / 360) * 2 * Math.PI;
  const sat = Math.min(saturation, 1);
  const x = ((Math.cos(phi) * sat + 1) / 2) * diameter;
  const y = ((Math.sin(phi) * sat + 1) / 2) * diameter;
  return {x, y};
};

export const getCoordFromColorTemp = (
  canvas: HTMLCanvasElement | null,
  temperature: number,
  minKelvin: number,
  maxKelvin: number
) => {
  if (!canvas) return {x: 0, y: 0};
  const diameter = canvas.clientWidth;
  const fraction = (temperature - minKelvin) / (maxKelvin - minKelvin);
  return {x: diameter / 2, y: fraction * diameter};
};

export const getColorFromCoord = (x: number, y: number) => {
  const hue = Math.round((Math.atan2(y, x) / (2 * Math.PI)) * 360) % 360;
  const saturation = Math.round(Math.min(Math.hypot(x, y), 1) * 100) / 100;
  return hsv2rgb([hue, saturation, 255]);
};

export const getColorTempFromCoord = (
  _x: number,
  y: number,
  minKelvin: number,
  maxKelvin: number
) => {
  const fraction = (y / 0.9 + 1) / 2;
  const temp = Math.max(
    Math.min(minKelvin + fraction * (maxKelvin - minKelvin), maxKelvin),
    minKelvin
  );
  return temp;
};
