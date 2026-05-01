import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "89475945892",
  api_secret: process.env.CLOUDINARY_API_SECRET || "dummysecret123456789",
});

export default cloudinary;
