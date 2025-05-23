export interface TokenConfig {
  symbol: string;
  bscAddress: string;
  solanaAddress: string;
  bscDecimals: number;
  solanaDecimals: number;
}

export interface ArbitrageConfig {
  okxApiKey: string;
  okxSecretKey: string;
  okxPassPhrase: string;
  initialAmountUsd: number;
  profitThresholdUsd: number;
  monitoringIntervalSeconds: number;
  slippageTolerance: number;
}

export interface QuoteParams {
  chainId: string;
  amount: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  slippage: string;
  userWalletAddress: string;
}

export interface QuoteData {
  fromTokenSymbol: string;
  toTokenSymbol: string;
  toTokenAmount: string;
  toTokenPriceUsd: string;
  estimatedGas: string;
}

export interface QuoteResponse {
  code: string;
  msg: string;
  data: QuoteData[];
}

export interface FormattedQuote {
  chain: string;
  fromToken: string;
  toToken: string;
  expectedAmount: string;
  normalizedAmount: string;
  price: string;
  estimatedGasFee: string;
}

export interface ArbitrageStep {
  chain: string;
  from: string;
  to: string;
  amount: number;
}

export interface ArbitrageResult {
  path: string;
  initialAmount: number;
  finalAmount: number;
  profit: number;
  steps: ArbitrageStep[];
}

export interface ChainConfig {
  id: string;
  name: string;
}

export const BSC_CHAIN: ChainConfig = { id: "56", name: "BSC" };
export const SOLANA_CHAIN: ChainConfig = { id: "501", name: "Solana" };
