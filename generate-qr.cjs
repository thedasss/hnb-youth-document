#!/usr/bin/env node
const QRCode = require('qrcode');
const fs = require('fs');
const os = require('os');

// Detect local network IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const targetUrl = process.argv[2] || `http://${getLocalIP()}:3000`;
const filename = process.argv[3] || 'qr-code';

console.log(`Generating QR code for: ${targetUrl}`);

QRCode.toFile(`${filename}.png`, targetUrl, {
  width: 1024,
  margin: 2,
  color: { dark: '#002B66', light: '#FFFFFF' }
}, (err) => {
  if (err) throw err;
  console.log(`✓ Saved ${filename}.png (1024x1024)`);
});

QRCode.toString(targetUrl, {
  type: 'svg',
  margin: 2,
  color: { dark: '#002B66', light: '#FFFFFF' }
}, (err, svg) => {
  if (err) throw err;
  fs.writeFileSync(`${filename}.svg`, svg);
  console.log(`✓ Saved ${filename}.svg (Vector)`);
});
