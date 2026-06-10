import cloudinary from "./cloudinary";
import streamifier from "streamifier"; 

export function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  options: object = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, ...options },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}