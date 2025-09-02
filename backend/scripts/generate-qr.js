#!/usr/bin/env node

/**
 * QR Code Generator for AXS Access Points
 * 
 * This script generates QR codes for testing the new AXS access point system.
 * Usage: node generate-qr.js
 */

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const accessPoints = [
  {
    publicId: 'agencia-lomas-vehicular-1',
    name: 'Agencia Lomas - Entrada Vehicular',
    description: 'Entrada principal para vehículos en servicio'
  },
  {
    publicId: 'agencia-lomas-peatonal-1',
    name: 'Agencia Lomas - Entrada Peatonal',
    description: 'Entrada peatonal para clientes'
  },
  {
    publicId: 'hotel-presidente-parking-1',
    name: 'Hotel Presidente - Estacionamiento',
    description: 'Estacionamiento del hotel'
  }
];

async function generateQRCodes() {
  console.log('🎯 Generating AXS Access Point QR Codes...\n');

  // Create output directory
  const outputDir = path.join(__dirname, 'qr-codes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (const ap of accessPoints) {
    const qrContent = `axs://ap/${ap.publicId}`;
    const filename = `${ap.publicId}.png`;
    const filepath = path.join(outputDir, filename);

    try {
      await QRCode.toFile(filepath, qrContent, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log(`✅ Generated: ${filename}`);
      console.log(`   📍 Access Point: ${ap.name}`);
      console.log(`   🔗 QR Content: ${qrContent}`);
      console.log(`   📄 Description: ${ap.description}`);
      console.log(`   📂 File: ${filepath}\n`);

    } catch (error) {
      console.error(`❌ Error generating QR for ${ap.publicId}:`, error);
    }
  }

  // Generate HTML viewer
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>AXS Access Point QR Codes</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .qr-container { display: inline-block; margin: 20px; text-align: center; }
        .qr-image { border: 2px solid #007AFF; border-radius: 8px; }
        .qr-title { font-weight: bold; margin: 10px 0 5px 0; }
        .qr-id { font-family: monospace; color: #666; font-size: 14px; }
        .qr-desc { color: #888; font-size: 12px; margin-top: 5px; }
        h1 { color: #333; border-bottom: 2px solid #007AFF; padding-bottom: 10px; }
        .instructions { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🎯 AXS Access Point QR Codes</h1>
    
    <div class="instructions">
        <h3>📱 How to test:</h3>
        <ol>
            <li>Start the AXS mobile app</li>
            <li>Navigate to QR Scanner</li>
            <li>Scan any of the QR codes below</li>
            <li>Follow the access point flow</li>
        </ol>
        <p><strong>Demo user:</strong> +525512345678 (any OTP code works)</p>
    </div>

    ${accessPoints.map(ap => `
    <div class="qr-container">
        <div class="qr-title">${ap.name}</div>
        <div class="qr-id">axs://ap/${ap.publicId}</div>
        <img src="${ap.publicId}.png" alt="${ap.name}" class="qr-image" />
        <div class="qr-desc">${ap.description}</div>
    </div>
    `).join('')}

    <div style="margin-top: 40px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
        <h3>🔧 Technical Notes:</h3>
        <ul>
            <li>QR format: <code>axs://ap/&lt;accessPointPublicId&gt;</code></li>
            <li>Each QR represents a physical access point (static QR)</li>
            <li>Users scan QR → Follow configurable flow → Check-in with timestamp + photo</li>
            <li>Flows are defined in the database and can include forms, payments, rules</li>
        </ul>
    </div>
</body>
</html>`;

  const htmlPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`📄 Generated HTML viewer: ${htmlPath}`);
  
  console.log('\n🎉 QR Code generation completed!');
  console.log(`📂 Files saved to: ${outputDir}`);
  console.log(`🌐 Open ${htmlPath} in your browser to view all QR codes`);
}

generateQRCodes().catch(console.error);