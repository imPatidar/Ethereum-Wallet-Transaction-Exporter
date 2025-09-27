#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exportAddressCsv } from '../src/services/exportService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple: just take address from command line
const address = process.argv[2];

if (!address) {
  console.log('Usage: npx eth-export <ethereum-address>');
  console.log('Example: npx eth-export 0xa39b189482f984388a34460636fea9eb181ad1a6');
  process.exit(1);
}

async function main() {
  try {
    const outputDir = path.join(__dirname, '..', 'exports');
    const result = await exportAddressCsv({ address, outputDir });
    console.log(`✅ Exported ${result.count} transactions to: ${result.filePath}`);
  } catch (e) {
    console.error('❌ Export failed:', e?.message || e);
    process.exit(1);
  }
}

main();


