#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
MicroLoan Risk Model - API Credit Prediction

This file provides a function to load the model and make predictions
from API data sent from a React frontend.
"""

import pandas as pd
import pickle
import os
import numpy as np
from boost_model import MicroLoanRiskModelAdvanced

# Global variable to store the loaded model
_model = None

def load_model_once(model_path=None):
    """Load the model once and cache it for future use"""
    global _model
    
    if _model is not None:
        return _model
        
    if model_path is None:
        # Default path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'microloan_risk_model_advanced.pkl')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    # Load the model
    with open(model_path, 'rb') as f:
        model_dict = pickle.load(f)
    
    # Get model instance
    if 'instance' in model_dict:
        _model = model_dict['instance']
    else:
        # Fallback if no instance is available
        from boost_model import MicroLoanRiskModelAdvanced
        _model = MicroLoanRiskModelAdvanced()
        _model.model = model_dict['model']
        _model.preprocessor = model_dict['preprocessor']
        _model.feature_names = model_dict['feature_names']
    
    return _model

def predict_credit_score(api_data):
    """
    Predict default probability from API data.
    
    Args:
        api_data (dict): JSON data from React frontend with the required fields:
            - sector
            - location.country
            - location.geo.level
            - terms.disbursal_currency
            - terms.loan_amount
            - local_amount
            - amount
    
    Returns:
        float: The predicted default probability (0-1, where 1 = 100% probability of default)
    """
    try:
        # Load model if not already loaded
        model = load_model_once()
        
        # Validate required fields
        required_fields = [
            'sector', 
            'location.country', 
            'location.geo.level', 
            'terms.disbursal_currency',
            'terms.loan_amount', 
            'local_amount', 
            'amount'
        ]
        
        for field in required_fields:
            if field not in api_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Convert to DataFrame (required format for model)
        df = pd.DataFrame([api_data])
        
        # Make prediction - model returns a credit score (0-100)
        credit_score = model.predict(df)[0]
        
        # Return single score value
        return float(credit_score)
        
    except Exception as e:
        # Log the error
        print(f"Error predicting credit score: {str(e)}")
        # Return a default value or re-raise
        raise

