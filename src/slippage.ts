/**
 * Slippage Sentinel - Slippage Calculation Engine
 * Bounty #3: Slippage Sentinel
 */

import { ethers } from "ethers";
import { SlippageRequest, SlippageResponse, PoolDepth, TradeStats, DexConfig, ChainConfig } from "./types";
import { getDexesForChain, getChainConfig } from "./chains";

// ERC20 ABI for balanceOf, decimals, symbol
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Uniswap V2 Pair ABI
const V2_PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
];

// Uniswap V2 Router ABI
const V2_ROUTER_ABI = [
  "function getAmountsOut(uint256 amountIn, address[] calldata path) view returns (uint256[] memory amounts)",
];

// Uniswap V3 Pool ABI
const V3_POOL_ABI = [
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function liquidity() view returns (uint128)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function fee() view returns (uint24)",
];

// Uniswap V3 Quoter ABI
const V3_QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) view returns (uint256 amountOut)",
];

// SushiSwap V2 Router (same as Uniswap V2)
const SUSHI_ROUTER_ABI = V2_ROUTER_ABI;

interface PoolInfo {
  dex: string;
  poolAddress: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  feeBps: number;
}

async function getV2PoolInfo(provider: ethers.JsonRpcProvider, pairAddress: string): Promise<PoolInfo | null> {
  try {
    const pair = new ethers.Contract(pairAddress, V2_PAIR_ABI, provider);
    const [reserves, token0, token1] = await Promise.all([
      pair.getReserves(),
      pair.token0(),
      pair.token1(),
    ]);
    return {
      dex: "uniswap-v2",
      poolAddress: pairAddress,
      token0,
      token1,
      reserve0: reserves[0].toString(),
      reserve1: reserves[1].toString(),
      feeBps: 30,
    };
  } catch {
    return null;
  }
}

async function getV2PriceImpact(
  provider: ethers.JsonRpcProvider,
  routerAddress: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  feeBps: number
): Promise<{ amountOut: string; priceImpactBps: number } | null> {
  try {
    const router = new ethers.Contract(routerAddress, V2_ROUTER_ABI, provider);
    const path = [tokenIn, tokenOut];
    const amounts = await router.getAmountsOut(amountIn, path);
    const amountOut = amounts[1];
    
    // Calculate price impact (simplified - would need pool reserves for accurate calc)
    // For V2: price impact = (amountIn / reserveIn) * (1 - fee) approximately
    return {
      amountOut: amountOut.toString(),
      priceImpactBps: 0, // Placeholder - would need pool reserves
    };
  } catch {
    return null;
  }
}

async function getV3PoolInfo(provider: ethers.JsonRpcProvider, poolAddress: string): Promise<PoolInfo | null> {
  try {
    const pool = new ethers.Contract(poolAddress, V3_POOL_ABI, provider);
    const [slot0, liquidity, token0, token1, fee] = await Promise.all([
      pool.slot0(),
      pool.liquidity(),
      pool.token0(),
      pool.token1(),
      pool.fee(),
    ]);
    return {
      dex: "uniswap-v3",
      poolAddress,
      token0,
      token1,
      reserve0: liquidity.toString(),
      reserve1: "0",
      feeBps: Number(fee) / 100, // Convert from 0.01% to bps
    };
  } catch {
    return null;
  }
}

async function getV3PriceImpact(
  provider: ethers.JsonRpcProvider,
  quoterAddress: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  feeBps: number
): Promise<{ amountOut: string; priceImpactBps: number } | null> {
  try {
    const quoter = new ethers.Contract(quoterAddress, V3_QUOTER_ABI, provider);
    const fee = feeBps * 100; // Convert bps to fee tier (e.g., 30 bps = 3000)
    const amountOut = await quoter.quoteExactInputSingle(tokenIn, tokenOut, fee, amountIn, 0);
    return {
      amountOut: amountOut.toString(),
      priceImpactBps: 0, // Placeholder
    };
  } catch {
    return null;
  }
}

async function findV2Pool(
  provider: ethers.JsonRpcProvider,
  factoryAddress: string,
  tokenA: string,
  tokenB: string
): Promise<string | null> {
  // For V2, pool address = keccak256(token0 + token1) with CREATE2
  // Simplified: just try common pairs
  return null;
}

