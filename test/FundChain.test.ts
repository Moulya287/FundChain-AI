
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("FundChain", async function () {
  const { viem, networkHelpers } = await network.create();

  // Helper: Deploy contract and create a campaign
  async function deployCampaign() {
    const fundChain = await viem.deployContract("FundChain");

    await fundChain.write.createCampaign([
      "Help Build a School",
      parseEther("10"),
      30n,
    ]);

    return fundChain;
  }

  // Helper: Deploy, create campaign and receive a contribution
  async function deployFundedCampaign() {
    const fundChain = await deployCampaign();
    const walletClients = await viem.getWalletClients();

    const contributorAddress = walletClients[1].account.address;

    await fundChain.write.contribute([1n], {
      account: contributorAddress,
      value: parseEther("3"),
    });

    return { fundChain, contributorAddress };
  }

  // 1. Campaign creation
  it("should create a campaign successfully", async function () {
    const fundChain = await deployCampaign();

    const count = await fundChain.read.campaignCount();

    assert.equal(count, 1n);
  });

  // 2. Reject empty campaign title
  it("should reject an empty campaign title", async function () {
    const fundChain = await viem.deployContract("FundChain");

    await viem.assertions.revertWith(
      fundChain.write.createCampaign(["", parseEther("10"), 30n]),
      "Title required"
    );
  });

  // 3. Reject zero funding goal
  it("should reject a zero funding goal", async function () {
    const fundChain = await viem.deployContract("FundChain");

    await viem.assertions.revertWith(
      fundChain.write.createCampaign(["School Project", 0n, 30n]),
      "Goal must be greater than zero"
    );
  });

  // 4. Reject invalid campaign ID
  it("should reject contributions to a campaign that does not exist", async function () {
    const fundChain = await viem.deployContract("FundChain");

    await viem.assertions.revertWith(
      fundChain.write.contribute([99n], { value: parseEther("1") }),
      "Campaign does not exist"
    );
  });

  // 5. Reject zero contribution
  it("should reject a zero ETH contribution", async function () {
    const fundChain = await deployCampaign();

    await viem.assertions.revertWith(
      fundChain.write.contribute([1n], { value: 0n }),
      "Contribution must be greater than zero"
    );
  });

  // 6. Record valid contribution
  it("should record contributions and update campaign totals", async function () {
    const fundChain = await deployCampaign();
    const walletClients = await viem.getWalletClients();

    const contributorAddress = walletClients[1].account.address;

    await fundChain.write.contribute([1n], {
      account: contributorAddress,
      value: parseEther("1"),
    });

    const contribution = await fundChain.read.contributions([
      1n,
      contributorAddress,
    ]);

    const campaign = await fundChain.read.campaigns([1n]);

    assert.equal(contribution, parseEther("1"));
    assert.equal(campaign[4], parseEther("1"));
    assert.equal(campaign[6], 1n);
  });

  // 7. Count the same contributor only once
  it("should count the same contributor only once", async function () {
    const fundChain = await deployCampaign();
    const walletClients = await viem.getWalletClients();

    const contributorAddress = walletClients[1].account.address;

    await fundChain.write.contribute([1n], {
      account: contributorAddress,
      value: parseEther("1"),
    });

    await fundChain.write.contribute([1n], {
      account: contributorAddress,
      value: parseEther("2"),
    });

    const contribution = await fundChain.read.contributions([
      1n,
      contributorAddress,
    ]);

    const campaign = await fundChain.read.campaigns([1n]);

    assert.equal(contribution, parseEther("3"));
    assert.equal(campaign[4], parseEther("3"));
    assert.equal(campaign[6], 1n);
  });

  // 8. Create milestone successfully
  it("should allow the campaign creator to create a milestone", async function () {
    const fundChain = await deployCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete school foundation",
      parseEther("2"),
    ]);

    const milestone = await fundChain.read.milestones([1n, 1n]);

    assert.equal(milestone[0], "Complete school foundation");
    assert.equal(milestone[1], parseEther("2"));
    assert.equal(milestone[5], false);
    assert.equal(milestone[6], false);
    assert.equal(milestone[7], true);

    assert.equal(await fundChain.read.milestoneCount([1n]), 1n);
  });

  // 9. Only creator can create milestones
  it("should reject milestone creation by a non-creator", async function () {
    const fundChain = await deployCampaign();
    const walletClients = await viem.getWalletClients();

    await viem.assertions.revertWith(
      fundChain.write.createMilestone(
        [1n, "Build classrooms", parseEther("2")],
        { account: walletClients[1].account.address }
      ),
      "Only creator can create milestones"
    );
  });

  // 10. Reject milestone allocation exceeding campaign goal
  it("should reject milestone allocation exceeding the campaign goal", async function () {
    const fundChain = await deployCampaign();

    await viem.assertions.revertWith(
      fundChain.write.createMilestone([
        1n,
        "Build school",
        parseEther("11"),
      ]),
      "Milestone allocation exceeds goal"
    );
  });

  // 11. Submit milestone proof
  it("should allow the creator to submit milestone proof", async function () {
    const fundChain = await deployCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await fundChain.write.submitMilestoneProof([
      1n,
      1n,
      "ipfs://school-foundation-proof",
    ]);

    const milestone = await fundChain.read.milestones([1n, 1n]);

    assert.equal(milestone[2], "ipfs://school-foundation-proof");
    assert.ok(milestone[8] > 0n);
  });

  // 12. Reject empty proof
  it("should reject an empty milestone proof", async function () {
    const fundChain = await deployCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await viem.assertions.revertWith(
      fundChain.write.submitMilestoneProof([1n, 1n, ""]),
      "Proof cannot be empty"
    );
  });

  // 13. Only contributors can vote
  it("should reject voting by a non-contributor", async function () {
    const fundChain = await deployCampaign();
    const walletClients = await viem.getWalletClients();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await fundChain.write.submitMilestoneProof([
      1n,
      1n,
      "ipfs://foundation-proof",
    ]);

    await viem.assertions.revertWith(
      fundChain.write.voteOnMilestone([1n, 1n, true], {
        account: walletClients[1].account.address,
      }),
      "Only contributors can vote"
    );
  });

  // 14. Contributor can vote successfully
  it("should record a contributor's approval vote", async function () {
    const { fundChain, contributorAddress } =
      await deployFundedCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await fundChain.write.submitMilestoneProof([
      1n,
      1n,
      "ipfs://foundation-proof",
    ]);

    await fundChain.write.voteOnMilestone([1n, 1n, true], {
      account: contributorAddress,
    });

    const milestone = await fundChain.read.milestones([1n, 1n]);

    assert.equal(milestone[3], 1n);
    assert.equal(milestone[4], 0n);

    assert.equal(
      await fundChain.read.hasVoted([
        1n,
        1n,
        contributorAddress,
      ]),
      true
    );
  });

  // 15. Reject duplicate voting
  it("should prevent a contributor from voting twice", async function () {
    const { fundChain, contributorAddress } =
      await deployFundedCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await fundChain.write.submitMilestoneProof([
      1n,
      1n,
      "ipfs://foundation-proof",
    ]);

    await fundChain.write.voteOnMilestone([1n, 1n, true], {
      account: contributorAddress,
    });

    await viem.assertions.revertWith(
      fundChain.write.voteOnMilestone([1n, 1n, true], {
        account: contributorAddress,
      }),
      "Already voted"
    );
  });

  // 16. Reject finalization before voting period ends
  it("should reject finalizing voting before the deadline", async function () {
    const { fundChain, contributorAddress } =
      await deployFundedCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await fundChain.write.submitMilestoneProof([
      1n,
      1n,
      "ipfs://foundation-proof",
    ]);

    await fundChain.write.voteOnMilestone([1n, 1n, true], {
      account: contributorAddress,
    });

    await viem.assertions.revertWith(
      fundChain.write.finalizeMilestoneVoting([1n, 1n]),
      "Voting period not ended"
    );
  });

  // 17. Approve milestone after voting period
  it("should approve a milestone when yes votes exceed no votes", async function () {
    const { fundChain, contributorAddress } =
      await deployFundedCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await fundChain.write.submitMilestoneProof([
      1n,
      1n,
      "ipfs://foundation-proof",
    ]);

    await fundChain.write.voteOnMilestone([1n, 1n, true], {
      account: contributorAddress,
    });

    await networkHelpers.time.increase(3 * 24 * 60 * 60 + 1);

    await fundChain.write.finalizeMilestoneVoting([1n, 1n]);

    const milestone = await fundChain.read.milestones([1n, 1n]);

    assert.equal(milestone[5], true);
    assert.equal(milestone[9], true);
  });

  // 18. Reject milestone with more no votes
  it("should reject a milestone when no votes exceed yes votes", async function () {
    const { fundChain, contributorAddress } =
      await deployFundedCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await fundChain.write.submitMilestoneProof([
      1n,
      1n,
      "ipfs://foundation-proof",
    ]);

    await fundChain.write.voteOnMilestone([1n, 1n, false], {
      account: contributorAddress,
    });

    await networkHelpers.time.increase(3 * 24 * 60 * 60 + 1);

    await fundChain.write.finalizeMilestoneVoting([1n, 1n]);

    const milestone = await fundChain.read.milestones([1n, 1n]);

    assert.equal(milestone[5], false);
    assert.equal(milestone[9], true);
  });

  // 19. Reject fund release before voting is finalized
  it("should reject fund release before voting is finalized", async function () {
    const { fundChain, contributorAddress } =
      await deployFundedCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await fundChain.write.submitMilestoneProof([
      1n,
      1n,
      "ipfs://foundation-proof",
    ]);

    await fundChain.write.voteOnMilestone([1n, 1n, true], {
      account: contributorAddress,
    });

    await viem.assertions.revertWith(
      fundChain.write.releaseMilestoneFunds([1n, 1n]),
      "Voting not finalized"
    );
  });

  // 20. Release approved milestone funds
  it("should release funds after milestone approval", async function () {
    const { fundChain, contributorAddress } =
      await deployFundedCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await fundChain.write.submitMilestoneProof([
      1n,
      1n,
      "ipfs://foundation-proof",
    ]);

    await fundChain.write.voteOnMilestone([1n, 1n, true], {
      account: contributorAddress,
    });

    await networkHelpers.time.increase(3 * 24 * 60 * 60 + 1);

    await fundChain.write.finalizeMilestoneVoting([1n, 1n]);

    await fundChain.write.releaseMilestoneFunds([1n, 1n]);

    const milestone = await fundChain.read.milestones([1n, 1n]);
    const released = await fundChain.read.totalReleased([1n]);

    assert.equal(milestone[6], true);
    assert.equal(released, parseEther("2"));
  });

  // 21. Prevent duplicate fund release
  it("should prevent releasing the same milestone funds twice", async function () {
    const { fundChain, contributorAddress } =
      await deployFundedCampaign();

    await fundChain.write.createMilestone([
      1n,
      "Complete foundation",
      parseEther("2"),
    ]);

    await fundChain.write.submitMilestoneProof([
      1n,
      1n,
      "ipfs://foundation-proof",
    ]);

    await fundChain.write.voteOnMilestone([1n, 1n, true], {
      account: contributorAddress,
    });

    await networkHelpers.time.increase(3 * 24 * 60 * 60 + 1);

    await fundChain.write.finalizeMilestoneVoting([1n, 1n]);

    await fundChain.write.releaseMilestoneFunds([1n, 1n]);

    await viem.assertions.revertWith(
      fundChain.write.releaseMilestoneFunds([1n, 1n]),
      "Funds already released"
    );
  });
});
