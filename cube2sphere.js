function mod(x, n) {
  return ((x % n) + n) % n
}

function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max)
}

const orientations = {
  px: (out, x, y, z) => {
    out.x = -z
    out.y = -y
    out.z = -x
  }, // Flipped horizontally
  nx: (out, x, y, z) => {
    out.x = z
    out.y = -y
    out.z = x
  }, // Flipped horizontally
  py: (out, x, y, z) => {
    out.x = -x
    out.y = z
    out.z = -y
  }, // Flipped horizontally
  ny: (out, x, y, z) => {
    out.x = -x
    out.y = -z
    out.z = y
  }, // Flipped horizontally
  pz: (out, x, y, z) => {
    out.x = -x
    out.y = -y
    out.z = -z
  },
  nz: (out, x, y, z) => {
    out.x = x
    out.y = -y
    out.z = z
  },
}

function lanczosKernel(x) {
  const filterSize = 5
  if (x === 0) {
    return 1
  } else {
    const xp = Math.PI * x
    return (filterSize * Math.sin(xp) * Math.sin(xp / filterSize)) / (xp * xp)
  }
}

function sampleLanczos(image, x, y) {
  const filterSize = 5
  let r = 0,
    g = 0,
    b = 0,
    weightSum = 0

  for (let iy = Math.floor(y) - filterSize + 1; iy <= Math.floor(y) + filterSize; iy++) {
    for (let ix = Math.floor(x) - filterSize + 1; ix <= Math.floor(x) + filterSize; ix++) {
      const sampleX = clamp(ix, 0, image.width - 1)
      const sampleY = clamp(iy, 0, image.height - 1)
      const sampleIndex = (sampleY * image.width + sampleX) * 4

      const wx = lanczosKernel(x - ix)
      const wy = lanczosKernel(y - iy)
      const weight = wx * wy

      r += image.data[sampleIndex] * weight
      g += image.data[sampleIndex + 1] * weight
      b += image.data[sampleIndex + 2] * weight
      weightSum += weight
    }
  }

  return [Math.round(r / weightSum), Math.round(g / weightSum), Math.round(b / weightSum)]
}

function sampleCubemap(cubeImages, direction, useNearest = false) {
  const absX = Math.abs(direction.x)
  const absY = Math.abs(direction.y)
  const absZ = Math.abs(direction.z)

  let faceImage, u, v
  const sc = 1.0 / Math.max(absX, absY, absZ)
  direction.x *= sc
  direction.y *= sc
  direction.z *= sc

  const tempDir = { x: 0, y: 0, z: 0 }

  if (absX > absY && absX > absZ) {
    // Swap px and nx here (kept from previous version)
    faceImage = direction.x > 0 ? cubeImages['nx'] : cubeImages['px']
    orientations[direction.x > 0 ? 'nx' : 'px'](tempDir, direction.x, direction.y, direction.z)
  } else if (absY > absZ) {
    faceImage = direction.y > 0 ? cubeImages['py'] : cubeImages['ny']
    orientations[direction.y > 0 ? 'py' : 'ny'](tempDir, direction.x, direction.y, direction.z)
  } else {
    faceImage = direction.z > 0 ? cubeImages['pz'] : cubeImages['nz']
    orientations[direction.z > 0 ? 'pz' : 'nz'](tempDir, direction.x, direction.y, direction.z)
  }

  u = (tempDir.x + 1) * 0.5
  v = (tempDir.y + 1) * 0.5

  if (useNearest) {
    return sampleNearest(faceImage, u * (faceImage.width - 1), v * (faceImage.height - 1))
  } else {
    return sampleLanczos(faceImage, u * (faceImage.width - 1), v * (faceImage.height - 1))
  }
}

function sampleNearest(image, x, y) {
  const ix = Math.round(clamp(x, 0, image.width - 1))
  const iy = Math.round(clamp(y, 0, image.height - 1))
  const index = (iy * image.width + ix) * 4
  return [image.data[index], image.data[index + 1], image.data[index + 2]]
}

