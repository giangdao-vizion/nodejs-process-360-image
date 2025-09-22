const fs = require("fs");
const path = require("path");

/**
 * Get all files from a folder filtered by extension.
 * @param {string} folder - Path to the folder.
 * @param {string[]} exts - Array of allowed extensions (e.g. ["jpg","jpeg"]).
 * @returns {string[]} - List of relative file paths.
 */
function getAllFileFromFolder(folder, exts = []) {
  const results = [];

  const list = fs.readdirSync(folder, { withFileTypes: true });

  list.forEach((entry) => {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase().replace(".", "");
      if (exts.length === 0 || exts.includes(ext)) {
        results.push(path.join(folder, entry.name).replace(/\\/g, "/")); // normalize slashes
      }
    }
  });

  return results;
}


const createFolderIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

module.exports = {
  createFolderIfNotExists,
  getAllFileFromFolder,
};