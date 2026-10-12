/**
 * Slippage Sentinel - Shared Types
 * Bounty #3: Slippage Sentinel
 */

// Supported chains
export type ChainId = "ethereum" | "arbitrum" | "optimism" | "base" | "polygon";

// Chain configuration
export interface ChainConfig {
  name: ChainId;
  rpcUrl: string;
  blockTimeMs: number;
  nativeToken: string;
  uniswapV2Factory?: string;
  uniswapV3Factory?: string;
  sushiswapV2Factory?: string;
  curveFactory?: string;
}

// DEX configuration
export interface DexConfig {
  name: "uniswap-v2" | "uniswap-v3" | "sushiswap-v2" | "curve";
  factory: string;
  router: string;
  feeBps?: number; // For V3 pools
  chain: ChainId;
}

// Slippage request
export interface SlippageRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string; // Wei as string
  chain: ChainId;
  dexHint?: "uniswap-v2" | "uniswap-v3" | "sushiswap-v2" | "curve";
  maxPools?: number; // Max pools to check per DEX
}

// Pool depth info
export interface PoolDepth {
  dex: string;
  poolAddress: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  feeBps: number;
  priceImpactBps: number; // Price impact for the given amount
  liquidityUsd?: number;
}

// Recent trade stats
export interface TradeStats {
  tradeCount: number;
  avgTradeSizeUsd: number;
  p95TradeSizeUsd: number;
  maxTradeSizeUsd: number;
  windowHours: number;
}

// Slippage response
export interface SlippageResponse {
  minSafeSlipBps: number; // Minimum safe slippage in basis points
  poolDepths: PoolDepth[];
  tradeStats: TradeStats;
  recommendedRoute: {
    dex: string;
    poolAddress: string;
    expectedOut: string;
    priceImpactBps: number;
  };
  warnings: string[];
  timestamp: number;
}

// Health endpoint response
export interface HealthResponse {
  status: "ok" | "degraded";
  chains: Record<ChainId, { configured: boolean; lastBlock?: number }>;
  dexes: Record<string, boolean>;
  timestamp: number;
}

// x402 manifest
export interface X402Manifest {
  x402Version: number;
  resource: string;
  description: string;
  accepts: Array<{
    scheme: "exact";
    network: string;
    asset: string;
    payTo: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
  }>;
  free: string[];
}