async function findV3Pool(
  provider: ethers.JsonRpcProvider,
  factoryAddress: string,
  tokenA: string,
  tokenB: string,
  fee: number
): Promise<string | null> {
  // For V3, pool address = CREATE2(factory, salt, initCodeHash)
  // Salt = keccak256(token0 + token1 + fee)
  // This is complex - simplified for now
  return null;
}

function calculatePriceImpact(reserveIn: string, reserveOut: string, amountIn: string, feeBps: number): number {
  const rIn = parseFloat(reserveIn);
  const rOut = parseFloat(reserveOut);
  const aIn = parseFloat(amountIn);
  
  if (rIn === 0 || rOut === 0) return 10000; // 100% impact
  
  const feeMultiplier = 1 - feeBps / 10000;
  const amountOut = (rOut * aIn * feeMultiplier) / (rIn + aIn * feeMultiplier);
  const spotPrice = rOut / rIn;
  const effectivePrice = amountOut / aIn;
  const impact = ((spotPrice - effectivePrice) / spotPrice) * 10000;
  
  return Math.max(0, Math.round(impact));
}

async function analyzePoolDepth(
  provider: ethers.JsonRpcProvider,
  dex: DexConfig,
  tokenIn: string,
  tokenOut: string,
  amountIn: string
): Promise<PoolDepth | null> {
  try {
    if (dex.name === "uniswap-v2" || dex.name === "sushiswap-v2") {
      // For V2, we need to find the pool address
      // This is simplified - in production, you'd query the factory
      return null;
    } else if (dex.name === "uniswap-v3") {
      // For V3, we'd need to find the pool for the specific fee tier
      return null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function calculateSlippage(request: SlippageRequest): Promise<SlippageResponse> {
  const chainConfig = getChainConfig(request.chain);
  const dexes = request.dexHint 
    ? getDexesForChain(request.chain).filter(d => d.name === request.dexHint)
    : getDexesForChain(request.chain);
  
  const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
  
  const poolDepths: PoolDepth[] = [];
  const warnings: string[] = [];
  
  // For each DEX, try to find pools and calculate price impact
  for (const dex of dexes) {
    try {
      // This is a simplified implementation
      // In production, you'd:
      // 1. Query factory for pool addresses
      // 2. Get reserves/liquidity
      // 3. Calculate exact price impact
      // 4. Get recent trade stats from subgraph or logs
      
      warnings.push(`${dex.name} on ${request.chain}: Pool lookup not fully implemented`);
    } catch (e) {
      warnings.push(`${dex.name} error: ${e}`);
    }
  }
  
  // If no pools found, return conservative defaults
  if (poolDepths.length === 0) {
    warnings.push("No pools found - returning conservative estimates");
    return {
      minSafeSlipBps: 500, // 5% conservative default
      poolDepths: [],
      tradeStats: {
        tradeCount: 0,
        avgTradeSizeUsd: 0,
        p95TradeSizeUsd: 0,
        maxTradeSizeUsd: 0,
        windowHours: 24,
      },
      recommendedRoute: {
        dex: "unknown",
        poolAddress: "0x0",
        expectedOut: "0",
        priceImpactBps: 500,
      },
      warnings,
      timestamp: Date.now(),
    };
  }
  
  // Find best route (lowest price impact)
  const bestPool = poolDepths.reduce((best, current) => 
    current.priceImpactBps < best.priceImpactBps ? current : best
  );
  
  const minSafeSlipBps = Math.max(
    bestPool.priceImpactBps * 2, // 2x price impact as safety margin
    100 // Minimum 1%
  );
  
  return {
    minSafeSlipBps,
    poolDepths,
    tradeStats: {
      tradeCount: 0,
      avgTradeSizeUsd: 0,
      p95TradeSizeUsd: 0,
      maxTradeSizeUsd: 0,
      windowHours: 24,
    },
    recommendedRoute: {
      dex: bestPool.dex,
      poolAddress: bestPool.poolAddress,
      expectedOut: "0",
      priceImpactBps: bestPool.priceImpactBps,
    },
    warnings,
    timestamp: Date.now(),
  };
}

export type { PoolDepth, TradeStats };