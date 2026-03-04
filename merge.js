const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

// Configuration
const NODE_NAME = "node1";
const LEVEL = "level_3";
const FACE_DIR = path.join(__dirname, 'output', NODE_NAME, LEVEL);
const OUTPUT_WIDTH = 8192;
const OUTPUT_HEIGHT = OUTPUT_WIDTH / 2;

async function mergeToEquirectangular() {
    console.log("Stitching faces to 360 using native OffscreenCanvas...");

    const faceNames = ['front', 'right', 'back', 'left', 'up', 'down'];
    const faceBuffers = {};

    // 1. Use Sharp to get raw pixel data (RGBA) for each face
    for (const name of faceNames) {
        const imgPath = path.join(FACE_DIR, `${name}.jpg`);
        const { data, info } = await sharp(imgPath)
            .raw()
            .toBuffer({ resolveWithObject: true });
        
        faceBuffers[name] = {
            data: new Uint8ClampedArray(data),
            width: info.width,
            height: info.height
        };
    }

    const faceSize = faceBuffers.front.width;
    
    // 2. Initialize native OffscreenCanvas
    const canvas = new OffscreenCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT);
    const ctx = canvas.getContext('2d');
    const outputImage = ctx.createImageData(OUTPUT_WIDTH, OUTPUT_HEIGHT);
    const outData = outputImage.data;

    // 3. Mathematical Mapping (Cube to Equirectangular)
    for (let y = 0; y < OUTPUT_HEIGHT; y++) {
        for (let x = 0; x < OUTPUT_WIDTH; x++) {
            // Normalized coordinates [0, 1]
            const u = x / OUTPUT_WIDTH;
            const v = y / OUTPUT_HEIGHT;

            // Map to spherical coordinates
            const theta = u * 2 * Math.PI - Math.PI;
            const phi = v * Math.PI - Math.PI / 2;

            // Map sphere to unit cube vector
            const dx = Math.cos(phi) * Math.sin(theta);
            const dy = Math.sin(phi);
            const dz = Math.cos(phi) * Math.cos(theta);

            const absX = Math.abs(dx);
            const absY = Math.abs(dy);
            const absZ = Math.abs(dz);

            let faceName, tx, ty;

            // Determine which face the vector hits
            if (absX >= absY && absX >= absZ) {
                if (dx > 0) { faceName = 'right'; tx = ((-dz / absX) + 1) / 2; ty = ((-dy / absX) + 1) / 2; }
                else { faceName = 'left'; tx = ((dz / absX) + 1) / 2; ty = ((-dy / absX) + 1) / 2; }
            } else if (absY >= absX && absY >= absZ) {
                if (dy > 0) { faceName = 'up'; tx = ((dx / absY) + 1) / 2; ty = ((dz / absY) + 1) / 2; }
                else { faceName = 'down'; tx = ((dx / absY) + 1) / 2; ty = ((-dz / absY) + 1) / 2; }
            } else {
                if (dz > 0) { faceName = 'front'; tx = ((dx / absZ) + 1) / 2; ty = ((-dy / absZ) + 1) / 2; }
                else { faceName = 'back'; tx = ((-dx / absZ) + 1) / 2; ty = ((-dy / absZ) + 1) / 2; }
            }

            // Get pixel from the correct face buffer
            const face = faceBuffers[faceName];
            const ix = Math.min(Math.floor(tx * face.width), face.width - 1);
            const iy = Math.min(Math.floor(ty * face.height), face.height - 1);
            
            const srcIdx = (iy * face.width + ix) * 4;
            const dstIdx = (y * OUTPUT_WIDTH + x) * 4;

            outData[dstIdx] = face.data[srcIdx];         // R
            outData[dstIdx + 1] = face.data[srcIdx + 1]; // G
            outData[dstIdx + 2] = face.data[srcIdx + 2]; // B
            outData[dstIdx + 3] = 255;                   // A
        }
    }

    // 4. Save the result back to JPEG using Sharp
    await sharp(outData, {
        raw: { width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT, channels: 4 }
    })
    .jpeg({ quality: 95 })
    .toFile(path.join(FACE_DIR, 'final_360_native.jpg'));

    console.log("✅ Success: final_360_native.jpg created.");
}

mergeToEquirectangular().catch(console.error);