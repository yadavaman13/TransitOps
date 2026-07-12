import multer from 'multer';

// Set up memory storage so that files are kept in memory as buffers before upload to ImageKit
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB file size limit
    },
});

export const uploadSingle = upload.single('file');
