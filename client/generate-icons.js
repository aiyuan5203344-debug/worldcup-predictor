// Simple script to generate placeholder icons
// Run this script to create icon-192.png and icon-512.png

import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0a0e17'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.15)
  ctx.fill()

  // Circle
  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = size * 0.04
  ctx.beginPath()
  ctx.arc(size/2, size/2, size * 0.3, 0, Math.PI * 2)
  ctx.stroke()

  // Checkmark
  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = size * 0.05
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(size * 0.3, size * 0.5)
  ctx.lineTo(size * 0.45, size * 0.65)
  ctx.lineTo(size * 0.7, size * 0.35)
  ctx.stroke()

  // Text
  ctx.fillStyle = '#d4af37'
  ctx.font = `bold ${size * 0.08}px Arial`
  ctx.textAlign = 'center'
  ctx.fillText('WC 2026', size/2, size * 0.9)

  // Save
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outputPath, buffer)
  console.log(`Generated: ${outputPath}`)
}

// Generate icons
const iconsDir = path.join(process.cwd(), 'public', 'icons')

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

generateIcon(192, path.join(iconsDir, 'icon-192.png'))
generateIcon(512, path.join(iconsDir, 'icon-512.png'))

console.log('Icons generated successfully!')
