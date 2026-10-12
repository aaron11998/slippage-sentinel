/**
 * Slippage Sentinel - Health Endpoint
 * Bounty #3: Slippage Sentinel
 */

import { HealthResponse, ChainId } from "./types";
import { CHAINS, DEXES } from "./chains";

export async function handleHealth(env: { [key: string]: string }): Promise<HealthResponse> {
  const chains: Record<ChainId, { configured: boolean; lastBlock?: number }> = {
    ethereum: { configured: !!env.ETHEREUM_RPC_URL },
    arbitrum: { configured: !!env.ARBITRUM_RPC_URL },
    optimism: { configured: !!env.OPTIMISM_RPC_URL },
    base: { configured: !!env.BASE_RPC_URL },
    polygon: { configured: !!env.POLYGON_RPC_URL },
  };

  const dexes: Record<string, boolean> = {};
  for (const dex of DEXES) {
    dexes[`${dex.name}-${dex.chain}`] = chains[dex.chain].configured;
  }

  const allConfigured = Object.values(chains).every(c => c.configured);
  
  return {
    status: allConfigured ? "ok" : "degraded",
    chains,
    dexes,
    timestamp: Date.now(),
  };
}