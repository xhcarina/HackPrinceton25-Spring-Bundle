#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
MicroLoan Risk Model - Simple Predictor Guide

This script demonstrates how to use the saved model (.pkl file) to make predictions
on new loan data. It provides a clear example that you can adapt for future use.
"""
from boost_model import MicroLoanRiskModelAdvanced
import pandas as pd
import pickle
import os

def load_model(model_path):
    """
    Load the saved model from a pickle file.
    
    Args:
        model_path: Path to the saved model pickle file
        
    Returns:
        The model instance that can be used for predictions
    """
    print(f"Loading model from {model_path}...")
    
    with open(model_path, 'rb') as f:
        model_dict = pickle.load(f)
        
    # Check if the instance is available in the saved dictionary
    if 'instance' in model_dict:
        print("Model instance found - this will simplify predictions")
        return model_dict['instance']
    else:
        # Fallback to components if no instance is available
        print("No model instance found, attempting to load components...")
        from MicroLoanRiskModelAdvanced import MicroLoanRiskModelAdvanced
        model = MicroLoanRiskModelAdvanced()
        model.model = model_dict['model']
        model.preprocessor = model_dict['preprocessor']
        model.feature_names = model_dict['feature_names']
        return model

def predict_loan_risk(model, loan_data):
    """
    Predict the risk score for new loan applications.
    
    Args:
        model: The loaded model instance
        loan_data: DataFrame with loan application data
        
    Returns:
        DataFrame with original data and predictions
    """
    # Make predictions
    print("Making predictions...")
    predictions = model.predict(loan_data)
    
    # Add predictions to the original data
    results = loan_data.copy()
    results['risk_score'] = predictions
    
    # Add risk categories
    results['risk_level'] = pd.cut(
        results['risk_score'],
        bins=[0, 50, 75, 100],
        labels=['High Risk', 'Medium Risk', 'Low Risk']
    )
    
    return results

def main():
    """
    Example of how to use the model to make predictions.
    """
    # Set paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'microloan_risk_model_advanced.pkl')
    
    # Check if model exists
    if not os.path.exists(model_path):
        print(f"Model file not found at {model_path}")
        return
    
    # Load the model
    model = load_model(model_path)
    
    # Create example loan data
    # IMPORTANT: Your data must include these 7 features
    example_loans = pd.DataFrame([
        {
            'sector': 'Agriculture',
            'location.country': 'Kenya',
            'location.geo.level': 'rural_area',
            'terms.disbursal_currency': 'KES',
            'terms.loan_amount': 500,
            'local_amount': 500,
            'amount': 500
        },
        {
            'sector': 'Retail',
            'location.country': 'Philippines',
            'location.geo.level': 'town',
            'terms.disbursal_currency': 'PHP',
            'terms.loan_amount': 1500,
            'local_amount': 1500,
            'amount': 1500
        },
        {
            'sector': 'Food',
            'location.country': 'Peru',
            'location.geo.level': 'city',
            'terms.disbursal_currency': 'USD',
            'terms.loan_amount': 3000,
            'local_amount': 3000,
            'amount': 3000
        }
    ])
    
    print("\nExample loan data:")
    print(example_loans)
    
    # Make predictions
    results = predict_loan_risk(model, example_loans)
    
    # Display detailed results with interpretation
    print("\n=== PREDICTION RESULTS ===")
    for i, row in results.iterrows():
        print(f"\nLoan Application #{i+1}:")
        print(f"  Sector: {row['sector']}")
        print(f"  Country: {row['location.country']}")
        print(f"  Geo Level: {row['location.geo.level']}")
        print(f"  Loan Amount: ${row['terms.loan_amount']:,.2f}")
        print(f"  Risk Score: {row['risk_score']:.2f} / 100")
        print(f"  Risk Level: {row['risk_level']}")
        
        # Add interpretation
        if row['risk_level'] == 'Low Risk':
            print("  Interpretation: This loan has a HIGH probability of being repaid.")
            print("  Recommendation: APPROVE - This loan appears to be a safe investment.")
        elif row['risk_level'] == 'Medium Risk':
            print("  Interpretation: This loan has a MODERATE probability of being repaid.")
            print("  Recommendation: REVIEW - Consider requesting additional information or collateral.")
        else:
            print("  Interpretation: This loan has a LOW probability of being repaid.")
            print("  Recommendation: DECLINE - This loan presents significant default risk.")
    
    # Add summary statistics
    print("\n=== SUMMARY STATISTICS ===")
    risk_counts = results['risk_level'].value_counts()
    for level, count in risk_counts.items():
        print(f"  {level}: {count} loan(s)")
    
    avg_score = results['risk_score'].mean()
    print(f"  Average Risk Score: {avg_score:.2f} / 100")
    
    print("\n=== HOW TO USE THIS MODEL IN THE FUTURE ===")
    print("1. Load the model using the load_model() function")
    print("2. Prepare your loan data with the 7 required features:")
    print("   - sector")
    print("   - location.country")
    print("   - location.geo.level")
    print("   - terms.disbursal_currency")
    print("   - terms.loan_amount")
    print("   - local_amount")
    print("   - amount")
    print("3. Call model.predict() on your data")
    print("4. A score closer to 100 means lower risk (higher probability of repayment)")
    print("5. A score closer to 0 means higher risk (higher probability of default)")
    
    print("\n=== SAMPLE CODE FOR FUTURE USE ===")
    print("""
    # Quick code snippet for making predictions
    import pandas as pd
    import pickle
    
    # 1. Load the model
    with open('microloan_risk_model_advanced.pkl', 'rb') as f:
        model_dict = pickle.load(f)
    model = model_dict['instance']
    
    # 2. Prepare your data (with the 7 required features)
    new_loans = pd.DataFrame([
        {
            'sector': 'Agriculture',
            'location.country': 'Kenya',
            'location.geo.level': 'rural_area',
            'terms.disbursal_currency': 'KES',
            'terms.loan_amount': 500,
            'local_amount': 500,
            'amount': 500
        }
    ])
    
    # 3. Make predictions
    predictions = model.predict(new_loans)
    
    # 4. Interpret results (examples)
    # Convert scores to risk levels
    risk_levels = ['High Risk' if score < 50 else 
                  'Medium Risk' if score < 75 else 
                  'Low Risk' for score in predictions]
    
    # Print results
    for i, (score, risk) in enumerate(zip(predictions, risk_levels)):
        print(f"Loan #{i+1}: Score = {score:.2f}, Risk Level = {risk}")
    """)

if __name__ == "__main__":
    main() 