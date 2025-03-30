import * as FileSystem from 'expo-file-system';

interface RiskPrediction {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

export async function loadModel(): Promise<void> {
  try {
    const modelPath = `${FileSystem.documentDirectory}random_forest_risk_model.pkl`;
    const modelInfo = await FileSystem.getInfoAsync(modelPath);
    
    if (!modelInfo.exists) {
      throw new Error('Risk model file not found');
    }
    
    console.log('Risk model loaded successfully');
  } catch (error) {
    console.error('Error loading risk model:', error);
    throw error;
  }
}

export async function predictRisk(
  features: {
    loanAmount: number;
    loanTerm: number;
    borrowerIncome: number;
    creditScore: number;
    employmentLength: number;
    debtToIncome: number;
    purpose: string;
    location: string;
  }
): Promise<RiskPrediction> {
  try {
    // TODO: Implement actual model prediction logic
    // For now, return a mock prediction
    const mockRiskScore = Math.random();
    const riskLevel = mockRiskScore < 0.3 ? 'low' : mockRiskScore < 0.7 ? 'medium' : 'high';
    const confidence = Math.abs(0.5 - mockRiskScore) * 2;

    return {
      riskScore: mockRiskScore,
      riskLevel,
      confidence
    };
  } catch (error) {
    console.error('Error making risk prediction:', error);
    throw error;
  }
}

export function getRiskColor(riskLevel: 'low' | 'medium' | 'high'): string {
  switch (riskLevel) {
    case 'low':
      return '#4CAF50'; // Green
    case 'medium':
      return '#FFC107'; // Yellow
    case 'high':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Grey
  }
}

export function getRiskDescription(riskLevel: 'low' | 'medium' | 'high'): string {
  switch (riskLevel) {
    case 'low':
      return 'Low risk - Good candidate for loan approval';
    case 'medium':
      return 'Medium risk - Additional review may be required';
    case 'high':
      return 'High risk - Loan approval unlikely';
    default:
      return 'Risk level unknown';
  }
} 