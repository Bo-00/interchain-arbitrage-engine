import { OKXClient } from "./okx-client";
import {
  TokenConfig,
  ArbitrageConfig,
  ArbitrageResult,
  FormattedQuote,
  BSC_CHAIN,
  SOLANA_CHAIN,
} from "./types";
import { calculateQuoteAmount } from "./config";

export class ArbitrageEngine {
  private okxClient: OKXClient;
  private config: ArbitrageConfig;
  private token1: TokenConfig;
  private token2: TokenConfig;

  constructor(
    config: ArbitrageConfig,
    token1: TokenConfig,
    token2: TokenConfig,
  ) {
    this.config = config;
    this.token1 = token1;
    this.token2 = token2;
    this.okxClient = new OKXClient(config);
  }

  /**
   * Normalize token amount based on decimal precision
   */
  private normalizeTokenAmount(rawAmount: string, decimals: number): number {
    return parseFloat(rawAmount) / Math.pow(10, decimals);
  }

  /**
   * Format quote data for display
   */
  private formatQuoteData(
    data: any,
    chainName: string,
    tokenDecimals?: number,
  ): FormattedQuote | null {
    if (!data || !data.data || data.data.length === 0) {
      return null;
    }

    const quote = data.data[0];
    const rawAmount = quote.toTokenAmount;
    const normalizedAmount = tokenDecimals
      ? this.normalizeTokenAmount(rawAmount, tokenDecimals)
      : rawAmount;

    return {
      chain: chainName,
      fromToken: quote.fromTokenSymbol,
      toToken: quote.toTokenSymbol,
      expectedAmount: rawAmount,
      normalizedAmount: tokenDecimals ? normalizedAmount.toFixed(6) : rawAmount,
      price: quote.toTokenPriceUsd,
      estimatedGasFee: quote.estimatedGas,
    };
  }

