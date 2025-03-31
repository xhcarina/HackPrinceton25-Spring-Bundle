# OLD README

# MicroLoan Risk Model

This project implements a risk assessment model for microloans, providing credit scoring on a 0-100 scale to help lenders evaluate loan applications. The model is built using data from the Kiva microlending platform and employs machine learning techniques to predict loan repayment likelihood.

## Overview

The MicroLoan Risk Model analyzes historical loan data to predict the likelihood of loan repayment. It uses advanced machine learning techniques to identify patterns in loan characteristics, borrower information, and repayment history that are associated with successful repayments versus defaults.

## Scoring Scale Interpretation

**Important:** Our scoring system follows the convention of traditional credit scores where:
- **Higher scores (closer to 100)** indicate **LOWER risk** (safer loans)
- **Lower scores (closer to 0)** indicate **HIGHER risk** (riskier loans)

This means a loan with a score of 90 is considered very safe, while a loan with a score of 40 would be considered high risk.

## Model Parameters and Features

### Essential Parameters

These parameters are critical for accurate risk assessment:

| Parameter | Description | Data Type | Impact on Score |
|-----------|-------------|-----------|-----------------|
| `funded_amount` | Amount of loan in USD | Float | Higher amounts may increase risk |
| `sector` | Business sector (Agriculture, Retail, etc.) | String | Some sectors are historically safer than others |
| `location.country` | Country where loan is disbursed | String | Geographic location affects repayment patterns |
| `loan_duration` | Duration of the loan in days | Integer | Longer durations generally increase risk |

### Recommended Parameters

These parameters significantly improve prediction accuracy:

| Parameter | Description | Data Type | Impact on Score |
|-----------|-------------|-----------|-----------------|
| `is_female` | Whether borrower is female (1) or not (0) | Integer | Female borrowers statistically have higher repayment rates |
| `borrower_pictured` | Whether borrower provided a picture | Integer | Having a picture correlates with commitment |
| `terms.disbursal_currency` | Local currency for loan | String | Some currencies have higher volatility |
| `terms.disbursal_amount` | Amount in local currency | Float | Used to compute exchange rate effects |
| `disbursal_year` | Year when loan was disbursed | Integer | Captures temporal trends |
| `disbursal_month` | Month when loan was disbursed | Integer | Captures seasonal patterns |
| `payment_count` | Number of payments made | Integer | More frequent payments reduce risk |

### Optional Parameters

These parameters provide additional insights:

| Parameter | Description | Data Type | Impact on Score |
|-----------|-------------|-----------|-----------------|
| `lat`, `lon` | Geographical coordinates | Float | Used for geographic risk clustering |
| `exchange_rate` | Exchange rate between local and USD | Float | Currency stability indicator |
| `repayment_ratio` | Ratio of amount repaid to amount loaned | Float | Historical repayment behavior |
| `request_status` | Status of the loan request (requested/received) | String | Does not affect risk score |
| `In_bundle` | Whether loan is part of a bundle | Boolean | Does not affect individual risk score |

## How Risk Scores Are Calculated

The MicroLoan Risk Model calculates scores using the following process:

1. **Data Preprocessing**:
   - Missing values are imputed with sensible defaults
   - Categorical variables are encoded (one-hot encoding or target encoding)
   - Numerical variables are normalized using power transformation
   - Feature engineering creates derived metrics

2. **Prediction Pipeline**:
   - An XGBoost model analyzes all parameters
   - Each feature contributes positively or negatively to the final score
   - A base value (typically around 78) is adjusted up or down
   - Scores are calibrated to ensure consistency across different loan types

3. **Feature Contributions**:
   - The most influential factors are identified with SHAP values
   - Each factor's contribution to the score is quantified
   - Both positive and negative influences are tracked

4. **Final Score Calculation**:
   ```
   Risk Score = Base Value + Sum(Feature Contributions)
   ```
   Where:
   - Base Value: The average prediction across the training dataset
   - Feature Contributions: Individual impact of each feature on the prediction

5. **Score Interpretation**:

The model outputs a score from 0-100, where **higher scores indicate safer loans** (lower risk):

