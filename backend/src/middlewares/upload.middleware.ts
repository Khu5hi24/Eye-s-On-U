import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
  cb(null, allowedMimeTypes.includes(file.mimetype));
};

export const upload = multer({ storage, fileFilter });
