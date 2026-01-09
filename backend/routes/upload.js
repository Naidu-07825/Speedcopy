const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    ),
});

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only PDF and PNG/JPEG allowed."));
};

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });


router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File missing" });
  }

  res.json({
    filePath: req.file ? `/uploads/${req.file.filename}` : null,
    fileName: req.file ? req.file.originalname : null,
  });
});


router.post("/multiple", upload.array("files", 10), (req, res) => {
  if (!req.files || !req.files.length) {
    return res.status(400).json({ message: "Files missing" });
  }

  const files = req.files.map((f) => ({
    filePath: `/uploads/${f.filename}`,
    fileName: f.originalname,
  }));

  res.json({ files });
});

module.exports = router;
