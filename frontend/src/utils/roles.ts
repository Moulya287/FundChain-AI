import type { Address } from "viem";

export type Campaign = {
  id: number;
  title: string;
  creator: Address;
  goal: bigint;
  raised: bigint;
  deadline: bigint;
  backers: bigint;
  completed: boolean;
};

export type Role =
  | "visitor"
  | "contributor"
  | "owner"
  | "owner-contributor";

export type Permissions = {
  canViewDetails: boolean;
  canViewMilestones: boolean;
  canViewProof: boolean;
  canViewResults: boolean;
  canSubmitProof: boolean;
  canVote: boolean;
  canFinalize: boolean;
  canRelease: boolean;
  canCreateMilestone: boolean;
};

export function getRole(
  campaign: Campaign,
  wallet: Address | "" | null,
  contributedAmount: bigint
): Role {
  if (!wallet) return "visitor";

  const isOwner =
    campaign.creator.toLowerCase() === wallet.toLowerCase();
  const isContributor = contributedAmount > 0n;

  if (isOwner && isContributor) return "owner-contributor";
  if (isOwner) return "owner";
  if (isContributor) return "contributor";
  return "visitor";
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case "owner":
      return "Campaign owner";
    case "owner-contributor":
      return "Owner · Contributor";
    case "contributor":
      return "Contributor";
    case "visitor":
    default:
      return "Visitor";
  }
}

export function getPermissions(
  role: Role,
  wallet: Address | "" | null
): Permissions {
  const connected = !!wallet;
  const isOwner = role === "owner" || role === "owner-contributor";
  const isContributor = role === "contributor"; // NOT owner-contributor

  return {
    // Everyone (including visitors, connected or not) can view
    canViewDetails: true,
    canViewMilestones: true,
    canViewProof: true,
    canViewResults: true,

    // Only owner (with or without contribution) can submit proof & release
    canSubmitProof: isOwner,
    canRelease: isOwner,
    canCreateMilestone: isOwner,

    // Contributor can vote — owner NEVER can, even if they contributed
    canVote: isContributor,

    // Anyone connected can finalize once the deadline has passed
    canFinalize: connected,
  };
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}