import { ArbitrageEngine } from "./arbitrage-engine";
import { loadArbitrageConfig, loadTokenConfigs } from "./config";

async function main(): Promise<void> {
  try {
    console.log("🚀 Initializing Interchain Arbitrage Engine...\n");

    // Load configuration from environment variables
    console.log("📋 Loading configuration...");
    const arbitrageConfig = loadArbitrageConfig();
    const { token1, token2 } = loadTokenConfigs();

    console.log(`✅ Configuration loaded successfully!`);
    console.log(`   📈 Token Pair: ${token1.symbol} / ${token2.symbol}`);
    console.log(
      `   💰 Initial Amount: $${arbitrageConfig.initialAmountUsd} USD`,
    );
    console.log(
      `   🎯 Profit Threshold: $${arbitrageConfig.profitThresholdUsd} USD`,
    );
    console.log(
      `   ⏱️  Monitoring Interval: ${arbitrageConfig.monitoringIntervalSeconds} seconds`,
    );
    console.log(
      `   📊 Slippage Tolerance: ${arbitrageConfig.slippageTolerance}%\n`,
    );

    // Initialize and start the arbitrage engine
    const engine = new ArbitrageEngine(arbitrageConfig, token1, token2);
    engine.startMonitoring();
  } catch (error: any) {
    console.error("❌ Failed to initialize arbitrage engine:", error.message);

    if (error.message.includes("Required environment variable")) {
      console.log("\n💡 Please make sure to:");
      console.log("   1. Copy env.example to .env");
      console.log(
        "   2. Fill in your OKX API credentials and token configurations",
      );
      console.log("   3. Adjust trading parameters as needed");
    }

    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start the application
main();