function smoothPoleRegion(panorama, width, height, poleY, radius) {
  const startY = Math.max(0, poleY - radius)
  const endY = Math.min(height - 1, poleY + radius)

  for (let y = startY; y <= endY; y++) {
    const weight = 1 - Math.abs(y - poleY) / radius
    const smoothFactor = weight * 0.5 // Adjust this value to control smoothing strength

    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4
      const prevIndex = (y * width + ((x - 1 + width) % width)) * 4
      const nextIndex = (y * width + ((x + 1) % width)) * 4

      for (let c = 0; c < 3; c++) {
        const avg = (panorama.data[prevIndex + c] + panorama.data[nextIndex + c]) / 2
        panorama.data[index + c] = Math.round(
          panorama.data[index + c] * (1 - smoothFactor) + avg * smoothFactor,
        )
      }
    }
  }
}

function convertCubemapToPanorama(cubeImages, outputWidth, outputHeight) {
  const panorama = new ImageData(outputWidth, outputHeight)
  const direction = { x: 0, y: 0, z: 0 }

  for (let y = 0; y < outputHeight; y++) {
    const lat = Math.PI * ((outputHeight - 1 - y) / outputHeight - 0.5) // Kept vertical flip
    const cosLat = Math.cos(lat)

    for (let x = 0; x < outputWidth; x++) {
      const lon = 2 * Math.PI * (1 - x / outputWidth - 0.5) // Kept horizontal orientation

      direction.x = cosLat * Math.sin(lon)
      direction.y = Math.sin(lat)
      direction.z = cosLat * Math.cos(lon)

      const useNearest = Math.abs(lat) > 0.495 * Math.PI // Use nearest sampling very close to poles
      const [r, g, b] = sampleCubemap(cubeImages, direction, useNearest)

      const index = (y * outputWidth + x) * 4
      panorama.data[index] = r
      panorama.data[index + 1] = g
      panorama.data[index + 2] = b
      panorama.data[index + 3] = 255
    }

    if (y % 100 === 0) {
      const progress = Math.round((y / outputHeight) * 100)
      postMessage({ status: 'progress', progress })
    }
  }

  // Apply smoothing to pole regions
  smoothPoleRegion(panorama, outputWidth, outputHeight, 0, outputHeight * 0.05)
  smoothPoleRegion(panorama, outputWidth, outputHeight, outputHeight - 1, outputHeight * 0.05)

  return panorama
}

