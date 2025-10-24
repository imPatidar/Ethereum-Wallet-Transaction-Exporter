import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.ETHERSCAN_API_KEY || '';
const BASE_URL = process.env.BASE_URL || 'https://api.etherscan.io/v2/api';
const CHAIN_ID = process.env.CHAIN_ID || '1'; // Default to Ethereum mainnet

async function getData(action, address) {
  console.log(`Calling API: ${action} for ${address}`);
  
  const { data } = await axios.get(BASE_URL, {
    params: { chainid: CHAIN_ID, module: 'account', action, address, apikey: API_KEY }
  });
  
  console.log(`API response status: ${data?.status}, message: ${data?.message}`);
  
  // "No transactions found" is normal, not an error
  if (data?.status === '0' && data?.message === 'No transactions found') {
    console.log(`No transactions found for ${action}`);
    return [];
  }
  
  // Real API errors
  if (data?.status === '0') {
    console.log(`API error: ${data?.result}`);
    throw new Error(data?.result || 'API error');
  }
  
  return data.result || [];
}

// Helper function to wait
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getTransactions(address) {
  console.log('Fetching transactions...');
  
  // Sequential calls with 1 second delay between each (respects 2/sec limit)
  const normal = await getData('txlist', address);
  console.log('Got normal transactions');
  await wait(1000); // Wait 1 second
  
  const internal = await getData('txlistinternal', address);
  console.log('Got internal transactions');
  await wait(1000); // Wait 1 second
  
  const erc20 = await getData('tokentx', address);
  console.log('Got ERC-20 transactions');
  await wait(1000); // Wait 1 second
  
  const erc721 = await getData('tokennfttx', address);
  console.log('Got ERC-721 transactions');
  await wait(1000); // Wait 1 second
  
  const erc1155 = await getData('token1155tx', address);
  console.log('Got ERC-1155 transactions');
  
  return { normal, internal, erc20, erc721, erc1155 };
}

