import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Chain,
} from "viem";

// Deployed FundChain contract address
export const CONTRACT_ADDRESS =
  "0x5fbdb2315678afecb367f032d93f642f64180aa3" as const;

// Local Hardhat blockchain
export const CHAIN: Chain = {
  id: 31337,
  name: "FundChain Local",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
};

// FundChain Smart Contract ABI
export const CONTRACT_ABI = [
  {
    type: "function",
    name: "campaignCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "campaigns",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "title", type: "string" },
      { name: "creator", type: "address" },
      { name: "goal", type: "uint256" },
      { name: "totalRaised", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "contributorCount", type: "uint256" },
      { name: "completed", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "contributions",
    stateMutability: "view",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "createCampaign",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_title", type: "string" },
      { name: "_goal", type: "uint256" },
      { name: "_durationDays", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "contribute",
    stateMutability: "payable",
    inputs: [{ name: "_campaignId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "milestoneCount",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "milestones",
    stateMutability: "view",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
    ],
    outputs: [
      { name: "description", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "proof", type: "string" },
      { name: "votesFor", type: "uint256" },
      { name: "votesAgainst", type: "uint256" },
      { name: "approved", type: "bool" },
      { name: "released", type: "bool" },
      { name: "exists", type: "bool" },
      { name: "votingDeadline", type: "uint256" },
      { name: "votingFinalized", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "createMilestone",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_campaignId", type: "uint256" },
      { name: "_description", type: "string" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "submitMilestoneProof",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_campaignId", type: "uint256" },
      { name: "_milestoneId", type: "uint256" },
      { name: "_proof", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "voteOnMilestone",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_campaignId", type: "uint256" },
      { name: "_milestoneId", type: "uint256" },
      { name: "_approve", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "finalizeMilestoneVoting",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_campaignId", type: "uint256" },
      { name: "_milestoneId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "releaseMilestoneFunds",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_campaignId", type: "uint256" },
      { name: "_milestoneId", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

// Public client for reading blockchain data
// Public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http("http://127.0.0.1:8545", {
    fetchFn: async (url, options) => {
      if (typeof options?.body === "string") {
        const body = JSON.parse(options.body);
        const requests = Array.isArray(body) ? body : [body];

        for (const request of requests) {
          if (
            request.method === "eth_call" &&
            Array.isArray(request.params?.[0]?.authorizationList) &&
            request.params[0].authorizationList.length === 0
          ) {
            delete request.params[0].authorizationList;
          }
        }

        options = {
          ...options,
          body: JSON.stringify(body),
        };
      }

      return fetch(url, options);
    },
  }),
}) as any;

// Wallet client for MetaMask transactions
// IMPORTANT: This is synchronous, not async.
export function getWalletClient() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  return createWalletClient({
    chain: CHAIN,
    transport: custom(window.ethereum),
  });
}