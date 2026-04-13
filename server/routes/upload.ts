import { Router } from 'express';
import { upload } from '../config/cloudinary';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Single image upload
// To use this, send a POST request with 'image' field in multipart/form-data
router.post('/image', authenticateUser, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // req.file.path contains the Cloudinary URL
    res.json({
      message: 'Image uploaded successfully',
      url: req.file.path,
      public_id: (req.file as any).filename // multer-storage-cloudinary adds this
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Multiple image upload
router.post('/images', authenticateUser, upload.array('images', 5), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = files.map(file => ({
      url: file.path,
      public_id: (file as any).filename
    }));

    res.json({
      message: 'Images uploaded successfully',
      results
    });
  } catch (error: any) {
    console.error('Batch upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

export const uploadRoutes = router;
