const sharp = require("sharp");
const { createFolderIfNotExists, getAllFileFromFolder } = require('./fs.utils');
const { INTERPOLATION_METHOD, getImageNameFromImgPath, getCurTimeString, renderFace } = require('./utils');

sharp.cache(false);

const OUTPUT_SIZE = {
  512: {
    width: 512,
    quality: 50,
  },
  1024: {
    width: 1024,
    quality: 50,
  },
  1024_75: {
    width: 1024,
    quality: 75,
  },
  2048: {
    width: 2048,
    quality: 75,
  },
  2048_90: {
    width: 2048,
    quality: 90,
  },
  4096: {
    width: 4096,
    quality: 90,
  },
  4096_100: {
    width: 4096,
    quality: 100,
  },
};

async function processImg(inputImagePath, outputConfigs = [OUTPUT_SIZE[1024]], outputDir = "output") {
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

  createFolderIfNotExists(outputDir);

  const sides = ["px", "nx", "py", "ny", "pz", "nz"];

  for (const outConf of outputConfigs) {
    for (const face of sides) {
      const result = renderFace({
        data: imageData,
        face: face,
        rotation: 0,
        interpolation: INTERPOLATION_METHOD.BILINEAR,
        outputWidth: outConf.width,
        maxWidth: 4096,
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
          quality: outConf.quality,
          chromaSubsampling: outConf.quality >= 90 ? '4:4:4' : '4:2:0', // keep sharp colors by 4:4:4
          progressive: true,
          mozjpeg: true,
        })
        .toFile(`${outputDir}/${outConf.width}-${face}.jpeg`);

      console.log(`The output file for ${outConf.width}-${face} was created.`);
    }
  }

  console.log(`PROCESS COMPLETED !`);
}


const inputFile = "input/51m.jpg";
const imgName = getImageNameFromImgPath(inputFile);
const currentTime = getCurTimeString();
const outputDir = `output/${imgName}_${currentTime}`;

// Process 1 file
// processImg(
//   inputFile,
//   [OUTPUT_SIZE[1024], OUTPUT_SIZE[2048], OUTPUT_SIZE[4096]],
//   outputDir
// ).catch(console.error);

// process many files
const processMany = async () => {
  const files = getAllFileFromFolder("input", ["jpg", "jpeg"]);
  console.log("Found files:", files);
  for (const file of files) {
    console.log("Processing:", file);
    const iName = getImageNameFromImgPath(file);
    await processImg(file, [OUTPUT_SIZE[1024], OUTPUT_SIZE[2048]], `output/${currentTime}/${iName}`); // wait until done before moving on
    console.log("Done:", file);
  }
  console.log("All files processed.");
};

processMany();
