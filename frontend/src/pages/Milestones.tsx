import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { formatEther, parseEther, type Address } from "viem";

import {
  getWalletClient,
  publicClient,
  CHAIN,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
} from "../contract";

import {
  getRole,
  getRoleLabel,
  getPermissions,
  shortenAddress,
  type Campaign,
} from "../utils/roles";

type Milestone = {
  id: number;
  description: string;
  amount: bigint;
  proof: string;
  votesFor: bigint;
  votesAgainst: bigint;
  approved: boolean;
  released: boolean;
  exists: boolean;
  votingDeadline: bigint;
  votingFinalized: boolean;
};

type MilestonesProps = {
  campaigns: Campaign[];
  walletAddress: Address | "";
  onRefresh: () => Promise<void>;
};

function Milestones({
  campaigns,
  walletAddress,
  onRefresh,
}: MilestonesProps) {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [proofInputs, setProofInputs] = useState<Record<number, string>>({});
  const [hasVotedMap, setHasVotedMap] = useState<Record<number, boolean>>({});
  const [myCampaignContribution, setMyCampaignContribution] = useState<bigint>(
    0n
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selected = campaigns.find(
    (campaign) => String(campaign.id) === selectedCampaign
  );

  const role = selected
    ? getRole(selected, walletAddress, myCampaignContribution)
    : "visitor";

  const permissions = getPermissions(role, walletAddress);

  const loadMyContributionForCampaign = async () => {
    if (!selectedCampaign || !walletAddress) {
      setMyCampaignContribution(0n);
      return;
    }

    try {
      const contribution = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "contributions",
        args: [BigInt(selectedCampaign), walletAddress],
      });
      setMyCampaignContribution(contribution as bigint);
    } catch (error) {
      console.error("Could not load contribution:", error);
      setMyCampaignContribution(0n);
    }
  };

  const loadHasVoted = async (milestoneIds: number[]) => {
    if (!selectedCampaign || !walletAddress || milestoneIds.length === 0) {
      setHasVotedMap({});
      return;
    }

    try {
      const map: Record<number, boolean> = {};

      for (const milestoneId of milestoneIds) {
        const voted = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "hasVoted",
          args: [
            BigInt(selectedCampaign),
            BigInt(milestoneId),
            walletAddress,
          ],
        });
        map[milestoneId] = voted as boolean;
      }

      setHasVotedMap(map);
    } catch (error) {
      console.error("Could not load vote status:", error);
      setHasVotedMap({});
    }
  };

  const loadMilestones = async () => {
    if (!selectedCampaign) {
      setMilestones([]);
      setHasVotedMap({});
      setMyCampaignContribution(0n);
      return;
    }

    try {
      const campaignId = BigInt(selectedCampaign);

      const count = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "milestoneCount",
        args: [campaignId],
      });

      const loaded: Milestone[] = [];

      for (let i = 1n; i <= count; i++) {
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "milestones",
          args: [campaignId, i],
        });

        loaded.push({
          id: Number(i),
          description: result[0],
          amount: result[1],
          proof: result[2],
          votesFor: result[3],
          votesAgainst: result[4],
          approved: result[5],
          released: result[6],
          exists: result[7],
          votingDeadline: result[8],
          votingFinalized: result[9],
        });
      }

      setMilestones(loaded);
      await loadMyContributionForCampaign();
      await loadHasVoted(loaded.map((milestone) => milestone.id));
    } catch (error) {
      console.error("Could not load milestones:", error);
      setMessage("Unable to load milestones. Please try again.");
    }
  };

  useEffect(() => {
    void loadMilestones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, campaigns, walletAddress]);

  const sendTransaction = async (
    functionName: string,
    args: readonly unknown[]
  ) => {
    if (!walletAddress) {
      setMessage("Connect your wallet first.");
      return false;
    }

    setLoading(true);
    setMessage("");

    try {
      const walletClient = getWalletClient();

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName,
        args,
        account: walletAddress,
        chain: CHAIN,
        gas: 3000000n, 
      } as never);

      await publicClient.waitForTransactionReceipt({ hash });

      setMessage("Transaction successful!");

      await loadMilestones();
      await onRefresh();

      return true;
    } catch (error) {
      console.error("Transaction failed:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Transaction failed. Please try again."
      );

      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedCampaign || !description.trim() || !amount) {
      setMessage("Please enter the milestone details.");
      return;
    }

    try {
      const parsedAmount = parseEther(amount);

      if (parsedAmount <= 0n) {
        setMessage("Milestone amount must be greater than zero.");
        return;
      }

      const success = await sendTransaction("createMilestone", [
        BigInt(selectedCampaign),
        description.trim(),
        parsedAmount,
      ]);

      if (success) {
        setDescription("");
        setAmount("");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Please enter a valid ETH amount."
      );
    }
  };

  const handleProofSubmit = async (milestoneId: number) => {
    const proof = proofInputs[milestoneId]?.trim();

    if (!proof || !selectedCampaign) {
      setMessage("Please enter proof for this milestone.");
      return;
    }

    const success = await sendTransaction("submitMilestoneProof", [
      BigInt(selectedCampaign),
      BigInt(milestoneId),
      proof,
    ]);

    if (success) {
      setProofInputs((previous) => ({
        ...previous,
        [milestoneId]: "",
      }));
    }
  };

  const handleVote = async (milestoneId: number, approve: boolean) => {
    if (!selectedCampaign) return;

    await sendTransaction("voteOnMilestone", [
      BigInt(selectedCampaign),
      BigInt(milestoneId),
      approve,
    ]);
  };

  const handleFinalize = async (milestoneId: number) => {
    if (!selectedCampaign) return;

    await sendTransaction("finalizeMilestoneVoting", [
      BigInt(selectedCampaign),
      BigInt(milestoneId),
    ]);
  };

  const handleRelease = async (milestoneId: number) => {
    if (!selectedCampaign) return;

    await sendTransaction("releaseMilestoneFunds", [
      BigInt(selectedCampaign),
      BigInt(milestoneId),
    ]);
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return "Not started";
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <section className="campaign-section milestone-page">
      <div className="section-kicker">TRANSPARENT FUND RELEASES</div>

      <h2 className="milestone-title">Milestone tracking</h2>

      <p className="milestone-subtitle">
        Track campaign progress, review submitted proof and vote on fund
        releases.
      </p>

      <div className="form-group">
        <label htmlFor="milestone-campaign">Select a campaign</label>

        <select
          id="milestone-campaign"
          className="milestone-select"
          value={selectedCampaign}
          onChange={(event) => {
            setSelectedCampaign(event.target.value);
            setMessage("");
          }}
        >
          <option value="">Choose a campaign</option>

          {campaigns.map((campaign) => (
            <option key={String(campaign.id)} value={String(campaign.id)}>
              {campaign.title}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="status-message">{message}</p>}

      {!selectedCampaign && (
        <p>Select a campaign to view its milestones.</p>
      )}

      {selected && (
        <>
          <div className="milestone-role-banner">
            <div>
              <strong>Your role: {getRoleLabel(role)}</strong>
              <span>
                {walletAddress
                  ? shortenAddress(walletAddress)
                  : "Wallet not connected"}
              </span>
            </div>

            <div className="milestone-role-stats">
              <span>
                Your contribution:{" "}
                <strong>
                  {formatEther(myCampaignContribution)} ETH
                </strong>
              </span>
            </div>
          </div>

          <div className="milestone-campaign-info">
            <h3>{selected.title}</h3>

            <p>
              Goal: {formatEther(selected.goal)} ETH · Raised:{" "}
              {formatEther(selected.raised)} ETH
            </p>

            <p>
              Creator: {shortenAddress(selected.creator)}
              {role === "owner" || role === "owner-contributor" ? (
                <span className="milestone-owner-tag">You</span>
              ) : null}
            </p>
          </div>

          {permissions.canCreateMilestone && (
            <form onSubmit={handleCreateMilestone} className="create-form">
              <h3>Add a milestone</h3>

              <div className="form-group">
                <label>Description</label>

                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="e.g. Purchase construction materials"
                  required
                />
              </div>

              <div className="form-group">
                <label>Funds required (ETH)</label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="e.g. 0.5"
                  required
                />
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Processing..." : "Add milestone"}
              </button>
            </form>
          )}

          <div className="milestone-list">
            <h3>Campaign milestones</h3>

            {milestones.length === 0 && (
              <p>No milestones have been added to this campaign yet.</p>
            )}

            {milestones.map((milestone) => {
              const hasProof = milestone.proof.trim().length > 0;

              const votingEnded =
                milestone.votingDeadline > 0n &&
                BigInt(Math.floor(Date.now() / 1000)) >=
                  milestone.votingDeadline;

              const alreadyVoted = hasVotedMap[milestone.id] === true;

              const canShowVoteButtons =
                hasProof &&
                !milestone.votingFinalized &&
                !votingEnded &&
                permissions.canVote &&
                !alreadyVoted;

              const canShowFinalizeButton =
                hasProof &&
                !milestone.votingFinalized &&
                votingEnded &&
                permissions.canFinalize;

              return (
                <article className="milestone-input-card" key={milestone.id}>
                  <div className="milestone-input-heading">
                    <h4>
                      Milestone {milestone.id}: {milestone.description}
                    </h4>

                    <strong>{formatEther(milestone.amount)} ETH</strong>
                  </div>

                  <p>
                    Votes in favour: {milestone.votesFor.toString()}
                  </p>

                  <p>
                    Votes against: {milestone.votesAgainst.toString()}
                  </p>

                  {hasProof ? (
                    <>
                      <p>
                        <strong>Submitted proof:</strong>
                      </p>

                      <p>{milestone.proof}</p>

                      <p>
                        Voting deadline:{" "}
                        {formatDate(milestone.votingDeadline)}
                      </p>

                      {alreadyVoted && !milestone.votingFinalized && (
                        <p className="milestone-voted-tag">
                          You have already voted on this milestone.
                        </p>
                      )}
                    </>
                  ) : (
                    <p>Proof has not been submitted yet.</p>
                  )}

                  {permissions.canSubmitProof && !hasProof && (
                    <div className="form-group">
                      <label>Submit milestone proof</label>

                      <textarea
                        value={proofInputs[milestone.id] || ""}
                        onChange={(event) =>
                          setProofInputs((previous) => ({
                            ...previous,
                            [milestone.id]: event.target.value,
                          }))
                        }
                        placeholder="Enter proof details or a link"
                      />

                      <button
                        type="button"
                        className="primary-button"
                        disabled={loading}
                        onClick={() => handleProofSubmit(milestone.id)}
                      >
                        Submit proof
                      </button>
                    </div>
                  )}

                  {canShowVoteButtons && (
                    <div className="milestone-actions">
                      <button
                        type="button"
                        className="primary-button"
                        disabled={loading}
                        onClick={() => handleVote(milestone.id, true)}
                      >
                        Vote to approve
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        disabled={loading}
                        onClick={() => handleVote(milestone.id, false)}
                      >
                        Vote against
                      </button>
                    </div>
                  )}

                  {canShowFinalizeButton && (
                    <div className="milestone-actions">
                      <button
                        type="button"
                        className="primary-button"
                        disabled={loading}
                        onClick={() => handleFinalize(milestone.id)}
                      >
                        Finalise voting
                      </button>
                    </div>
                  )}

                  {milestone.votingFinalized && (
                    <p>
                      Voting result:{" "}
                      <strong>
                        {milestone.approved ? "Approved" : "Not approved"}
                      </strong>
                    </p>
                  )}

                  {permissions.canRelease &&
                    milestone.approved &&
                    !milestone.released && (
                      <button
                        type="button"
                        className="primary-button"
                        disabled={loading}
                        onClick={() => handleRelease(milestone.id)}
                      >
                        Release milestone funds
                      </button>
                    )}

                  {milestone.released && (
                    <p>
                      <strong>Funds released successfully.</strong>
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export default Milestones;