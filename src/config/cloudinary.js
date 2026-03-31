// config/cloudinary.js
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dryzziijr", // Tu cloud name del backend
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "video_hero_upload", // Debes crear este preset en Cloudinary
};
