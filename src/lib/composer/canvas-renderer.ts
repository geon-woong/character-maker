import type { ResolvedLayer, ViewDirection } from '@/types/character';
import { CANVAS_EXPORT_SCALE } from '@/lib/utils/constants';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Draw image using object-contain logic: maintain aspect ratio, center within canvas.
 */
function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = cw / ch;
  let dw: number, dh: number;
  if (imgRatio > canvasRatio) {
    dw = cw;
    dh = cw / imgRatio;
  } else {
    dh = ch;
    dw = ch * imgRatio;
  }
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Render resolved layers onto a canvas and return a Blob (PNG).
 * Layers with `side` are clipped to left/right half and transformed independently.
 */
export async function renderToBlob(
  layers: ResolvedLayer[],
  canvasWidth: number,
  canvasHeight: number,
  scale: number = CANVAS_EXPORT_SCALE
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(canvasWidth * scale);
  canvas.height = Math.ceil(canvasHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  ctx.scale(scale, scale);

  const sorted = [...layers].sort((a, b) => a.layerIndex - b.layerIndex);

  for (const layer of sorted) {
    const img = await loadImage(layer.svgPath);
    const hasTransform = layer.offsetX || layer.offsetY || layer.rotate;

    if (layer.side) {
      ctx.save();

      if (hasTransform) {
        ctx.translate(canvasWidth / 2 + layer.offsetX, canvasHeight / 2 + layer.offsetY);
        const rotateRad = (layer.rotate * Math.PI) / 180;
        ctx.rotate(rotateRad);
        ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
      }

      // Clip to left or right half
      ctx.beginPath();
      if (layer.side === 'left') ctx.rect(0, 0, canvasWidth / 2, canvasHeight);
      else ctx.rect(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
      ctx.clip();

      // Right side: flip horizontally to mirror left-only image content
      if (layer.flipX) {
        ctx.translate(canvasWidth, 0);
        ctx.scale(-1, 1);
      }

      drawImageContain(ctx, img, canvasWidth, canvasHeight);
      ctx.restore();
    } else if (hasTransform) {
      ctx.save();
      ctx.translate(canvasWidth / 2 + layer.offsetX, canvasHeight / 2 + layer.offsetY);
      const rotateRad = (layer.rotate * Math.PI) / 180;
      ctx.rotate(rotateRad);
      ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
      drawImageContain(ctx, img, canvasWidth, canvasHeight);
      ctx.restore();
    } else {
      drawImageContain(ctx, img, canvasWidth, canvasHeight);
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      'image/png'
    );
  });
}

/**
 * Render layers with direction-specific handling.
 * - side/half-side: Layers already contain direction-specific images via directionVariants,
 *   so no canvas-level transform needed — render directly.
 * - back: Apply horizontal flip after rendering.
 * Layers should already be filtered/resolved for the direction before calling.
 */
export async function renderToBlobWithDirection(
  layers: ResolvedLayer[],
  canvasWidth: number,
  canvasHeight: number,
  scale: number = CANVAS_EXPORT_SCALE,
  direction: ViewDirection = 'front'
): Promise<Blob> {
  // side/half-side use actual direction images — render directly like front
  if (direction === 'front' || direction === 'side' || direction === 'half-side') {
    return renderToBlob(layers, canvasWidth, canvasHeight, scale);
  }

  // back: render normally then flip horizontally
  const pw = Math.ceil(canvasWidth * scale);
  const ph = Math.ceil(canvasHeight * scale);

  const tempBlob = await renderToBlob(layers, canvasWidth, canvasHeight, scale);
  const tempImg = await loadImage(URL.createObjectURL(tempBlob));

  const canvas = document.createElement('canvas');
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  ctx.translate(pw, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(tempImg, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      'image/png'
    );
  });
}
