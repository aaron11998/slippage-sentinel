/**
 * Slippage Sentinel - Chain & DEX Configurations
 * Bounty #3: Slippage Sentinel
 */

import { ChainConfig, DexConfig, ChainId } from "./types";

export const CHAINS: Record<ChainId, ChainConfig> = {
  ethereum: {
    name: "ethereum",
    rpcUrl: "",
    blockTimeMs: 12000,
    nativeToken: "ETH",
    uniswapV2Factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    uniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    sushiswapV2Factory: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    curveFactory: "0xB9fC157394Af804a3578134A6585C0dc9cc990d4",
  },
  arbitrum: {
    name: "arbitrum",
    rpcUrl: "",
    blockTimeMs: 250,
    nativeToken: "ETH",
    uniswapV2Factory: "0x8e9f5E1b88d51E5C8e9E4e8d9E6e8E5E8E5E8E5E8",
    uniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    sushiswapV2Factory: "0x7579dDdBEF464e2F947e8e8D8D8D8D8D8D8D8D8D8",
  },
  optimism: {
    name: "optimism",
    rpcUrl: "",
    blockTimeMs: 2000,
    nativeToken: "ETH",
    uniswapV2Factory: "0x8e9f5E1b88d51E5C8e9E4e8d9E6e8E5E8E5E8E5E8",
    uniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  },
  base: {
    name: "base",
    rpcUrl: "",
    blockTimeMs: 2000,
    nativeToken: "ETH",
    uniswapV2Factory: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
    uniswapV3Factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
  },
  polygon: {
    name: "polygon",
    rpcUrl: "",
    blockTimeMs: 2000,
    nativeToken: "MATIC",
    uniswapV2Factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    uniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    sushiswapV2Factory: "0x7579dDdBEF464e2F947e8e8D8D8D8D8D8D8D8D8D8",
  },
};

export const DEXES: DexConfig[] = [
  // Ethereum
  { name: "uniswap-v2", factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", feeBps: 30, chain: "ethereum" },
  { name: "uniswap-v3", factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984", router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", chain: "ethereum" },
  { name: "sushiswap-v2", factory: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac", router: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", feeBps: 30, chain: "ethereum" },
  { name: "curve", factory: "0xB9fC157394Af804a3578134A6585C0dc9cc990d4", router: "0x1234", chain: "ethereum" },
  // Arbitrum
  { name: "uniswap-v2", factory: "0x8e9f5E1b88d51E5C8e9E4e8d9E6e8E5E8E5E8E5E8", router: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106", feeBps: 30, chain: "arbitrum" },
  { name: "uniswap-v3", factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984", router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", chain: "arbitrum" },
  // Optimism
  { name: "uniswap-v2", factory: "0x8e9f5E1b88d51E5C8e9E4e8d9E6e8E5E8E5E8E5E8", router: "0x8b0E3F474c828f9e6A1e4F6b5C2D1A9F8E7D6C5B4", feeBps: 30, chain: "optimism" },
  { name: "uniswap-v3", factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984", router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", chain: "optimism" },
  // Base
  { name: "uniswap-v2", factory: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6", router: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24", feeBps: 30, chain: "base" },
  { name: "uniswap-v3", factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD", router: "0x2626664c2603336E57B271c5C0b26F421741e481", chain: "base" },
  // Polygon
  { name: "uniswap-v2", factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32", router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", feeBps: 30, chain: "polygon" },
  { name: "uniswap-v3", factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984", router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", chain: "polygon" },
  { name: "sushiswap-v2", factory: "0x7579dDdBEF464e2F947e8e8D8D8D8D8D8D8D8D8D8", router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", feeBps: 30, chain: "polygon" },
];

export function getChainConfig(chain: ChainId): ChainConfig {
  const config = CHAINS[chain];
  if (!config) throw new Error(`Unknown chain: ${chain}`);
  return config;
}

export function getDexesForChain(chain: ChainId): DexConfig[] {
  return DEXES.filter((d) => d.chain === chain);
}

export function getDexConfig(dexName: string, chain: ChainId): DexConfig | undefined {
  return DEXES.find((d) => d.name === dexName && d.chain === chain);
}

export type { ChainConfig, DexConfig } from "./types";