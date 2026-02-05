const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pLimit = require("p-limit");
const { getCurTimeString } = require('./utils');
const URL_LIST = require('./simulator.data.json');

const OUTPUT_DIR = path.join(__dirname, "output", "" + getCurTimeString());

// số request song song (tối ưu, an toàn)
const CONCURRENCY = 5;
const limit = pLimit(CONCURRENCY);

// tạo thư mục nếu chưa có
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

async function downloadImage(url) {
  try {
    // Extract filename from URL
    const filename = path.basename(url);
    const filePath = path.join(OUTPUT_DIR, filename);

    console.log("⬇️ Downloading:", filename);

    // Request image as stream
    const res = await axios.get(url, {
      responseType: "stream",
      timeout: 15000,
    });

    // Save file
    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log("✅ Saved:", filename);
        resolve();
      });

      writer.on("error", reject);
    });
  } catch (err) {
    console.log("⚠️ Failed:", url);
  }
}

(async () => {
  console.log("🚀 Starting downloads...\n");

  const tasks = URL_LIST.map((url) =>
    limit(() => downloadImage(url))
  );

  await Promise.all(tasks);

  console.log("\n🎉 All downloads finished!");
})();