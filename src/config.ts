import dotenv from "dotenv";
import { TokenConfig, ArbitrageConfig } from "./types";

// Load environment variables
dotenv.config();

/**
 * Validate and get required environment variable
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is missing`);
  }
  return value;
}

/**
 * Get environment variable with default value
 */
function getEnvWithDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Get numeric environment variable with default value
 */
function getNumericEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseFloat(value) : defaultValue;
}

/**
 * Load token configurations from environment variables
 */
export function loadTokenConfigs(): {
  token1: TokenConfig;
  token2: TokenConfig;
} {
  const token1: TokenConfig = {
    symbol: getRequiredEnv("TOKEN_1_SYMBOL"),
    bscAddress: getRequiredEnv("BSC_TOKEN_1_ADDRESS"),
    solanaAddress: getRequiredEnv("SOLANA_TOKEN_1_ADDRESS"),
    bscDecimals: getNumericEnv("BSC_TOKEN_1_DECIMALS", 18),
    solanaDecimals: getNumericEnv("SOLANA_TOKEN_1_DECIMALS", 9),
  };

  const token2: TokenConfig = {
    symbol: getRequiredEnv("TOKEN_2_SYMBOL"),
    bscAddress: getRequiredEnv("BSC_TOKEN_2_ADDRESS"),
    solanaAddress: getRequiredEnv("SOLANA_TOKEN_2_ADDRESS"),
    bscDecimals: getNumericEnv("BSC_TOKEN_2_DECIMALS", 18),
    solanaDecimals: getNumericEnv("SOLANA_TOKEN_2_DECIMALS", 6),
  };

  return { token1, token2 };
}

/**
 * Load arbitrage engine configuration from environment variables
 */
export function loadArbitrageConfig(): ArbitrageConfig {
  return {
    okxApiKey: getRequiredEnv("OKX_API_KEY"),
    okxSecretKey: getRequiredEnv("OKX_SECRET_KEY"),
    okxPassPhrase: getRequiredEnv("OKX_PASS_PHRASE"),
    initialAmountUsd: getNumericEnv("INITIAL_AMOUNT_USD", 500),
    profitThresholdUsd: getNumericEnv("PROFIT_THRESHOLD_USD", 30),
    monitoringIntervalSeconds: getNumericEnv("MONITORING_INTERVAL_SECONDS", 30),
    slippageTolerance: getNumericEnv("SLIPPAGE_TOLERANCE", 1.0),
  };
}

/**
 * Calculate quote amount based on token decimals
 */
export function calculateQuoteAmount(
  amountUsd: number,
  decimals: number,
): string {
  // Convert USD amount to smallest token units
  return (amountUsd * Math.pow(10, decimals)).toString();
}
