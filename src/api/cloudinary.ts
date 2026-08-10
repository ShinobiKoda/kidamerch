import { createServerFn } from '@tanstack/react-start'

export const getUploadSignature = createServerFn({ method: 'POST' }).handler(async () => {
  const { v2: cloudinary } = await import('cloudinary')
  const { getRequiredEnv } = await import('@/lib/get-required-env')

  const CLOUDINARY_CLOUD_NAME = getRequiredEnv('CLOUDINARY_CLOUD_NAME')
  const CLOUDINARY_API_KEY = getRequiredEnv('CLOUDINARY_API_KEY')
  const CLOUDINARY_API_SECRET = getRequiredEnv('CLOUDINARY_API_SECRET')

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  })

  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { timestamp, folder: 'kidamerch/products' }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET)

  return {
    signature,
    timestamp,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
    folder: 'kidamerch/products',
  }
})