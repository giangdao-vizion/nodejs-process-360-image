const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { getCurTimeString } = require('./utils');

// =======================
// CONFIG
// =======================
const inputDir = path.join(__dirname, "input", "convert-webp"); // folder chứa PNG
const outputDir = path.join(__dirname, "output", "convert-webp-" + getCurTimeString()); // folder chứa WEBP

const MAX_WIDTH = 1500;
const WEBP_QUALITY = 80;

// =======================
// HELPERS
// =======================

// tạo folder output nếu chưa có
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// =======================
// MAIN FUNCTION
// =======================
async function processImages() {
  console.log("🚀 Scanning folder:", inputDir);

  // đọc tất cả file trong inputDir
  const files = fs.readdirSync(inputDir);

  // lọc file PNG
  const pngFiles = files.filter((file) =>
    file.toLowerCase().endsWith(".png")
  );

  if (pngFiles.length === 0) {
    console.log("⚠️ No PNG files found in input folder.");
    return;
  }

  console.log(`📌 Found ${pngFiles.length} PNG files\n`);

  // xử lý từng file
  for (const file of pngFiles) {
    const inputPath = path.join(inputDir, file);

    // đổi tên output thành .webp
    const outputName = file.replace(/\.png$/i, ".webp");
    const outputPath = path.join(outputDir, outputName);

    try {
      console.log("⬇️ Processing:", file);

      await sharp(inputPath)
        .resize({
          width: MAX_WIDTH,
          withoutEnlargement: true, // không phóng to ảnh nhỏ
        })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);

      console.log("✅ Saved:", outputName);
    } catch (err) {
      console.log("❌ Failed:", file, err.message);
    }
  }

  console.log("\n🎉 DONE! All PNG files converted to WEBP.");
}

processImages();