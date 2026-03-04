const axios = require('axios');
const sharp = require('sharp');
const pLimit = require('p-limit');
const fs = require('fs-extra');
const path = require('path');

const inputURL = "https://agoracity.vn/360/tiles/node1/cf_3/l_3/c_4/tile_7.jpg?ts=60966409";
const TILE_SIZE = 512; 
const limit = pLimit(10); 

function parsePanoUrl(url) {
    const regex = /^(.*\/)(node\d+)\/cf_(\d+)\/l_(\d+)\/c_(\d+)\/tile_(\d+)\.jpg(\?.*)?$/;
    const match = url.match(regex);
    if (!match) throw new Error("URL format not recognized.");
    return {
        baseUrl: match[1],
        node: match[2],
        level: parseInt(match[4]),
        query: match[7] || ""
    };
}

async function getTileData(info, faceId, x, y) {
    const url = `${info.baseUrl}${info.node}/cf_${faceId}/l_${info.level}/c_${x}/tile_${y}.jpg${info.query}`;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
        const buffer = Buffer.from(response.data);
        const metadata = await sharp(buffer).metadata();
        return { buffer, width: metadata.width, height: metadata.height, x, y };
    } catch (err) {
        return null;
    }
}

async function processFace(info, faceId, faceName) {
    const gridSize = Math.pow(2, info.level); 
    console.log(`Calculating dimensions for Face ${faceId}...`);
    
    // 1. Download all tiles and collect their actual sizes
    const downloadPromises = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            downloadPromises.push(limit(() => getTileData(info, faceId, x, y)));
        }
    }

    const allTiles = (await Promise.all(downloadPromises)).filter(t => t !== null);
    if (allTiles.length === 0) return;

    // 2. Calculate the "Smart Canvas" size
    // We sum widths of tiles in row 0, and heights of tiles in column 0
    let totalWidth = 0;
    for (let x = 0; x < gridSize; x++) {
        const tile = allTiles.find(t => t.x === x && t.y === 0);
        if (tile) totalWidth += tile.width;
    }

    let totalHeight = 0;
    for (let y = 0; y < gridSize; y++) {
        const tile = allTiles.find(t => t.y === y && t.x === 0);
        if (tile) totalHeight += tile.height;
    }

    console.log(`Smart Canvas Size: ${totalWidth}x${totalHeight} (removed ${ (gridSize * TILE_SIZE) - totalWidth}px overhang)`);

    // 3. Prepare tiles for Sharp's composite
    const compositeList = allTiles.map(tile => ({
        input: tile.buffer,
        left: tile.x * TILE_SIZE,
        top: tile.y * TILE_SIZE
    }));

    const outputDir = path.join(__dirname, 'output', info.node, `level_${info.level}`);
    await fs.ensureDir(outputDir);

    // 4. Create the perfectly sized canvas
    await sharp({
        create: {
            width: totalWidth,
            height: totalHeight,
            channels: 3,
            background: { r: 0, g: 0, b: 0 }
        }
    })
    .composite(compositeList)
    .jpeg({ quality: 95 })
    .toFile(path.join(outputDir, `${faceName}.jpg`));

    console.log(`✅ Saved: ${faceName}.jpg`);
}

async function start() {
    const info = parsePanoUrl(inputURL);
    const faces = ['front', 'right', 'back', 'left', 'up', 'down'];
    for (let i = 0; i < 6; i++) {
        await processFace(info, i, faces[i]);
    }
}

start().catch(err => console.error("Error:", err.message));