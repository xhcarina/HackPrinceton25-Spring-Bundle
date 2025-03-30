# HP25-Bundle: Decentralized Microlending Platform

A revolutionary decentralized microlending platform that combines loan tokenization, intelligent bundling, and advanced risk assessment to create a secure and liquid marketplace for microloans.

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
- Intelligent loan bundling algorithms
- Database operations and schema management
- Firebase integration for real-time data
- Resource allocation optimization
- Bundle risk calculation methods:
  - Weighted Average
  - Nonlinear Method
  - Variance-Adjusted Scoring

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
  - Historical pattern of full repayment
  - Strongest creditworthiness indicators
  - Ideal for bundling as anchor loans

- 75-89: Good (Low Risk)
  - Strong repayment probability
  - Favorable risk indicators
  - Reliable bundle components

- 60-74: Moderate (Average Risk)
  - Acceptable repayment probability
  - Some risk factors present
  - Suitable for diversified bundles

- 40-59: Caution (High Risk)
  - Elevated default probability
  - Multiple risk factors
  - Requires risk mitigation strategies

- 0-39: High Caution (Very High Risk)
  - Significant default probability
  - Major risk factors present
  - Not recommended for standard bundles

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact & Support

For technical support or business inquiries, please contact the project maintainers.

## Acknowledgments
- Duke University for the Kiva loan dataset
- Google for Firebase and AI services
- Open-source community contributors 
