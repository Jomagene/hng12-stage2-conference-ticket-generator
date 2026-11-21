import { CLOUDINARY_UPLOAD_URL, UPLOAD, uploadsConfigured } from '@/config/upload';

export class UploadError extends Error {
  name = 'UploadError';
}

export function validateImageFile(file, { acceptedTypes = UPLOAD.acceptedTypes, maxBytes = UPLOAD.maxBytes } = {}) {
  if (!file) return 'Please choose an image.';
  if (!acceptedTypes.includes(file.type)) return 'Please choose a JPG, PNG or WebP image.';
  if (file.size > maxBytes) {
    return `That image is too large. The limit is ${Math.round(maxBytes / 1024 / 1024)} MB.`;
  }
  return null;
}

// Phone photos are several MB; downscale before uploading.
async function resizeImage(file, maxDimension) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UploadError('We could not read that image. Please try another one.');
  }
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1024 * 1024) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
  return blob ?? file;
}

export async function uploadAvatar(file, { signal } = {}) {
  if (!uploadsConfigured) throw new UploadError('Photo uploads are not set up on this site yet.');
  const problem = validateImageFile(file);
  if (problem) throw new UploadError(problem);

  const image = await resizeImage(file, UPLOAD.maxDimension);
  const body = new FormData();
  body.append('file', image, 'avatar.jpg');
  body.append('upload_preset', UPLOAD.uploadPreset);

  let response;
  try {
    response = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body, signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new UploadError('Network error. Check your connection and try again.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || typeof data?.secure_url !== 'string') {
    throw new UploadError(data?.error?.message || 'Upload failed. Please try again.');
  }
  return data.secure_url;
}
