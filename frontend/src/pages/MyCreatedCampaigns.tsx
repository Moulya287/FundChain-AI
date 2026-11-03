import { formatEther, type Address } from "viem";
import { shortenAddress } from "../utils/roles";
import { ArrowRight } from "lucide-react";

type Campaign = {
  id: number;
  title: string;
  creator: Address;
  goal: bigint;
  raised: bigint;
  backers: bigint;
  deadline: bigint;
};

type MyCreatedCampaignsProps = {
  walletAddress: Address | "" | null;
  campaigns: Campaign[];
  changePage: (page: string) => void;
};

function MyCreatedCampaigns({
  walletAddress,
  campaigns,
  changePage,
}: MyCreatedCampaignsProps) {
  const myCampaigns = campaigns.filter(
    (campaign) =>
      !!walletAddress &&
      campaign.creator.toLowerCase() === walletAddress.toLowerCase()
  );

  return (
    <section className="campaign-section">
      <div className="section-kicker">YOUR PROJECTS</div>
      <h2>My created campaigns</h2>

      {!walletAddress ? (
        <p>Connect your wallet to view the campaigns you have created.</p>
      ) : myCampaigns.length === 0 ? (
        <div className="empty-state">
          <h3>You haven't created any campaigns yet.</h3>
          <button
            className="primary-button"
            onClick={() => changePage("Create Campaign")}
          >
            Start a campaign <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="campaign-grid">
          {myCampaigns.map((campaign) => (
            <div className="campaign-card" key={campaign.id}>
              <div className="campaign-body">
                <div className="campaign-role-badge">Owner</div>
                <h3>{campaign.title}</h3>
                <p className="campaign-creator">
                  Created by you ({shortenAddress(campaign.creator)})
                </p>
                
                <div className="funding-numbers" style={{ marginTop: '12px', marginBottom: '12px' }}>
                  <div>
                    <strong>{Number(formatEther(campaign.raised)).toFixed(3)} ETH</strong>
                    <span>raised</span>
                  </div>
                  <div className="funding-goal">
                    <strong>{Number(formatEther(campaign.goal)).toFixed(3)} ETH</strong>
                    <span>goal</span>
                  </div>
                </div>

                <p>
                  Backers: <strong>{campaign.backers.toString()}</strong>
                </p>
                
                <button 
                  className="secondary-button" 
                  style={{ marginTop: '16px', width: '100%' }}
                  onClick={() => changePage("Milestones")}
                >
                  Manage milestones
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyCreatedCampaigns;