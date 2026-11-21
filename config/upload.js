// TODO: unsigned preset is public. Sign uploads server-side before launch.
export const UPLOAD = Object.freeze({
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ds0sysk6d',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'profile_upload',
  acceptedTypes: Object.freeze(['image/jpeg', 'image/png', 'image/webp']),
  maxBytes: 10 * 1024 * 1024,
  // Longest edge after resize. The ticket shows the photo at 140px.
  maxDimension: 800,
});

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${UPLOAD.cloudName}/image/upload`;
