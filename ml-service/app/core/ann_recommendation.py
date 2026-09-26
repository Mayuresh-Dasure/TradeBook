import torch
import torch.nn as nn
import torch.nn.functional as F

class RecommendationANN(nn.Module):
    """
    Feedforward Neural Network for Ranking Textbook Recommendations.
    
    Inputs (Feature Vector size 10):
    - User Category Preference Vector (e.g. Science, Arts, Engineering) - 4 features
    - User Historical Price Preference (average coin value) - 1 feature
    - Book Category One-Hot - 4 features
    - Book Price (coin value) - 1 feature
    
    Output:
    - Probability (0.0 to 1.0) that the user will transact on this book.
    """
    def __init__(self, input_dim=10):
        super(RecommendationANN, self).__init__()
        # 3-layer architecture
        self.fc1 = nn.Linear(input_dim, 16)
        self.fc2 = nn.Linear(16, 8)
        self.fc3 = nn.Linear(8, 1)
        
        # Dropout for regularization
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = torch.sigmoid(self.fc3(x))
        return x
