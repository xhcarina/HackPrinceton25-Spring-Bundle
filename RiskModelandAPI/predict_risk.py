#!/usr/bin/env python
# -*- coding: utf-8 -*-

import joblib
import pandas as pd
import numpy as np
import os
import pickle
from datetime import datetime

def load_model():
    """Load the trained model and metadata"""
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'random_forest_risk_model.pkl')
        model_data = joblib.load(model_path)
        print("Model loaded successfully")
        return model_data
    except FileNotFoundError:
        raise FileNotFoundError(f"Model file not found at {model_path}")

def get_sample_loan():
    """Return a sample loan for testing"""
    return {
        'funded_amount': 1000,
        'paid_amount': 100,
        'amount': 1000,
        'sector': 'Retail',
        'borrowers.gender': 'male',
        'borrowers.pictured': 0,
        'delinquent': 1,
        'lat': 1454343.7565,
        'lon': 12345432341.0583,
        'location.country': 'Philippines',
        'terms.disbursal_date': 20100602,
        'terms.disbursal_amount': 1000,
        'terms.disbursal_currency': 'PHP',
        'terms.loan_amount': 1000
    }

def compute_risk_score(model_data, loan_data):
    """Compute risk score for a loan"""
    try:
        # Convert loan data to DataFrame
        df = pd.DataFrame([loan_data])
        
        # Get model components
        model = model_data['model']
        feature_names = model_data['feature_names']
        label_encoders = model_data['label_encoders']
        
        # Process categorical variables
        categorical_cols = ['sector', 'location.country', 'terms.disbursal_currency']
        
        # Calculate risk scores and encode categories
        for col in categorical_cols:
            if col in df.columns:
                # Transform using label encoders
                df[f'{col}_encoded'] = label_encoders[col].transform(df[col].astype(str))
                
                # Add risk scores (if available in training data)
                if f'{col}_risk' in feature_names:
                    df[f'{col}_risk'] = 0.5  # Use default risk score since we don't have historical data
        
        # Add engineered features
        df['is_female'] = df['borrowers.gender'].apply(lambda x: 1 if 'female' in str(x).lower() else 0)
        df['borrower_pictured'] = df['borrowers.pictured'].astype(int)
        df['delinquent'] = df['delinquent'].astype(int)
        
        # Extract year and month from disbursal date
        df['disbursal_year'] = pd.to_datetime(df['terms.disbursal_date'], format='%Y%m%d').dt.year
        df['disbursal_month'] = pd.to_datetime(df['terms.disbursal_date'], format='%Y%m%d').dt.month
        
        # Calculate repayment ratio
        df['repayment_ratio'] = df['paid_amount'] / df['terms.loan_amount']
        
        # Select and order features according to model's expectations
        X = df[feature_names].copy()
        
        # Fill missing values with 0
        X = X.fillna(0)
        
        # Get probability of default
        default_prob = model.predict_proba(X)[0, 1]
        
        # Convert to risk score (0-100, where 100 is lowest risk)
        risk_score = 100 * (1 - default_prob)
        
        # Determine risk category
        if risk_score >= 80:
            risk_category = "Low Risk"
        elif risk_score >= 50:
            risk_category = "Medium Risk"
        else:
            risk_category = "High Risk"
        
        # Get feature importances for this prediction
        importances = pd.DataFrame({
            'feature': feature_names,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        return {
            'risk_score': risk_score,
            'risk_category': risk_category,
            'default_probability': default_prob,
            'top_factors': importances.head(5).to_dict('records')
        }
        
    except Exception as e:
        raise Exception(f"Error computing risk score: {str(e)}")

def main():
    try:
        # Load model
        print("Loading model...")
        model_data = load_model()
        
        # Get sample loan data
        loan_data = get_sample_loan()
        print("\nSample loan data:")
        for key, value in loan_data.items():
            print(f"- {key}: {value}")
        
        # Compute risk score
        print("\nComputing risk score...")
        result = compute_risk_score(model_data, loan_data)
        
        print("\nRisk Assessment Results:")
        print(f"Risk Score: {result['risk_score']:.2f}/100")
        print(f"Risk Category: {result['risk_category']}")
        print(f"Default Probability: {result['default_probability']:.2%}")
        
        print("\nTop Contributing Factors:")
        for factor in result['top_factors']:
            print(f"- {factor['feature']}: {factor['importance']:.4f}")
        
        return 0
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1

if __name__ == "__main__":
    main() 