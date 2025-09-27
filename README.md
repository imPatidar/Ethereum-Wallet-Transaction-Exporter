## Ethereum Wallet Address Fetcher

Basic Node + Express service and CLI to fetch an Ethereum address's transactions from Etherscan (normal, internal, ERC-20, ERC-721, ERC-1155), normalize them, and export to CSV.

### Quick Start

1) Prerequisites
- Node 18+
- Etherscan API key (`https://etherscan.io/apis`)

2) Install

```bash
npm install
```

3) Configure environment

Create a `.env` file in project root (not committed):

```bash
echo "ETHERSCAN_API_KEY=YOUR_KEY" >> .env
echo "BASE_URL=https://api.etherscan.io/api" >> .env
```

4) Run the server

```bash
npm run start
# Health check
curl http://localhost:3000/health

# Export CSV via HTTP (downloads file)
open "http://localhost:3000/export?address=0xa39b189482f984388a34460636fea9eb181ad1a6"
```

5) Use the CLI

```bash
# Export to CSV
npx eth-export 0xa39b189482f984388a34460636fea9eb181ad1a6

# Custom output dir
npx eth-export 0xd620AADaBaA20d2af700853C4504028cba7C3333 -o ./my-exports
```

### What it does

- Calls Etherscan account endpoints to fetch:
  - Normal (external) txs
  - Internal transactions
  - ERC-20 token transfers
  - ERC-721 NFT transfers
  - ERC-1155 transfers
- Normalizes into a single CSV with columns:
  - `transactionHash, dateTime, from, to, transactionType, assetContract, assetSymbol, tokenId, value, gasFeeEth`

### Notes and Assumptions

- This is intentionally minimal and coded in a day: Node + Express, no DB.
- Etherscan is the only provider used;
- Large addresses (e.g., 100k+ txs) are fetched in pages (offset=10000). The script will iterate until no more results or max pages reached. It is because of Etherscan rate limits.
- **Rate limiting**: The app includes 1-second delays between API calls to respect the FREE tier's 2 calls/second limit. This makes the export process take ~5-6 seconds but ensures it works reliably. These delays can be removed if you upgrade to a higher API tier with higher rate limits.

### Interesting Architecture Decisions

- Thin client per provider: `src/clients/etherscanClient.js` exposes simple methods and centralized pagination/rate delay. Makes it easy to swap providers.
- Unified normalization layer: `src/utils/normalize.js` converts provider-specific shapes into one row schema for CSV, so the exporter and API don't care about backend shape.
- Dual entrypoints: REST endpoint `/export` and CLI `eth-export` share the same service (`src/services/exportService.js`).

### Endpoints

- `GET /health` → `{ ok: true }`
- `GET /export?address=<ethAddress>` → returns a CSV file download

### Sample Addresses (for testing)

- `0xa39b189482f984388a34460636fea9eb181ad1a6` — small account [`Etherscan link`](https://etherscan.io/address/0xa39b189482f984388a34460636fea9eb181ad1a6)
- `0xd620AADaBaA20d2af700853C4504028cba7C3333` — sample address [`Etherscan link`](https://etherscan.io/address/0xd620AADaBaA20d2af700853C4504028cba7C3333)
- `0xfb50526f49894b78541b776f5aaefe43e3bd8590` — heavy activity (assumed) [`Etherscan link`](https://etherscan.io/address/0xfb50526f49894b78541b776f5aaefe43e3bd8590)

### CSV Columns

- transactionHash
- dateTime (ISO string)
- from
- to
- transactionType (ETH, INTERNAL, ERC-20, ERC-721, ERC-1155)
- assetContract (if applicable)
- assetSymbol / name
- tokenId (NFTs)
- value (human-readable decimals)
- gasFeeEth (for normal txs)

### References

- Etherscan address page used as data reference: [`https://etherscan.io/address/0xa39b189482f984388a34460636fea9eb181ad1a6`](https://etherscan.io/address/0xa39b189482f984388a34460636fea9eb181ad1a6)

