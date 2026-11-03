import { formatEther, type Address } from "viem";
import { shortenAddress } from "../utils/roles";

type Campaign = {
  id: number;
  title: string;
  creator: Address;
};

type MyContributionsProps = {
  walletAddress: Address | "" | null;
  campaigns: Campaign[];
  myContributions: Record<number, bigint>;
};

function MyContributions({
  walletAddress,
  campaigns,
  myContributions,
}: MyContributionsProps) {
  // Only show campaigns where the connected wallet contributed > 0 ETH
  const backedCampaigns = campaigns.filter(
    (campaign) => (myContributions[campaign.id] ?? 0n) > 0n
  );

  const getRoleLabel = (campaign: Campaign) => {
    if (!walletAddress) return "";
    const isOwner =
      campaign.creator.toLowerCase() === walletAddress.toLowerCase();
    return isOwner ? "Owner · Backer" : "Backer";
  };

  return (
    <section className="campaign-section">
      <div className="section-kicker">YOUR ACTIVITY</div>
      <h2>My contributions</h2>

      {!walletAddress ? (
        <p>Connect your wallet to view your contributions.</p>
      ) : backedCampaigns.length === 0 ? (
        <p>
          You haven't backed any campaigns yet. Explore campaigns to support a
          project.
        </p>
      ) : (
        <div className="campaign-grid">
          {backedCampaigns.map((campaign) => (
            <div className="campaign-card" key={campaign.id}>
              <div className="campaign-body">
                <div className="campaign-role-badge">
                  {getRoleLabel(campaign)}
                </div>
                <h3>{campaign.title}</h3>
                <p className="campaign-creator">
                  Created by {shortenAddress(campaign.creator)}
                </p>
                <p>
                  Your contribution:{" "}
                  <strong>
                    {formatEther(myContributions[campaign.id] ?? 0n)} ETH
                  </strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyContributions;