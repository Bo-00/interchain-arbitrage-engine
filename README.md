# Interchain Arbitrage Engine

A sophisticated cross-chain arbitrage analysis engine that detects price differences between blockchains and identifies profitable trading opportunities.

## 🚀 Features

- **Cross-Chain Analysis**: Monitors price differences between BSC and Solana
- **Real-time Monitoring**: Continuous scanning for arbitrage opportunities
- **Configurable Trading**: Flexible token pairs and trading parameters
- **Risk Management**: Built-in profit thresholds and slippage protection
- **TypeScript**: Fully typed codebase for better development experience
- **Environment-based Configuration**: Secure credential management

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- OKX API credentials (for DEX aggregator access)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd interchain-arbitrage-engine
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```bash
   # OKX API Configuration
   OKX_API_KEY=your_okx_api_key_here
   OKX_SECRET_KEY=your_okx_secret_key_here
   OKX_PASS_PHRASE=your_okx_passphrase_here

   # Token Configuration
   TOKEN_1_SYMBOL=SOON
   TOKEN_2_SYMBOL=USDT

   # BSC Token Addresses
   BSC_TOKEN_1_ADDRESS=0xb9e1fd5a02d3a33b25a14d661414e6ed6954a721
   BSC_TOKEN_2_ADDRESS=0x55d398326f99059ff775485246999027b3197955

   # Solana Token Addresses
   SOLANA_TOKEN_1_ADDRESS=4eDf52YYzL6i6gbZ6FXqrLUPXbtP61f1gPSFM66M4XHe
   SOLANA_TOKEN_2_ADDRESS=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB

   # Token Decimals
   BSC_TOKEN_1_DECIMALS=18
   BSC_TOKEN_2_DECIMALS=18
   SOLANA_TOKEN_1_DECIMALS=9
   SOLANA_TOKEN_2_DECIMALS=6

   # Trading Configuration
   INITIAL_AMOUNT_USD=500
   PROFIT_THRESHOLD_USD=30
   MONITORING_INTERVAL_SECONDS=30
   SLIPPAGE_TOLERANCE=1.0
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🎯 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Watch Mode (for development)

```bash
npm run watch
```

## 📊 How It Works

The engine analyzes two arbitrage paths:

1. **BSC → Solana Path**:

   - Buy TOKEN_1 with TOKEN_2 on BSC
   - Sell TOKEN_1 for TOKEN_2 on Solana
   - Calculate profit/loss

2. **Solana → BSC Path**:
   - Buy TOKEN_1 with TOKEN_2 on Solana
   - Sell TOKEN_1 for TOKEN_2 on BSC
   - Calculate profit/loss

The engine continuously monitors both paths and alerts when profitable opportunities exceed the configured threshold.

## ⚙️ Configuration

### Environment Variables

| Variable                      | Description                             | Default  |
| ----------------------------- | --------------------------------------- | -------- |
| `OKX_API_KEY`                 | Your OKX API key                        | Required |
| `OKX_SECRET_KEY`              | Your OKX secret key                     | Required |
| `OKX_PASS_PHRASE`             | Your OKX passphrase                     | Required |
| `TOKEN_1_SYMBOL`              | Primary token symbol                    | Required |
| `TOKEN_2_SYMBOL`              | Quote token symbol (usually stablecoin) | Required |
| `BSC_TOKEN_1_ADDRESS`         | Token 1 contract address on BSC         | Required |
| `BSC_TOKEN_2_ADDRESS`         | Token 2 contract address on BSC         | Required |
| `SOLANA_TOKEN_1_ADDRESS`      | Token 1 contract address on Solana      | Required |
| `SOLANA_TOKEN_2_ADDRESS`      | Token 2 contract address on Solana      | Required |
| `BSC_TOKEN_1_DECIMALS`        | Token 1 decimals on BSC                 | 18       |
| `BSC_TOKEN_2_DECIMALS`        | Token 2 decimals on BSC                 | 18       |
| `SOLANA_TOKEN_1_DECIMALS`     | Token 1 decimals on Solana              | 9        |
| `SOLANA_TOKEN_2_DECIMALS`     | Token 2 decimals on Solana              | 6        |
| `INITIAL_AMOUNT_USD`          | Initial trading amount in USD           | 500      |
| `PROFIT_THRESHOLD_USD`        | Minimum profit to trigger alert         | 30       |
| `MONITORING_INTERVAL_SECONDS` | Monitoring frequency                    | 30       |
| `SLIPPAGE_TOLERANCE`          | Acceptable slippage percentage          | 1.0      |

### OKX API Setup

1. Create an OKX account and enable API access
2. Generate API credentials (Key, Secret, Passphrase)
3. Ensure your API key has permissions for DEX aggregator endpoints
4. Add your credentials to the `.env` file

## 📈 Output Example

```
🚀 Starting SOON Token Arbitrage Monitor...
🔄 Monitoring for arbitrage opportunities every 30 seconds
⏹️  Press Ctrl+C to stop monitoring

[12/3/2024, 10:30:45 AM] 🔍 Analyzing SOON token arbitrage opportunities...

📊 Path: Solana 500 USDT -> SOON -> BSC USDT
   Step 1: 500 USDT -> 125.750000 SOON (Solana)
   Step 2: 125.750000 SOON -> 515.25 USDT (BSC)
   💰 Net result: 515.25 USDT (+15.25 profit)

📊 Path: BSC 500 USDT -> SOON -> Solana USDT
   Step 1: 500 USDT -> 128.500000 SOON (BSC)
   Step 2: 128.500000 SOON -> 535.80 USDT (Solana)
   💰 Net result: 535.80 USDT (+35.80 profit)

🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 RESULTS 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
✅💰 Solana->BSC: +15.25 USD
✅💰 BSC->Solana: +35.80 USD

🚨🚨🚨 PROFITABLE ARBITRAGE DETECTED! 🚨🚨🚨
🎯 Best Strategy: BSC->Solana
💎 Expected Profit: $35.80 USD
📈 ROI: 7.16%
```

## 🔧 Development

### Project Structure

```
src/
├── types.ts              # TypeScript type definitions
├── config.ts             # Configuration management
├── okx-client.ts         # OKX API client
├── arbitrage-engine.ts   # Core arbitrage logic
└── index.ts              # Application entry point
```

### Adding New Token Pairs

1. Update your `.env` file with new token addresses and configurations
2. Restart the application - no code changes needed!

### Adding New Chains

To support additional blockchains:

1. Add chain configuration to `types.ts`
2. Update the arbitrage engine to handle new chain logic
3. Ensure OKX DEX aggregator supports the new chain

## ⚠️ Disclaimer

This tool is for educational and research purposes only. Cryptocurrency trading involves significant risk, and you may lose money. Always:

- Start with small amounts
- Understand the risks involved
- Consider gas fees and slippage in real trading
- Test thoroughly before using with significant funds
- Ensure compliance with local regulations

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.
