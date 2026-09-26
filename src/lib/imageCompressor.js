/**
 * BookLoop Image Compressor
 *
 * Resizes an image File/Blob to a maximum dimension of 1024px (longest side)
 * and re-encodes as JPEG at 80% quality using an off-screen canvas.
 *
 * Returns a compressed Blob (image/jpeg) suitable for:
 * - Supabase Storage upload (smaller payload = faster upload)
 * - Gemini Vision API (smaller inline data = faster inference)
 */

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.80;

/**
 * Compress a File or Blob to max 1024px / JPEG 80%.
 * @param {File|Blob} fileOrBlob - The image to compress
 * @returns {Promise<Blob>} - Compressed JPEG blob
 */
export async function compressImage(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate target dimensions maintaining aspect ratio
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_DIMENSION);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width / height) * MAX_DIMENSION);
          height = MAX_DIMENSION;
        }
      }

      // Draw to off-screen canvas and export
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Canvas compression failed — return original unchanged
            resolve(fileOrBlob);
          }
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // On error fall back to original
      resolve(fileOrBlob);
    };

    img.src = url;
  });
}

/**
 * Compress a File, returning a new File with .jpg extension.
 * Preserves original filename stem.
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function compressImageFile(file) {
  const compressed = await compressImage(file);
  const stem = file.name.replace(/\.[^.]+$/, '');
  return new File([compressed], `${stem}_compressed.jpg`, { type: 'image/jpeg' });
}
