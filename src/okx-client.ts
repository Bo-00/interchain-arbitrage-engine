import * as crypto from "crypto";
import axios, { AxiosResponse } from "axios";
import { QuoteParams, QuoteResponse, ArbitrageConfig } from "./types";

const BASE_URL = "https://web3.okx.com";

export class OKXClient {
  private config: ArbitrageConfig;

  constructor(config: ArbitrageConfig) {
    this.config = config;
  }

  /**
   * Generate authentication headers for OKX API
   */
  private getHeaders(
    timestamp: string,
    method: string,
    requestPath: string,
    body: string = "",
  ): Record<string, string> {
    const sign = crypto
      .createHmac("sha256", this.config.okxSecretKey)
      .update(timestamp + method + requestPath + body)
      .digest("base64");

    return {
      "OK-ACCESS-KEY": this.config.okxApiKey,
      "OK-ACCESS-SIGN": sign,
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": this.config.okxPassPhrase,
      "Content-Type": "application/json",
    };
  }

  /**
   * Get quote from OKX DEX API
   */
  async getQuote(
    chainId: string,
    fromToken: string,
    toToken: string,
    amount: string,
    walletAddress: string = "0x0000000000000000000000000000000000000000",
  ): Promise<QuoteResponse | null> {
    try {
      const timestamp = new Date().toISOString();
      const requestPath = "/api/v5/dex/aggregator/quote";

      const quoteParams: QuoteParams = {
        chainId,
        amount,
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        slippage: this.config.slippageTolerance.toString(),
        userWalletAddress: walletAddress,
      };

      // Convert QuoteParams to Record<string, string> for URLSearchParams
      const paramsRecord: Record<string, string> = {
        chainId: quoteParams.chainId,
        amount: quoteParams.amount,
        fromTokenAddress: quoteParams.fromTokenAddress,
        toTokenAddress: quoteParams.toTokenAddress,
        slippage: quoteParams.slippage,
        userWalletAddress: quoteParams.userWalletAddress,
      };

      const queryString = "?" + new URLSearchParams(paramsRecord).toString();
      const headers = this.getHeaders(
        timestamp,
        "GET",
        requestPath + queryString,
      );

      const response: AxiosResponse<QuoteResponse> = await axios.get(
        `${BASE_URL}${requestPath}${queryString}`,
        { headers },
      );

      return response.data;
    } catch (error: any) {
      console.error(`Error getting quote: ${error.message}`);
      if (error.response) {
        console.error(JSON.stringify(error.response.data, null, 2));
      }
      return null;
    }
  }

  /**
   * Add delay between API calls to respect rate limits
   */
  async delay(ms: number = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
