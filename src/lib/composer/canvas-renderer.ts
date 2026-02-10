import type { ResolvedLayer } from '@/types/character';
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
      // Clip to left or right half
      ctx.save();
      ctx.beginPath();
      if (layer.side === 'left') {
        ctx.rect(0, 0, canvasWidth / 2, canvasHeight);
      } else {
        ctx.rect(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
      }
      ctx.clip();

      if (hasTransform) {
        ctx.translate(canvasWidth / 2 + layer.offsetX, canvasHeight / 2 + layer.offsetY);
        const rotateRad = (layer.rotate * Math.PI) / 180;
        ctx.rotate(rotateRad);
        ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
      }

      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    } else if (hasTransform) {
      ctx.save();
      ctx.translate(canvasWidth / 2 + layer.offsetX, canvasHeight / 2 + layer.offsetY);
      const rotateRad = (layer.rotate * Math.PI) / 180;
      ctx.rotate(rotateRad);
      ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    } else {
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
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
