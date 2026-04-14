// ─────────────────────────────────────────────
// lib/cloudinary.ts  —  Free file uploads
// Cloudinary Spark free tier: 25GB storage, 25GB bandwidth/month
// No Firebase Storage needed — works on Firebase Spark (free) plan
// ─────────────────────────────────────────────

const CLOUD_NAME  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET! // unsigned preset

/**
 * Upload a file directly from the browser to Cloudinary (unsigned).
 * Uses an "unsigned upload preset" — safe to call from client side.
 * Returns the secure HTTPS URL of the uploaded file.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Upload failed (${res.status})`)
  }

  const data = await res.json()
  return data.secure_url as string
}

// Folder constants — mirrors old FOLDERS/BUCKETS shape
export const FOLDERS = {
  PRODUCT_IMAGES:  'neko3dlabs/product-images',
  PRODUCT_VIDEOS:  'neko3dlabs/product-videos',
  SCREENSHOTS:     'neko3dlabs/screenshots',
  SHIPPING_PROOFS: 'neko3dlabs/shipping-proofs',
} as const
