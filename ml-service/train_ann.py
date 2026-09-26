import os
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Must be set BEFORE importing pyplot
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score, precision_score, recall_score
from app.core.ann_recommendation import RecommendationANN

def generate_synthetic_data(num_samples=1000):
    """
    Generates synthetic data for training the recommendation engine.
    Feature vector: [user_cat_0, user_cat_1, user_cat_2, user_cat_3, user_price_pref, 
                     book_cat_0, book_cat_1, book_cat_2, book_cat_3, book_price]
    """
    np.random.seed(42)
    X = np.random.rand(num_samples, 10)
    
    # Target label generation (simulate logic where matching categories and close price = 1)
    y = np.zeros((num_samples, 1))
    for i in range(num_samples):
        # Category match score (dot product of user pref and book category)
        cat_match = np.dot(X[i, 0:4], X[i, 5:9])
        
        # Price distance
        price_diff = abs(X[i, 4] - X[i, 9])
        
        # Logic: High category match and low price difference => high probability of transaction
        score = cat_match - (price_diff * 1.5)
        
        # Add some noise
        score += np.random.normal(0, 0.2)
        
        y[i, 0] = 1.0 if score > 0.5 else 0.0
        
    return torch.tensor(X, dtype=torch.float32), torch.tensor(y, dtype=torch.float32)

def train_model():
    print("Generating synthetic data...")
    X_train, y_train = generate_synthetic_data(2000)
    X_test, y_test = generate_synthetic_data(500)
    
    model = RecommendationANN(input_dim=10)
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    
    epochs = 150
    losses = []
    
    print("Training started...")
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()
        
        losses.append(loss.item())
        
        if (epoch+1) % 30 == 0:
            print(f"Epoch {epoch+1}/{epochs}, Loss: {loss.item():.4f}")
            
    # Evaluation
    model.eval()
    with torch.no_grad():
        test_outputs = model(X_test)
        predictions = (test_outputs.numpy() > 0.5).astype(float)
        y_true = y_test.numpy()
        
        acc = accuracy_score(y_true, predictions)
        prec = precision_score(y_true, predictions, zero_division=0)
        rec = recall_score(y_true, predictions, zero_division=0)
        
    print("\n--- Evaluation Metrics ---")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    
    # Save Model
    model_path = os.path.join(os.path.dirname(__file__), "ann_model.pth")
    torch.save(model.state_dict(), model_path)
    print(f"\nModel saved to {model_path}")
    
    # Ensure matplotlib uses a non-interactive backend
    import matplotlib
    matplotlib.use('Agg')
    
    # Plot loss curve
    plt.figure(figsize=(8, 5))
    plt.plot(losses, label='Training Loss')
    plt.title('ANN Training Loss Curve')
    plt.xlabel('Epochs')
    plt.ylabel('Binary Cross-Entropy Loss')
    plt.legend()
    plt.grid(True)
    
    plot_path = os.path.join(os.path.dirname(__file__), "loss_curve.png")
    plt.savefig(plot_path)
    print(f"Loss curve saved to {plot_path}")
    
    # Write metrics summary next to this script
    artifact_content = f"""
# Module 3: ANN Recommendation Metrics

**Architecture**: Feedforward Neural Network (PyTorch)
**Layers**: [10 (Input) -> 16 (ReLU) -> Dropout(0.2) -> 8 (ReLU) -> 1 (Sigmoid)]
**Loss Function**: Binary Cross-Entropy (BCE)
**Optimizer**: Adam (lr=0.01)

### Evaluation on Synthetic Validation Set (N=500)
- **Accuracy**: `{acc:.4f}`
- **Precision**: `{prec:.4f}`
- **Recall**: `{rec:.4f}`

![Loss Curve]({plot_path})
"""
    artifact_path = os.path.join(os.path.dirname(__file__), "ann_metrics.md")
    with open(artifact_path, "w") as f:
        f.write(artifact_content)
    print(f"Metrics saved to {artifact_path}")
        
if __name__ == "__main__":
    train_model()
