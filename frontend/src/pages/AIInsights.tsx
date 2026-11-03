import { useState } from "react";
import { formatEther } from "viem";
import { Sparkles, Brain, ShieldCheck } from "lucide-react";
import { publicClient, CONTRACT_ABI, CONTRACT_ADDRESS } from "../contract";

type Campaign = {
  id: number;
  title: string;
  creator: string;
  goal: bigint;
  raised: bigint;
  deadline: bigint;
  backers: bigint;
  completed: boolean;
};

type AIInsightsProps = {
  campaigns: Campaign[];
};

function AIInsights({ campaigns }: AIInsightsProps) {
  const [selectedId, setSelectedId] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    trustScore: number;
    status: "High" | "Moderate" | "Low";
    advice: string[];
  } | null>(null);

  const selectedCampaign = campaigns.find((c) => String(c.id) === selectedId);

  const runAnalysis = async () => {
    if (!selectedCampaign) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const goal = Number(formatEther(selectedCampaign.goal));
      const raised = Number(formatEther(selectedCampaign.raised));
      const backers = Number(selectedCampaign.backers);
      const progress = goal > 0 ? (raised / goal) * 100 : 0;
      const daysLeft = Math.max(0, Math.ceil((Number(selectedCampaign.deadline) - Date.now() / 1000) / 86400));

      // 1. Fetch Milestones to calculate Trust
      const count = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "milestoneCount",
        args: [BigInt(selectedCampaign.id)],
      });

      let approvedCount = 0;
      const totalMilestones = Number(count);

      for (let i = 1n; i <= count; i++) {
        const m = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "milestones",
          args: [BigInt(selectedCampaign.id), i],
        });
        // m[5] is the 'approved' boolean
        if (m[5]) approvedCount++;
      }

      // 2. Check if the Creator contributed (Skin in the game)
      const creatorContribution = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "contributions",
        args: [BigInt(selectedCampaign.id), selectedCampaign.creator as `0x${string}`],
      });
      const creatorContributed = creatorContribution > 0n ? 1 : 0;

      // 3. Send ALL data to Python AI
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress: progress,
          days_left: daysLeft,
          backers: backers,
          goal: goal,
          approved_milestones: approvedCount,
          total_milestones: totalMilestones,
          creator_contributed: creatorContributed
        })
      });
      
      const mlResult = await response.json();
      const score = Math.round(mlResult.probability);
      const trustScore = mlResult.trust_score;

      // 4. Generate Advice based on Trust + Money
      const advice: string[] = [];

      if (trustScore === 100 && score > 60) {
        advice.push("🌟 The AI highly trusts this campaign. Milestones are approved, and funding is strong.");
      } else if (creatorContributed === 1) {
        advice.push("🤝 The creator has contributed their own funds. This shows strong commitment.");
      } else if (totalMilestones > 0 && approvedCount === 0) {
        advice.push("🛑 Warning: The creator has not completed any milestones yet. Trust is currently low.");
      }

      if (score > 75) {
        advice.push("✅ High probability of success based on current funding velocity.");
      } else if (score > 40) {
        advice.push(`📈 Moderate success. You need to raise ~${(goal - raised).toFixed(2)} ETH in ${daysLeft} days.`);
      } else {
        advice.push("⚠️ High risk of failure. Funding velocity is too low.");
        advice.push("📢 Promote this on social media to increase backers.");
      }

      setResult({
        score,
        trustScore,
        status: score > 70 ? "High" : score > 40 ? "Moderate" : "Low",
        advice,
      });
    } catch (error) {
      console.error("AI Error:", error);
      alert("Error connecting to AI backend. Make sure Python is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="campaign-section">
      <div className="section-kicker">INTELLIGENCE LAYER</div>
      <h2>AI Funding & Trust Predictions</h2>
      <p>
        Our Machine Learning model analyzes financial velocity, milestone completion, 
        and creator commitment to predict success.
      </p>

      <div className="ai-dashboard" style={{ marginTop: '30px' }}>
        <div className="form-group">
          <label>Select a campaign to analyze</label>
          <select
            className="milestone-select"
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setResult(null); }}
          >
            <option value="">Choose a campaign...</option>
            {campaigns.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.title}</option>
            ))}
          </select>
        </div>

        {selectedCampaign && (
          <div style={{ marginTop: '20px' }}>
            <button className="primary-button" onClick={runAnalysis} disabled={isAnalyzing}>
              <Brain size={18} style={{ marginRight: '8px' }} />
              {isAnalyzing ? "AI is analyzing..." : "Run AI Prediction"}
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="ai-loading" style={{ marginTop: '30px', color: '#a78bfa' }}>
            <span className="spinner" style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
            {" "} Processing trust metrics & funding data...
          </div>
        )}

        {result && !isAnalyzing && (
          <div className="ai-result-card" style={{ marginTop: '30px', padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            
            {/* Score Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff' }}>Success Probability</h3>
                <span style={{ color: '#b8b8c8', fontSize: '14px' }}>Generated by Python Random Forest</span>
              </div>
              <div style={{
                fontSize: '24px', fontWeight: 'bold', padding: '8px 16px', borderRadius: '8px',
                background: result.status === 'High' ? 'rgba(34, 197, 94, 0.2)' : result.status === 'Moderate' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: result.status === 'High' ? '#4ade80' : result.status === 'Moderate' ? '#facc15' : '#f87171'
              }}>
                {result.score}%
              </div>
            </div>

            <div className="progress-track" style={{ marginBottom: '24px' }}>
              <div className="progress-fill" style={{ width: `${result.score}%`, background: result.status === 'High' ? '#4ade80' : result.status === 'Moderate' ? '#facc15' : '#f87171' }} />
            </div>

            {/* Trust Score Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '30px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#a78bfa" /> Trust Score
                </h3>
                <span style={{ color: '#b8b8c8', fontSize: '14px' }}>Based on milestone approvals</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#a78bfa' }}>
                {result.trustScore}%
              </div>
            </div>

            <div className="progress-track" style={{ marginBottom: '24px' }}>
              <div className="progress-fill" style={{ width: `${result.trustScore}%`, background: '#8b5cf6' }} />
            </div>

            {/* Advice */}
            <h4 style={{ color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#a78bfa" /> AI Recommendations
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.advice.map((item, index) => (
                <li key={index} style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: '#e6e6f0', fontSize: '14px', borderLeft: '3px solid #8b5cf6', textAlign: 'left' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </section>
  );
}

export default AIInsights;