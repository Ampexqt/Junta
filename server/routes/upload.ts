import { Router } from 'express';
import { uploadImage, uploadDocument } from '../config/cloudinary';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Single image upload
router.post('/image', authenticateUser, uploadImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'Image uploaded successfully',
      url: req.file.path,
      public_id: (req.file as any).filename
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Single document upload
router.post('/document', authenticateUser, uploadDocument.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'Document uploaded successfully',
      url: req.file.path,
      public_id: (req.file as any).filename
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Multiple image upload (kept for compatibility)
router.post('/images', authenticateUser, uploadImage.array('images', 5), (req, res) => {
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

