/**
 * Client-side image compression using the Canvas API.
 * Max 1920×1920px, max 2MB output, JPEG at quality 85.
 * Call this before any image upload to reduce Supabase storage costs.
 */

const MAX_DIMENSION = 1920
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const JPEG_QUALITY  = 0.85

const SUPPORTED_TYPES   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const UNSUPPORTED_TYPES = ['image/heic', 'image/heif', 'image/raw', 'image/bmp', 'image/tiff']

type CompressResult = {
  file:            File
  originalSize:    number
  compressedSize:  number
  compressionRatio: number
  width:           number
  height:          number
}

export async function compressImage(file: File): Promise<CompressResult> {
  // Reject unsupported formats
  if (UNSUPPORTED_TYPES.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toUpperCase() || file.type
    throw new Error(
      `${ext} files are not supported. Please upload a JPEG, PNG, WebP, or GIF image.`
    )
  }

  // Animated GIFs — return as-is (Canvas strips animation)
  if (file.type === 'image/gif') {
    return {
      file,
      originalSize:    file.size,
      compressedSize:  file.size,
      compressionRatio: 1,
      width:  0,
      height: 0,
    }
  }

  if (!SUPPORTED_TYPES.includes(file.type)) {
    throw new Error(
      `Unsupported file type: ${file.type}. Please upload a JPEG, PNG, WebP, or GIF image.`
    )
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Scale down while preserving aspect ratio — never upscale
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context unavailable'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Export as JPEG (handles PNG→JPEG conversion, strips PNG metadata)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image compression failed'))
            return
          }

          // If the compressed output is still too large, reduce quality further
          if (blob.size > MAX_SIZE_BYTES) {
            canvas.toBlob(
              (blob2) => {
                if (!blob2) {
                  reject(new Error('Image compression failed at lower quality'))
                  return
                }
                const outputFile = new File([blob2], toJpegName(file.name), {
                  type: 'image/jpeg',
                })
                resolve({
                  file:             outputFile,
                  originalSize:     file.size,
                  compressedSize:   outputFile.size,
                  compressionRatio: file.size / outputFile.size,
                  width,
                  height,
                })
              },
              'image/jpeg',
              0.70 // Lower quality fallback
            )
            return
          }

          const outputFile = new File([blob], toJpegName(file.name), {
            type: 'image/jpeg',
          })

          resolve({
            file:             outputFile,
            originalSize:     file.size,
            compressedSize:   outputFile.size,
            compressionRatio: file.size / outputFile.size,
            width,
            height,
          })
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image. The file may be corrupt or an unsupported format.'))
    }

    img.src = url
  })
}

function toJpegName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '')
  return `${base}.jpg`
}

/** Format file size for display, e.g. "1.4 MB" or "320 KB" */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
