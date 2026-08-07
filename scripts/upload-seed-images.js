// scripts/upload-seed-images.js
import { v2 as cloudinary } from 'cloudinary'
import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// 1. Verify Env
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary env variables in .env')
  process.exit(1)
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const files = [
  { local: path.join(projectRoot, 'src/assets/p-apparel.jpg'), name: 'p-apparel' },
  { local: path.join(projectRoot, 'src/assets/p-figure.jpg'), name: 'p-figure' },
  { local: path.join(projectRoot, 'src/assets/p-print.jpg'), name: 'p-print' },
  { local: path.join(projectRoot, 'src/assets/p-accessory.jpg'), name: 'p-accessory' },
  { local: path.join(projectRoot, 'src/assets/hero-figure.jpg'), name: 'hero-figure' },
]

async function seed() {
  for (const file of files) {
    // 2. Check if local file exists before attempting upload
    if (!fs.existsSync(file.local)) {
      console.error(`❌ Local file not found: ${file.local}`)
      continue
    }

    try {
      console.log(`Uploading ${file.name}...`)
      const result = await cloudinary.uploader.upload(file.local, {
        folder: 'kidamerch/seed',
        public_id: file.name,
        overwrite: true,
        timeout: 60000,
      })
      console.log(`✅ ${file.name} -> ${result.secure_url}`)
    } catch (error) {
      console.error(`❌ Error uploading ${file.name}:`, error)
    }
  }
}

seed()