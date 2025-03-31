
# Models are on the master branch. Most Frontend/Backend are on backup branch. Check: https://github.com/EricChang9/HP25-Bundle/tree/backup
# HP25-Bundle: Decentralized Microlending Platform
## Award: Best Financial Hack [Sponsored by Capital One] -- Honorable Mention -- Best Bussiness Idea

A revolutionary microlending platform that combines intelligent loan bundling, advanced risk assessment, and a modern mobile interface for efficient microloan management.

## Afterthoughts

- Didn't deploy blockchain(Verbwire) successfully
- First Hack for two people in the team; Ethical Issues with the fourth teammate
- Attempted Expo(checked), Modal, and GeminiAPI
- Very rewarding experience
- Team of 3


## Vision & Overview

HP25-Bundle revolutionizes microlending by:
- Creating an efficient marketplace for small loans
- Enabling intelligent loan bundling for improved management
- Providing sophisticated risk assessment and resource allocation
- Empowering borrowers in developing economies while offering investors new opportunities
- Maintaining transparency while ensuring benefits flow to underserved communities

## Core Features

### For Borrowers
- Secure loan application submission
- Transparent risk assessment and interest rates
- Real-time application status tracking
- Flexible payment schedules

### For Investors
- Access to tokenized microloan bundles
- Diversified investment opportunities
- Real-time portfolio management
- Blockchain-based security trading

## Project Components

### 1. Loan Bundling System (`/loan_bundling`)
- Firebase-based loan management
- Real-time bundle creation and tracking
- Firestore database integration
- Bundle status management
- Automated loan status updates

### 2. Risk Assessment Engine (`/RiskModelandAPI`)
#### Risk Scoring Parameters
- Essential Parameters (e.g., funded_amount, sector, location)
- Recommended Parameters (e.g., borrower demographics, payment history)
- Optional Parameters (e.g., geographical data, exchange rates)
- Bundle-specific Parameters (for aggregated risk assessment)

#### Risk Score System
The risk assessment model uses an advanced XGBoost regressor that outputs scores on a 0-100 scale:

##### Risk Score Interpretation
- 90-100: Excellent (Very Low Risk)
- 75-89: Good (Low Risk)
- 60-74: Moderate (Average Risk)
- 40-59: Caution (High Risk)
- 0-39: High Caution (Very High Risk)

##### Score Calculation Factors
- Sector performance history
- Geographic risk assessment
- Loan amount evaluation
- Currency stability factors
- Local vs. Global amount ratios
- Historical repayment data

##### Model Features
- Advanced preprocessing pipeline
- Two-stage hyperparameter tuning
- SHAP-based feature importance
- Continuous model calibration
- Automated risk factor analysis

### 3. Frontend Platform (`/FrontEnd`)
#### User Interfaces
- Authentication (OAuth/Django)
- Borrower Dashboard
  - Loan application submission
  - Application status tracking
  - Payment management
- Investor Dashboard
  - Bundle browsing and filtering
  - Investment portfolio management
  - Transaction history

## Technical Architecture

### Prerequisites
- Python 3.9+
- Node.js 16+
- Firebase account and credentials
- Blockchain wallet integration
- Required packages (see respective requirement files)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd HP25-Bundle
```

2. Set up the Loan Bundling component:
```bash
cd loan_bundling
pip install -r requirements.txt
```

3. Set up the Risk Assessment API:
```bash
cd ../RiskModelandAPI
pip install -r requirements.txt
```

4. Set up the Frontend:
```bash
cd ../FrontEnd
npm install
```

5. Configure Firebase and Blockchain:
- Set up Firebase credentials
- Configure blockchain network settings
- Update environment variables

### Running the Platform

1. Start the Loan Bundling Service:
```bash
cd loan_bundling
python bundle_algo.py
```

2. Launch the Risk Assessment API:
```bash
cd RiskModelandAPI
python api_server.py
```

3. Start the Frontend:
```bash
cd FrontEnd
npm start
```

## Development & Testing

### Testing Components
- Loan Bundling: `python test_bundle.py`
- Risk Assessment: `python test_risk_model.py`
- Frontend: `npm test`

### Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security Considerations
- Encrypted data transmission
- Secure blockchain integration
- Firebase security rules
- API authentication
- User data protection
