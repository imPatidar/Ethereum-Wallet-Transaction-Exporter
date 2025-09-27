import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { exportAddressCsv } from './services/exportService.js';

dotenv.config();

const app = express();

app.get('/export', async (req, res) => {
  const address = req.query.address;
  if (!address) {
    return res.status(400).json({ error: 'address required' });
  }

  try {
    console.log(`Exporting for address: ${address}`);
    const outputDir = path.join(process.cwd(), 'exports');
    const result = await exportAddressCsv({ address, outputDir });
    console.log(`Export complete: ${result.count} transactions`);
    res.json({ success: true, file: result.fileName, count: result.count });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server: http://localhost:${port}/export?address=0x...`);
});


