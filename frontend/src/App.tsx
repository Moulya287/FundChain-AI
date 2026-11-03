import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getWalletClient,
  publicClient,
  CHAIN,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
} from "./contract";
import { formatEther, parseEther, type Address } from "viem";

import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Compass,
  FilePlus2,
  FolderKanban,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import "./App.css";
import CreateCampaign, {
  type MilestoneInput,
} from "./pages/CreateCampaign";
import ExploreCampaigns from "./pages/ExploreCampaigns";
import MyContributions from "./pages/MyContributions";
import AIInsights from "./pages/AIInsights";
import Milestones from "./pages/Milestones";
import MyCreatedCampaigns from "./pages/MyCreatedCampaigns";

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

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Explore Campaigns", icon: Compass },
  { label: "Create Campaign", icon: FilePlus2 },
  { label: "My Created Campaigns", icon: FolderKanban }, 
  { label: "My Contributions", icon: FolderKanban },
];

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [walletAddress, setWalletAddress] = useState<Address | "">("");
  const [walletError, setWalletError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [campaignDuration, setCampaignDuration] = useState("30");

  const [contributionAmounts, setContributionAmounts] = useState<
    Record<number, string>
  >({});

  const [myContributions, setMyContributions] = useState<
    Record<number, bigint>
  >({});

  const loadMyContributions = useCallback(async () => {
    if (!walletAddress || campaigns.length === 0) {
      setMyContributions({});
      return;
    }

    try {
      const amounts: Record<number, bigint> = {};

      for (const campaign of campaigns) {
        const amount = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "contributions",
          args: [BigInt(campaign.id), walletAddress],
        });

        amounts[campaign.id] = amount;
      }

      setMyContributions(amounts);
    } catch (error) {
      console.error("Could not load contributions:", error);
    }
  }, [campaigns, walletAddress]);

  useEffect(() => {
    loadMyContributions();
  }, [loadMyContributions]);

  const loadCampaigns = useCallback(async () => {
    try {
const count = await publicClient.readContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "campaignCount",
});

      const loaded: Campaign[] = [];

      for (let i = 1n; i <= count; i++) {
const data = await publicClient.readContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "campaigns",
  args: [i],
});

        loaded.push({
          id: Number(data[0]),
          title: data[1],
          creator: data[2],
          goal: data[3],
          raised: data[4],
          deadline: data[5],
          backers: data[6],
          completed: data[7],
        });
      }

      setCampaigns(loaded.reverse());
    } catch (error) {
      console.error("Could not load campaigns:", error);
      setMessage(
        "Could not read the contract. Check that Hardhat is running and the contract is deployed."
      );
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setWalletAddress((accounts[0] as Address) || "");
    };

    const handleChainChanged = () => {
      setWalletAddress("");
      setWalletError("Network changed. Please reconnect your wallet.");
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
      window.ethereum?.removeListener(
        "chainChanged",
        handleChainChanged
      );
    };
  }, []);

  const connectWallet = async () => {
    try {
      setWalletError("");
      setMessage("");

      if (!window.ethereum) {
        throw new Error("Please install MetaMask first.");
      }

      const walletClient = getWalletClient();
      const [address] = await walletClient.requestAddresses();
      const chainId = await walletClient.getChainId();

      if (chainId !== 31337) {
        throw new Error(
          "Please switch MetaMask to FundChain Local (Chain ID 31337)."
        );
      }

      setWalletAddress(address);
      setMessage("Wallet connected successfully!");
    } catch (error) {
      setWalletError(
        error instanceof Error ? error.message : "Wallet connection failed."
      );
    }
  };

  const changePage = (page: string) => {
    setActivePage(page);
    setMobileMenu(false);
    setMessage("");
  };

  const handleCreateCampaign = async (
    event: React.FormEvent<HTMLFormElement>,
    milestones: MilestoneInput[]
  ) => {
    event.preventDefault();

    try {
      setMessage("");
      setWalletError("");

      if (!walletAddress) {
        await connectWallet();
        return;
      }

      if (!campaignTitle.trim()) {
        throw new Error("Please enter a campaign title.");
      }

      if (Number(campaignGoal) <= 0 || Number(campaignDuration) <= 0) {
        throw new Error("Goal and duration must be greater than zero.");
      }

      const totalMilestoneAmount = milestones.reduce(
        (total, milestone) => total + Number(milestone.amount),
        0
      );

      if (
        milestones.some(
          (milestone) =>
            !milestone.description.trim() ||
            !milestone.amount ||
            Number(milestone.amount) <= 0
        )
      ) {
        throw new Error("Please complete every milestone correctly.");
      }

      if (totalMilestoneAmount > Number(campaignGoal)) {
        throw new Error("Total milestone amounts cannot exceed the campaign goal.");
      }

      setLoading(true);

      const walletClient = getWalletClient();

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "createCampaign",
        args: [
          campaignTitle.trim(),
          parseEther(campaignGoal),
          BigInt(campaignDuration),
        ],
        account: walletAddress,
        chain: CHAIN,
      });

      setMessage("Campaign submitted. Waiting for blockchain confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status !== "success") {
        throw new Error("Campaign creation failed.");
      }