  /**
   * Calculate arbitrage path profit
   */
  async calculateArbitragePath(
    startChain: "BSC" | "Solana",
  ): Promise<ArbitrageResult | null> {
    try {
      const initialAmount = this.config.initialAmountUsd;

      if (startChain === "BSC") {
        return await this.calculateBSCToSolanaPath(initialAmount);
      } else {
        return await this.calculateSolanaeToBSCPath(initialAmount);
      }
    } catch (error: any) {
      console.error(
        `Error calculating ${startChain} arbitrage path:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Calculate BSC -> Solana arbitrage path
   */
  private async calculateBSCToSolanaPath(
    initialAmount: number,
  ): Promise<ArbitrageResult | null> {
    console.log(
      `\n📊 Path: BSC ${initialAmount} ${this.token2.symbol} -> ${this.token1.symbol} -> Solana ${this.token2.symbol}`,
    );

    // Step 1: BSC token2 -> token1
    const bscQuoteAmount = calculateQuoteAmount(
      initialAmount,
      this.token2.bscDecimals,
    );
    const step1Quote = await this.okxClient.getQuote(
      BSC_CHAIN.id,
      this.token2.bscAddress,
      this.token1.bscAddress,
      bscQuoteAmount,
    );

    if (!step1Quote || !step1Quote.data || step1Quote.data.length === 0) {
      console.log(
        `❌ Failed to get BSC ${this.token2.symbol}->${this.token1.symbol} quote`,
      );
      return null;
    }

    const token1FromBSC = step1Quote.data[0].toTokenAmount;
    const normalizedToken1Amount = this.normalizeTokenAmount(
      token1FromBSC,
      this.token1.bscDecimals,
    );
    console.log(
      `   Step 1: ${initialAmount} ${
        this.token2.symbol
      } -> ${normalizedToken1Amount.toFixed(6)} ${this.token1.symbol} (BSC)`,
    );

    // Convert token1 amount to Solana decimals for the next query
    const token1AmountForSolana = Math.floor(
      normalizedToken1Amount * Math.pow(10, this.token1.solanaDecimals),
    ).toString();

    await this.okxClient.delay(1000);

    // Step 2: Solana token1 -> token2
    const step2Quote = await this.okxClient.getQuote(
      SOLANA_CHAIN.id,
      this.token1.solanaAddress,
      this.token2.solanaAddress,
      token1AmountForSolana,
    );

    if (!step2Quote || !step2Quote.data || step2Quote.data.length === 0) {
      console.log(
        `❌ Failed to get Solana ${this.token1.symbol}->${this.token2.symbol} quote`,
      );
      return null;
    }

    const finalToken2 = this.normalizeTokenAmount(
      step2Quote.data[0].toTokenAmount,
      this.token2.solanaDecimals,
    );
    console.log(
      `   Step 2: ${normalizedToken1Amount.toFixed(6)} ${
        this.token1.symbol
      } -> ${finalToken2.toFixed(6)} ${this.token2.symbol} (Solana)`,
    );

    const profit = finalToken2 - initialAmount;
    console.log(
      `   💰 Net result: ${finalToken2.toFixed(6)} ${this.token2.symbol} (${
        profit > 0 ? "+" : ""
      }${profit.toFixed(6)} profit)`,
    );

    return {
      path: "BSC->Solana",
      initialAmount,
      finalAmount: finalToken2,
      profit,
      steps: [
        {
          chain: "BSC",
          from: this.token2.symbol,
          to: this.token1.symbol,
          amount: normalizedToken1Amount,
        },
        {
          chain: "Solana",
          from: this.token1.symbol,
          to: this.token2.symbol,
          amount: finalToken2,
        },
      ],
    };
  }

  /**
   * Calculate Solana -> BSC arbitrage path
   */
  private async calculateSolanaeToBSCPath(
    initialAmount: number,
  ): Promise<ArbitrageResult | null> {
    console.log(
      `\n📊 Path: Solana ${initialAmount} ${this.token2.symbol} -> ${this.token1.symbol} -> BSC ${this.token2.symbol}`,
    );

    // Step 1: Solana token2 -> token1
    const solanaQuoteAmount = calculateQuoteAmount(
      initialAmount,
      this.token2.solanaDecimals,
    );
    const step1Quote = await this.okxClient.getQuote(
      SOLANA_CHAIN.id,
      this.token2.solanaAddress,
      this.token1.solanaAddress,
      solanaQuoteAmount,
    );

    if (!step1Quote || !step1Quote.data || step1Quote.data.length === 0) {
      console.log(
        `❌ Failed to get Solana ${this.token2.symbol}->${this.token1.symbol} quote`,
      );
      return null;
    }

    const token1FromSolana = step1Quote.data[0].toTokenAmount;
    const normalizedToken1Amount = this.normalizeTokenAmount(
      token1FromSolana,
      this.token1.solanaDecimals,
    );
    console.log(
      `   Step 1: ${initialAmount} ${
        this.token2.symbol
      } -> ${normalizedToken1Amount.toFixed(6)} ${this.token1.symbol} (Solana)`,
    );

    // Convert token1 amount to BSC decimals for the next query
    const token1AmountForBSC = Math.floor(
      normalizedToken1Amount * Math.pow(10, this.token1.bscDecimals),
    ).toString();

    await this.okxClient.delay(1000);

    // Step 2: BSC token1 -> token2
    const step2Quote = await this.okxClient.getQuote(
      BSC_CHAIN.id,
      this.token1.bscAddress,
      this.token2.bscAddress,
      token1AmountForBSC,
    );

    if (!step2Quote || !step2Quote.data || step2Quote.data.length === 0) {
      console.log(
        `❌ Failed to get BSC ${this.token1.symbol}->${this.token2.symbol} quote`,
      );
      return null;
    }

    const finalToken2 = this.normalizeTokenAmount(
      step2Quote.data[0].toTokenAmount,
      this.token2.bscDecimals,
    );
    console.log(
      `   Step 2: ${normalizedToken1Amount.toFixed(6)} ${
        this.token1.symbol
      } -> ${finalToken2.toFixed(6)} ${this.token2.symbol} (BSC)`,
    );

    const profit = finalToken2 - initialAmount;
    console.log(
      `   💰 Net result: ${finalToken2.toFixed(6)} ${this.token2.symbol} (${
        profit > 0 ? "+" : ""
      }${profit.toFixed(6)} profit)`,
    );

    return {
      path: "Solana->BSC",
      initialAmount,
      finalAmount: finalToken2,
      profit,
      steps: [
        {
          chain: "Solana",
          from: this.token2.symbol,
          to: this.token1.symbol,
          amount: normalizedToken1Amount,
        },
        {
          chain: "BSC",
          from: this.token1.symbol,
          to: this.token2.symbol,
          amount: finalToken2,
        },
      ],
    };
  }

  /**
   * Main function to compare prices and detect arbitrage
   */
  async analyzeArbitrageOpportunities(): Promise<void> {
    const timestamp = new Date().toLocaleString();
    console.log(
      `\n[${timestamp}] 🔍 Analyzing ${this.token1.symbol} token arbitrage opportunities...`,
    );

    try {
      // Calculate both arbitrage paths
      const path1Result = await this.calculateArbitragePath("Solana");
      await this.okxClient.delay(1000);
      const path2Result = await this.calculateArbitragePath("BSC");

      // Determine best arbitrage opportunity
      let bestPath: ArbitrageResult | null = null;
      let maxProfit = 0;

      if (path1Result && path1Result.profit > maxProfit) {
        maxProfit = path1Result.profit;
        bestPath = path1Result;
      }

      if (path2Result && path2Result.profit > maxProfit) {
        maxProfit = path2Result.profit;
        bestPath = path2Result;
      }

      // Show results with clear symbols
      console.log("\n" + "🔥".repeat(20) + " RESULTS " + "🔥".repeat(20));

      if (path1Result) {
        const symbol = path1Result.profit > 0 ? "✅💰" : "❌💸";
        console.log(
          `${symbol} Solana->BSC: ${
            path1Result.profit > 0 ? "+" : ""
          }${path1Result.profit.toFixed(2)} USD`,
        );
      } else {
        console.log("❌🚫 Solana->BSC: Failed to calculate");
      }

      if (path2Result) {
        const symbol = path2Result.profit > 0 ? "✅💰" : "❌💸";
        console.log(
          `${symbol} BSC->Solana: ${
            path2Result.profit > 0 ? "+" : ""
          }${path2Result.profit.toFixed(2)} USD`,
        );
      } else {
        console.log("❌🚫 BSC->Solana: Failed to calculate");
      }

      if (bestPath && maxProfit > this.config.profitThresholdUsd) {
        console.log("\n🚨🚨🚨 PROFITABLE ARBITRAGE DETECTED! 🚨🚨🚨");
        console.log(`🎯 Best Strategy: ${bestPath.path}`);
        console.log(`💎 Expected Profit: $${maxProfit.toFixed(2)} USD`);
        console.log(
          `📈 ROI: ${((maxProfit / bestPath.initialAmount) * 100).toFixed(2)}%`,
        );
      } else if (bestPath && maxProfit > 0) {
        console.log(
          `\n💡 Small opportunity: ${bestPath.path} → $${maxProfit.toFixed(
            2,
          )} (below $${this.config.profitThresholdUsd})`,
        );
      } else {
        console.log("\n😴 No profitable opportunities");
      }
    } catch (error: any) {
      console.error(
        `[${timestamp}] ❌ Error during arbitrage analysis:`,
        error.message,
      );
    }

    console.log("\n" + "=".repeat(60));
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(): void {
    console.log(`🚀 Starting ${this.token1.symbol} Token Arbitrage Monitor...`);
    console.log(
      `🔄 Monitoring for arbitrage opportunities every ${this.config.monitoringIntervalSeconds} seconds`,
    );
    console.log("⏹️  Press Ctrl+C to stop monitoring\n");

    // Run immediately
    this.analyzeArbitrageOpportunities();

    // Then run at configured interval
    const interval = setInterval(() => {
      this.analyzeArbitrageOpportunities();
    }, this.config.monitoringIntervalSeconds * 1000);

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n\n🛑 Stopping arbitrage monitor...");
      clearInterval(interval);
      process.exit(0);
    });
  }
}
