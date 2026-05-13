#!/usr/bin/env node
/**
 * Quét thư mục gốc (vd ./img-360), tìm mọi thư mục tên "anh-ghep" (mọi cấp) và xóa.
 *
 * Dùng: node clean-anh-ghep.js <đường_dẫn>
 * Node 20+
 */

const fs = require("fs");
const path = require("path");

function collectAnhGhepDirs(root) {
  const results = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (!e.isDirectory()) continue;
      if (e.name === "anh-ghep") {
        results.push(p);
        continue;
      }
      walk(p);
    }
  }
  walk(path.resolve(root));
  return results;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error("Cách dùng: node clean-anh-ghep.js <thư_mục_gốc>");
    console.error("Ví dụ: node clean-anh-ghep.js ./img-360");
    process.exit(1);
  }

  const root = path.resolve(args[0]);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`Không phải thư mục hợp lệ: ${root}`);
    process.exit(1);
  }

  const dirs = collectAnhGhepDirs(root);
  // Xóa từ đường dẫn sâu nhất trước (phòng trường hợp lồng nhau)
  dirs.sort((a, b) => b.length - a.length);

  let removed = 0;
  for (const d of dirs) {
    try {
      fs.rmSync(d, { recursive: true, force: true });
      console.log(`Đã xóa: ${d}`);
      removed++;
    } catch (e) {
      console.error(`Lỗi xóa ${d}: ${e.message}`);
    }
  }

  console.log(`Hoàn tất. Đã xóa ${removed}/${dirs.length} thư mục anh-ghep.`);
}

main();