const campaignId = await publicClient.readContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "campaignCount",
});

      if (milestones.length > 0) {
        for (let index = 0; index < milestones.length; index++) {
          const milestone = milestones[index];

          setMessage(
            `Creating milestone ${index + 1} of ${milestones.length}...`
          );

          const milestoneHash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "createMilestone",
            args: [
              campaignId,
              milestone.description.trim(),
              parseEther(milestone.amount),
            ],
            account: walletAddress,
            chain: CHAIN,
          });

          const milestoneReceipt =
            await publicClient.waitForTransactionReceipt({
              hash: milestoneHash,
            });

          if (milestoneReceipt.status !== "success") {
            throw new Error(
              `Campaign was created, but milestone ${index + 1} failed. You can add it later.`
            );
          }
        }
      }

      setMessage(
        milestones.length > 0
          ? "Campaign and all milestones created successfully!"
          : "Campaign created successfully on the blockchain!"
      );

      setCampaignTitle("");
      setCampaignGoal("");
      setCampaignDuration("30");

      await loadCampaigns();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error ? error.message : "Campaign creation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (campaignId: number) => {
    try {
      setMessage("");
      setWalletError("");

      if (!walletAddress) {
        await connectWallet();
        return;
      }

      const amount = contributionAmounts[campaignId];

      if (!amount || Number(amount) <= 0) {
        throw new Error("Enter a valid ETH contribution.");
      }

      setLoading(true);

      const walletClient = getWalletClient();

const hash = await walletClient.writeContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "contribute",
  args: [BigInt(campaignId)],
  value: parseEther(amount),
  account: walletAddress,
  chain: CHAIN,
});

      setMessage("Contribution submitted. Waiting for confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status !== "success") {
        throw new Error("Contribution transaction failed.");
      }

      setMessage("Your contribution was recorded on the blockchain!");

      setContributionAmounts((previous) => ({
        ...previous,
        [campaignId]: "",
      }));

      await loadCampaigns();
      await loadMyContributions();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error ? error.message : "Contribution failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) =>
      campaign.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [campaigns, search]);

  const totalRaised = campaigns.reduce(
    (total, campaign) => total + campaign.raised,
    0n
  );

  const totalBackers = campaigns.reduce(
    (total, campaign) => total + campaign.backers,
    0n
  );

  const getDaysLeft = (deadline: bigint) => {
    const secondsLeft = Number(deadline) - Math.floor(Date.now() / 1000);
    return Math.max(0, Math.ceil(secondsLeft / 86400));
  };

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
          aria-label="Close menu"
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Zap size={21} fill="currentColor" />
          </div>
          <div>
            <div className="brand-name">
              FundChain<span> AI</span>
            </div>
            <div className="brand-caption">DECENTRALIZED FUNDING</div>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => changePage(label)}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Create Campaign" && (
                <span className="nav-plus">+</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <div className="workspace-label">PLATFORM</div>

        <nav className="navigation">
          <button
            className={`nav-item ${activePage === "AI Insights" ? "active" : ""}`}
            onClick={() => changePage("AI Insights")}
          >
            <Sparkles size={19} />
            <span>AI Insights</span>
            <span className="new-tag">NEW</span>
          </button>

          <button
            className={`nav-item ${activePage === "Milestones" ? "active" : ""}`}
            onClick={() => changePage("Milestones")}
          >
            <ShieldCheck size={19} />
            <span>Milestone Tracking</span>
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="help-card">
          <div className="help-icon">
            <CircleHelp size={19} />
          </div>
          <strong>Need a hand?</strong>
          <p>Explore how transparent crowdfunding works.</p>
          <button onClick={() => changePage("AI Insights")}>
            Explore insights <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="profile">
          <div className="avatar">FC</div>
          <div className="profile-info">
            <strong>{walletAddress ? "Wallet connected" : "Guest User"}</strong>
            <span>Community member</span>
          </div>
          <ChevronDown size={16} className="profile-chevron" />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setMobileMenu(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              Workspace <span>/</span> <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button notification-button"
              onClick={() => setMessage("You are viewing the latest blockchain data.")}
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            <button
              className={`connect-button ${walletAddress ? "connected" : ""}`}
              onClick={connectWallet}
            >
              <Wallet size={17} />
              {walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : "Connect wallet"}
            </button>
          </div>
        </header>

        {(walletError || message) && (
          <div className={walletError ? "wallet-error" : "status-message"}>
            {walletError || message}
            <button
              onClick={() => {
                setWalletError("");
                setMessage("");
              }}
              aria-label="Dismiss message"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="page-container">
        {activePage === "Create Campaign" ? (
  <CreateCampaign
    campaignTitle={campaignTitle}
    setCampaignTitle={setCampaignTitle}
    campaignGoal={campaignGoal}
    setCampaignGoal={setCampaignGoal}
    campaignDuration={campaignDuration}
    setCampaignDuration={setCampaignDuration}
    loading={loading}
    handleCreateCampaign={handleCreateCampaign}
  />
) : activePage === "AI Insights" ? (
<AIInsights campaigns={campaigns} />
          ) : activePage === "Milestones" ? (
<Milestones
  campaigns={campaigns}
  walletAddress={walletAddress}
  onRefresh={loadCampaigns}
/>

) : activePage === "My Created Campaigns" ? (
  <MyCreatedCampaigns
    walletAddress={walletAddress}
    campaigns={campaigns}
    changePage={changePage}
  />
) : activePage === "My Contributions" ? (
  <MyContributions
    walletAddress={walletAddress}
    campaigns={campaigns}
    myContributions={myContributions}
  />
) : activePage === "Overview" ? (
  <>
    <section className="welcome-section">
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-dot" />
                    THE FUTURE OF TRANSPARENT FUNDING
                  </div>

                  <h1>
                    Funding ideas.
                    <br />
                    <span>Building trust.</span>
                  </h1>

                  <p className="welcome-description">
                    Discover meaningful projects, support ambitious ideas, and
                    follow every milestone with blockchain-powered transparency.
                  </p>

                  <div className="welcome-actions">
                    <button
                      className="primary-button"
                      onClick={() => changePage("Explore Campaigns")}
                    >
                      Explore campaigns <ArrowRight size={17} />
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => changePage("Create Campaign")}
                    >
                      Start a campaign
                    </button>
                  </div>
                </div>

                <div className="hero-visual">
                  <div className="hero-glow" />
                  <div className="hero-orbit orbit-one" />
                  <div className="hero-orbit orbit-two" />
                  <div className="hero-core">
                    <div className="hero-core-inner">
                      <Zap size={43} fill="currentColor" />
                    </div>
                  </div>

                  <div className="floating-card floating-top">
                    <div className="floating-icon green-icon">
                      <CheckCircle2 size={17} />
                    </div>
                    <div>
                      <strong>Verified milestones</strong>
                      <span>Transparent by design</span>
                    </div>
                  </div>

                  <div className="floating-card floating-bottom">
                    <div className="floating-icon purple-icon">
                      <Sparkles size={17} />
                    </div>
                    <div>
                      <strong>AI-powered insights</strong>
                      <span>Smarter funding decisions</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Total funding raised</span>
                    <div className="stat-icon purple-stat">
                      <Wallet size={18} />
                    </div>
                  </div>
                  <div className="stat-value">
                    {Number(formatEther(totalRaised)).toFixed(3)} ETH
                  </div>
                  <div className="stat-foot">
                    <span className="positive">
                      <ArrowUpRight size={14} /> On-chain data
                    </span>
                    <span>All campaigns</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span>Active campaigns</span>
                    <div className="stat-icon blue-stat">
                      <FolderKanban size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{campaigns.length}</div>
                  <div className="stat-foot">
                    <span className="positive">Live</span>
                    <span>From smart contract</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span>Community backers</span>
                    <div className="stat-icon green-stat">
                      <ShieldCheck size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{totalBackers.toString()}</div>
                  <div className="stat-foot">
                    <span className="positive">On-chain</span>
                    <span>Across campaigns</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span>Platform transparency</span>
                    <div className="stat-icon orange-stat">
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className="stat-value">On-chain</div>
                  <div className="stat-foot">
                    <span className="positive">Blockchain powered</span>
                    <span>Designed for trust</span>
                  </div>
                </div>
              </section>
  </>
) : null}


{(activePage === "Overview" ||
  activePage === "Explore Campaigns") && (
  <ExploreCampaigns
    campaigns={campaigns}
    filteredCampaigns={filteredCampaigns}
    search={search}
    setSearch={setSearch}
    loading={loading}
    contributionAmounts={contributionAmounts}
    setContributionAmounts={setContributionAmounts}
    loadCampaigns={loadCampaigns}
    handleContribute={handleContribute}
    changePage={changePage}
    getDaysLeft={getDaysLeft}
    walletAddress={walletAddress}   
  />
)}

          <section className="bottom-grid">
            <div className="ai-card">
              <div className="ai-card-content">
                <div className="ai-label">
                  <Sparkles size={15} /> INTELLIGENCE LAYER
                </div>
                <h2>Make smarter funding decisions.</h2>
                <p>
                  Explore AI-driven funding insights designed to help creators
                  understand campaign performance and funding potential.
                </p>
                <button
                  className="ai-button"
                  onClick={() => changePage("AI Insights")}
                >
                  Explore AI insights <ArrowRight size={16} />
                </button>
              </div>
              <div className="ai-decoration">
                <div className="ai-ring ring-one" />
                <div className="ai-ring ring-two" />
                <Sparkles size={39} />
              </div>
            </div>

            <div className="trust-card">
              <div className="trust-icon">
                <ShieldCheck size={23} />
              </div>
              <div className="section-kicker">BUILT ON TRANSPARENCY</div>
              <h3>Every milestone matters.</h3>
              <p>
                Campaign milestones, community voting, and fund releases are
                designed to be recorded transparently on the blockchain.
              </p>
              <button onClick={() => changePage("Milestones")}>
                How it works <ArrowRight size={15} />
              </button>
            </div>
          </section>

          <footer className="footer">
            <div>© 2026 FundChain AI. Built for transparent crowdfunding.</div>
            <div className="footer-links">
              <span>Decentralized</span>
              <span className="footer-dot" />
              <span>Transparent</span>
              <span className="footer-dot" />
              <span>Community powered</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;