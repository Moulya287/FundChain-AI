
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

export type MilestoneInput = {
  description: string;
  amount: string;
};

type CreateCampaignProps = {
  campaignTitle: string;
  setCampaignTitle: (value: string) => void;
  campaignGoal: string;
  setCampaignGoal: (value: string) => void;
  campaignDuration: string;
  setCampaignDuration: (value: string) => void;
  loading: boolean;
  handleCreateCampaign: (
    event: FormEvent<HTMLFormElement>,
    milestones: MilestoneInput[]
  ) => void;
};

function CreateCampaign({
  campaignTitle,
  setCampaignTitle,
  campaignGoal,
  setCampaignGoal,
  campaignDuration,
  setCampaignDuration,
  loading,
  handleCreateCampaign,
}: CreateCampaignProps) {
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  
  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { description: "", amount: "" },
    ]);
  };

  const updateMilestone = (
    index: number,
    field: keyof MilestoneInput,
    value: string
  ) => {
    setMilestones((current) =>
      current.map((milestone, i) =>
        i === index ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const removeMilestone = (index: number) => {
    setMilestones((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const submitCampaign = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validMilestones = milestones.filter(
      (milestone) =>
        milestone.description.trim() !== "" &&
        Number(milestone.amount) > 0
    );

    handleCreateCampaign(event, validMilestones);
  };

  return (
    <div className="create-campaign-page">
      <section className="campaign-section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">
              START SOMETHING MEANINGFUL
            </div>
            <h2>Create a campaign</h2>
            <p>
              Your campaign and its funding milestones will be connected
              to the FundChain blockchain.
            </p>
          </div>
        </div>

        <form className="create-form" onSubmit={submitCampaign}>
          <label htmlFor="campaign-title">Campaign title</label>
          <input
            id="campaign-title"
            value={campaignTitle}
            onChange={(e) => setCampaignTitle(e.target.value)}
            placeholder="Enter your campaign title"
            required
          />

          <label htmlFor="campaign-goal">Funding goal (ETH)</label>
          <input
            id="campaign-goal"
            type="number"
            min="0.000000000000000001"
            step="any"
            value={campaignGoal}
            onChange={(e) => setCampaignGoal(e.target.value)}
            placeholder="Example: 2"
            required
          />

          <label htmlFor="campaign-duration">Duration (days)</label>
          <input
            id="campaign-duration"
            type="number"
            min="1"
            step="1"
            value={campaignDuration}
            onChange={(e) => setCampaignDuration(e.target.value)}
            required
          />

          <div className="milestone-form-section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">
                  TRANSPARENT FUND RELEASES
                </div>
                <h3>Plan your milestones</h3>
                <p>
                  Divide your funding goal into stages and explain
                  how the funds will be used.
                </p>
              </div>
            </div>

            {milestones.map((milestone, index) => (
              <div className="milestone-input-card" key={index}>
                <div className="milestone-input-heading">
                  <strong>Milestone {index + 1}</strong>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => removeMilestone(index)}
                    aria-label={`Remove milestone ${index + 1}`}
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>

                <label htmlFor={`milestone-description-${index}`}>
                  Milestone description
                </label>
                <input
                  id={`milestone-description-${index}`}
                  value={milestone.description}
                  onChange={(e) =>
                    updateMilestone(index, "description", e.target.value)
                  }
                  placeholder="Example: Purchase construction materials"
                  required
                />

                <label htmlFor={`milestone-amount-${index}`}>
                  Milestone amount (ETH)
                </label>
                <input
                  id={`milestone-amount-${index}`}
                  type="number"
                  min="0.000000000000000001"
                  step="any"
                  value={milestone.amount}
                  onChange={(e) =>
                    updateMilestone(index, "amount", e.target.value)
                  }
                  placeholder="Example: 0.5"
                  required
                />
              </div>
            ))}

            <button
              type="button"
              className="secondary-button"
              onClick={addMilestone}
            >
              <Plus size={17} />
              Add milestone
            </button>

            {milestones.length === 0 && (
              <p className="milestone-empty-message">
                No milestones added yet. You can add them now or later.
              </p>
            )}
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : "Create campaign"}
            <ArrowRight size={17} />
          </button>
        </form>
      </section>
    </div>
  );
}

export default CreateCampaign;
