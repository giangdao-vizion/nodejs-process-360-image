const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const pLimit = require("p-limit");

// =======================
// CONFIG
// =======================
const INPUT_FILE = "./shopify-products.json";
const OUTPUT_DIR = path.join(__dirname, "output");

const CONCURRENCY = 5;
const limit = pLimit(CONCURRENCY);

// Resize tối ưu (giữ chi tiết tốt)
const RESIZE_WIDTH = 1000;
const WEBP_QUALITY = 82;
const WEBP_EFFORT = 6;

// =======================
// HELPERS
// =======================

// tạo folder nếu chưa có
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// lấy filename sạch từ URL
function getFileName(url) {
  return path.basename(url.split("?")[0]);
}

// datetime string
function getDateTimeString() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

// =======================
// DOWNLOAD + RESIZE + SAVE WEBP
// =======================
async function processImage(url, productHandle) {
  try {
    // folder output theo handle
    const productDir = path.join(OUTPUT_DIR, productHandle);
    ensureDir(productDir);

    // filename gốc
    const originalName = getFileName(url);

    // đổi sang .webp
    const webpName = originalName.replace(/\.(jpg|jpeg|png)$/i, ".webp");

    // output path
    const outputPath = path.join(productDir, webpName);

    console.log("⬇️ Download:", url);

    // tải ảnh về buffer
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 20000,
    });

    const buffer = Buffer.from(res.data);

    // resize + convert webp rồi lưu luôn
    await sharp(buffer)
      .resize({ width: RESIZE_WIDTH })
      .webp({
        quality: WEBP_QUALITY,
        effort: WEBP_EFFORT,
      })
      .toFile(outputPath);

    console.log("✅ Saved:", outputPath);

    // return new local url
    return `/output/${productHandle}/${webpName}`;
  } catch (err) {
    console.log("⚠️ Failed:", url);
    return null;
  }
}

// =======================
// MAIN
// =======================
async function main() {
  console.log("🚀 Reading products.json...\n");

  const products = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));

  ensureDir(OUTPUT_DIR);

  let updatedProducts = [];

  for (const product of products) {
    console.log(`\n📦 Product: ${product.name}`);

    let newImageUrls = [];

    // download + resize song song
    const tasks = product.imageUrls.map((url) =>
      limit(async () => {
        const newUrl = await processImage(url, product.handle);
        if (newUrl) newImageUrls.push(newUrl);
      })
    );

    await Promise.all(tasks);

    // update product JSON
    updatedProducts.push({
      ...product,
      imageUrls: newImageUrls,
    });
  }

  // save new json file
  const datetime = getDateTimeString();
  const outputJsonFile = path.join(
    OUTPUT_DIR,
    `product-new-${datetime}.json`
  );

  fs.writeFileSync(outputJsonFile, JSON.stringify(updatedProducts, null, 2));

  console.log("\n🎉 DONE!");
  console.log("📄 New JSON saved at:", outputJsonFile);
}

main();