const axios = require('axios');
const sharp = require('sharp');
const pLimit = require('p-limit');
const fs = require('fs-extra'); // Optional: 'fs' works too, but 'fs-extra' is cleaner for mkdir -p
const path = require('path');

// Configuration
// const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/Agora+City/@10.6146995,106.4084827,3a,75y,235.36h,94.96t/data=!3m7!1e1!3m5!1sjah9ulX_-WMAe_GdnxWiYg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-4.961667789449109%26panoid%3Djah9ulX_-WMAe_GdnxWiYg%26yaw%3D235.35653886828743!7i16384!8i8192!4m14!1m7!3m6!1s0x310acf64305ca71d:0xf5c539ebf817f783!2sAgora+City!8m2!3d10.6143914!4d106.4084681!16s%2Fg%2F11t443hgpn!3m5!1s0x310acf64305ca71d:0xf5c539ebf817f783!8m2!3d10.6143914!4d106.4084681!16s%2Fg%2F11t443hgpn?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";
// const GOOGLE_MAPS_URL = "https://www.google.com/maps/@40.758895,-73.985131,3a,75y,289.43h,90t/data=!3m6!1e1!3m4!1spekKQtksVp6N_ycpZKiPvw!2e0!7i16384!8i8192";
// const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/Agora+City/@10.6151533,106.4081523,3a,75y,163.89h,70.91t/data=!3m7!1e1!3m5!1snJL-aX4rqGyCuvz2CMW_fw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D19.094152171511894%26panoid%3DnJL-aX4rqGyCuvz2CMW_fw%26yaw%3D163.89215709511686!7i16384!8i8192!4m14!1m7!3m6!1s0x310acf64305ca71d:0xf5c539ebf817f783!2sAgora+City!8m2!3d10.6143914!4d106.4084681!16s%2Fg%2F11t443hgpn!3m5!1s0x310acf64305ca71d:0xf5c539ebf817f783!8m2!3d10.6143914!4d106.4084681!16s%2Fg%2F11t443hgpn?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";
// const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/Agora+City/@10.6143294,106.4087434,3a,75y,270.44h,94.52t/data=!3m7!1e1!3m5!1sCqrdxn5XG2j_JPqXBR1TCg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-4.521811420873405%26panoid%3DCqrdxn5XG2j_JPqXBR1TCg%26yaw%3D270.4425977774238!7i16384!8i8192!4m14!1m7!3m6!1s0x310acf64305ca71d:0xf5c539ebf817f783!2sAgora+City!8m2!3d10.6143914!4d106.4084681!16s%2Fg%2F11t443hgpn!3m5!1s0x310acf64305ca71d:0xf5c539ebf817f783!8m2!3d10.6143914!4d106.4084681!16s%2Fg%2F11t443hgpn?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";
// const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/Agora+City/@10.6141944,106.4077438,3a,75y,232.6h,95.81t/data=!3m7!1e1!3m5!1sSc2Q5hQ8IKWiHbI3Dn_0Yg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-5.814984294302988%26panoid%3DSc2Q5hQ8IKWiHbI3Dn_0Yg%26yaw%3D232.60337151543274!7i16384!8i8192!4m14!1m7!3m6!1s0x310acf64305ca71d:0xf5c539ebf817f783!2sAgora+City!8m2!3d10.6143914!4d106.4084681!16s%2Fg%2F11t443hgpn!3m5!1s0x310acf64305ca71d:0xf5c539ebf817f783!8m2!3d10.6143914!4d106.4084681!16s%2Fg%2F11t443hgpn?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";
const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/Agora+City/@10.6139013,106.4072775,3a,75y,67.62h,90.8t/data=!3m7!1e1!3m5!1sEwbADa_loW9czJHLhPYdTA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-0.7955677472897662%26panoid%3DEwbADa_loW9czJHLhPYdTA%26yaw%3D67.61561462656273!7i16384!8i8192!4m14!1m7!3m6!1s0x310acf64305ca71d:0xf5c539ebf817f783!2sAgora+City!8m2!3d10.6143914!4d106.4084681!16s%2Fg%2F11t443hgpn!3m5!1s0x310acf64305ca71d:0xf5c539ebf817f783!8m2!3d10.6143914!4d106.4084681!16s%2Fg%2F11t443hgpn?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D";
const limit = pLimit(5);
const TILE_SIZE = 512;

// Map Zoom levels to their expected grid dimensions (Cols x Rows)
const ZOOM_CONFIG = {
    0: { cols: 1, rows: 1 },
    1: { cols: 2, rows: 1 },
    2: { cols: 4, rows: 2 },
    3: { cols: 8, rows: 4 },
    4: { cols: 16, rows: 8 },
    5: { cols: 32, rows: 16 }
};

function extractPanoid(url) {
    const match = url.match(/!1s([^!]+)/);
    return match ? match[1] : null;
}

async function downloadTile(panoid, x, y, zoom, tilePath) {
    const url = `https://streetviewpixels-pa.googleapis.com/v1/tile?cb_client=maps_sv.tactile&panoid=${panoid}&x=${x}&y=${y}&zoom=${zoom}&nbt=1&fover=2`;
    
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
        await fs.outputFile(tilePath, response.data);
        return {
            input: Buffer.from(response.data),
            top: y * TILE_SIZE,
            left: x * TILE_SIZE
        };
    } catch (err) {
        return null; // Return null if tile is missing or 404
    }
}

async function processZoom(panoid, zoom) {
    const { cols, rows } = ZOOM_CONFIG[zoom];
    const totalExpected = cols * rows;
    const zoomDir = path.join(__dirname, 'output', panoid, zoom.toString());
    const tilesDir = path.join(zoomDir, 'tiles');

    console.log(`--- Processing Zoom ${zoom} (${cols}x${rows}) ---`);
    
    const downloadPromises = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const tilePath = path.join(tilesDir, `tile_${y}_${x}.jpg`);
            downloadPromises.push(limit(() => downloadTile(panoid, x, y, zoom, tilePath)));
        }
    }

    const results = await Promise.all(downloadPromises);
    const successfulTiles = results.filter(t => t !== null);

    if (successfulTiles.length === totalExpected) {
        console.log(`✅ All ${totalExpected} tiles found. Stitching...`);
        
        await sharp({
            create: {
                width: cols * TILE_SIZE,
                height: rows * TILE_SIZE,
                channels: 3,
                background: { r: 0, g: 0, b: 0 }
            }
        })
        .composite(successfulTiles)
        .jpeg({ quality: 95 })
        .toFile(path.join(zoomDir, 'pano.jpg'));
        
        console.log(`Saved: ${zoomDir}/pano.jpg`);
    } else {
        console.log(`❌ Missing ${totalExpected - successfulTiles.length} of total ${totalExpected} tiles for zoom level ${zoom}`);
    }
}

async function start() {
    const panoid = extractPanoid(GOOGLE_MAPS_URL);
    if (!panoid) return console.error("Could not find PANOID in link.");
    
    console.log(`Target Panoid: ${panoid}`);

    // select zoom levels to process
    for (let z = 4; z <= 4; z++) {
        await processZoom(panoid, z);
    }
}

// Ensure you have 'fs-extra' installed or replace with native fs.mkdirSync logic
// npm install fs-extra
start().catch(console.error);