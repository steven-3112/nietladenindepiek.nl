import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64Image: string, folder: string = 'guides'): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `nietladenindepiek/${folder}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
}

export default cloudinary;

