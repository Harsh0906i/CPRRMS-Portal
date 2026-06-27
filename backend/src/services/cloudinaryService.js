const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials are provided and not mock
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloudinary_cloud_name';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary storage service configured.');
} else {
  console.log('Cloudinary not configured or mock credentials used. Falling back to local file storage.');
}

/**
 * Uploads a file either to Cloudinary or locally.
 * @param {string} localFilePath - Path of the file on local disk
 * @param {string} folder - Destination folder name
 * @returns {Promise<{fileUrl: string, publicId: string}>}
 */
const uploadFile = async (localFilePath, folder = 'cprrms_reports') => {
  try {
    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folder,
        resource_type: 'auto'
      });
      
      // Delete temporary local file created by multer
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      return {
        fileUrl: result.secure_url,
        publicId: result.public_id
      };
    } else {
      // Local fallback
      // Create local uploads directory if it doesn't exist
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = path.basename(localFilePath);
      const destPath = path.join(uploadDir, fileName);

      // Move file from temp to final local upload directory
      fs.renameSync(localFilePath, destPath);

      // Mock clean URL
      const fileUrl = `/uploads/${fileName}`;
      const publicId = `local_${fileName}`;

      return {
        fileUrl,
        publicId
      };
    }
  } catch (error) {
    // Make sure to clean up temp file on error
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        // ignore
      }
    }
    throw error;
  }
};

/**
 * Deletes a file either from Cloudinary or local uploads.
 * @param {string} publicId - Storage reference identifier
 * @returns {Promise<boolean>}
 */
const deleteFile = async publicId => {
  try {
    if (isCloudinaryConfigured && !publicId.startsWith('local_')) {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } else {
      // Local fallback deletion
      if (publicId.startsWith('local_')) {
        const fileName = publicId.replace('local_', '');
        const filePath = path.join(__dirname, '../../uploads', fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return true;
        }
      }
      return false;
    }
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`);
    return false;
  }
};

module.exports = {
  uploadFile,
  deleteFile
};
