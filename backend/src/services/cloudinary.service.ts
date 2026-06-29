import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary';

export const uploadProfilePicture = async (file: { buffer: Buffer; path?: string }) => {
  try {
    const streamUpload = () =>
      new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'eyes_on_u/avatars',
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(result?.secure_url as string);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

    return await streamUpload();
  } catch (error) {
    console.error('Avatar upload failed:', error);
    return null;
  }
};

export const uploadAvatar = async (file: { buffer: Buffer; path?: string }) => uploadProfilePicture(file);
