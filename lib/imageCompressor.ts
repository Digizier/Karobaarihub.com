/**
 * In-Browser HTML5 Canvas Image Compressor
 * - Automatically resizes images to max 1200px while maintaining aspect ratio
 * - Converts PNG, JPG, JPEG, BMP, JFIF into ultra-lightweight WebP format
 * - Adaptive quality to achieve sub-100KB (target 20KB - 80KB) with crisp visual fidelity
 * - Runs 100% on the client without external dependencies
 */

export interface ImageCompressionOptions {
  maxDimension?: number; // Maximum width or height in px (default 1200)
  targetMaxSizeBytes?: number; // Target max file size (default 100 * 1024 = 100KB)
  initialQuality?: number; // Initial WebP quality 0.1 - 1.0 (default 0.82)
  minQuality?: number; // Minimum WebP quality during reduction (default 0.50)
}

export interface CompressionResult {
  file: File;
  blob: Blob;
  previewUrl: string;
  originalSize: number; // bytes
  compressedSize: number; // bytes
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  savingsPercent: number; // e.g. 75
  width: number;
  height: number;
  format: "webp" | "jpeg";
}

/**
 * Format raw bytes into human readable KB / MB
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Compress an image File or Blob into WebP
 */
export async function compressImageToWebP(
  input: File | Blob,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxDimension = 1200,
    targetMaxSizeBytes = 100 * 1024, // 100 KB
    initialQuality = 0.82,
    minQuality = 0.52,
  } = options;

  const originalSize = input.size;
  const originalFileName = (input as File).name || "image.jpg";
  const baseName = originalFileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");

  // Load image into an HTMLImageElement
  const objectUrl = URL.createObjectURL(input);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = (err) => reject(new Error("Failed to decode image: " + err));
    el.src = objectUrl;
  });

  try {
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    // Calculate aspect ratio resize
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    // Prepare offscreen canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      throw new Error("Canvas 2D context not supported");
    }

    // High quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    // Function to convert canvas to blob with specific quality
    const getBlob = (quality: number, type = "image/webp"): Promise<Blob | null> => {
      return new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), type, quality);
      });
    };

    let quality = initialQuality;
    let mimeType: "image/webp" | "image/jpeg" = "image/webp";
    let blob = await getBlob(quality, "image/webp");

    // Fallback if browser does not support WebP canvas export
    if (!blob || blob.type !== "image/webp") {
      mimeType = "image/jpeg";
      blob = await getBlob(quality, "image/jpeg");
    }

    // Adaptive pass: if blob > targetMaxSizeBytes and quality can be safely lowered
    if (blob && blob.size > targetMaxSizeBytes && quality > minQuality) {
      const stepDownQualities = [0.72, 0.62, 0.52];
      for (const q of stepDownQualities) {
        if (q < minQuality) break;
        const testBlob = await getBlob(q, mimeType);
        if (testBlob) {
          blob = testBlob;
          quality = q;
          if (blob.size <= targetMaxSizeBytes) break;
        }
      }
    }

    if (!blob) {
      throw new Error("Image compression failed to produce output blob");
    }

    const compressedSize = blob.size;
    const ext = mimeType === "image/webp" ? "webp" : "jpg";
    const compressedFile = new File([blob], `${baseName}.${ext}`, {
      type: mimeType,
      lastModified: Date.now(),
    });

    const previewUrl = URL.createObjectURL(blob);
    const savingsPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

    return {
      file: compressedFile,
      blob,
      previewUrl,
      originalSize,
      compressedSize,
      originalSizeFormatted: formatBytes(originalSize),
      compressedSizeFormatted: formatBytes(compressedSize),
      savingsPercent,
      width,
      height,
      format: mimeType === "image/webp" ? "webp" : "jpeg",
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
