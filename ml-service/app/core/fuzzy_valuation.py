import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

def evaluate_book_coin_value(condition_grade_score, original_price, edition_age, subject_demand):
    """
    Evaluates the BookCoin value using a Mamdani Fuzzy Inference System.
    
    Inputs:
    - Condition Grade (0-100)
    - Original Price (0-5000)
    - Edition Age (0-20 years)
    - Subject Demand (0-10)
    
    Output:
    - BookCoin Value Percentage (0-100% of original price)
    """
    
    # 1. Define Antecedents (Inputs) and Consequents (Outputs)
    condition = ctrl.Antecedent(np.arange(0, 101, 1), 'condition')
    price = ctrl.Antecedent(np.arange(0, 5001, 1), 'price')
    age = ctrl.Antecedent(np.arange(0, 21, 1), 'age')
    demand = ctrl.Antecedent(np.arange(0, 11, 1), 'demand')
    
    value_pct = ctrl.Consequent(np.arange(0, 101, 1), 'value_pct')
    
    # 2. Define Membership Functions
    # Condition: Worn (0-40), Fair (30-70), Good (60-90), Like New (80-100)
    condition['worn'] = fuzz.trapmf(condition.universe, [0, 0, 30, 45])
    condition['fair'] = fuzz.trimf(condition.universe, [30, 50, 70])
    condition['good'] = fuzz.trimf(condition.universe, [60, 75, 90])
    condition['like_new'] = fuzz.trapmf(condition.universe, [80, 90, 100, 100])
    
    # Price: Low (0-1000), Medium (500-2500), High (2000-5000)
    price['low'] = fuzz.trapmf(price.universe, [0, 0, 500, 1000])
    price['medium'] = fuzz.trimf(price.universe, [500, 1500, 2500])
    price['high'] = fuzz.trapmf(price.universe, [2000, 3000, 5000, 5000])
    
    # Age: New (0-3), Recent (2-7), Old (5-20)
    age['new'] = fuzz.trapmf(age.universe, [0, 0, 2, 4])
    age['recent'] = fuzz.trimf(age.universe, [2, 5, 8])
    age['old'] = fuzz.trapmf(age.universe, [6, 10, 20, 20])
    
    # Demand: Low (0-4), Medium (3-7), High (6-10)
    demand['low'] = fuzz.trapmf(demand.universe, [0, 0, 3, 5])
    demand['medium'] = fuzz.trimf(demand.universe, [3, 5, 7])
    demand['high'] = fuzz.trapmf(demand.universe, [6, 8, 10, 10])
    
    # Value Percentage: Low (0-40), Medium (30-70), High (60-100)
    value_pct['low'] = fuzz.trapmf(value_pct.universe, [0, 0, 30, 45])
    value_pct['medium'] = fuzz.trimf(value_pct.universe, [35, 50, 65])
    value_pct['high'] = fuzz.trapmf(value_pct.universe, [60, 80, 100, 100])
    
    # 3. Define Rules
    rule1 = ctrl.Rule(condition['like_new'] & age['new'] & demand['high'], value_pct['high'])
    rule2 = ctrl.Rule(condition['worn'] | demand['low'], value_pct['low'])
    rule3 = ctrl.Rule(condition['good'] & demand['medium'], value_pct['medium'])
    rule4 = ctrl.Rule(condition['fair'] & age['old'], value_pct['low'])
    rule5 = ctrl.Rule(condition['like_new'] & demand['medium'], value_pct['high'])
    rule6 = ctrl.Rule(condition['good'] & demand['high'], value_pct['high'])
    rule7 = ctrl.Rule(condition['fair'] & demand['high'], value_pct['medium'])
    rule8 = ctrl.Rule(age['old'] & demand['high'], value_pct['medium'])

    # 4. Control System Creation
    valuation_ctrl = ctrl.ControlSystem([
        rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8
    ])
    valuation_sim = ctrl.ControlSystemSimulation(valuation_ctrl)
    
    # 5. Provide Inputs
    valuation_sim.input['condition'] = condition_grade_score
    valuation_sim.input['price'] = original_price
    valuation_sim.input['age'] = edition_age
    valuation_sim.input['demand'] = subject_demand
    
    # 6. Compute
    try:
        valuation_sim.compute()
        pct = valuation_sim.output['value_pct']
    except Exception as e:
        # Fallback if rules don't cover a specific weird edge case
        pct = 50.0

    # Calculate final BookCoins, rounding to nearest 5
    raw_coins = original_price * (pct / 100.0)
    final_coins = max(10, round(raw_coins / 5) * 5)
    
    return {
        "calculated_coins": int(final_coins),
        "percentage_applied": round(pct, 2)
    }

# Example helper to map textual grade to a rough score (0-100)
def map_grade_to_score(grade_str: str) -> int:
    mapping = {
        'Like New': 95,
        'Good': 75,
        'Fair': 50,
        'Worn': 20
    }
    return mapping.get(grade_str, 50)
