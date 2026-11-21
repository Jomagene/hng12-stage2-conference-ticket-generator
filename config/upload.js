// TODO: unsigned preset is public. Sign uploads server-side before launch.
export const UPLOAD = Object.freeze({
  // Set in .env (defaults) or .env.local / hosting settings.
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '',
  acceptedTypes: Object.freeze(['image/jpeg', 'image/png', 'image/webp']),
  maxBytes: 10 * 1024 * 1024,
  // Longest edge after resize. The ticket shows the photo at 140px.
  maxDimension: 800,
});

export const uploadsConfigured = Boolean(UPLOAD.cloudName && UPLOAD.uploadPreset);

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${UPLOAD.cloudName}/image/upload`;