| Score Range | Risk Level | Interpretation |
|-------------|------------|----------------|
| 90-100 | Very Low Risk | Excellent candidate for funding; historical data suggests very high likelihood of repayment |
| 80-89 | Low Risk | Strong candidate; good probability of full repayment |
| 70-79 | Moderate Risk | Acceptable candidate; moderate probability of repayment |
| 50-69 | High Risk | Exercise caution; higher than average chance of default |
| 0-49 | Very High Risk | Significant concerns; historical data suggests high probability of default |

Each prediction includes explanations of the top factors influencing the score, highlighting both positive factors (increasing the score) and negative factors (decreasing the score).

## Loan Bundle Risk Calculation

The `bundle_loans.py` module calculates a single risk score for a bundle of loans using several methods:

### Bundle Parameters

| Parameter | Description | Data Type | Impact on Bundle Score |
|-----------|-------------|-----------|------------------------|
| `loans` | List of loan objects to be bundled | Array | Base data for calculation |
| `method` | The scoring method to use | String | Determines calculation approach |
| `amount` | Loan amount (used for weighting) | Float | Larger loans have more influence |
| `score` | Individual risk score of each loan | Float | Base metric for bundle score |
| `sector` | Business sector of each loan | String | Used for diversification analysis |
| `location.country` | Country of each loan | String | Used for geographic diversification |
| `due_date` | When loan payment is due | Date | Used for temporal diversification |

### Bundling Methods

The system supports three different methods to calculate bundle risk scores:

1. **Weighted Average** (`weighted_avg`):
   ```
   Bundle Score = Sum(Loan Score × Weight) for all loans
   ```
   Where Weight is the loan amount divided by total bundle amount.
   
2. **Nonlinear Method** (`nonlinear`):
   ```
   Bundle Score = 100 - sqrt(Sum(Weight × (100-Score)²))
   ```
   This method penalizes high-risk concentration more severely.
   
3. **Variance-Adjusted** (`variance_adjusted`):
   ```
   Bundle Score = Weighted Average - Variance Penalty
   ```
   Where the Variance Penalty increases with higher variance among loan scores.

### Diversification Penalties

The bundle score is reduced based on these concentration risks:

1. **Sector Concentration**: Penalty if too many loans are in the same sector
   ```
   Sector Penalty = 2 × Sum(Sector Weight²)
   ```

2. **Geographic Concentration**: Penalty if too many loans are from the same country
   ```
   Geographic Penalty = 2 × Sum(Country Weight²)
   ```

3. **Risk Level Concentration**: Penalty if too many loans have similar risk profiles
   ```
   Risk Concentration Penalty = 3 × Sum(Risk Bucket Weight²)
   ```

4. **Due Date Clustering**: Penalty if too many loans are due at the same time
   ```
   Due Date Penalty = max(0, 3 × (1 - std_dev_of_due_dates/10))
   ```

The final bundle score is:
```
Final Bundle Score = Initial Bundle Score - Sum(Diversification Penalties)
```
Capped within the range of 0-100.

## Project Structure

- `MicroLoanRiskModel.py` - Core implementation of the machine learning model
- `bundle_loans.py` - Script for bundling loans with similar risk profiles and due dates
- `score_loans.py` - Command-line tool for scoring batches of loans
- `risk_score_api.py` - API wrapper for integrating with other systems
- `retrain.py` - Script for retraining the model with new data
- `api_server.py` - Web API server for hosting the model as a service
- `gemini_explainer.py` - Integration with Google's Gemini AI for natural language explanations
- `templates/` - HTML templates for the web interface

## Dataset

The model is trained on data from the Kiva microlending platform, accessed via the Duke University Statistical Science department's dataset repository ([source](https://stat.duke.edu/datasets/kiva-loans)). The dataset contains detailed information on microloans, including:

- Loan characteristics (amount, sector, purpose)
- Borrower information (gender, location)
- Repayment history
- Geographical data
- Temporal information

Each row in the original dataset represents an individual payment on a loan, with multiple rows per loan ID reflecting the installment repayment structure. For our analysis, we collapse the data to have one row per unique loan ID.

## Data Cleaning and Preprocessing

The model performs several data cleaning and preprocessing steps:

### 1. Handling Duplicate Records

- Each loan (identified by a unique `id`) may appear multiple times in the dataset if there are multiple payments
- We collapse rows with the same `id` by keeping only the first record for each loan
- We derive a `payment_count` feature by counting how many times each loan ID appears in the original data

### 2. Advanced Feature Engineering

We generate several types of derived features to better capture loan risk factors:

