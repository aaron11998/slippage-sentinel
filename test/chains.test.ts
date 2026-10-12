import { describe, it, expect } from "vitest";
import { CHAINS, getChainConfig, getDexesForChain, getDexConfig } from "../src/chains";
import { ChainId } from "../src/types";

describe("Chains Configuration", () => {
  it("should have all 5 chains configured", () => {
    expect(Object.keys(CHAINS).length).toBe(5);
    expect(CHAINS.ethereum).toBeDefined();
    expect(CHAINS.arbitrum).toBeDefined();
    expect(CHAINS.optimism).toBeDefined();
    expect(CHAINS.base).toBeDefined();
    expect(CHAINS.polygon).toBeDefined();
  });

  it("should have required properties for each chain", () => {
    const chains: ChainId[] = ["ethereum", "arbitrum", "optimism", "base", "polygon"];
    for (const chain of chains) {
      const config = CHAINS[chain];
      expect(config.name).toBe(chain);
      expect(config.blockTimeMs).toBeGreaterThan(0);
      expect(config.nativeToken).toBeDefined();
    }
  });

  it("should have Uniswap V2 and V3 factories for Ethereum", () => {
    const eth = CHAINS.ethereum;
    expect(eth.uniswapV2Factory).toBeDefined();
    expect(eth.uniswapV3Factory).toBeDefined();
  });
});

describe("Chain Helpers", () => {
  it("getChainConfig should return correct config", () => {
    const eth = getChainConfig("ethereum");
    expect(eth.name).toBe("ethereum");
    expect(eth.blockTimeMs).toBe(12000);
  });

  it("getChainConfig should throw for unknown chain", () => {
    expect(() => getChainConfig("unknown" as ChainId)).toThrow();
  });

  it("getDexesForChain should return correct DEXes", () => {
    const ethDexes = getDexesForChain("ethereum");
    expect(ethDexes.length).toBeGreaterThan(0);
    for (const dex of ethDexes) {
      expect(dex.chain).toBe("ethereum");
    }
  });

  it("getDexConfig should find specific DEX", () => {
    const dex = getDexConfig("uniswap-v2", "ethereum");
    expect(dex).toBeDefined();
    expect(dex?.name).toBe("uniswap-v2");
    expect(dex?.chain).toBe("ethereum");
  });

  it("getDexConfig should return undefined for non-existent DEX", () => {
    const dex = getDexConfig("nonexistent", "ethereum");
    expect(dex).toBeUndefined();
  });
});