onmessage = function (e) {
  const { mode } = e.data || {}

  if (mode === 'patch') {
    const { originalPanorama, faceImage, face, outputFormat } = e.data

    const outputWidth = originalPanorama.width
    const outputHeight = originalPanorama.height

    // Clone original to preserve input and mutate the clone
    const panorama = new ImageData(
      new Uint8ClampedArray(originalPanorama.data),
      outputWidth,
      outputHeight,
    )

    // Inverse mapping: iterate equirect pixels, update only those belonging to target face
    const direction = { x: 0, y: 0, z: 0 }
    const tempDir = { x: 0, y: 0, z: 0 }

    const writeIndex = (x, y) => (y * outputWidth + x) * 4

    const edgeFeatherPx = 1.5 // small feather near face edges to reduce visible seams

    for (let y = 0; y < outputHeight; y++) {
      const lat = Math.PI * ((outputHeight - 1 - y) / outputHeight - 0.5)
      const cosLat = Math.cos(lat)

      for (let x = 0; x < outputWidth; x++) {
        const lon = 2 * Math.PI * (1 - x / outputWidth - 0.5)

        direction.x = cosLat * Math.sin(lon)
        direction.y = Math.sin(lat)
        direction.z = cosLat * Math.cos(lon)

        const absX = Math.abs(direction.x)
        const absY = Math.abs(direction.y)
        const absZ = Math.abs(direction.z)

        // Select dominant face (replicates convert/sampleCubemap logic, including px/nx swap)
        let selectedFace
        const sc = 1.0 / Math.max(absX, absY, absZ)
        const dx = direction.x * sc
        const dy = direction.y * sc
        const dz = direction.z * sc

        if (absX > absY && absX > absZ) {
          selectedFace = direction.x > 0 ? 'nx' : 'px'
          orientations[selectedFace](tempDir, dx, dy, dz)
        } else if (absY > absZ) {
          selectedFace = direction.y > 0 ? 'py' : 'ny'
          orientations[selectedFace](tempDir, dx, dy, dz)
        } else {
          selectedFace = direction.z > 0 ? 'pz' : 'nz'
          orientations[selectedFace](tempDir, dx, dy, dz)
        }

        if (selectedFace !== face) continue

        // Compute UV on this face
        const u = (tempDir.x + 1) * 0.5
        const v = (tempDir.y + 1) * 0.5

        // Choose sampling filter: nearest very close to poles to avoid ringing
        const useNearest = Math.abs(lat) > 0.495 * Math.PI
        const fx = u * (faceImage.width - 1)
        const fy = v * (faceImage.height - 1)
        const [r, g, b] = useNearest
          ? sampleNearest(faceImage, fx, fy)
          : sampleLanczos(faceImage, fx, fy)

        // Optional feather blend at edges to reduce seams when only one face is patched
        let alpha = 1
        if (edgeFeatherPx > 0) {
          const edgeU = Math.min(u, 1 - u)
          const edgeV = Math.min(v, 1 - v)
          const edgePx = Math.min(edgeU * faceImage.width, edgeV * faceImage.height)
          alpha = clamp(edgePx / edgeFeatherPx, 0, 1)
        }

        const idx = writeIndex(x, y)
        if (alpha >= 0.999) {
          panorama.data[idx] = r
          panorama.data[idx + 1] = g
          panorama.data[idx + 2] = b
          panorama.data[idx + 3] = 255
        } else if (alpha > 0) {
          // Blend with original
          panorama.data[idx] = Math.round(panorama.data[idx] * (1 - alpha) + r * alpha)
          panorama.data[idx + 1] = Math.round(panorama.data[idx + 1] * (1 - alpha) + g * alpha)
          panorama.data[idx + 2] = Math.round(panorama.data[idx + 2] * (1 - alpha) + b * alpha)
          panorama.data[idx + 3] = 255
        }
      }

      if (y % 100 === 0) {
        const progress = Math.round((y / outputHeight) * 100)
        postMessage({ status: 'progress', progress })
      }
    }

    const canvas = new OffscreenCanvas(outputWidth, outputHeight)
    const ctx = canvas.getContext('2d')
    ctx.putImageData(panorama, 0, 0)

    let mimeType = 'image/png'
    let quality = undefined

    if (outputFormat === 'jpeg') {
      mimeType = 'image/jpeg'
      quality = 0.9
    }

    canvas.convertToBlob({ type: mimeType, quality: quality }).then((blob) => {
      const reader = new FileReader()
      reader.onloadend = function () {
        postMessage({ status: 'complete', panorama: reader.result })
      }
      reader.readAsDataURL(blob)
    })
  } else {
    const { cubeImages, outputWidth, outputHeight, outputFormat } = e.data
    const panorama = convertCubemapToPanorama(cubeImages, outputWidth, outputHeight)

    const canvas = new OffscreenCanvas(outputWidth, outputHeight)
    const ctx = canvas.getContext('2d')
    ctx.putImageData(panorama, 0, 0)

    let mimeType = 'image/png'
    let quality = undefined

    if (outputFormat === 'jpeg') {
      mimeType = 'image/jpeg'
      quality = 0.9 // Adjust JPEG quality as needed
    }

    canvas.convertToBlob({ type: mimeType, quality: quality }).then((blob) => {
      const reader = new FileReader()
      reader.onloadend = function () {
        postMessage({ status: 'complete', panorama: reader.result })
      }
      reader.readAsDataURL(blob)
    })
  }
}
