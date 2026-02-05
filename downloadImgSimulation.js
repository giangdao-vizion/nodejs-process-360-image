const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pLimit = require("p-limit");
const { getCurTimeString } = require('./utils');

const INPUT_URL = "https://ez-viz.net/ct7/ngay/camngay089.webp";
const OUTPUT_DIR = path.join(__dirname, "output", "camngay-" + getCurTimeString());

// số request song song (tối ưu, an toàn)
const CONCURRENCY = 5;
const limit = pLimit(CONCURRENCY);

// tạo thư mục nếu chưa có
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// phân tích link gốc
const match = INPUT_URL.match(/(.*camngay)(\d{3})(\.webp)/);
if (!match) {
  console.error("❌ Link không đúng định dạng camngayXXX.webp");
  process.exit(1);
}

const base = match[1];
const ext = match[3];

async function downloadImage(url, filename) {
  try {
    const res = await axios.get(url, {
      responseType: "stream",
      timeout: 15000,
    });

    const filePath = path.join(OUTPUT_DIR, filename);
    const writer = fs.createWriteStream(filePath);

    res.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log("✅ Đã tải:", filename);
        resolve();
      });
      writer.on("error", reject);
    });
  } catch (err) {
    console.log("⚠️ Bỏ qua:", filename);
  }
}

(async () => {
  const tasks = [];

  for (let i = 1; i <= 99; i++) {
    const num = String(i).padStart(3, "0");
    const url = `${base}${num}${ext}`;
    const filename = `camngay${num}.webp`;

    tasks.push(
      limit(() => downloadImage(url, filename))
    );
  }

  await Promise.all(tasks);
  console.log("🎉 Hoàn tất tải ảnh");
})();