import multer from "multer";

// Dùng bộ nhớ tạm (Memory Storage) để ném thẳng lên Cloudinary mà không cần lưu ở ổ cứng cục bộ
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB mỗi ảnh
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  },
});
