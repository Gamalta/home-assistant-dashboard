import {hsv2rgb, rgb2hex, rgbw2rgb, rgbww2rgb} from '@hakit/core';

export function drawColorWheel(
  ctx: CanvasRenderingContext2D,
  colorBrightness = 255,
  wv?: number,
  cw?: number,
  ww?: number,
  minKelvin?: number,
  maxKelvin?: number
) {
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
      rgb2hex(
        adjustRgb(
          hsv2rgb([angle, saturation, colorBrightness]),
          wv,
          cw,
          ww,
          minKelvin,
          maxKelvin
        )
      );
    const start = createGradientColor(0);
    const end = createGradientColor(1);

    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

export function degToRad(deg: number) {
  return (deg / 360) * 2 * Math.PI;
}

export function adjustRgb(
  rgb: [number, number, number],
  wv?: number,
  cw?: number,
  ww?: number,
  minKelvin?: number,
  maxKelvin?: number
) {
  if (wv != null) {
    return rgbw2rgb([...rgb, wv] as [number, number, number, number]);
  }
  if (cw != null && ww !== null) {
    return rgbww2rgb(
      [...rgb, cw, ww] as [number, number, number, number, number],
      minKelvin,
      maxKelvin
    );
  }
  return rgb;
}
