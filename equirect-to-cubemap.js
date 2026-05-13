#!/usr/bin/env node
/**
 * Quét thư mục gốc (vd: ./img-360), mỗi thư mục con: tìm *.jpg, kiểm tra equirect 2:1,
 * chuyển sang 6 mặt cubemap PNG kích thước (Wgốc * 0.25) x (Wgốc * 0.25)
 * Ghi vào <cùng thư mục với file ảnh>/anh-ghep/{px,nx,py,ny,pz,nz}.png
 * Nếu đã tồn tại thư mục anh-ghep thì bỏ qua ảnh đó (không ghi đè).
 *
 * Dùng: node equirect-to-cubemap.js <đường dẫn thư mục>
 * Yêu cầu: Node 20+
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { renderFace, INTERPOLATION_METHOD } = require("./utils");

const SIDES = ["px", "nx", "py", "ny", "pz", "nz"];

/** Tỷ lệ chuẩn equirect toàn cầu: width / height = 2 */
const EQUIRECT_RATIO = 2;
const RATIO_TOLERANCE = 0.02; // 2% lệch

function isLikelyEquirectangular(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 4 || height < 2) {
    return false;
  }
  const r = width / height;
  return Math.abs(r - EQUIRECT_RATIO) / EQUIRECT_RATIO <= RATIO_TOLERANCE;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * @param {string} rootDir - thư mục gốc (vd img-360)
 * @param {{ recursive: boolean }} opts
 */
async function processRoot(rootDir, opts) {
  const absoluteRoot = path.resolve(rootDir);
  if (!fs.existsSync(absoluteRoot) || !fs.statSync(absoluteRoot).isDirectory()) {
    throw new Error(`Thư mục không tồn tại hoặc không phải thư mục: ${absoluteRoot}`);
  }

  const dirsToScan = opts.recursive ? allNestedDirs(absoluteRoot) : immediateSubdirs(absoluteRoot);

  let processed = 0;
  let skippedExisting = 0;
  let skipped = 0;

  for (const dir of dirsToScan) {
    const jpgs = findJpegsInDir(dir);
    for (const imagePath of jpgs) {
      const r = await processOneImage(imagePath);
      if (r === true) processed++;
      else if (r === "skip-existing") skippedExisting++;
      else skipped++;
    }
  }

  console.log(
    `Hoàn tất. Đã xử lý: ${processed}, đã có anh-ghep (bỏ qua): ${skippedExisting}, bỏ qua/lỗi khác: ${skipped}`
  );
}

function immediateSubdirs(root) {
  const out = [];
  for (const name of fs.readdirSync(root, { withFileTypes: true })) {
    if (name.isDirectory()) {
      out.push(path.join(root, name.name));
    }
  }
  return out;
}

/** Mọi thư mục con ở mọi cấp (không gồm root). Dùng với --recursive */
function allNestedDirs(root) {
  const dirs = [];
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) {
        const p = path.join(d, e.name);
        dirs.push(p);
        walk(p);
      }
    }
  }
  walk(root);
  return dirs;
}

function findJpegsInDir(dir) {
  const files = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!name.isFile()) continue;
    if (/\.jpe?g$/i.test(name.name)) {
      files.push(path.join(dir, name.name));
    }
  }
  return files;
}

/**
 * @returns {Promise<boolean|string>} true thành công, "skip-existing" nếu đã có anh-ghep, false lỗi/bỏ qua
 */
async function processOneImage(inputImagePath) {
  const imgDir = path.dirname(inputImagePath);
  const outDir = path.join(imgDir, "anh-ghep");

  try {
    if (fs.existsSync(outDir) && fs.statSync(outDir).isDirectory()) {
      console.log(`[Bỏ qua — đã có anh-ghep] ${inputImagePath}`);
      return "skip-existing";
    }
  } catch {
    /* tiếp tục xử lý nếu kiểm tra stat lỗi */
  }

  let meta;
  try {
    meta = await sharp(inputImagePath).metadata();
  } catch (e) {
    console.error(`[Lỗi đọc ảnh] ${inputImagePath}: ${e.message}`);
    return false;
  }

  const width = meta.width;
  const height = meta.height;
  if (!width || !height) {
    console.error(`[Bỏ qua] Không đọc được kích thước: ${inputImagePath}`);
    return false;
  }

  if (!isLikelyEquirectangular(width, height)) {
    console.warn(
      `[Bỏ qua — không giống equirect 2:1] ${inputImagePath} (${width}x${height}, tỷ lệ ${(width / height).toFixed(4)})`
    );
    return false;
  }

  const faceSize = Math.round(width * 0.25);
  if (faceSize < 1) {
    console.error(`[Bỏ qua] Face size quá nhỏ (${faceSize}px): ${inputImagePath}`);
    return false;
  }

  let inputImage;
  try {
    inputImage = await sharp(inputImagePath)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });
  } catch (e) {
    console.error(`[Lỗi decode] ${inputImagePath}: ${e.message}`);
    return false;
  }

  const imageData = {
    data: new Uint8ClampedArray(inputImage.data),
    width: inputImage.info.width,
    height: inputImage.info.height,
    channels: inputImage.info.channels,
  };

  ensureDir(outDir);

  try {
    for (const face of SIDES) {
      const result = renderFace({
        data: imageData,
        face,
        rotation: 0,
        interpolation: INTERPOLATION_METHOD.BILINEAR,
        outputWidth: faceSize,
        maxWidth: Infinity,
      });

      const outPath = path.join(outDir, `${face}.png`);
      await sharp(Buffer.from(result.data), {
        raw: {
          width: result.width,
          height: result.height,
          channels: imageData.channels,
        },
      })
        .removeAlpha()
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    }
  } catch (e) {
    console.error(`[Lỗi render] ${inputImagePath}: ${e.message}`);
    return false;
  }

  console.log(`[OK] ${inputImagePath} → ${outDir}/ (${faceSize}x${faceSize} mỗi mặt)`);
  return true;
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--recursive");
  const recursive = process.argv.includes("--recursive");

  if (args.length !== 1) {
    console.error("Cách dùng: node equirect-to-cubemap.js <thư_mục_gốc> [--recursive]");
    console.error("Ví dụ: node equirect-to-cubemap.js ./img-360");
    process.exit(1);
  }

  sharp.cache(false);
  await processRoot(args[0], { recursive });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
