/**
 * Slippage Sentinel - x402 Slippage Endpoint
 * Bounty #3: Slippage Sentinel
 */

import { SlippageRequest, SlippageResponse, X402Manifest } from "./types";
import { calculateSlippage } from "./slippage";

const X402_NETWORK = "eip155:8453";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const ORG_EVM_PAYTO = "0x76EfB727cd3271C7DE22f92437Be212766C9631f";

export async function handleSlippage(request: Request, env: { [key: string]: string }): Promise<Response> {
  try {
    const body: SlippageRequest = await request.json();
    
    // Validate required fields
    if (!body.tokenIn || !body.tokenOut || !body.amountIn || !body.chain) {
      return new Response(JSON.stringify({ error: "Missing required fields: tokenIn, tokenOut, amountIn, chain" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calculate slippage
    const result = await calculateSlippage(body);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function handleX402Manifest(): Promise<Response> {
  const manifest: X402Manifest = {
    x402Version: 2,
    resource: "/slippage",
    description: "Slippage Sentinel: Safe slippage tolerance estimation for swap routes",
    accepts: [
      {
        scheme: "exact",
        network: X402_NETWORK,
        asset: USDC_BASE,
        payTo: ORG_EVM_PAYTO,
        maxAmountRequired: "10000", // $0.01 in USDC base units
        resource: "/slippage",
        description: "One /slippage API call",
      },
    ],
    free: ["/health", "/.well-known/x402.json"],
  };
  
  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}