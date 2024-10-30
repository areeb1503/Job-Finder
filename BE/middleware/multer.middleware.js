import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    const extName = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extName);
    const newFileName = `${baseName}_${Date.now()}${extName}`;
    cb(null, newFileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      resume: /pdf/,
      profilePhoto: /jpeg|jpg|png|gif/,
    };
    const extName = path.extname(file.originalname).toLowerCase();
    const isValid = Object.keys(allowedTypes).some((key) => {
      return file.fieldname === key && allowedTypes[key].test(extName);
    });

    if (isValid) {
      cb(null, true); // Accept the file
    } else {
      cb(
        new Error(
          `Invalid file type for ${
            file.fieldname
          }. Only allowed types are: ${Object.keys(allowedTypes).join(", ")}`
        ),
        false
      );
    }
  },
});

export const uploadMiddleware = (req, res, next) => {
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