- **Borrower Characteristics**: 
  - Convert `borrowers.gender` to a binary `is_female` feature
  - Create `borrower_pictured` indicator from `borrowers.pictured`

- **Loan Duration and Temporal Features**:
  - Calculate loan duration in days between disbursement and repayment/default
  - Extract year, month, and quarter from disbursement date
  - Create `is_high_season` flag for seasonal patterns
  - Determine if payments were made on or before scheduled due dates

- **Geographic Features**:
  - Calculate distance from country centroid
  - Create country-specific risk factors based on historical default rates
  - Use country-level aggregations for comparison metrics

- **Exchange Rate Information**:
  - Calculate effective exchange rate between local currency and USD
  - Create log-transformed versions of monetary values

- **Relative Metrics**:
  - Calculate loan amount relative to country average
  - Create capped versions of features to handle outliers

### 3. Feature Selection and Preprocessing

We employ several techniques to select the most informative features while avoiding overfitting:

- **Feature Selection**:
  - Use permutation importance to identify truly predictive features
  - Select features that collectively explain 95% of the variance
  - Maintain an optimal feature count (usually 25-35 features)

- **Transformation**:
  - Apply quantile transformation to normalize skewed numeric features
  - Use one-hot encoding for categorical features with low cardinality
  - Apply target encoding for high-cardinality categorical features
  - Create binned versions of continuous features for better stability

- **Handling Missing Values**:
  - Automatically drop columns with more than 90% missing values
  - Use appropriate imputation strategies for remaining missing values

## Loan Bundling

The project includes a loan bundling strategy that:

- Groups loans by similar due dates (10-day windows)
- Distributes risk levels evenly within each bundle
- Calculates aggregate bundle risk scores
- Provides diversification metrics and interest rate recommendations
- Allows reshuffling of bundles every 10 days

## Model Architecture

The model uses XGBoost, a gradient boosting framework, with several enhancements to improve performance and generalization:

1. **Feature Engineering Pipeline**: Creates and transforms features from raw loan data
2. **Feature Selection**: Uses permutation importance to identify the most predictive features
3. **Hyperparameter Tuning**: Employs two-phase optimization with cross-validation
4. **Early Stopping**: Prevents overfitting during training
5. **Calibration**: Ensures scores accurately reflect true probabilities

## Model Performance

Based on comprehensive cross-validation testing, the model achieves:

- **R² Score**: 0.810 ± 0.005 (explaining 81% of the variance in loan outcomes)
- **RMSE**: 13.28 ± 0.19 (on a 0-100 scale)
- **Model Stability**: Excellent, with coefficient of variation < 0.01
- **Fairness Metrics**: Similar R² across gender groups (female: 0.821, male: 0.804)

These metrics indicate strong predictive performance with high stability across different data splits, suggesting the model will generalize well to new loans with similar characteristics.


## Usage

### Command-Line Interface

```bash
# Score a batch of loans
python score_loans.py loan_applications.csv --output scores.csv --detailed --visualize

# Create loan bundles
python bundle_loans.py loan_data.csv --output bundles.csv --size 50 --days 10

# Retrain the model
python retrain.py --data new_loan_data.csv --output new_model.pkl
```

### Web API

```bash
# Start the API server
python api_server.py

# Server runs on http://localhost:5000 by default
```

### As a Python Library

```python
from MicroLoanRiskModel import MicroLoanRiskModel
import pandas as pd

# Initialize the model
model = MicroLoanRiskModel()

# Load a trained model
model.load_model('microloan_risk_model.pkl')

# Create a loan application
loan_data = {
    'funded_amount': 500,
    'sector': 'Agriculture',
    'location.country': 'Kenya',
    'is_female': 1,
    'borrower_pictured': 1,
    'loan_duration': 180,
    'disbursal_year': 2023,
    'disbursal_month': 6
}

# Convert to DataFrame
loan_df = pd.DataFrame([loan_data])

# Get a repayment likelihood score (0-100, higher is better/safer)
score = model.predict_score(loan_df)
print(f"Repayment Score: {score}/100")
```

## Requirements

See `requirements.txt` for a full list of dependencies.

## Citation

If using this model or the Kiva dataset, please cite:
- Kiva Dataset: [Duke University, Statistical Science Department](https://stat.duke.edu/datasets/kiva-loans)
- Original data source: [Kiva.org API](http://build.kiva.org/docs/data/snapshots)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
