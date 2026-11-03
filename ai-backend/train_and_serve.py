import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

# 1. Generate SYNTHETIC data with Trust & Milestone metrics
np.random.seed(42)
data = []
labels = []

for _ in range(5000):
    # Features: [progress %, days_left, backers, goal_eth, milestones_approved, total_milestones, creator_contributed]
    progress = np.random.uniform(0, 100)
    days_left = np.random.randint(0, 30)
    backers = np.random.randint(0, 100)
    goal = np.random.uniform(0.5, 10.0)
    total_milestones = np.random.randint(1, 6) # 1 to 5 milestones
    approved_milestones = np.random.randint(0, total_milestones + 1)
    creator_contributed = np.random.choice([0, 1]) # 0 = No, 1 = Yes
    
    # AI Logic for success (Trust is key!)
    # If they have lots of money but NO approved milestones, they might be a scam.
    # If they have milestones approved and the creator put money in, they are highly trusted.
    score = (progress * 0.3) + (backers * 0.2) + (approved_milestones * 15) + (creator_contributed * 20)
    
    if score > 60:
        label = 1 # Success
    else:
        label = 0 # Failure
        
    data.append([progress, days_left, backers, goal, approved_milestones, total_milestones, creator_contributed])
    labels.append(label)

# 2. Train the Random Forest
X = pd.DataFrame(data, columns=['progress', 'days_left', 'backers', 'goal', 'approved_milestones', 'total_milestones', 'creator_contributed'])
y = pd.Series(labels)
model = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
model.fit(X, y)

joblib.dump(model, 'fundchain_model.joblib')
print("Upgraded AI Model trained and saved!")

# 3. Create FastAPI App
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class CampaignData(BaseModel):
    progress: float
    days_left: int
    backers: int
    goal: float
    approved_milestones: int
    total_milestones: int
    creator_contributed: int

@app.post("/predict")
def predict(data: CampaignData):
    model = joblib.load('fundchain_model.joblib')
    
    # Features array for prediction
    features = [[
        data.progress, 
        data.days_left, 
        data.backers, 
        data.goal,
        data.approved_milestones,
        data.total_milestones,
        data.creator_contributed
    ]]
    
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1] * 100
    
    # Calculate a "Trust Score" based on milestone completion
    trust_score = 0
    if data.total_milestones > 0:
        trust_score = int((data.approved_milestones / data.total_milestones) * 100)
    
    return {
        "success": bool(prediction),
        "probability": round(probability, 2),
        "trust_score": trust_score
    }