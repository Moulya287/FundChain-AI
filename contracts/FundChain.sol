// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FundChain {
    struct Campaign {
        uint256 id;
        string title;
        address creator;
        uint256 goal;
        uint256 totalRaised;
        uint256 deadline;
        uint256 contributorCount;
        bool completed;
    }

    struct Milestone {
        string description;
        uint256 amount;
        string proof;
        uint256 votesFor;
        uint256 votesAgainst;
        bool approved;
        bool released;
        bool exists;
        uint256 votingDeadline;
        bool votingFinalized;
    }

    uint256 public campaignCount;

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    mapping(uint256 => uint256) public milestoneCount;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;

    mapping(uint256 => mapping(uint256 => mapping(address => bool)))
        public hasVoted;

    mapping(uint256 => uint256) public totalMilestoneAllocation;
    mapping(uint256 => uint256) public totalReleased;

    uint256 public constant VOTING_PERIOD = 1 minutes;

    event CampaignCreated(
        uint256 indexed campaignId,
        string title,
        address indexed creator,
        uint256 goal,
        uint256 deadline
    );

    event ContributionReceived(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );

    event MilestoneCreated(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        string description,
        uint256 amount
    );

    event MilestoneProofSubmitted(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        string proof
    );

    event MilestoneVoted(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        address indexed voter,
        bool approved
    );

    event MilestoneVotingFinalized(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        bool approved
    );

    event FundsReleased(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        uint256 amount
    );

    function createCampaign(
        string memory _title,
        uint256 _goal,
        uint256 _durationDays
    ) external {
        require(bytes(_title).length > 0, "Title required");
        require(_goal > 0, "Goal must be greater than zero");
        require(_durationDays > 0, "Duration must be greater than zero");

        campaignCount++;

        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            title: _title,
            creator: msg.sender,
            goal: _goal,
            totalRaised: 0,
            deadline: block.timestamp + (_durationDays * 1 days),
            contributorCount: 0,
            completed: false
        });

        emit CampaignCreated(
            campaignCount,
            _title,
            msg.sender,
            _goal,
            campaigns[campaignCount].deadline
        );
    }

    function contribute(uint256 _campaignId) external payable {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Campaign does not exist"
        );

        Campaign storage campaign = campaigns[_campaignId];

        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(!campaign.completed, "Campaign is completed");
        require(msg.value > 0, "Contribution must be greater than zero");

        if (contributions[_campaignId][msg.sender] == 0) {
            campaign.contributorCount++;
        }

        contributions[_campaignId][msg.sender] += msg.value;
        campaign.totalRaised += msg.value;

        emit ContributionReceived(
            _campaignId,
            msg.sender,
            msg.value
        );
    }

    function createMilestone(
        uint256 _campaignId,
        string memory _description,
        uint256 _amount
    ) external {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Campaign does not exist"
        );

        Campaign storage campaign = campaigns[_campaignId];

        require(
            msg.sender == campaign.creator,
            "Only creator can create milestones"
        );

        require(bytes(_description).length > 0, "Description required");
        require(_amount > 0, "Amount must be greater than zero");

        require(
            totalMilestoneAllocation[_campaignId] + _amount <= campaign.goal,
            "Milestone allocation exceeds goal"
        );

        milestoneCount[_campaignId]++;

        uint256 newMilestoneId = milestoneCount[_campaignId];

        milestones[_campaignId][newMilestoneId] = Milestone({
            description: _description,
            amount: _amount,
            proof: "",
            votesFor: 0,
            votesAgainst: 0,
            approved: false,
            released: false,
            exists: true,
            votingDeadline: 0,
            votingFinalized: false
        });

        totalMilestoneAllocation[_campaignId] += _amount;

        emit MilestoneCreated(
            _campaignId,
            newMilestoneId,
            _description,
            _amount
        );
    }

    function submitMilestoneProof(
        uint256 _campaignId,
        uint256 _milestoneId,
        string memory _proof
    ) external {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Campaign does not exist"
        );

        Campaign storage campaign = campaigns[_campaignId];

        require(
            msg.sender == campaign.creator,
            "Only creator can submit proof"
        );

        Milestone storage milestone =
            milestones[_campaignId][_milestoneId];

        require(milestone.exists, "Milestone does not exist");
        require(bytes(_proof).length > 0, "Proof cannot be empty");
        require(
            !milestone.votingFinalized,
            "Voting already finalized"
        );

        milestone.proof = _proof;
        milestone.votingDeadline = block.timestamp + VOTING_PERIOD;

        emit MilestoneProofSubmitted(
            _campaignId,
            _milestoneId,
            _proof
        );
    }

    function voteOnMilestone(
        uint256 _campaignId,
        uint256 _milestoneId,
        bool _approve
    ) external {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Campaign does not exist"
        );

        Milestone storage milestone =
            milestones[_campaignId][_milestoneId];

        require(milestone.exists, "Milestone does not exist");
        require(bytes(milestone.proof).length > 0, "Proof not submitted");
        require(
            contributions[_campaignId][msg.sender] > 0,
            "Only contributors can vote"
        );
        require(
            msg.sender != campaigns[_campaignId].creator,
            "Campaign creator cannot vote"
        );
        require(
            !hasVoted[_campaignId][_milestoneId][msg.sender],
            "Already voted"
        );
        require(
            block.timestamp < milestone.votingDeadline,
            "Voting period ended"
        );
        require(
            !milestone.votingFinalized,
            "Voting already finalized"
        );

        hasVoted[_campaignId][_milestoneId][msg.sender] = true;

        if (_approve) {
            milestone.votesFor++;
        } else {
            milestone.votesAgainst++;
        }

        emit MilestoneVoted(
            _campaignId,
            _milestoneId,
            msg.sender,
            _approve
        );
    }

    function finalizeMilestoneVoting(
        uint256 _campaignId,
        uint256 _milestoneId
    ) external {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Campaign does not exist"
        );

        Milestone storage milestone =
            milestones[_campaignId][_milestoneId];

        require(milestone.exists, "Milestone does not exist");
        require(
            milestone.votingDeadline > 0,
            "Proof not submitted"
        );
        require(
            block.timestamp >= milestone.votingDeadline,
            "Voting period not ended"
        );
        require(
            !milestone.votingFinalized,
            "Voting already finalized"
        );

        milestone.votingFinalized = true;

        milestone.approved =
            milestone.votesFor > milestone.votesAgainst;

        emit MilestoneVotingFinalized(
            _campaignId,
            _milestoneId,
            milestone.approved
        );
    }

    function releaseMilestoneFunds(
        uint256 _campaignId,
        uint256 _milestoneId
    ) external {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Campaign does not exist"
        );

        Campaign storage campaign = campaigns[_campaignId];

        Milestone storage milestone =
            milestones[_campaignId][_milestoneId];

        require(milestone.exists, "Milestone does not exist");
        require(
            milestone.votingFinalized,
            "Voting not finalized"
        );
        require(
            milestone.approved,
            "Milestone not approved"
        );
        require(
            !milestone.released,
            "Funds already released"
        );
        require(
            campaign.totalRaised >= totalReleased[_campaignId] + milestone.amount,
            "Insufficient funds"
        );

        milestone.released = true;
        totalReleased[_campaignId] += milestone.amount;

        (bool success, ) = payable(campaign.creator).call{
            value: milestone.amount
        }("");

        require(success, "Fund transfer failed");

        emit FundsReleased(
            _campaignId,
            _milestoneId,
            milestone.amount
        );
    }
}