const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { getCurTimeString } = require('./utils');

// =======================
// CONFIG
// =======================
const inputDir = path.join(__dirname, "input", "convert-webp"); 
const outputDir = path.join(__dirname, "output", "convert-webp-" + getCurTimeString()); 

const MAX_WIDTH = 1500;
const WEBP_QUALITY = 80;

// =======================
// HELPERS
// =======================

// Create output folder if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// =======================
// MAIN FUNCTION
// =======================
async function processImages() {
  console.log("🚀 Scanning folder:", inputDir);

  // Read all files in inputDir
  const files = fs.readdirSync(inputDir);

  // Filter for JPEG files only
  const imageFiles = files.filter((file) => {
    const ext = file.toLowerCase();
    return ext.endsWith(".jpg") || ext.endsWith(".jpeg");
  });

  if (imageFiles.length === 0) {
    console.log("⚠️ No JPEG files found in input folder.");
    return;
  }

  // Sort files numerically (Scene 1, Scene 2 ... Scene 101)
  // Without this, "Scene 10.jpg" might appear before "Scene 2.jpg"
  imageFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/) || 0);
    const numB = parseInt(b.match(/\d+/) || 0);
    return numA - numB;
  });

  console.log(`📌 Found ${imageFiles.length} JPEGs. Starting conversion...\n`);

  // Process each file
  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);

    // 1. Extract the number from the filename (e.g., "1" from "Scene 1.jpg")
    const match = file.match(/\d+/);
    
    if (!match) {
      console.log(`⚠️ Skipping ${file}: No number found in filename.`);
      continue;
    }

    // 2. Pad the number to 3 digits (1 -> 001) and format the new name
    const paddedNumber = match[0].padStart(3, "0");
    const outputName = `scene-${paddedNumber}.webp`;
    const outputPath = path.join(outputDir, outputName);

    try {
      console.log(`⬇️ Converting: ${file} -> ${outputName}`);

      await sharp(inputPath)
        .resize({
          width: MAX_WIDTH,
          withoutEnlargement: true, // Don't upscale small images
        })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);

      console.log("✅ Saved!");
    } catch (err) {
      console.log("❌ Failed:", file, err.message);
    }
  }

  console.log("\n🎉 DONE! All files renamed to 'scene-xxx.webp' and converted.");
}

processImages();