const { createCanvas, Image } = require('canvas');
const { writeFileSync, readFileSync } = require('fs');
const THREE = require('three');

async function extractPerspective(inputPath, outputPath, {
  fov = 90,          // field of view in degrees
  yaw = 0,           // left/right rotation
  pitch = 0,         // up/down rotation
  width = 1920,      // output width
  height = 1080      // output height
} = {}) {
  // Create canvas
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  // Setup Three.js renderer with node-canvas
  const renderer = new THREE.WebGLRenderer({ canvas, context });
  renderer.setSize(width, height, false);

  // Setup scene
  const scene = new THREE.Scene();

  // Load texture from equirectangular
  const data = readFileSync(inputPath);
  const image = new Image();
  image.src = data;
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;

  // Sphere with inverted normals (inside-out)
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Camera
  const camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1100);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = THREE.MathUtils.degToRad(yaw);
  camera.rotation.x = THREE.MathUtils.degToRad(pitch);

  // Render
  renderer.render(scene, camera);

  // Save buffer to file
  const buffer = canvas.toBuffer('image/jpeg', { quality: 1.0 });
  writeFileSync(outputPath, buffer);

  console.log(`Saved 2D image: ${outputPath}`);
}

const getCurTimeString = () => {
  const currentTime =
    new Date().toISOString().replace(/[:T]/g, "").split(".")[0] +
    "-" +
    new Date().getMilliseconds().toString().padStart(3, "0");

  return currentTime;
};

// Example usage:
extractPerspective(
  'input/51m.jpg', 
  'output/51m-'+getCurTimeString()+'.jpg',
  { fov: 90, yaw: 45, pitch: 0, width: 1920, height: 1080 }
);


// magick input/51m.jpg -virtual-pixel Black -distort SphericalProjection "90 45 0" output/51m.jpg