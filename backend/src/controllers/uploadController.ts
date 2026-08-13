import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'travel',
      public_id: uuidv4()
    });

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ message: 'public_id is required' });
    await cloudinary.uploader.destroy(public_id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
