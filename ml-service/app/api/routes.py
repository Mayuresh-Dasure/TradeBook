from fastapi import APIRouter
from pydantic import BaseModel
from app.core.fuzzy_valuation import evaluate_book_coin_value, map_grade_to_score
from app.core.fuzzy_trust import evaluate_trust_score

router = APIRouter()

class ValuationRequest(BaseModel):
    condition_grade: str
    original_price: float
    edition_age: int = 1
    subject_demand: int = 5

@router.post("/valuation")
def get_valuation(req: ValuationRequest):
    condition_score = map_grade_to_score(req.condition_grade)
    
    result = evaluate_book_coin_value(
        condition_grade_score=condition_score,
        original_price=req.original_price,
        edition_age=req.edition_age,
        subject_demand=req.subject_demand
    )
    
    return {
        "status": "success",
        "data": result
    }

class TrustRequest(BaseModel):
    avg_rating: float
    tx_count: int
    dispute_rate: float
    account_age_days: int

@router.post("/trust")
def get_trust_score(req: TrustRequest):
    trust = evaluate_trust_score(
        avg_rating=req.avg_rating,
        tx_count=req.tx_count,
        dispute_rate=req.dispute_rate,
        account_age_days=req.account_age_days
    )
    
    return {
        "status": "success",
        "data": {
            "trust_score": trust
        }
    }

class RecommendRequest(BaseModel):
    user_features: list[float]  # length 5
    books: list[dict] # list of dicts with 'id' and 'features' (length 5)

@router.post("/recommend")
def get_recommendations(req: RecommendRequest):
    import os
    import torch
    from app.core.ann_recommendation import RecommendationANN
    
    # Load model
    model = RecommendationANN(input_dim=10)
    model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "ann_model.pth")
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, weights_only=True))
    model.eval()
    
    results = []
    with torch.no_grad():
        for book in req.books:
            features = req.user_features + book['features']
            if len(features) != 10:
                continue
                
            x = torch.tensor([features], dtype=torch.float32)
            prob = model(x).item()
            results.append({
                "book_id": book['id'],
                "match_probability": round(prob, 4)
            })
            
    # Sort books by probability descending
    results.sort(key=lambda x: x["match_probability"], reverse=True)
    
    return {
        "status": "success",
        "data": results
    }
