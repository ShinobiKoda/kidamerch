import { createServerFn } from '@tanstack/react-start'
import { getRequiredEnv } from '@/lib/get-required-env'

async function signParams(
  params: Record<string, string | number>,
  apiSecret: string,
): Promise<string> {
  const toSign =
    Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&') + apiSecret

  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(toSign))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const getUploadSignature = createServerFn({ method: 'POST' }).handler(async () => {
  const CLOUDINARY_CLOUD_NAME = getRequiredEnv('CLOUDINARY_CLOUD_NAME')
  const CLOUDINARY_API_KEY = getRequiredEnv('CLOUDINARY_API_KEY')
  const CLOUDINARY_API_SECRET = getRequiredEnv('CLOUDINARY_API_SECRET')

  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { timestamp, folder: 'kidamerch/products' }

  const signature = await signParams(paramsToSign, CLOUDINARY_API_SECRET)

  return {
    signature,
    timestamp,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
    folder: 'kidamerch/products',
  }
})