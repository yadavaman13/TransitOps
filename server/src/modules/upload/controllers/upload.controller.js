import { uploadImageOnImageKit } from '../../../services/image.service.js';

export async function uploadFile(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const file = await uploadImageOnImageKit({ image: req.file });

        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                url: file.url,
                name: file.name,
                fileId: file.fileId,
            },
        });
    } catch (error) {
        next(error);
    }
}
