// scripts/update-sql-images.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// Path files
const sqlFilePath = path.join(projectRoot, 'supabase/seed.sql') // adjust if named differently
const seedJsonPath = path.join(projectRoot, 'src/data/seed-urls.json')
const outputSqlPath = path.join(projectRoot, 'supabase/seed.sql')

if (!fs.existsSync(seedJsonPath)) {
  console.error('❌ seed-urls.json not found! Run upload-seed-images.js first.')
  process.exit(1)
}

const urlMap = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8'))
let sqlContent = fs.readFileSync(sqlFilePath, 'utf-8')

// Replace local asset paths with uploaded Cloudinary URLs
const replacements = {
  '/assets/p-apparel.jpg': urlMap['p-apparel'],
  '/assets/p-figure.jpg': urlMap['p-figure'],
  '/assets/p-print.jpg': urlMap['p-print'],
  '/assets/p-accessory.jpg': urlMap['p-accessory'],
  '/assets/hero-figure.jpg': urlMap['hero-figure'],
}

for (const [localPath, cdnUrl] of Object.entries(replacements)) {
  if (cdnUrl) {
    sqlContent = sqlContent.replaceAll(localPath, cdnUrl)
  } else {
    console.warn(`⚠️ Warning: No Cloudinary URL found for ${localPath}`)
  }
}

fs.writeFileSync(outputSqlPath, sqlContent)
console.log(`\n🎉 Updated SQL file saved to: ${outputSqlPath}`)