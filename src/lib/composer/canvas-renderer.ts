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

      ctx.beginPath();
      if (layer.side === 'left') ctx.rect(0, 0, canvasWidth / 2, canvasHeight);
      else ctx.rect(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
      ctx.clip();

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
 * Render layers with direction-specific transforms (back flip, side perspective).
 * Layers should already be filtered for the direction before calling.
 */
export async function renderToBlobWithDirection(
  layers: ResolvedLayer[],
  canvasWidth: number,
  canvasHeight: number,
  scale: number = CANVAS_EXPORT_SCALE,
  direction: ViewDirection = 'front'
): Promise<Blob> {
  if (direction === 'front') {
    return renderToBlob(layers, canvasWidth, canvasHeight, scale);
  }

  // Render character normally first
  const tempCanvas = document.createElement('canvas');
  const pw = Math.ceil(canvasWidth * scale);
  const ph = Math.ceil(canvasHeight * scale);
  tempCanvas.width = pw;
  tempCanvas.height = ph;

  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Could not get 2d context');
  tempCtx.scale(scale, scale);

  const sorted = [...layers].sort((a, b) => a.layerIndex - b.layerIndex);
  for (const layer of sorted) {
    const img = await loadImage(layer.svgPath);
    const hasTransform = layer.offsetX || layer.offsetY || layer.rotate;

    if (layer.side) {
      tempCtx.save();
      if (hasTransform) {
        tempCtx.translate(canvasWidth / 2 + layer.offsetX, canvasHeight / 2 + layer.offsetY);
        tempCtx.rotate((layer.rotate * Math.PI) / 180);
        tempCtx.translate(-canvasWidth / 2, -canvasHeight / 2);
      }
      tempCtx.beginPath();
      if (layer.side === 'left') tempCtx.rect(0, 0, canvasWidth / 2, canvasHeight);
      else tempCtx.rect(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
      tempCtx.clip();
      drawImageContain(tempCtx, img, canvasWidth, canvasHeight);
      tempCtx.restore();
    } else if (hasTransform) {
      tempCtx.save();
      tempCtx.translate(canvasWidth / 2 + layer.offsetX, canvasHeight / 2 + layer.offsetY);
      tempCtx.rotate((layer.rotate * Math.PI) / 180);
      tempCtx.translate(-canvasWidth / 2, -canvasHeight / 2);
      drawImageContain(tempCtx, img, canvasWidth, canvasHeight);
      tempCtx.restore();
    } else {
      drawImageContain(tempCtx, img, canvasWidth, canvasHeight);
    }
  }

  // Apply direction transform to a final canvas
  const canvas = document.createElement('canvas');
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  if (direction === 'back') {
    // Horizontal flip
    ctx.translate(pw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(tempCanvas, 0, 0);
  } else {
    // Side views: 2D approximation of perspective rotateY
    const angle = direction === 'side-right' ? 30 : -30;
    const rad = (angle * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const skew = Math.sin(rad) * 0.15;

    ctx.translate(pw / 2, ph / 2);
    ctx.transform(cosA, 0, skew, 1, 0, 0);
    ctx.translate(-pw / 2, -ph / 2);
    ctx.drawImage(tempCanvas, 0, 0);
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
