import multer from 'multer';
import path from 'path';

// Configure multer storage in memory for handling buffer processing with Sharp
const storage = multer.memoryStorage();

// Multer upload middleware for handling multiple image fields with error handling
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Only image files (JPEG, JPG, PNG) are allowed.'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})
    .fields([
        { name: 'images', maxCount: 5 },  // Main product images
        { name: 'colorsImg', maxCount: 5 } // Color variant images (adjusted to match frontend key)
    ]);

// Export the configured multer upload function
export default upload;
