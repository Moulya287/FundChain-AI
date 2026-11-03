import type { Dispatch, SetStateAction } from "react";
import { formatEther, type Address } from "viem";
import {
  ArrowDownRight,
  ArrowRight,
  Search,
  Wallet,
} from "lucide-react";
import { shortenAddress } from "../utils/roles";

type Campaign = {
  id: number;
  title: string;
  creator: Address;
  goal: bigint;
  raised: bigint;
  deadline: bigint;
  backers: bigint;
  completed: boolean;
};

type ExploreCampaignsProps = {
  campaigns: Campaign[];
  filteredCampaigns: Campaign[];
  search: string;
  setSearch: (value: string) => void;
  loading: boolean;
  contributionAmounts: Record<number, string>;
  setContributionAmounts: Dispatch<
    SetStateAction<Record<number, string>>
  >;
  loadCampaigns: () => void;
  handleContribute: (campaignId: number) => void;
  changePage: (page: string) => void;
  getDaysLeft: (deadline: bigint) => number;
  walletAddress: Address | "";
};

function ExploreCampaigns({
  campaigns,
  filteredCampaigns,
  search,
  setSearch,
  loading,
  contributionAmounts,
  setContributionAmounts,
  loadCampaigns,
  handleContribute,
  changePage,
  getDaysLeft,
  walletAddress,
}: ExploreCampaignsProps) {
  return (
    <section className="campaign-section">
      <div className="section-heading">
        <div>
          <div className="section-kicker">DISCOVER & SUPPORT</div>
          <h2>Featured campaigns</h2>
          <p>These campaigns are loaded from your smart contract.</p>
        </div>

        <button className="text-button" onClick={loadCampaigns}>
          Refresh campaigns <ArrowRight size={16} />
        </button>
      </div>

      <div className="campaign-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="empty-state">
          <Search size={28} />
          <h3>No campaigns found</h3>
          <p>
            {campaigns.length === 0
              ? "Create the first campaign on the blockchain."
              : "Try another search term."}
          </p>
          <button
            className="secondary-button"
            onClick={() => changePage("Create Campaign")}
          >
            Create campaign
          </button>
        </div>
      ) : (
        <div className="campaign-grid">
          {filteredCampaigns.map((campaign, index) => {
            const progress =
              campaign.goal > 0n
                ? Math.min(
                    Number(
                      (campaign.raised * 100n) / campaign.goal
                    ),
                    100
                  )
                : 0;

            const isOwner =
              !!walletAddress &&
              campaign.creator.toLowerCase() === walletAddress.toLowerCase();

            return (
              <article className="campaign-card" key={campaign.id}>
                <div
                  className={`campaign-art ${
                    ["green", "blue", "purple"][index % 3]
                  }`}
                >
                  <div className="art-shape art-shape-one" />
                  <div className="art-shape art-shape-two" />
                  <div className="campaign-monogram">
                    {campaign.title.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="category-badge">Blockchain</span>
                  {isOwner && (
                    <span className="category-badge" style={{ right: '12px', left: 'auto', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
                      You own this
                    </span>
                  )}
                </div>

                <div className="campaign-body">
                  <div className="campaign-title-row">
                    <h3>{campaign.title}</h3>
                  </div>

                  <p className="campaign-description">
                    Created by {shortenAddress(campaign.creator)}
                  </p>

                  <div className="progress-label">
                    <span>Funding progress</span>
                    <strong>{progress}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${
                        ["green", "blue", "purple"][index % 3]
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="funding-numbers">
                    <div>
                      <strong>
                        {Number(formatEther(campaign.raised)).toFixed(3)} ETH
                      </strong>
                      <span>raised</span>
                    </div>

                    <div className="funding-goal">
                      <strong>
                        {Number(formatEther(campaign.goal)).toFixed(3)} ETH
                      </strong>
                      <span>goal</span>
                    </div>
                  </div>

                  <div className="campaign-footer">
                    <span>
                      <Wallet size={14} />{" "}
                      {campaign.backers.toString()} backers
                    </span>

                    <span>
                      <ArrowDownRight size={14} />{" "}
                      {getDaysLeft(campaign.deadline)} days left
                    </span>
                  </div>

                  <div className="contribute-form">
                    <input
                      type="number"
                      min="0.000000000000000001"
                      step="any"
                      className="contribution-input"
                      placeholder="Amount in ETH"
                      value={contributionAmounts[campaign.id] || ""}
                      onChange={(e) =>
                        setContributionAmounts((previous) => ({
                          ...previous,
                          [campaign.id]: e.target.value,
                        }))
                      }
                    />

                    <button
                      className="primary-button"
                      disabled={loading}
                      onClick={() => handleContribute(campaign.id)}
                    >
                      {loading ? "Processing..." : "Contribute"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ExploreCampaigns;