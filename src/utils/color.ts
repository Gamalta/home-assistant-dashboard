import {hsv2rgb, rgb2hex, temperature2rgb} from '@hakit/core';
import {
  MAX_KELVIN,
  MIN_KELVIN,
} from '../components/Modal/LightModal/Tabs/ColorTempTab';

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

export function drawColorTempWheel(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const radius = ctx.canvas.width / 2;

  for (let y = -radius; y < radius; y += 1) {
    const x = radius * Math.sqrt(1 - (y / radius) ** 2);

    const fraction = (y / (radius * 0.9) + 1) / 2;

    const temperature = Math.max(
      Math.min(MIN_KELVIN + fraction * (MAX_KELVIN - MIN_KELVIN), MAX_KELVIN),
      MIN_KELVIN
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

//TODO remove if not used
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
