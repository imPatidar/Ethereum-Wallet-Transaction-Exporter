import fs from 'fs';
import path from 'path';
import { getTransactions } from '../clients/etherscanClient.js';
import { normalizeTransactions } from '../utils/normalize.js';

export async function exportAddressCsv({ address, outputDir }) {
  // Get all transactions
  const data = await getTransactions(address);
  
  // Convert to CSV rows
  const rows = normalizeTransactions(data);
  
  // Create output file
  await fs.promises.mkdir(outputDir, { recursive: true });
  const fileName = `transactions_${address}_${Date.now()}.csv`;
  const filePath = path.join(outputDir, fileName);
  
  // Write CSV
  const headers = 'transactionHash,dateTime,from,to,transactionType,assetContract,assetSymbol,tokenId,value,gasFeeEth\n';
  const csvContent = headers + rows.map(row => 
    Object.values(row).map(val => `"${val}"`).join(',')
  ).join('\n');
  
  await fs.promises.writeFile(filePath, csvContent);
  
  return { filePath, fileName, count: rows.length };
}


