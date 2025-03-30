import pandas as pd
import numpy as np
from datetime import date
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.metrics import r2_score, roc_auc_score, accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

# ----------------------------------------
# Helper Functions
# ----------------------------------------
def day2num(t):
    """
    Convert a date in YYYYMMDD format to the number of days since 1900-01-01.
    """
    try:
        t = int(t)
        year = t // 10000
        month = (t // 100) % 100
        day = t % 100
        d0 = date(1900, 1, 1)
        d = date(year, month, day)
        return (d - d0).days
    except Exception:
        return np.nan

def extract_year(t):
    try:
        t = int(t)
        return t // 10000
    except Exception:
        return np.nan

def extract_month(t):
    try:
        t = int(t)
        return (t // 100) % 100
    except Exception:
        return np.nan

def convert_country(country):
    """
    Convert country names to standardized two-letter codes.
    Extend the mapping as necessary.
    """
    mapping = {
        'United States': 'US',
        'Canada': 'CA',
        'United Kingdom': 'UK'
        # Extend as needed.
    }
    if pd.isna(country):
        return country
    return mapping.get(country, country[:2].upper())

def derive_binary_gender(gender):
    """
    Create a binary indicator for female.
    Assumes that if the string contains 'female' (case-insensitive), then it's 1; otherwise 0.
    """
    if pd.isna(gender):
        return 0
    return 1 if 'female' in str(gender).lower() else 0

# ----------------------------------------
# Main Script
# ----------------------------------------
def main():
    """Main function to train the risk model"""
    try:
        print("Loading and preprocessing data...")
        # Load the training and testing datasets
        df_train = pd.read_csv("loan_data_train.csv")
        df_test = pd.read_csv("loan_data_test.csv")
        
        print(f"Training data size: {len(df_train)} records")
        print(f"Testing data size: {len(df_test)} records")
        
        # Process training data
        df_train['default_flag'] = df_train['status'].apply(lambda x: 1 if 'default' in str(x).lower() else 0)
        df_test['default_flag'] = df_test['status'].apply(lambda x: 1 if 'default' in str(x).lower() else 0)
        
        # Process categorical variables
        categorical_cols = ['sector', 'location.country', 'terms.disbursal_currency']
        label_encoders = {}
        
        # Fit encoders on training data only
        for col in categorical_cols:
            if col in df_train.columns:
                # Calculate risk score for each category based on historical default rates
                risk_scores = df_train.groupby(col)['default_flag'].mean().map(lambda x: 1 - x)
                df_train[f'{col}_risk'] = df_train[col].map(risk_scores)
                df_test[f'{col}_risk'] = df_test[col].map(risk_scores)
                
                # Also encode categories for model training
                label_encoders[col] = LabelEncoder()
                label_encoders[col].fit(pd.concat([df_train[col], df_test[col]]).astype(str).unique())
                df_train[f'{col}_encoded'] = label_encoders[col].transform(df_train[col].astype(str))
                df_test[f'{col}_encoded'] = label_encoders[col].transform(df_test[col].astype(str))
        
        # Process numeric variables
        numeric_cols = [
            'funded_amount', 'paid_amount', 'amount',
            'lat', 'lon', 'terms.disbursal_amount', 'terms.loan_amount'
        ]
        
        # Add engineered features to both datasets
        for df in [df_train, df_test]:
            df['is_female'] = df['borrowers.gender'].apply(lambda x: 1 if 'female' in str(x).lower() else 0)
            df['borrower_pictured'] = df['borrowers.pictured'].astype(int)
            df['delinquent'] = df['delinquent'].astype(int)
            
            # Extract year and month from disbursal date
            df['disbursal_year'] = pd.to_datetime(df['terms.disbursal_date'], format='%Y%m%d').dt.year
            df['disbursal_month'] = pd.to_datetime(df['terms.disbursal_date'], format='%Y%m%d').dt.month
            
            # Calculate repayment ratio
            df['repayment_ratio'] = df['paid_amount'] / df['terms.loan_amount']
        
        # Prepare features for model
        feature_cols = (
            numeric_cols +
            [f'{col}_risk' for col in categorical_cols] +
            [f'{col}_encoded' for col in categorical_cols] +
            ['is_female', 'borrower_pictured', 'delinquent', 
             'disbursal_year', 'disbursal_month', 'repayment_ratio']
        )
        
        # Remove any columns that don't exist
        feature_cols = [col for col in feature_cols if col in df_train.columns]
        
        print("\nFeatures used in model:")
        for col in feature_cols:
            print(f"- {col}")
        
        # Prepare training and testing data
        X_train = df_train[feature_cols].copy()
        y_train = df_train['default_flag']
        X_test = df_test[feature_cols].copy()
        y_test = df_test['default_flag']
        
        # Fill missing values using training data statistics
        train_means = X_train.mean()
        X_train = X_train.fillna(train_means)
        X_test = X_test.fillna(train_means)
        
        print("\nTraining Random Forest model...")
        
        # Initialize and train Random Forest model with optimized parameters
        rf_params = {
            'n_estimators': 100,
            'max_depth': 10,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'random_state': 42,
            'n_jobs': -1  # Use all available cores
        }
        
        model = RandomForestClassifier(**rf_params)
        model.fit(X_train, y_train)
        
        # Perform cross-validation on training data
        print("\nPerforming cross-validation...")
        cv = KFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring='r2')
        print(f"Cross-validation R² scores: {cv_scores}")
        print(f"Mean R² score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        # Calculate metrics on test set
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        test_accuracy = accuracy_score(y_test, y_pred)
        test_auc = roc_auc_score(y_test, y_pred_proba)
        test_r2 = r2_score(y_test, y_pred_proba)
        
        print("\nTest Set Metrics:")
        print(f"Accuracy: {test_accuracy:.4f}")
        print(f"ROC AUC: {test_auc:.4f}")
        print(f"R²: {test_r2:.4f}")
        
        # Get feature importance
        importance = model.feature_importances_
        feature_importance = pd.DataFrame({
            'feature': feature_cols,
            'importance': importance
        })
        feature_importance = feature_importance.sort_values('importance', ascending=False)
        
        print("\nTop 10 Most Important Features:")
        print(feature_importance.head(10))
        
        # Save feature importance
        feature_importance.to_csv('feature_importance.csv', index=False)
        print("\nFeature importance saved to feature_importance.csv")
        
        # Save model and metadata
        model_data = {
            'model': model,
            'feature_names': feature_cols,
            'label_encoders': label_encoders,
            'metrics': {
                'cv_r2_mean': cv_scores.mean(),
                'cv_r2_std': cv_scores.std(),
                'test_accuracy': test_accuracy,
                'test_auc': test_auc,
                'test_r2': test_r2
            }
        }
        
        with open('random_forest_risk_model.pkl', 'wb') as f:
            joblib.dump(model_data, f)
        print("\nModel and metadata saved to random_forest_risk_model.pkl")
        
        return 0
        
    except Exception as e:
        print(f"Error during model training: {str(e)}")
        return 1

if __name__ == "__main__":
    main()
