#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
MicroLoan Risk Model – Advanced Version

This model uses a fixed set of features (without additional feature engineering) and adopts:
  - An advanced preprocessing pipeline (using ColumnTransformer, Pipelines, and various transformers)
  - Two-stage hyperparameter tuning (RandomizedSearchCV followed by GridSearchCV)
  - SHAP-based model explanation and feature importance visualization
  - A regression approach that maps "paid" loans to a score of 100 and "defaulted" loans to 0

The output is a credit score on a 0-100 scale.
"""

import os
import pickle
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import xgboost as xgb
import shap
from sklearn.model_selection import train_test_split, RandomizedSearchCV, GridSearchCV
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import PowerTransformer, OneHotEncoder
import warnings
warnings.filterwarnings('ignore')



# Set up plotting style
plt.style.use('ggplot')
sns.set(style='whitegrid')

class MicroLoanRiskModelAdvanced:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.preprocessor = None
        self.feature_names = None
        self.model_metrics = {}
        self.calibration = None  # Could hold any calibration info if used

    def load_data(self, filepath='loan_data.csv', encoding='latin1'):
        """Load the loan data file."""
        print(f"Loading data from {filepath}...")
        try:
            if not os.path.exists(filepath):
                raise FileNotFoundError(f"File {filepath} not found.")
            else:
                df = pd.read_csv(filepath, encoding=encoding, low_memory=False)
                print(f"Data loaded with {df.shape[0]} rows and {df.shape[1]} columns")
                return df
        except Exception as e:
            raise Exception(f"Error loading data: {str(e)}")

    def clean_data(self, df):
        """
        Perform minimal cleaning:
          - Convert date columns to datetime.
          - Create the target variable: map status "paid" -> 100 and "defaulted" -> 0.
          - Ensure key numeric columns are numeric and fill missing values.
          - Convert selected categorical columns to strings.
        """
        df_clean = df.copy()

        # Convert disbursal date if available
        if 'terms.disbursal_date' in df_clean.columns:
            df_clean['terms.disbursal_date'] = pd.to_datetime(
                df_clean['terms.disbursal_date'], format='%Y%m%d', errors='coerce'
            )

        # Create target variable 'score' from 'status'
        if 'status' in df_clean.columns:
            # Only keep rows with 'paid' or 'defaulted'
            df_clean = df_clean[df_clean['status'].isin(['paid', 'defaulted'])]
            df_clean['score'] = df_clean['status'].map({'paid': 100, 'defaulted': 0})

        # Ensure key numeric columns are numeric and fill missing values with median
        numeric_cols = ['terms.loan_amount', 'local_amount', 'amount']
        for col in numeric_cols:
            if col in df_clean.columns:
                df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
                df_clean[col].fillna(df_clean[col].median(), inplace=True)

        # Convert selected categorical columns to string and fill missing with 'Unknown'
        categorical_cols = ['sector', 'location.country', 'location.geo.level', 'terms.disbursal_currency']
        for col in categorical_cols:
            if col in df_clean.columns:
                df_clean[col] = df_clean[col].astype(str).fillna('Unknown')

        return df_clean

    def prepare_features(self, df):
        """
        Select the fixed set of features (without additional feature engineering)
        and extract the target variable.
        """
        # We use the same features you currently use:
        features = [
            'sector', 
            'location.country', 
            'location.geo.level', 
            'terms.disbursal_currency',
            'terms.loan_amount', 
            'local_amount', 
            'amount'
        ]
        self.feature_names = features

        # Extract features and target
        X = df[features].copy()
        y = df['score']  # score is our continuous target from 0-100
        return X, y

    def preprocess_data(self, X, y, test_size=0.3, random_state=42):
        """
        Use an advanced preprocessing pipeline. In this example, we:
          - Identify numeric and categorical columns.
          - For numeric columns: impute missing values (median) then apply a power transform.
          - For categorical columns: impute missing values and one-hot encode them.
          - Combine these with ColumnTransformer.
        """
        print("Preprocessing data...")

        # Define our fixed column types based on our features
        numeric_cols = ['terms.loan_amount', 'local_amount', 'amount']
        categorical_cols = ['sector', 'location.country', 'location.geo.level', 'terms.disbursal_currency']

        # Create pipelines for numeric and categorical data.
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('power', PowerTransformer(method='yeo-johnson', standardize=True))
        ])
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])

        # Combine transformers using ColumnTransformer
        self.preprocessor = ColumnTransformer(transformers=[
            ('num', numeric_transformer, numeric_cols),
            ('cat', categorical_transformer, categorical_cols)
        ])

        # Split into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        # Fit preprocessor on training data and transform both train and test data
        X_train_proc = self.preprocessor.fit_transform(X_train)
        X_test_proc = self.preprocessor.transform(X_test)
        
        # Get feature names from ColumnTransformer:
        # For numeric, names are the same.
        num_features = numeric_cols
        # For categorical, OneHotEncoder provides feature names
        cat_features = list(self.preprocessor.named_transformers_['cat'].
                            named_steps['onehot'].get_feature_names_out(categorical_cols))
        final_features = num_features + cat_features
        
        # Convert processed data back to DataFrames for convenience
        X_train_proc_df = pd.DataFrame(X_train_proc, columns=final_features, index=X_train.index)
        #this will be used as background data for the model
        self.X_train_proc_df = X_train_proc_df.copy()
        X_test_proc_df = pd.DataFrame(X_test_proc, columns=final_features, index=X_test.index)
        
        return X_train_proc_df, X_test_proc_df, y_train, y_test

    def tune_model(self, X_train, y_train):
        """
        Tune the XGBoost regressor using an initial RandomizedSearchCV
        followed by a focused GridSearchCV.
        """
        print("\n=== Starting Model Tuning ===")
        print(f"Training data shape: {X_train.shape}")
        print(f"Target data shape: {y_train.shape}")
        
        try:
            # Validate input data
            if X_train.empty or y_train.empty:
                raise ValueError("Empty training data provided")
            if len(X_train) != len(y_train):
                raise ValueError(f"Mismatched data shapes: X_train ({len(X_train)}) != y_train ({len(y_train)})")
            
            # Check for NaN values
            nan_cols = X_train.columns[X_train.isna().any()].tolist()
            if nan_cols:
                print(f"Warning: Found NaN values in columns: {nan_cols}")
            
            # Use a much smaller parameter grid for faster exploration
            param_grid = {
                'max_depth': [3, 5],
                'learning_rate': [0.05, 0.1],
                'n_estimators': [100, 200],
                'subsample': [0.8],
                'colsample_bytree': [0.8],
                'min_child_weight': [1],
                'gamma': [0],
                'reg_alpha': [0],
                'reg_lambda': [1.0]
            }
            
            print("\nInitializing XGBoost model...")
            xgb_model = xgb.XGBRegressor(
                objective='reg:squarederror',
                random_state=42,
                n_jobs=-1,  # Use all available cores
                tree_method='hist'  # Use histogram-based algorithm for faster training
            )
            
            # First, RandomizedSearchCV for a broad search
            print("\n=== Starting RandomizedSearchCV ===")
            print(f"Number of iterations: 5")  # Reduced from 20
            print(f"Cross-validation folds: 2")  # Reduced from 3
            
            random_search = RandomizedSearchCV(
                estimator=xgb_model,
                param_distributions=param_grid,
                n_iter=5,  # Reduced from 20
                scoring='r2',
                cv=2,  # Reduced from 3
                n_jobs=-1,
                verbose=2,
                random_state=42
            )
            
            print("\nFitting RandomizedSearchCV...")
            random_search.fit(X_train, y_train)
            
            # Log RandomizedSearchCV results
            print("\nRandomizedSearchCV Results:")
            print(f"Best parameters: {random_search.best_params_}")
            print(f"Best R² score: {random_search.best_score_:.4f}")
            print(f"Mean cross-validation score: {random_search.cv_results_['mean_test_score'].mean():.4f}")
            print(f"Std cross-validation score: {random_search.cv_results_['mean_test_score'].std():.4f}")
            
            # Skip the GridSearchCV and use the best parameters directly
            print("\nSkipping GridSearchCV to save time - using best parameters from RandomizedSearchCV")
            best_params = random_search.best_params_
            
            # Initialize final model with best parameters
            print("\nInitializing final model with best parameters...")
            self.model = xgb.XGBRegressor(
                objective='reg:squarederror',
                random_state=42,
                tree_method='hist',  # Use histogram-based algorithm
                **best_params
            )
            
            print("\n=== Model Tuning Completed Successfully ===")
            
        except Exception as e:
            print(f"\n!!! Error during model tuning: {str(e)}")
            raise

    def train_model(self, X_train, y_train, X_test, y_test):
        """Train the model with the refined hyperparameters and evaluate performance."""
        print("\n=== Starting Final Model Training ===")
        try:
            # Validate input data
            if X_train.empty or y_train.empty or X_test.empty or y_test.empty:
                raise ValueError("Empty training or test data provided")
            
            if len(X_train) != len(y_train) or len(X_test) != len(y_test):
                raise ValueError("Mismatched data shapes in training or test sets")
            
            # Check for NaN values
            train_nan_cols = X_train.columns[X_train.isna().any()].tolist()
            test_nan_cols = X_test.columns[X_test.isna().any()].tolist()
            if train_nan_cols or test_nan_cols:
                print(f"Warning: Found NaN values in columns:")
                if train_nan_cols:
                    print(f"Training set: {train_nan_cols}")
                if test_nan_cols:
                    print(f"Test set: {test_nan_cols}")
            
            print("\nTraining data shapes:")
            print(f"X_train: {X_train.shape}")
            print(f"y_train: {y_train.shape}")
            print(f"X_test: {X_test.shape}")
            print(f"y_test: {y_test.shape}")
            
            # Train the model
            print("\nFitting final model...")
            self.model.fit(X_train, y_train)
            
            # Make predictions
            print("\nMaking predictions...")
            y_pred = self.model.predict(X_test)
            
            # Calculate metrics
            print("\nCalculating performance metrics...")
            r2 = r2_score(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            
            # Store metrics
            self.model_metrics = {
                'r2_score': r2,
                'rmse': rmse,
                'n_samples': len(y_train) + len(y_test),
                'feature_importance': dict(zip(self.model.feature_names_in_, self.model.feature_importances_))
            }
            
            # Print detailed performance metrics
            print("\nModel Performance Metrics:")
            print(f"R² Score: {r2:.4f}")
            print(f"RMSE: {rmse:.4f}")
            print(f"Total samples: {self.model_metrics['n_samples']}")
            
            # Print feature importance
            print("\nTop 5 Most Important Features:")
            feature_importance = pd.DataFrame({
                'Feature': self.model.feature_names_in_,
                'Importance': self.model.feature_importances_
            }).sort_values('Importance', ascending=False)
            print(feature_importance.head())
            
            # Plot feature importance
            print("\nGenerating feature importance plot...")
            self.plot_feature_importance()
            
            print("\n=== Model Training Completed Successfully ===")
            
        except Exception as e:
            print(f"\n!!! Error during model training: {str(e)}")
            raise

    def plot_feature_importance(self):
        """Plot and save feature importance using SHAP values."""
        print("Plotting feature importance...")
        # Use SHAP to explain model predictions
        self.setup_explainer()
        shap_values = self.explainer.shap_values(self.X_train_proc_df)
        # For simplicity, use XGBoost's built-in feature importance here.
        importance = self.model.feature_importances_
        features = self.model.feature_names_in_
        importance_df = pd.DataFrame({'Feature': features, 'Importance': importance}).sort_values('Importance', ascending=False)
        plt.figure(figsize=(12, 10))
        sns.barplot(x='Importance', y='Feature', data=importance_df.head(20), palette='viridis')
        plt.title('Top 20 Feature Importances', fontsize=16)
        plt.xlabel('Importance', fontsize=14)
        plt.ylabel('Feature', fontsize=14)
        plt.tight_layout()
        plt.savefig('feature_importance.png', dpi=300)
        plt.close()
        print("Feature importance saved to 'feature_importance.png'")

    def setup_explainer(self):
        """Initialize SHAP explainer using a background sample from processed training data."""
        print("Setting up SHAP explainer...")
        # <<-- ADDED: Use a sample of the processed training data as background for SHAP -->> 
        if hasattr(self, 'X_train_proc_df'):
            X_sample = self.X_train_proc_df.head(100)
        else:
            raise ValueError("Processed training data not available. Run preprocess_data first.")
        self.explainer = shap.TreeExplainer(self.model, data=X_sample)
        return


    def predict(self, X_new):
        """
        Predict a risk score for new loan data.
        Handles preprocessing automatically if raw input is provided.
        """
        if self.model is None:
            raise ValueError("Model not trained.")
            
        # Check if X_new is a DataFrame
        if not isinstance(X_new, pd.DataFrame):
            try:
                X_new = pd.DataFrame(X_new)
            except:
                raise ValueError("Input must be convertible to a pandas DataFrame")
        
        # Ensure all required features are present
        if self.feature_names is not None:
            missing_features = [f for f in self.feature_names if f not in X_new.columns]
            if missing_features:
                raise ValueError(f"Missing required features: {missing_features}")
        
        # Apply preprocessing if the preprocessor is available
        if self.preprocessor is not None:
            try:
                X_processed = self.preprocessor.transform(X_new)
            except Exception as e:
                # Handle categorical data conversion issue
                print(f"Preprocessing error: {str(e)}")
                print("Attempting to convert categorical columns to category dtype...")
                
                # Try to convert categorical columns to category dtype
                categorical_cols = ['sector', 'location.country', 'location.geo.level', 'terms.disbursal_currency']
                for col in categorical_cols:
                    if col in X_new.columns:
                        X_new[col] = X_new[col].astype('category')
                
                # Try preprocessing again
                X_processed = self.preprocessor.transform(X_new)
        else:
            # If no preprocessor, use raw data (not recommended)
            X_processed = X_new
            
        # Make predictions
        predictions = self.model.predict(X_processed)
        
        # Clip predictions to ensure they stay within 0-100 range
        predictions = np.clip(predictions, 0, 100)
        
        return predictions

    def save_model(self, filepath='microloan_risk_model_advanced.pkl'):
        """Save the model and preprocessing objects."""
        # Save both the components dictionary and the instance itself
        model_data = {
            'model': self.model,
            'preprocessor': self.preprocessor,
            'model_metrics': self.model_metrics,
            'feature_names': self.feature_names,
            'tuning_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'instance': self  # Save the entire instance
        }
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"Model saved to {filepath}")
        print("The model instance has been saved, which will make future predictions simpler.")

    def load_model(self, filepath='microloan_risk_model_advanced.pkl'):
        """Load a saved model."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File {filepath} not found.")
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        self.model = model_data['model']
        self.preprocessor = model_data['preprocessor']
        self.model_metrics = model_data['model_metrics']
        self.feature_names = model_data['feature_names']
        print(f"Model loaded from {filepath}")

def train_model():
    """Main training function for Modal deployment"""
    try:
        print("Starting model training...")
        ml_model = MicroLoanRiskModelAdvanced()
        
        # Load and clean data
        df_raw = ml_model.load_data(filepath='loan_data.csv')
        df_clean = ml_model.clean_data(df_raw)
        
        # Prepare features
        X, y = ml_model.prepare_features(df_clean)
        
        # Preprocess data
        X_train, X_test, y_train, y_test = ml_model.preprocess_data(X, y)
        
        # Tune and train model
        ml_model.tune_model(X_train, y_train)
        ml_model.train_model(X_train, y_train, X_test, y_test)
        
        # Setup explainer and save model
        ml_model.setup_explainer()
        ml_model.save_model('microloan_risk_model_advanced.pkl')
        
        return "Model training completed successfully"
    except Exception as e:
        return f"Error during training: {str(e)}"

def main():
    train_model()

if __name__ == "__main__":
    main()
