import path from "path";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

const publicFolder = path.resolve(__dirname, "..", "..", "public");

const blockedExtensions = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".msi",
  ".sh",
  ".bash",
  ".ps1",
  ".php",
  ".php3",
  ".php4",
  ".php5",
  ".phtml",
  ".jsp",
  ".jspx",
  ".asp",
  ".aspx",
  ".cgi",
  ".pl",
  ".py",
  ".rb",
  ".js",
  ".jar",
  ".vbs",
  ".ws",
  ".wsf",
  ".dll",
  ".scr",
  ".htaccess"
]);

export default {
  directory: publicFolder,

  storage: multer.diskStorage({
    destination: publicFolder,
    filename(req, file, cb) {
      const fileName = new Date().getTime() + path.extname(file.originalname);

      return cb(null, fileName);
    }
  }),

  limits: {
    fileSize: 25 * 1024 * 1024
  },

  fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (blockedExtensions.has(ext)) {
      return cb(new Error("ERR_FILE_TYPE_NOT_ALLOWED"));
    }
    return cb(null, true);
  }
};
