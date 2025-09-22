const fs = require("fs");
const sharp = require("sharp");
const { INTERPOLATION_METHOD, getImageNameFromImgPath, getCurTimeString, renderFace } = require('./utils');

sharp.cache(false);

async function processImg(inputImagePath, imgW = 0, imgH = 0) {
  const inputImage = await sharp(inputImagePath)
    .raw()
    .ensureAlpha() // force 4 channels (RGBA), consistent indexing
    .toBuffer({ resolveWithObject: true });

  const imageData = {
    data: new Uint8ClampedArray(inputImage.data),
    width: inputImage.info.width,
    height: inputImage.info.height,
    channels: inputImage.info.channels,  // <= track this!
  };

  console.log('imageData.channels', imageData.channels);

  const imgName = getImageNameFromImgPath(inputImagePath);

  const currentTime = getCurTimeString();
  const outputDir = `output/${imgName}_${currentTime}`;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sides = ["px", "nx", "py", "ny", "pz", "nz"];

  for (const face of sides) {
    const result = renderFace({
      data: imageData,
      face: face,
      rotation: 0,
      interpolation: INTERPOLATION_METHOD.BILINEAR,
      maxWidth: 8192,
    });

    await sharp(Buffer.from(result.data), {
      raw: {
        width: result.width,
        height: result.height,
        channels: imageData.channels,
      },
    })
    .removeAlpha()
      .jpeg({
        quality: 100,              // highest quality
        chromaSubsampling: '4:4:4', // keep sharp colors
        progressive: true,          // better loading (optional)
        mozjpeg: true               // use mozjpeg if available
      })
      .toFile(`${outputDir}/${face}.jpeg`);

    console.log(`The output file for ${face} was created.`);
  }

  console.log(`PROCESS COMPLETED !`);
}

processImg("input/51m.jpg").catch(console.error);
