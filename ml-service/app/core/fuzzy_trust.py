import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

def evaluate_trust_score(avg_rating: float, tx_count: int, dispute_rate: float, account_age_days: int) -> float:
    """
    Evaluates a User's Trust Score using a Mamdani Fuzzy Inference System.
    
    Inputs:
    - Average Rating (1.0 to 5.0)
    - Transaction Count (0 to 100)
    - Dispute Rate (0.0 to 1.0)
    - Account Age in Days (0 to 1000)
    
    Output:
    - Trust Score (0.0 to 5.0)
    """
    
    # 1. Define Antecedents (Inputs) and Consequents (Outputs)
    rating = ctrl.Antecedent(np.arange(1.0, 5.1, 0.1), 'rating')
    txs = ctrl.Antecedent(np.arange(0, 101, 1), 'txs')
    disputes = ctrl.Antecedent(np.arange(0.0, 1.01, 0.05), 'disputes')
    age = ctrl.Antecedent(np.arange(0, 1001, 1), 'age')
    
    trust = ctrl.Consequent(np.arange(0.0, 5.1, 0.1), 'trust')
    
    # 2. Define Membership Functions
    # Rating: Low (1-3), Medium (2.5-4.5), High (4-5)
    rating['low'] = fuzz.trapmf(rating.universe, [1.0, 1.0, 2.5, 3.5])
    rating['medium'] = fuzz.trimf(rating.universe, [2.5, 3.5, 4.5])
    rating['high'] = fuzz.trapmf(rating.universe, [4.0, 4.5, 5.0, 5.0])
    
    # Transactions: Beginner (0-10), Intermediate (5-30), Veteran (25-100)
    txs['beginner'] = fuzz.trapmf(txs.universe, [0, 0, 5, 15])
    txs['intermediate'] = fuzz.trimf(txs.universe, [5, 20, 35])
    txs['veteran'] = fuzz.trapmf(txs.universe, [25, 40, 100, 100])
    
    # Disputes: Safe (0-0.1), Risky (0.05-0.3), Danger (0.2-1.0)
    disputes['safe'] = fuzz.trapmf(disputes.universe, [0.0, 0.0, 0.05, 0.15])
    disputes['risky'] = fuzz.trimf(disputes.universe, [0.05, 0.2, 0.35])
    disputes['danger'] = fuzz.trapmf(disputes.universe, [0.25, 0.4, 1.0, 1.0])
    
    # Age: New (0-30), Established (20-180), Old (150-1000)
    age['new'] = fuzz.trapmf(age.universe, [0, 0, 20, 40])
    age['established'] = fuzz.trimf(age.universe, [20, 90, 200])
    age['old'] = fuzz.trapmf(age.universe, [150, 300, 1000, 1000])
    
    # Trust Score Output: Poor (0-2.5), Average (2-4), Excellent (3.5-5.0)
    trust['poor'] = fuzz.trapmf(trust.universe, [0.0, 0.0, 1.5, 2.5])
    trust['average'] = fuzz.trimf(trust.universe, [2.0, 3.0, 4.0])
    trust['excellent'] = fuzz.trapmf(trust.universe, [3.5, 4.5, 5.0, 5.0])
    
    # 3. Define Rules
    rule1 = ctrl.Rule(rating['high'] & disputes['safe'] & txs['veteran'], trust['excellent'])
    rule2 = ctrl.Rule(disputes['danger'], trust['poor'])
    rule3 = ctrl.Rule(rating['low'], trust['poor'])
    rule4 = ctrl.Rule(rating['medium'] & disputes['safe'], trust['average'])
    rule5 = ctrl.Rule(age['new'] & txs['beginner'], trust['average'])
    rule6 = ctrl.Rule(rating['high'] & txs['beginner'] & disputes['safe'], trust['excellent'])
    rule7 = ctrl.Rule(rating['medium'] & disputes['risky'], trust['poor'])
    rule8 = ctrl.Rule(age['old'] & disputes['safe'] & rating['high'], trust['excellent'])

    # 4. Control System Creation
    trust_ctrl = ctrl.ControlSystem([
        rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8
    ])
    trust_sim = ctrl.ControlSystemSimulation(trust_ctrl)
    
    # 5. Provide Inputs
    trust_sim.input['rating'] = min(max(avg_rating, 1.0), 5.0)
    trust_sim.input['txs'] = min(max(tx_count, 0), 100)
    trust_sim.input['disputes'] = min(max(dispute_rate, 0.0), 1.0)
    trust_sim.input['age'] = min(max(account_age_days, 0), 1000)
    
    # 6. Compute
    try:
        trust_sim.compute()
        final_trust = trust_sim.output['trust']
    except Exception as e:
        # Fallback if unhandled
        final_trust = 2.5
        
    return round(float(final_trust), 2)
